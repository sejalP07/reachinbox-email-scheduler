import { Router } from "express";
import { prisma } from "../config/database.js";

const router = Router();

router.get("/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "postgresql",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "error",
      database: "postgresql",
    });
  }
});

export default router;