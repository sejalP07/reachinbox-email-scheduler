"use client";

import {
  Clock3,
  LayoutDashboard,
  Send,
  Settings,
} from "lucide-react";

interface SidebarProps {
  activeTab: "scheduled" | "sent";
  onTabChange: (
    tab: "scheduled" | "sent",
  ) => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
}: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full min-h-[calc(100vh-64px)] flex-col p-4">
        <nav className="space-y-1">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <button
            onClick={() => onTabChange("scheduled")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              activeTab === "scheduled"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Clock3 className="h-4 w-4" />
            Scheduled Emails
          </button>

          <button
            onClick={() => onTabChange("sent")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              activeTab === "sent"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Send className="h-4 w-4" />
            Sent Emails
          </button>
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>
    </aside>
  );
}