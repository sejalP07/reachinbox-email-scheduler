"use client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-84">
          <div className="rounded-lg border border-slate-200 bg-white px-9 py-9 shadow-sm">
            <div className="mb-7 text-center">
              <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-slate-900">
                Login
              </h1>

              <p className="mt-2 text-[12px] text-slate-500">
                Sign in to ReachInbox Email Scheduler
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              aria-label="Continue with Google"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <GoogleIcon />

              <span>Continue with Google</span>
            </button>

            <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
              You will be redirected to Google to securely
              authenticate your account.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
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
        d="M12 6.11c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.2 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.7 5.39l3.24 2.5 3.24 2.5C7.31 7.83 9.46 6.11 12 6.11Z"
      />
    </svg>
  );
}