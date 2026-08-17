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

/**
 * =========================================================
 * CONFIGURATION
 * =========================================================
 */

const concurrency = Math.max(
  1,
  Number(process.env.WORKER_CONCURRENCY ?? 10),
);

const MAX_EMAILS_PER_HOUR_PER_SENDER = Math.max(
  1,
  Number(
    process.env.MAX_EMAILS_PER_HOUR_PER_SENDER ?? 200,
  ),
);

/**
 * =========================================================
 * WORKER
 * =========================================================
 */

export const emailWorker =
  new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,

    async (job) => {
      const {
        scheduledEmailId,
      } = job.data;

      console.log(
        "📨 Processing email:",
        {
          time:
            new Date().toISOString(),
          jobId: job.id,
          scheduledEmailId,
          recipient:
            job.data.recipient,
        },
      );

      /**
       * =====================================================
       * 1. LOAD EMAIL
       * =====================================================
       */

      const email =
        await prisma.scheduledEmail.findUnique(
          {
            where: {
              id: scheduledEmailId,
            },

            include: {
              sender: true,
              campaign: true,
            },
          },
        );

      if (!email) {
        throw new Error(
          `Scheduled email ${scheduledEmailId} not found`,
        );
      }

      /**
       * =====================================================
       * 2. IDEMPOTENCY CHECK
       * =====================================================
       *
       * Never send an email that has already been sent.
       */

      if (email.status === "SENT") {
        console.log(
          `⚠️ Email ${scheduledEmailId} already sent. Skipping.`,
        );

        return {
          skipped: true,
          reason: "already-sent",
        };
      }

      /**
       * =====================================================
       * 3. DATABASE PROCESSING LOCK
       * =====================================================
       *
       * Atomically change:
       *
       * SCHEDULED → PROCESSING
       *
       * Only one worker can successfully perform this
       * transition.
       */

      const processingEmail =
        await prisma.scheduledEmail.updateMany(
          {
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
          },
        );

      /**
       * =====================================================
       * 4. ANOTHER WORKER ALREADY HAS THE EMAIL
       * =====================================================
       */

      if (processingEmail.count === 0) {
        const currentEmail =
          await prisma.scheduledEmail.findUnique(
            {
              where: {
                id: scheduledEmailId,
              },

              select: {
                id: true,
                status: true,
              },
            },
          );

        /**
         * Email disappeared.
         */
        if (!currentEmail) {
          throw new Error(
            `Scheduled email ${scheduledEmailId} no longer exists`,
          );
        }

        /**
         * Another worker already sent it.
         */
        if (
          currentEmail.status ===
          "SENT"
        ) {
          console.log(
            `⚠️ Email ${scheduledEmailId} was already sent. Skipping duplicate execution.`,
          );

          return {
            skipped: true,
            reason: "already-sent",
          };
        }

        /**
         * Another worker is currently processing it.
         *
         * IMPORTANT:
         * Do NOT throw an error here.
         *
         * Throwing would make BullMQ mark this duplicate
         * execution as failed.
         */
        if (
          currentEmail.status ===
          "PROCESSING"
        ) {
          console.log(
            `⚠️ Email ${scheduledEmailId} is already being processed by another worker. Skipping duplicate execution.`,
          );

          return {
            skipped: true,
            reason:
              "already-processing",
          };
        }

        /**
         * Any other state means the job should not be
         * processed by this worker execution.
         */
        console.log(
          `⚠️ Email ${scheduledEmailId} could not acquire processing lock. Current status: ${currentEmail.status}`,
        );

        return {
          skipped: true,
          reason:
            "processing-lock-not-acquired",

          status:
            currentEmail.status,
        };
      }

      /**
       * =====================================================
       * 5. REDIS DISTRIBUTED RATE LIMIT
       * =====================================================
       *
       * The database processing lock has already been
       * acquired.
       *
       * Now reserve a Redis-backed sending slot.
       */

      const effectiveHourlyLimit =
        Math.min(
          email.campaign.hourlyLimit,
          MAX_EMAILS_PER_HOUR_PER_SENDER,
        );

      const rateLimit =
        await reserveSendSlot(
          email.senderId,
          email.campaign.delayMs,
          effectiveHourlyLimit,
        );

      /**
       * =====================================================
       * 6. RATE LIMIT REACHED
       * =====================================================
       */

      if (!rateLimit.allowed) {
        const retryAt =
          rateLimit.retryAt;

        const delay = Math.max(
          retryAt - Date.now(),
          1_000,
        );

        console.log(
          `⏳ Rate limit reached for sender ${email.senderId}. ` +
            `Rescheduling ${email.recipient} in ${delay}ms.`,
        );

        /**
         * Release database processing lock.
         */
        await prisma.scheduledEmail.update(
          {
            where: {
              id: scheduledEmailId,
            },

            data: {
              status: "SCHEDULED",
            },
          },
        );

        /**
         * Create delayed BullMQ retry.
         *
         * No cron is used.
         */
        await emailQueue.add(
          "send-email",
          {
            scheduledEmailId:
              email.id,

            campaignId:
              email.campaignId,

            senderId:
              email.senderId,

            recipient:
              email.recipient,
          },
          {
            jobId:
              `email-${email.id}-retry-${retryAt}`,

            delay,

            removeOnComplete:
              true,

            removeOnFail:
              false,
          },
        );

        return {
          rescheduled: true,
          retryAt,
        };
      }

      /**
       * =====================================================
       * 7. SEND EMAIL
       * =====================================================
       */

      try {
        const info =
          await sendEmail({
            from:
              email.sender.email,

            to:
              email.recipient,

            subject:
              email.subject,

            text:
              email.body,
          });

        /**
         * Ethereal preview URL.
         */
        const previewUrl =
          nodemailer.getTestMessageUrl(
            info,
          );

        /**
         * ===================================================
         * 8. MARK AS SENT
         * ===================================================
         */

        await prisma.scheduledEmail.update(
          {
            where: {
              id: scheduledEmailId,
            },

            data: {
              status: "SENT",

              sentAt:
                new Date(),

              messageId:
                info.messageId,

              previewUrl:
                typeof previewUrl ===
                "string"
                  ? previewUrl
                  : null,

              lastError:
                null,
            },
          },
        );

        console.log(
          `✅ Email sent: ${email.recipient} at ${new Date().toISOString()}`,
        );

        if (info.messageId) {
          console.log(
            `📨 Message ID: ${info.messageId}`,
          );
        }

        if (
          typeof previewUrl ===
          "string"
        ) {
          console.log(
            `🔗 Ethereal preview: ${previewUrl}`,
          );
        }

        return {
          success: true,

          scheduledEmailId,

          messageId:
            info.messageId,

          previewUrl:
            typeof previewUrl ===
            "string"
              ? previewUrl
              : null,
        };
      } catch (error) {
        /**
         * ===================================================
         * 9. SMTP FAILURE
         * ===================================================
         */

        const message =
          error instanceof Error
            ? error.message
            : "Unknown SMTP error";

        console.error(
          `❌ Failed to send email ${scheduledEmailId}:`,
          message,
        );

        /**
         * Mark the email as FAILED.
         */
        await prisma.scheduledEmail.update(
          {
            where: {
              id: scheduledEmailId,
            },

            data: {
              status: "FAILED",

              lastError:
                message,
            },
          },
        );

        throw error;
      }
    },

    /**
     * =======================================================
     * WORKER OPTIONS
     * =======================================================
     */

    {
      connection: redis,

      concurrency,

      /**
       * Don't keep thousands of completed jobs forever.
       */
      removeOnComplete: {
        age:
          24 * 60 * 60,
        count: 10_000,
      },

      /**
       * Keep failed jobs for debugging.
       */
      removeOnFail: {
        age:
          7 * 24 * 60 * 60,
        count: 10_000,
      },
    },
  );

/**
 * =========================================================
 * WORKER EVENTS
 * =========================================================
 */

emailWorker.on(
  "completed",
  (job) => {
    console.log(
      `✅ Job completed: ${job.id}`,
    );
  },
);

emailWorker.on(
  "failed",
  (job, error) => {
    console.error(
      `❌ Job failed: ${job?.id}`,
      error,
    );
  },
);

emailWorker.on(
  "error",
  (error) => {
    console.error(
      "❌ Email worker error:",
      error,
    );
  },
);

console.log(
  `🚀 Email worker started with concurrency=${concurrency}`,
);