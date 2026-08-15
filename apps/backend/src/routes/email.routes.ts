import { Router } from "express";

import {
  createSenderController,
  getEmailStatsController,
  getScheduledEmailsController,
  getSentEmailsController,
  getSendersController,
  scheduleEmailsController,
} from "../controllers/email.controller.js";

import { requireAuth } from "../middleware/require-auth.js";

const router = Router();

router.post(
  "/schedule",
  requireAuth,
  scheduleEmailsController,
);

router.get(
  "/scheduled",
  requireAuth,
  getScheduledEmailsController,
);

router.get(
  "/sent",
  requireAuth,
  getSentEmailsController,
);

router.get(
  "/stats",
  requireAuth,
  getEmailStatsController,
);

router.get(
  "/senders",
  requireAuth,
  getSendersController,
);

router.post(
  "/senders",
  requireAuth,
  createSenderController,
);

export default router;