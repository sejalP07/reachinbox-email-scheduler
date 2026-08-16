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
 * PostgreSQL connection pool used by express-session.
 *
 * Sessions are persisted in PostgreSQL instead of
 * Express's default in-memory MemoryStore.
 */
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

sessionPool.on("error", (error) => {
  console.error("❌ Session PostgreSQL pool error:", error);
});

/**
 * PostgreSQL session store.
 */
const PgSessionStore = pgSession(session);

/**
 * Security headers.
 */
app.use(helmet());

/**
 * CORS.
 */
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ??
      "http://localhost:3000",
    credentials: true,
  }),
);

/**
 * Request body parsing.
 */
app.use(express.json({ limit: "2mb" }));

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/**
 * Persistent PostgreSQL-backed sessions.
 *
 * This replaces Express's default MemoryStore.
 */
app.use(
  session({
    store: new PgSessionStore({
      pool: sessionPool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),

    secret:
      process.env.SESSION_SECRET ??
      "development-secret-change-later",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",

      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

/**
 * Passport authentication.
 */
app.use(passport.initialize());

app.use(passport.session());

/**
 * HTTP request logging.
 */
app.use(pinoHttp({}));



app.get("/", (_req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="mA1LpHVwiH6Emi6qW8KIDSINQbLGjJpi-HvrBuAWQ2U"
        />
        <title>ReachInbox Email Scheduler</title>
      </head>
      <body>
        <h1>ReachInbox Email Scheduler</h1>
      </body>
    </html>
  `);
});

/**
 * Basic health check.
 */
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "reachinbox-backend",
    timestamp: new Date().toISOString(),
  });
});

/**
 * PostgreSQL health check.
 */
app.use("/health", healthRoutes);

/**
 * Authentication routes.
 */
app.use("/api/auth", authRoutes);

/**
 * Email scheduling routes.
 */
app.use("/api/emails", emailRoutes);

export default app;