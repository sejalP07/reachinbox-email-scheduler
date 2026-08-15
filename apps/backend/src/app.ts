import "dotenv/config";

import cors from "cors";
import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { Pool } from "pg";
import helmet from "helmet";
import pinoHttpModule from "pino-http";

import passport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import emailRoutes from "./routes/email.routes.js";
import healthRoutes from "./routes/health.routes.js";

const pinoHttp = pinoHttpModule.default ?? pinoHttpModule;

const app = express();

/**
 * PostgreSQL connection pool for persistent sessions.
 */
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

sessionPool.on("error", (error) => {
  console.error("❌ Session PostgreSQL pool error:", error);
});

const PgSessionStore = pgSession(session);

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ??
      "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/**
 * IMPORTANT:
 * Store sessions in PostgreSQL instead of
 * express-session's in-memory store.
 */
app.use(
  session({
    store: new PgSessionStore({
      pool: sessionPool,
      tableName: "session",
      createTableIfMissing: false,
    }),

    secret:
      process.env.SESSION_SECRET ??
      "development-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use(passport.initialize());

app.use(passport.session());

app.use(pinoHttp({}));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "reachinbox-backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/health", healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/emails", emailRoutes);

export default app;