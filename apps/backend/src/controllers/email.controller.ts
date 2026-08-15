import type { Request, Response } from "express";

import { prisma } from "../config/database.js";
import { scheduleEmails } from "../services/email-scheduler.service.js";
import { scheduleEmailSchema } from "../utils/email.validation.js";

export async function scheduleEmailsController(
  req: Request,
  res: Response,
) {
  try {
    const input = scheduleEmailSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    console.log("🔐 Authenticated user:", {
      id: req.user.id,
      email: req.user.email,
    });

    const userId = req.user.id;

    const result = await scheduleEmails(
      userId,
      input,
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Schedule email error:",
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

    const emails = await prisma.scheduledEmail.findMany({
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

    const emails = await prisma.scheduledEmail.findMany({
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

    const senders = await prisma.sender.findMany({
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