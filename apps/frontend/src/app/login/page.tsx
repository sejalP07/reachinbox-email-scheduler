"use client";

import { Mail } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href =
      `${API_URL}/api/auth/google`;
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Left branding panel */}
        <section className="hidden w-1/2 bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
                <Mail className="h-5 w-5" />
              </div>

              <span className="text-lg font-semibold">
                ReachInbox
              </span>
            </div>
          </div>

          <div className="max-w-lg">
            <p className="mb-4 text-sm font-medium text-indigo-400">
              EMAIL AUTOMATION
            </p>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Schedule smarter.
              <br />
              Send reliably.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Manage scheduled campaigns, automate
              email delivery, and monitor every message
              from one simple workspace.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            ReachInbox Scheduler
          </p>
        </section>

        {/* Login panel */}
        <section className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
                <Mail className="h-5 w-5 text-white" />
              </div>

              <span className="text-lg font-semibold text-slate-900">
                ReachInbox
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to manage your email campaigns.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:shadow-sm"
              >
                <GoogleIcon />

                Continue with Google
              </button>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs text-slate-400">
                  SECURE LOGIN
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="text-center text-xs leading-5 text-slate-400">
                By continuing, you agree to use ReachInbox
                for legitimate business communication.
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              © 2026 ReachInbox Scheduler
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.71-.06-1.39-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.93v2.42h3.14c1.84-1.69 2.92-4.18 2.92-7.18Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.42c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.74 9.74 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.86a5.85 5.85 0 0 1 0-3.72V7.64H3.3a9.75 9.75 0 0 0 0 8.72l3.24-2.5Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.11c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.2 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.7 5.39l3.24 2.5C7.31 7.83 9.46 6.11 12 6.11Z"
      />
    </svg>
  );
}