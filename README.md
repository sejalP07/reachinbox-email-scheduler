# ReachInbox Scheduler

A production-style email scheduling application that allows users to connect their Google account, create scheduled emails, manage scheduled messages, and automatically send them at the configured time.

The project is designed with a scalable backend architecture using **FastAPI, PostgreSQL, Redis, and background workers**, with a modern frontend built using **Next.js, TypeScript, and Tailwind CSS**.

---

## 🚀 Features

* 🔐 Google OAuth 2.0 authentication
* 📧 Gmail account integration
* ✉️ Compose and schedule emails
* ⏰ Schedule emails for a specific date and time
* 📋 View scheduled emails
* 🗑️ Cancel scheduled emails
* 📤 Track email delivery status
* 🔄 Background email processing
* ⚡ Redis-based job queue
* 🗄️ PostgreSQL database
* 🔒 Secure token management
* 🐳 Docker support
* 🌐 REST API architecture
* 📊 Email status tracking
* ♻️ Retry handling for failed email jobs
* 🧩 Modular backend architecture

---

# 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │      Next.js        │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │       Backend       │
                         └───────┬─────┬───────┘
                                 │     │
                    ┌────────────┘     └──────────────┐
                    ▼                                 ▼
          ┌──────────────────┐              ┌──────────────────┐
          │   PostgreSQL     │              │      Redis       │
          │    Database      │              │    Job Queue     │
          └──────────────────┘              └────────┬─────────┘
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │  Worker /       │
                                             │  Scheduler      │
                                             └────────┬────────┘
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │   Gmail API     │
                                             └─────────────────┘
```

---

# 📁 Project Structure

```text
reachinbox-scheduler/
│
├── apps/
│   │
│   ├── backend/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── routes/
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── emails.py
│   │   │   │   │   └── health.py
│   │   │   │   │
│   │   │   │   └── dependencies.py
│   │   │   │
│   │   │   ├── core/
│   │   │   │   ├── config.py
│   │   │   │   ├── security.py
│   │   │   │   └── database.py
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── user.py
│   │   │   │   └── email.py
│   │   │   │
│   │   │   ├── schemas/
│   │   │   │   ├── auth.py
│   │   │   │   └── email.py
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── google_oauth.py
│   │   │   │   ├── gmail.py
│   │   │   │   └── scheduler.py
│   │   │   │
│   │   │   ├── workers/
│   │   │   │   └── email_worker.py
│   │   │   │
│   │   │   └── main.py
│   │   │
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── .env.example
│   │
│   └── frontend/
│       ├── app/
│       │   ├── login/
│       │   ├── dashboard/
│       │   ├── compose/
│       │   └── page.tsx
│       │
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── EmailForm.tsx
│       │   ├── ScheduledEmailCard.tsx
│       │   └── StatusBadge.tsx
│       │
│       ├── lib/
│       │   └── api.ts
│       │
│       ├── public/
│       ├── package.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy

## Database

* PostgreSQL

## Queue / Scheduling

* Redis
* Background Worker
* Scheduled Job Processing

## Authentication

* Google OAuth 2.0

## Email Provider

* Gmail API

## Infrastructure

* Docker
* Docker Compose

---

# 📋 Prerequisites

Install the following before running the project:

* Git
* Python 3.10+
* Node.js 20+
* npm
* Docker Desktop
* PostgreSQL
* Redis

If using Docker, PostgreSQL and Redis can be started automatically using Docker Compose.

---

# 📥 Installation

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/reachinbox-scheduler.git

cd reachinbox-scheduler
```

---

# 🔧 Backend Setup

Move into the backend directory:

```bash
cd apps/backend
```

Create a virtual environment:

### Windows

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# 🔐 Environment Variables

Create:

```text
apps/backend/.env
```

Use `.env.example` as a reference.

Example:

```env
APP_NAME=ReachInbox Scheduler
ENVIRONMENT=development

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reachinbox

REDIS_URL=redis://localhost:6379/0

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

SECRET_KEY=your_secret_key

