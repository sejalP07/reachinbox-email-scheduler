import "dotenv/config";

import emailRoutes from "./routes/email.routes.js";
import healthRoutes from "./routes/health.routes.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttpModule from "pino-http";

const pinoHttp = pinoHttpModule.default ?? pinoHttpModule;
const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(pinoHttp({}));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "reachinbox-backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/health", healthRoutes);

app.use("/api/emails", emailRoutes);

export default app;