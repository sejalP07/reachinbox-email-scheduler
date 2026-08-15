"use client";

import { FormEvent, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = () => {
    window.location.href =
      `${API_URL}/api/auth/google`;
  };

  const handleEmailLogin = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    // Email/password authentication is not part
    // of the current assignment implementation.
    alert(
      "Email/password login is not configured. Please use Login with Google.",
    );
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[336px]">

          {/* Login Card */}
          <div className="rounded-lg border border-slate-200 bg-white px-9 py-9 shadow-sm">

            {/* Heading */}
            <div className="mb-7 text-center">
              <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-slate-900">
                Login
              </h1>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#E2F5EC] px-4 text-[12px] font-medium text-slate-700 transition hover:bg-[#D7F0E4] focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <GoogleIcon />

              <span>Login with Google</span>
            </button>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="whitespace-nowrap text-[10px] text-slate-400">
                or sign up through email
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailLogin}>

              {/* Email */}
              <div className="mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Email ID"
                  autoComplete="email"
                  className="h-10 w-full rounded-lg bg-[#F4F7F6] px-3 text-[12px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Password"
                  autoComplete="current-password"
                  className="h-10 w-full rounded-lg bg-[#F4F7F6] px-3 text-[12px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Login */}
              <button
                type="submit"
                className="h-10 w-full rounded-lg bg-[#00B341] text-[12px] font-medium text-white transition hover:bg-[#00A63D] focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="14"
      height="14"
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