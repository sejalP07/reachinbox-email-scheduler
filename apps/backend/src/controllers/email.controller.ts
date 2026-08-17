import type { Request, Response } from "express";

import { prisma } from "../config/database.js";
import { scheduleEmails } from "../services/email-scheduler.service.js";
import { scheduleEmailSchema } from "../utils/email.validation.js";

/**
 * Schedule emails
 */
export async function scheduleEmailsController(
  req: Request,
  res: Response,
) {
  try {
    /**
     * Authentication check
     */
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    console.log(
      "========== SCHEDULE REQUEST ==========",
    );

    console.log("Authenticated user:", {
      id: req.user.id,
      email: req.user.email,
    });

    console.log(
      "Request body:",
      JSON.stringify(req.body, null, 2),
    );

    /**
     * Validate request body with Zod.
     *
     * safeParse is used instead of parse so that
     * validation errors can be returned to the frontend.
     */
    const parsed =
      scheduleEmailSchema.safeParse(req.body);

    if (!parsed.success) {
      console.error(
        "❌ Schedule validation failed:",
        parsed.error.issues,
      );

      return res.status(400).json({
        success: false,
        error: "Invalid schedule request",
        details: parsed.error.issues,
      });
    }

    const input = parsed.data;

    console.log(
      "✅ Validated schedule input:",
      input,
    );

    /**
     * Schedule the emails.
     */
    const result = await scheduleEmails(
      req.user.id,
      input,
    );

    console.log(
      "✅ Emails scheduled successfully:",
      result,
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "❌ Schedule email error:",
      error,
    );

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

/**
 * Get scheduled emails
 */
export async function getScheduledEmailsController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const emails =
      await prisma.scheduledEmail.findMany({
        where: {
          campaign: {
            userId: req.user.id,
          },
          status: "SCHEDULED",
        },

        include: {
          sender: true,
          campaign: true,
        },

        orderBy: {
          scheduledAt: "asc",
        },
      });

    return res.status(200).json({
      success: true,
      data: emails,
    });
  } catch (error) {
    console.error(
      "Get scheduled emails error:",
      error,
    );

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Get sent emails
 */
export async function getSentEmailsController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const emails =
      await prisma.scheduledEmail.findMany({
        where: {
          campaign: {
            userId: req.user.id,
          },
          status: "SENT",
        },

        include: {
          sender: true,
          campaign: true,
        },

        orderBy: {
          sentAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      data: emails,
    });
  } catch (error) {
    console.error(
      "Get sent emails error:",
      error,
    );

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Get email statistics
 */
export async function getEmailStatsController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const userId = req.user.id;

    const [
      scheduled,
      processing,
      sent,
      failed,
      total,
    ] = await Promise.all([
      prisma.scheduledEmail.count({
        where: {
          campaign: {
            userId,
          },
          status: "SCHEDULED",
        },
      }),

      prisma.scheduledEmail.count({
        where: {
          campaign: {
            userId,
          },
          status: "PROCESSING",
        },
      }),

      prisma.scheduledEmail.count({
        where: {
          campaign: {
            userId,
          },
          status: "SENT",
        },
      }),

      prisma.scheduledEmail.count({
        where: {
          campaign: {
            userId,
          },
          status: "FAILED",
        },
      }),

      prisma.scheduledEmail.count({
        where: {
          campaign: {
            userId,
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        scheduled,
        processing,
        sent,
        failed,
        total,
      },
    });
  } catch (error) {
    console.error(
      "Get email stats error:",
      error,
    );

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Get configured senders
 */
export async function getSendersController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const senders =
      await prisma.sender.findMany({
        where: {
          userId: req.user.id,
        },

        orderBy: {
          createdAt: "asc",
        },

        select: {
          id: true,
          email: true,
          name: true,
        },
      });

    return res.status(200).json({
      success: true,
      data: senders,
    });
  } catch (error) {
    console.error(
      "Get senders error:",
      error,
    );

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Create sender
 */
export async function createSenderController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const email =
      typeof req.body.email === "string"
        ? req.body.email
            .trim()
            .toLowerCase()
        : "";

    const name =
      typeof req.body.name === "string"
        ? req.body.name.trim()
        : null;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Sender email is required",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sender email",
      });
    }

    const existingSender =
      await prisma.sender.findUnique({
        where: {
          userId_email: {
            userId: req.user.id,
            email,
          },
        },
      });

    if (existingSender) {
      return res.status(409).json({
        success: false,
        error: "This sender is already added",
      });
    }

    const sender =
      await prisma.sender.create({
        data: {
          userId: req.user.id,
          email,
          name: name || null,
        },

        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

    return res.status(201).json({
      success: true,
      data: sender,
    });
  } catch (error) {
    console.error(
      "Create sender error:",
      error,
    );

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}