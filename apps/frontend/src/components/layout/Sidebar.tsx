"use client";

import {
  Clock3,
  Send,
  Settings,
} from "lucide-react";

interface SidebarProps {
  activeTab: "scheduled" | "sent";
  onTabChange: (
    tab: "scheduled" | "sent",
  ) => void;

  settingsOpen: boolean;

  onSettingsChange: (
    open: boolean,
  ) => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  settingsOpen,
  onSettingsChange,
}: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full min-h-[calc(100vh-64px)] flex-col p-4">
        <nav className="space-y-1">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <button
            type="button"
            onClick={() => {
              onSettingsChange(false);
              onTabChange("scheduled");
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              !settingsOpen &&
              activeTab === "scheduled"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Clock3 className="h-4 w-4" />

            Scheduled Emails
          </button>

          <button
            type="button"
            onClick={() => {
              onSettingsChange(false);
              onTabChange("sent");
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              !settingsOpen &&
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
          <button
            type="button"
            onClick={() =>
              onSettingsChange(
                !settingsOpen,
              )
            }
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              settingsOpen
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Settings className="h-4 w-4" />

            Settings
          </button>
        </div>
      </div>
    </aside>
  );
}