FRONTEND_URL=http://localhost:3000
```

### Important

Never commit `.env` to Git.

Your `.gitignore` should contain:

```gitignore
.env
.env.*
!.env.example
```

---

# 🔑 Google OAuth Setup

The application uses Google OAuth 2.0 to authenticate users and access Gmail.

## Step 1 — Create a Google Cloud Project

Open Google Cloud Console and create a new project.

Suggested project name:

```text
ReachInbox Scheduler
```

---

## Step 2 — Enable Gmail API

Navigate to:

```text
APIs & Services
→ Library
→ Gmail API
→ Enable
```

---

## Step 3 — Configure OAuth Consent Screen

Configure the OAuth consent screen with:

```text
App name:
ReachInbox Scheduler
```

Add your support email and developer contact information.

---

## Step 4 — Create OAuth Credentials

Go to:

```text
APIs & Services
→ Credentials
→ Create Credentials
→ OAuth Client ID
```

Application type:

```text
Web application
```

Add the authorized redirect URI:

```text
http://localhost:8000/api/auth/google/callback
```

Copy:

```text
Client ID
Client Secret
```

into your backend `.env` file.

---

# 📧 Gmail OAuth Scopes

The application may request Gmail permissions such as:

```text
openid
email
profile
https://www.googleapis.com/auth/gmail.send
```

Only request the minimum permissions required by the application.

---

# 🗄️ Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE reachinbox;
```

Example connection:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reachinbox
```

---

# 🔴 Redis Setup

Redis is used for scheduling and background job processing.

If Redis is installed locally:

```bash
redis-server
```

Default connection:

```env
REDIS_URL=redis://localhost:6379/0
```

---

# 🐳 Docker Setup

The easiest way to run PostgreSQL and Redis is Docker Compose.

From the project root:

```bash
docker compose up -d
```

Check running containers:

```bash
docker compose ps
```

Stop the services:

```bash
docker compose down
```

---

# ▶️ Running the Backend

From:

```text
apps/backend
```

Run:

```bash
uvicorn app.main:app --reload --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

ReDoc:

```text
http://localhost:8000/redoc
```

---

# ▶️ Running the Frontend

Open another terminal:

```bash
cd apps/frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# ⚙️ Running the Worker

The email worker processes scheduled jobs.

Example:

```bash
python -m app.workers.email_worker
```

The worker:

1. Reads scheduled jobs.
2. Checks whether the email is ready to send.
3. Retrieves the user's Gmail credentials.
4. Calls Gmail API.
5. Sends the email.
6. Updates the email status.
7. Retries failed jobs when appropriate.

---

# 📡 API Endpoints

## Health

### Check API health

```http
GET /health
```

Example response:

```json
{
  "status": "ok"
}
```

---

# 🔐 Authentication

## Start Google OAuth

```http
GET /api/auth/google/login
```

Redirects the user to Google's OAuth consent page.

---

## OAuth Callback

```http
GET /api/auth/google/callback
```

Google redirects the user back to this endpoint after authentication.

---

## Current User

```http
GET /api/auth/me
```

Example response:

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User"
}
```

---

# ✉️ Email APIs

## Create Scheduled Email

```http
POST /api/emails
```

Example request:

```json
{
  "to": "recipient@example.com",
  "subject": "Hello",
  "body": "This is a scheduled email.",
  "scheduled_at": "2026-08-20T10:30:00+05:30"
}
```

---

## Get Scheduled Emails

```http
GET /api/emails
```

---

## Get Email by ID

```http
GET /api/emails/{email_id}
```

---

## Cancel Scheduled Email

```http
DELETE /api/emails/{email_id}
```

---

# 📊 Email Status

An email can have the following statuses:

```text
scheduled
processing
sent
failed
cancelled
```

Example:

```text
scheduled
    ↓
processing
    ↓
sent
```

If delivery fails:

```text
processing
    ↓
failed
    ↓
retry
    ↓
processing
```

---

# ⏰ Scheduling Flow

When a user schedules an email:

```text
User
 │
 ▼
Next.js
 │
 ▼
FastAPI
 │
 ▼
Validate Request
 │
 ▼
PostgreSQL
 │
 ▼
Create Scheduled Email
 │
 ▼
Redis Queue
 │
 ▼
Worker
 │
 ├── Not ready → wait
 │
 └── Ready
       │
       ▼
    Gmail API
       │
       ▼
    Send Email
       │
       ▼
Update PostgreSQL
       │
       ▼
      SENT
```

---

# 🔒 Security

The application follows several security practices:

