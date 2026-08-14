import { Router } from "express";

import {
  scheduleEmailsController,
} from "../controllers/email.controller.js";

const router = Router();

router.post(
  "/schedule",
  scheduleEmailsController,
);

export default router;