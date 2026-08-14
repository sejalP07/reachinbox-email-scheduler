import { prisma } from "../config/database.js";
import { emailQueue } from "../queues/email.queue.js";
import type { ScheduleEmailInput } from "../utils/email.validation.js";

export async function scheduleEmails(
  userId: string,
  input: ScheduleEmailInput,
) {
  const sender = await prisma.sender.findFirst({
    where: {
      id: input.senderId,
      userId,
    },
  });

  if (!sender) {
    throw new Error("Sender not found");
  }

  const startTime = new Date(input.startTime);

  if (Number.isNaN(startTime.getTime())) {
    throw new Error("Invalid start time");
  }

  if (startTime.getTime() < Date.now()) {
    throw new Error("Start time must be in the future");
  }

  // Remove duplicate recipients and normalize email addresses.
  const uniqueRecipients = [
    ...new Set(
      input.recipients.map((email) =>
        email.trim().toLowerCase(),
      ),
    ),
  ];

  if (uniqueRecipients.length === 0) {
    throw new Error("No valid recipients provided");
  }

  const campaign = await prisma.campaign.create({
    data: {
      userId,
      senderId: sender.id,
      subject: input.subject,
      body: input.body,
      startTime,
      delayMs: input.delayMs,
      hourlyLimit: input.hourlyLimit,
      status: "SCHEDULED",
    },
  });

  let scheduledEmails = 0;

  try {
    for (
      let index = 0;
      index < uniqueRecipients.length;
      index++
    ) {
      const recipient = uniqueRecipients[index];

      if (!recipient) {
        continue;
      }

      const scheduledAt = new Date(
        startTime.getTime() +
          index * input.delayMs,
      );

      const email = await prisma.scheduledEmail.create({
        data: {
          campaignId: campaign.id,
          senderId: sender.id,
          recipient,
          subject: input.subject,
          body: input.body,
          scheduledAt,
          status: "SCHEDULED",
        },
      });

      const delay = Math.max(
        0,
        scheduledAt.getTime() - Date.now(),
      );

      const job = await emailQueue.add(
        "send-email",
        {
          scheduledEmailId: email.id,
          campaignId: campaign.id,
          senderId: sender.id,
          recipient,
        },
        {
          jobId: `email-${email.id}`,
          delay,
        },
      );

      await prisma.scheduledEmail.update({
        where: {
          id: email.id,
        },
        data: {
          bullJobId: job.id,
        },
      });

      scheduledEmails++;
    }

    return {
      campaignId: campaign.id,
      totalEmails: uniqueRecipients.length,
      scheduledEmails,
    };
  } catch (error) {
    await prisma.campaign.update({
      where: {
        id: campaign.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    throw error;
  }
}