* OAuth 2.0 authentication
* HTTPS recommended for production
* Environment variables for secrets
* No secrets committed to Git
* Token encryption recommended
* Input validation using Pydantic
* Authentication middleware
* User-level data isolation
* Database constraints
* API error handling
* Rate-limit protection recommended
* Minimal OAuth scopes

---

# 🔄 Retry Strategy

Temporary Gmail/API failures should not immediately mark an email permanently failed.

A retry strategy can use exponential backoff:

```text
Attempt 1 → immediate
Attempt 2 → 5 seconds
Attempt 3 → 30 seconds
Attempt 4 → 2 minutes
Attempt 5 → 10 minutes
```

After the maximum retry count, the email is marked:

```text
failed
```

---

# 🧪 Testing

Run backend tests:

```bash
pytest
```

Run with verbose output:

```bash
pytest -v
```

Frontend tests can be added using the project's configured testing framework.

---

# 🧹 Code Quality

Recommended backend commands:

```bash
ruff check .
```

Format code:

```bash
ruff format .
```

Type checking:

```bash
mypy .
```

Frontend:

```bash
npm run lint
```

---

# 🐳 Full Docker Development

Start all services:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up -d --build
```

View logs:

```bash
docker compose logs -f
```

Backend logs:

```bash
docker compose logs -f backend
```

Worker logs:

```bash
docker compose logs -f worker
```

Stop everything:

```bash
docker compose down
```

Remove volumes:

```bash
docker compose down -v
```

---

# 🌐 Production Deployment

For production, the recommended architecture is:

```text
                    Internet
                       │
                       ▼
                  Load Balancer
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
      Frontend                   Backend
      Next.js                    FastAPI
                                    │
                  ┌─────────────────┼─────────────────┐
                  ▼                 ▼                 ▼
             PostgreSQL          Redis            Worker
                  │                                   │
                  └───────────────────────────────────┘
                                      │
                                      ▼
                                  Gmail API
```

Recommended production components:

* Next.js deployment
* FastAPI application server
* Managed PostgreSQL
* Managed Redis
* Background worker
* HTTPS
* Secure secret management
* Logging
* Monitoring
* Error tracking

---

# 📈 Scalability

The architecture is designed to support horizontal scaling.

Multiple backend instances can run behind a load balancer:

```text
                  Load Balancer
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    Backend 1      Backend 2      Backend 3
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                    Redis
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
           Worker 1 Worker 2 Worker 3
```

This allows the application to process a larger number of scheduled emails.

---

# 🧠 Design Decisions

## Why FastAPI?

FastAPI provides:

* High performance
* Async support
* Automatic OpenAPI documentation
* Pydantic validation
* Clean REST API development
* Easy integration with Python services

---

## Why PostgreSQL?

PostgreSQL is used for persistent application data such as:

* Users
* OAuth information
* Scheduled emails
* Email status
* Timestamps
* Retry information

---

## Why Redis?

Redis provides fast access to:

* Queues
* Job state
* Scheduling information
* Distributed locks
* Temporary data

---

## Why Background Workers?

Sending email directly inside an HTTP request can make requests slow and unreliable.

Instead:

```text
API Request
    ↓
Create Job
    ↓
Return Response
    ↓
Worker Processes Job
```

This improves reliability and scalability.

---

# 🗃️ Core Database Entities

## User

```text
User
├── id
├── email
├── name
├── google_id
├── access_token
├── refresh_token
├── token_expiry
├── created_at
└── updated_at
```

---

## Scheduled Email

```text
ScheduledEmail
├── id
├── user_id
├── recipient
├── subject
├── body
├── scheduled_at
├── status
├── retry_count
├── sent_at
├── error_message
├── created_at
└── updated_at
```

---

# 🛡️ Error Handling

The API should return consistent error responses.

Example:

```json
{
  "success": false,
  "message": "Email could not be scheduled",
  "error": "Invalid scheduled time"
}
```

Common HTTP status codes:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Too Many Requests
500 Internal Server Error
```

---

# 🐛 Troubleshooting

## Backend does not start

Check:

```bash
python --version
```

Then:

```bash
pip install -r requirements.txt
```

---

## PostgreSQL connection error

Verify PostgreSQL is running:

```bash
docker compose ps
```

Check:

```env
DATABASE_URL
```

Make sure the database exists.

---

## Redis connection error

Check Redis:

```bash
docker compose ps
```

Expected Redis URL:

```env
REDIS_URL=redis://localhost:6379/0
```

