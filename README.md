# ReachInbox Email Scheduler

A production-style email scheduling service and dashboard, built for the ReachInbox hiring assignment. Users log in with Google, compose a message to a list of recipients, and the backend schedules and sends each email at the configured time — reliably, without cron, and without losing or duplicating work if the server restarts.

---

## 🚀 Features

* 🔐 Real Google OAuth 2.0 login (Passport, session-based)
* ✉️ Compose emails with subject, rich-text body, and a recipient list
* 📎 CSV/TXT lead upload with automatic email-address parsing
* ⏰ Schedule a start time, per-email delay, and hourly send limit per campaign
* 📋 Scheduled Emails and Sent Emails dashboard views
* 📊 Live stats (scheduled / sent / failed) with auto-refresh
* ⚡ BullMQ + Redis delayed jobs — **no cron, anywhere**
* 🔒 Redis-backed, multi-worker-safe rate limiting (per-sender, per-hour)
* ♻️ Automatic requeue into the next hour window when the rate limit is hit
* 🔁 Idempotent sending — a job can never send the same email twice
* 🗄️ PostgreSQL + Prisma for persistent storage
* 📤 Ethereal Email (fake SMTP) for safe test sending, with preview links
* 🐳 Docker Compose for Postgres + Redis

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │   Next.js Frontend    │
                    └──────────┬───────────┘
                               │ REST API (session cookie)
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend     │
                    │  (Passport, Prisma)   │
                    └───────┬─────┬────────┘
                            │     │
               ┌────────────┘     └──────────────┐
               ▼                                  ▼
     ┌──────────────────┐               ┌──────────────────┐
     │    PostgreSQL      │               │      Redis         │
     │ users / senders /   │               │  BullMQ queue +     │
     │ campaigns / emails  │               │  rate-limit counters │
     └──────────────────┘               └────────┬─────────┘
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                                          │   BullMQ Worker    │
                                          │ (concurrency, rate  │
                                          │  limit, idempotency)│
                                          └────────┬─────────┘
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                                          │  Ethereal SMTP     │
                                          │ (nodemailer)        │
                                          └──────────────────┘
```

---

## 📁 Project Structure

```text
reachinbox-email-scheduler/
│
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts       # Prisma client
│   │   │   │   ├── redis.ts          # ioredis connection
│   │   │   │   └── passport.ts       # Google OAuth strategy
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── email.controller.ts
│   │   │   ├── middleware/
│   │   │   │   └── require-auth.ts
│   │   │   ├── queues/
│   │   │   │   ├── email.queue.ts    # BullMQ Queue definition
│   │   │   │   └── email.worker.ts   # BullMQ Worker (concurrency, locking)
│   │   │   ├── services/
│   │   │   │   ├── email-scheduler.service.ts  # creates campaign + delayed jobs
│   │   │   │   ├── email-rate-limiter.service.ts # atomic Redis rate limiter
│   │   │   │   └── email-smtp.service.ts       # Ethereal/nodemailer transport
│   │   │   ├── routes/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── login/
│       │   │   └── dashboard/
│       │   ├── components/
│       │   │   ├── layout/           # Header, Sidebar
│       │   │   ├── email/            # ComposeEmailModal (CSV upload, editor)
│       │   │   ├── dashboard/        # EmailTable, ScheduledEmails, SentEmails, DashboardStats
│       │   │   └── ui/               # Button, Input, Modal, Badge, EmptyState
│       │   ├── lib/                  # api.ts, auth.ts, emails.ts, csv.ts
│       │   └── types/
│       └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Tech Stack

**Backend:** TypeScript, Express, BullMQ, ioredis, Prisma, PostgreSQL, Passport (Google OAuth 2.0), nodemailer (Ethereal SMTP), Zod, Pino

**Frontend:** Next.js, React, TypeScript, Tailwind CSS

**Infra:** Docker Compose (PostgreSQL + Redis)

