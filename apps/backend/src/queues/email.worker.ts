import { Worker } from "bullmq";
import nodemailer from "nodemailer";

import { prisma } from "../config/database.js";
import { redis } from "../config/redis.js";
import { sendEmail } from "../services/email-smtp.service.js";
import { reserveSendSlot } from "../services/email-rate-limiter.service.js";
import {
  EMAIL_QUEUE_NAME,
  emailQueue,
  type EmailJobData,
} from "./email.queue.js";

const concurrency = Number(
  process.env.WORKER_CONCURRENCY ?? 10,
);
const MAX_EMAILS_PER_HOUR_PER_SENDER = Number(
  process.env.MAX_EMAILS_PER_HOUR_PER_SENDER ?? 200,
);
export const emailWorker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,
  async (job) => {
    const { scheduledEmailId } = job.data;

    console.log("📨 Processing email:", {
    time: new Date().toISOString(),
    jobId: job.id,
    recipient: job.data.recipient,
    });

    const email = await prisma.scheduledEmail.findUnique({
      where: {
        id: scheduledEmailId,
      },
      include: {
        sender: true,
        campaign: true,
      },
    });

    if (!email) {
      throw new Error(
        `Scheduled email ${scheduledEmailId} not found`,
      );
    }

    // Idempotency protection.
    // Never send an email that has already been successfully sent.
    if (email.status === "SENT") {
      console.log(
        `⚠️ Email ${scheduledEmailId} already sent. Skipping.`,
      );

      return {
        skipped: true,
        reason: "already-sent",
      };
    }
    /*
  * Acquire the database processing lock BEFORE reserving
  * the Redis send slot.
  *
  * This prevents duplicate workers from consuming rate-limit
  * slots when only one worker can actually send the email.
  */
  const processingEmail =
    await prisma.scheduledEmail.updateMany({
      where: {
        id: scheduledEmailId,
        status: "SCHEDULED",
      },
      data: {
        status: "PROCESSING",
        attempts: {
          increment: 1,
        },
      },
    });

  if (processingEmail.count === 0) {
    const currentEmail =
      await prisma.scheduledEmail.findUnique({
        where: {
          id: scheduledEmailId,
        },
      });

    if (currentEmail?.status === "SENT") {
      console.log(
        `Email ${scheduledEmailId} already sent. Skipping.`,
      );

    return {
      skipped: true,
      reason: "already-sent",
    };
  }

  if (currentEmail?.status === "PROCESSING") {
    console.log(
      `Email ${scheduledEmailId} is already being processed. Skipping duplicate worker execution.`,
    );

    return {
      skipped: true,
      reason: "already-processing",
    };
  }

  throw new Error(
    `Unable to acquire processing lock for ${scheduledEmailId}`,
  );
}

/*
 * The DB lock is now held by this worker.
 *
 * Reserve the distributed Redis send slot only after
 * successfully acquiring the processing lock.
 */
const effectiveHourlyLimit = Math.min(
  email.campaign.hourlyLimit,
  MAX_EMAILS_PER_HOUR_PER_SENDER,
);

const rateLimit = await reserveSendSlot(
  email.senderId,
  email.campaign.delayMs,
  effectiveHourlyLimit,
);

if (!rateLimit.allowed) {
  const retryAt = rateLimit.retryAt;

  const delay = Math.max(
    retryAt - Date.now(),
    100,
  );

    console.log(
      `Rate limit reached for sender ${email.senderId}. ` +
        `Rescheduling ${email.recipient} in ${delay}ms.`,
    );

    /*
    * Release the DB processing lock before creating
    * the delayed retry job.
    */
    await prisma.scheduledEmail.update({
      where: {
        id: scheduledEmailId,
      },
      data: {
        status: "SCHEDULED",
      },
    });

    await emailQueue.add(
      "send-email",
      {
        scheduledEmailId: email.id,
        campaignId: email.campaignId,
        senderId: email.senderId,
        recipient: email.recipient,
      },
      {
        jobId: `email-${email.id}-retry-${retryAt}`,
        delay,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return {
      rescheduled: true,
      retryAt,
    };
  }

    
    /*
     * The send slot has now been reserved.
     * It is safe to mark the email as PROCESSING.
     */
    const processingEmailAfterRateLimit =
        await prisma.scheduledEmail.updateMany({
            where: {
            id: scheduledEmailId,
            status: "SCHEDULED",
            },
            data: {
            status: "PROCESSING",
            attempts: {
                increment: 1,
            },
            },
        });

        if (processingEmailAfterRateLimit.count === 0) {
        const currentEmail =
            await prisma.scheduledEmail.findUnique({
            where: {
                id: scheduledEmailId,
            },
            });

        if (currentEmail?.status === "SENT") {
            console.log(
            `⚠️ Email ${scheduledEmailId} already sent. Skipping.`,
            );

            return {
            skipped: true,
            reason: "already-sent",
            };
        }

        if (currentEmail?.status === "PROCESSING") {
            console.log(
            `⚠️ Email ${scheduledEmailId} is already being processed. Skipping duplicate worker execution.`,
            );

            return {
            skipped: true,
            reason: "already-processing",
            };
        }

        throw new Error(
            `Unable to acquire processing lock for ${scheduledEmailId}`,
        );
    }

    try {
      const info = await sendEmail({
        from: email.sender.email,
        to: email.recipient,
        subject: email.subject,
        text: email.body,
      });

      const previewUrl =
        nodemailer.getTestMessageUrl(info);

      await prisma.scheduledEmail.update({
        where: {
          id: scheduledEmailId,
        },
        data: {
          status: "SENT",
          sentAt: new Date(),
          messageId: info.messageId,
          previewUrl:
            typeof previewUrl === "string"
              ? previewUrl
              : null,
          lastError: null,
        },
      });

      console.log(
        `✅ Email sent: ${email.recipient} at ${new Date().toISOString()}`,
        );
      if (info.messageId) {
        console.log(
          `📨 Message ID: ${info.messageId}`,
        );
      }

      if (typeof previewUrl === "string") {
        console.log(
          `🔗 Ethereal preview: ${previewUrl}`,
        );
      }

      return {
        success: true,
        scheduledEmailId,
        messageId: info.messageId,
        previewUrl:
          typeof previewUrl === "string"
            ? previewUrl
            : null,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown SMTP error";

      await prisma.scheduledEmail.update({
        where: {
          id: scheduledEmailId,
        },
        data: {
          status: "FAILED",
          lastError: message,
        },
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency,
  },
);

emailWorker.on("completed", (job) => {
  console.log(
    `✅ Job completed: ${job.id}`,
  );
});

emailWorker.on("failed", (job, error) => {
  console.error(
    `❌ Job failed: ${job?.id}`,
    error,
  );
});

console.log(
  `🚀 Email worker started with concurrency=${concurrency}`,
);