---

## Google OAuth redirect error

Make sure the redirect URI configured in Google Cloud exactly matches:

```text
http://localhost:8000/api/auth/google/callback
```

The following are considered different:

```text
http://localhost:8000/api/auth/google/callback
http://localhost:8000/api/auth/google/callback/
```

---

## Gmail API permission error

Verify that:

* Gmail API is enabled.
* OAuth credentials are correct.
* Required scopes are configured.
* The Google account has granted permission.
* OAuth consent screen is configured correctly.

---

## Email is not being sent

Check:

```text
1. Backend is running
2. Redis is running
3. Worker is running
4. Gmail OAuth is valid
5. Scheduled time is correct
6. Email status
7. Worker logs
```

---

# 🔐 Environment Variables Reference

| Variable               | Description                  |
| ---------------------- | ---------------------------- |
| `APP_NAME`             | Application name             |
| `ENVIRONMENT`          | development / production     |
| `DATABASE_URL`         | PostgreSQL connection string |
| `REDIS_URL`            | Redis connection string      |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret   |
| `GOOGLE_REDIRECT_URI`  | OAuth callback URL           |
| `SECRET_KEY`           | Application secret           |
| `FRONTEND_URL`         | Frontend application URL     |

---

# 🚦 Development Workflow

Recommended workflow:

```text
1. Start PostgreSQL
2. Start Redis
3. Start FastAPI
4. Start Worker
5. Start Next.js
6. Open application
7. Login with Google
8. Compose email
9. Select scheduled time
10. Create schedule
11. Worker processes email
12. Gmail sends email
13. Status updated
```

---

# 📌 Git Workflow

Create a feature branch:

```bash
git checkout -b feature/email-scheduling
```

Commit changes:

```bash
git add .
git commit -m "Add email scheduling"
```

Push:

```bash
git push origin feature/email-scheduling
```

---

# 📝 Example Commit Messages

```text
feat: add Google OAuth authentication
feat: add scheduled email API
feat: add Gmail integration
feat: add Redis job queue
feat: add email worker
feat: add scheduled email dashboard
fix: handle Gmail token refresh
fix: handle failed email jobs
refactor: improve scheduler architecture
test: add email scheduling tests
docs: update README
```

---

# 📊 Future Improvements

Possible future enhancements:

* Multiple Gmail accounts
* Email templates
* Recurring emails
* Bulk email scheduling
* Email attachments
* Timezone-aware scheduling
* Email analytics
* Delivery tracking
* Open tracking
* Click tracking
* Advanced retry policies
* Dead-letter queue
* Distributed scheduler
* Rate limiting
* Admin dashboard
* Audit logs
* Prometheus metrics
* Grafana monitoring
* Sentry error tracking
* Kubernetes deployment

---

# 🎯 Project Goals

The primary goals of ReachInbox Scheduler are:

1. Build a reliable email scheduling system.
2. Integrate Google OAuth securely.
3. Integrate Gmail API.
4. Process scheduled jobs asynchronously.
5. Build a scalable backend architecture.
6. Provide a clean user experience.
7. Demonstrate production-style software engineering practices.

---

# 👩‍💻 Author

**Sejal P**

MCA — RV Institute of Technology and Management, Bangalore

Software Engineering | Backend Development | AI/ML

---

# 📄 License

This project is intended for educational and development purposes.

Add an appropriate open-source license before publicly distributing the project.

---

# ⭐ Acknowledgements

Built using:

* FastAPI
* Next.js
* PostgreSQL
* Redis
* Google OAuth
* Gmail API
* Docker

---

## 🚀 Quick Start

For experienced developers, the complete setup is:

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/reachinbox-scheduler.git

cd reachinbox-scheduler

# Start infrastructure
docker compose up -d

# Backend
cd apps/backend

python -m venv .venv

# Windows
.venv\Scripts\Activate.ps1

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

In another terminal:

```bash
cd apps/frontend

npm install

npm run dev
```

Then open:

```text
http://localhost:3000
```

Backend API:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

---

## ⚠️ Important

Before pushing this repository to GitHub, verify that the following are **not committed**:

```text
.env
.env.local
credentials.json
Google OAuth client secrets
Access tokens
Refresh tokens
Database passwords
API keys
Secret keys
```

Use:

```text
.env.example
```

to document required environment variables without exposing actual secrets.
