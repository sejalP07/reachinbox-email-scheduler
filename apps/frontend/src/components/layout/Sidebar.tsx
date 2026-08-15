"use client";

import {
  Clock3,
  LogOut,
  Mail,
  Plus,
  Send,
} from "lucide-react";

interface SidebarProps {
  activeTab: "scheduled" | "sent";
  onTabChange: (
    tab: "scheduled" | "sent",
  ) => void;
  onCompose: () => void;
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
  scheduledCount?: number;
  sentCount?: number;
  onLogout: () => void;
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

export default function Sidebar({
  activeTab,
  onTabChange,
  onCompose,
  user,
  scheduledCount = 0,
  sentCount = 0,
  onLogout,
}: SidebarProps) {
  const initials = getInitials(user.name);

  return (
    <aside className="hidden w-[230px] shrink-0 border-r border-slate-200 bg-white lg:flex">
      <div className="flex min-h-[calc(100vh-0px)] w-full flex-col px-4 py-5">

        {/* Logo */}
        <div className="mb-7 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <Mail className="h-4 w-4 text-white" />
          </div>

          <span className="text-[18px] font-bold tracking-tight text-slate-900">
            ReachInbox
          </span>
        </div>

        {/* User */}
        <div className="mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.name} profile`}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {initials}
                </div>
              )}

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name}
              </p>

              <p className="truncate text-[11px] text-slate-500">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Compose */}
        <button
          type="button"
          onClick={onCompose}
          className="mb-7 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-emerald-500 bg-white text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
        >
          <Plus className="h-4 w-4" />
          Compose
        </button>

        {/* Navigation */}
        <nav className="space-y-1">
          <button
            type="button"
            onClick={() =>
              onTabChange("scheduled")
            }
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
              activeTab === "scheduled"
                ? "bg-slate-100 font-semibold text-slate-900"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-3">
              <Clock3 className="h-[17px] w-[17px]" />
              Scheduled
            </span>

            <span className="text-xs text-slate-400">
              {scheduledCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onTabChange("sent")
            }
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
              activeTab === "sent"
                ? "bg-slate-100 font-semibold text-slate-900"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-3">
              <Send className="h-[17px] w-[17px]" />
              Sent
            </span>

            <span className="text-xs text-slate-400">
              {sentCount}
            </span>
          </button>
        </nav>

        {/* Bottom */}
        <div className="mt-auto border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}