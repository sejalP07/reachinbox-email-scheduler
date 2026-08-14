import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const EMAIL_QUEUE_NAME = "email-scheduler";

export interface EmailJobData {
  scheduledEmailId: string;
  campaignId: string;
  senderId: string;
  recipient: string;
}

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: {
      age: 60 * 60 * 24,
    },

    removeOnFail: {
      age: 60 * 60 * 24 * 7,
    },
  },
});