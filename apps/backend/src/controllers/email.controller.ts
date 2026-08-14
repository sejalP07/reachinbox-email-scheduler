import type { Request, Response } from "express";

import { scheduleEmails } from "../services/email-scheduler.service.js";
import { scheduleEmailSchema } from "../utils/email.validation.js";

export async function scheduleEmailsController(
  req: Request,
  res: Response,
) {
  try {
    const input = scheduleEmailSchema.parse(req.body);

    const userId = req.header("x-user-id");

    if (!userId) {
      return res.status(401).json({
        error: "Missing x-user-id header",
      });
    }

    const result = await scheduleEmails(
      userId,
      input,
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Schedule email error:", error);

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}