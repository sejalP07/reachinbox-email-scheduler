import { z } from "zod";

export const scheduleEmailSchema = z.object({
  senderId: z.string().uuid(),

  subject: z
    .string()
    .min(1, "Subject is required")
    .max(500),

  body: z
    .string()
    .min(1, "Email body is required"),

  recipients: z
    .array(z.string().email())
    .min(1, "At least one recipient is required"),

  startTime: z
    .string()
    .datetime(),

  delayMs: z
    .number()
    .int()
    .min(0)
    .max(60_000),

  hourlyLimit: z
    .number()
    .int()
    .min(1)
    .max(10_000),
});

export type ScheduleEmailInput = z.infer<
  typeof scheduleEmailSchema
>;