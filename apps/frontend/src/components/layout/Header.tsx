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

export default function Header({
  user = {
    name: "Sejal P",
    email: "sejal@example.com",
  },
  onLogout,
}: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
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

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">
            {user.name}
          </p>
          <p className="text-xs text-slate-500">
            {user.email}
          </p>
        </div>

        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <button
          onClick={onLogout}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}