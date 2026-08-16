import { Router } from "express";
import passport from "../config/passport.js";

import {
  getCurrentUser,
  logout,
} from "../controllers/auth.controller.js";

const router = Router();

const FRONTEND_URL =
  process.env.FRONTEND_URL ?? "http://localhost:3000";

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  (_req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  },
);

router.get("/me", getCurrentUser);

router.post("/logout", logout);

export default router;