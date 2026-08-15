"use client";

import { LogOut, Mail } from "lucide-react";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]!.charAt(0).toUpperCase();
  }

  return (
    parts[0]!.charAt(0) +
    parts[parts.length - 1]!.charAt(0)
  ).toUpperCase();
}

export default function Header({
  user = {
    name: "Sejal P",
    email: "sejal@example.com",
  },
  onLogout,
}: HeaderProps) {
  const initials = getInitials(user.name);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
          <Mail className="h-5 w-5 text-white" />
        </div>

        <div>
          <h1 className="text-sm font-semibold text-slate-900">
            ReachInbox
          </h1>

          <p className="text-xs text-slate-500">
            Email Scheduler
          </p>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">
            {user.name}
          </p>

          <p className="max-w-55 truncate text-xs text-slate-500">
            {user.email}
          </p>
        </div>

        {/* Avatar */}
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.name} profile`}
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-md ring-1 ring-slate-200"
            />
          ) : (
            <div
              aria-label={`${user.name} profile`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md ring-2 ring-white"
            >
              {initials}
            </div>
          )}

          {/* Online indicator */}
          <span
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
            title="Online"
          />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}