---

## 📋 Prerequisites

* Node.js 20+
* Docker Desktop (for Postgres + Redis) — or local installs of both
* A Google Cloud OAuth 2.0 Client ID/Secret
* An Ethereal Email account (free, generated instantly at [ethereal.email](https://ethereal.email))

---

## 📥 Installation

```bash
git clone https://github.com/sejalP07/reachinbox-email-scheduler.git
cd reachinbox-email-scheduler
```

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5434` and Redis on `localhost:6379`.

### 2. Backend

```bash
cd apps/backend
npm install
cp .env.example .env
# fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ETHEREAL_USER, ETHEREAL_PASSWORD (see below)

npx prisma migrate dev
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## 🔐 Environment Variables (`apps/backend/.env`)

| Variable                         | Description                                              |
| --------------------------------- | ---------------------------------------------------------- |
| `NODE_ENV`                        | `development` / `production`                               |
| `PORT`                            | Backend port (default `5000`)                              |
| `DATABASE_URL`                    | PostgreSQL connection string                                |
| `REDIS_HOST` / `REDIS_PORT`       | Redis connection                                            |
| `WORKER_CONCURRENCY`              | BullMQ worker concurrency (configurable, no hardcoding)     |
| `MIN_EMAIL_DELAY_MS`              | Minimum delay between individual sends, in ms               |
| `MAX_EMAILS_PER_HOUR_PER_SENDER`  | Hourly send cap, enforced per sender                        |
| `FRONTEND_URL`                    | Used for OAuth redirects and CORS                            |
| `SESSION_SECRET`                  | Express session signing secret                               |
| `GOOGLE_CLIENT_ID` / `_SECRET`    | From Google Cloud Console                                    |
| `GOOGLE_CALLBACK_URL`             | Must match the redirect URI registered in Google Cloud       |
| `ETHEREAL_HOST` / `_PORT`         | Ethereal SMTP host (`smtp.ethereal.email`) / port (`587`)     |
| `ETHEREAL_USER` / `_PASSWORD`     | Credentials from an Ethereal test account                    |

**Never commit `.env`.** Only `.env.example` should be tracked.

### Setting up Ethereal Email

Ethereal accounts are free and disposable — generate one at [https://ethereal.email](https://ethereal.email) ("Create Ethereal Account"), or programmatically via `nodemailer.createTestAccount()`. Copy the generated `user` and `pass` into `ETHEREAL_USER` / `ETHEREAL_PASSWORD`. Every send returns a preview URL (visible in the worker logs and stored on the email record) where you can view the rendered email in a browser — nothing is actually delivered.

### Setting up Google OAuth

1. Create a project in [Google Cloud Console](https://console.cloud.google.com).
2. Under **APIs & Services → Credentials**, create an **OAuth Client ID** of type **Web application**.
3. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`.
4. Copy the Client ID and Secret into `.env`.

---

## 🧠 Architecture Overview

### How scheduling works

Scheduling emails is entirely BullMQ-driven — **no cron jobs are used anywhere** in this project. When a campaign is submitted:

1. `email-scheduler.service.ts` creates a `Campaign` row and one `ScheduledEmail` row per unique recipient in PostgreSQL.
2. For each recipient, a BullMQ job is added to the `email-scheduler` queue with a computed `delay` (time until `scheduledAt`), using BullMQ's native delayed-job mechanism (backed by a Redis sorted set) rather than any polling or cron trigger.
3. When a job's delay elapses, BullMQ hands it to an available worker.

### How persistence on restart is handled

BullMQ jobs live in Redis, not in process memory, so scheduled (delayed) jobs survive a backend restart on their own. On top of that, every job is tied to a `ScheduledEmail` row in PostgreSQL with a `status` field (`SCHEDULED → PROCESSING → SENT/FAILED`), so:

* If the backend restarts before a job's delay elapses, the job is still sitting in Redis and fires at the correct time — nothing needs to be recreated.
* If the backend restarts *while* a job is mid-processing, the worker re-checks the email's DB status before doing any send. An email already marked `SENT` is skipped rather than resent.

### How idempotency is enforced

Before sending, the worker attempts an atomic `UPDATE ... WHERE id = ? AND status = 'SCHEDULED'` to flip the row to `PROCESSING`. Only the worker that wins this conditional update proceeds to send; any other worker (or retry) sees `count === 0`, checks whether the email is already `SENT` or `PROCESSING`, and skips rather than sending again. This makes double-sends impossible even with concurrent workers or BullMQ retries.

### How rate limiting is enforced

Rate limiting is implemented with a Redis Lua script (`email-rate-limiter.service.ts`) executed via `EVAL`, which makes the whole check-and-increment operation atomic — safe across multiple worker processes or backend instances, since nothing relies on in-memory counters. The script:

1. Reads the current hourly count for `email-rate:{senderId}:{hourWindowStart}` and the sender's next-allowed-send timestamp.
2. If the hourly cap (`MAX_EMAILS_PER_HOUR_PER_SENDER`, configurable via env, or overridden per-campaign) is reached, or the minimum delay hasn't elapsed since the sender's last send, it returns "not allowed" plus the timestamp when a retry should be attempted — without sending.
3. Otherwise, it atomically increments the hourly counter and reserves the next send slot, then returns "allowed."

When a send is *not allowed*, the worker releases its DB processing lock (so the email goes back to `SCHEDULED`) and re-enqueues a new BullMQ job delayed until the returned retry time — so the email is rescheduled into the next available window instead of being dropped or hard-failed.

### Behavior under load

Scheduling 1000+ emails for the same start time creates 1000+ individually delayed BullMQ jobs (staggered by `delayMs` per recipient) rather than one giant job. When many jobs become eligible around the same time and exceed the hourly/delay limits, the rate limiter above pushes the excess into later windows automatically — throughput is bounded by `WORKER_CONCURRENCY`, `MIN_EMAIL_DELAY_MS`, and `MAX_EMAILS_PER_HOUR_PER_SENDER`, all configurable via env, with no code changes needed to tune behavior.

---

## ✅ Features Implemented

**Backend**
- [x] Scheduling via BullMQ delayed jobs (no cron)
- [x] Persistence across restarts (Redis-backed queue + Postgres status tracking)
- [x] Configurable worker concurrency
- [x] Minimum delay between sends
- [x] Per-sender hourly rate limiting, Redis-backed and multi-worker safe
- [x] Automatic requeue into the next hour window on rate-limit hit
- [x] Idempotent sends (DB status lock)
- [x] Real Google OAuth 2.0 (Passport)
- [x] Ethereal SMTP sending with preview URLs

**Frontend**
- [x] Google login → redirect to dashboard
- [x] Header with name, email, avatar, logout
- [x] Scheduled / Sent tabs with loading and empty states
- [x] Compose modal: subject, rich-text body, CSV/TXT lead upload with parsed recipient count, start time, delay, hourly limit
- [x] Live stats (scheduled / sent / failed)

---

## 🧪 Assumptions & Trade-offs

* Ethereal Email is used exactly as specified — sent messages are not actually delivered; each has a viewable preview URL instead.
* The hourly rate limit is enforced **per sender**, with a per-campaign `hourlyLimit` that is capped by the global `MAX_EMAILS_PER_HOUR_PER_SENDER` env var, whichever is lower.
* Recipient lists are deduplicated and normalized (trimmed, lowercased) at both the CSV-parsing step and the scheduling step.
* Failed sends (SMTP errors) are marked `FAILED` and left for BullMQ's built-in retry/backoff (3 attempts, exponential backoff) rather than being silently dropped.

---

## 👩‍💻 Author

**Sejal P** — MCA, RV Institute of Technology and Management, Bangalore
