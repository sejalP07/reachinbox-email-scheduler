import { Router } from "express";
import passport from "../config/passport.js";

import {
  getCurrentUser,
  logout,
} from "../controllers/auth.controller.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=google_auth_failed",
  }),
  (req, res) => {
    res.redirect("http://localhost:3000/dashboard");
  },
);

router.get("/me", getCurrentUser);

router.post("/logout", logout);

export default router;