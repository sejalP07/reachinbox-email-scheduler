"use client";

import {
  Clock3,
  Filter,
  Mail,
  Search,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import ComposeEmailModal from "@/components/email/ComposeEmailModal";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ScheduledEmails from "@/components/dashboard/ScheduledEmails";
import SentEmails from "@/components/dashboard/SentEmails";

import { getCurrentUser, logout } from "@/lib/auth";

import {
  getEmailStats,
  getScheduledEmails,
  getSentEmails,
} from "@/lib/emails";

import type { User } from "@/types/user";

import type {
  EmailStats,
  ScheduledEmail,
} from "@/types/email";

export default function DashboardPage() {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [activeTab, setActiveTab] =
    useState<"scheduled" | "sent">(
      "scheduled",
    );

  const [stats, setStats] =
    useState<EmailStats | null>(null);

  const [scheduledEmails, setScheduledEmails] =
    useState<ScheduledEmail[]>([]);

  const [sentEmails, setSentEmails] =
    useState<ScheduledEmail[]>([]);

  const [composeOpen, setComposeOpen] =
    useState(false);

  const [emailsLoading, setEmailsLoading] =
    useState(true);

  const [backendOffline, setBackendOffline] =
    useState(false);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setEmailsLoading(true);

        const currentUser =
          await getCurrentUser();

        if (!mounted) {
          return;
        }

        setUser(currentUser);

        const [
          emailStats,
          scheduled,
          sent,
        ] = await Promise.all([
          getEmailStats(),
          getScheduledEmails(),
          getSentEmails(),
        ]);

        if (!mounted) {
          return;
        }

        setStats(emailStats);
        setScheduledEmails(scheduled);
        setSentEmails(sent);
        setBackendOffline(false);
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error,
        );

        if (mounted) {
          setBackendOffline(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setEmailsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Keep the dashboard synchronized with the
   * backend so scheduled → processing → sent
   * changes appear automatically.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;

    async function refreshDashboard() {
      try {
        const [
          emailStats,
          scheduled,
          sent,
        ] = await Promise.all([
          getEmailStats(),
          getScheduledEmails(),
          getSentEmails(),
        ]);

        if (!mounted) {
          return;
        }

        setStats(emailStats);
        setScheduledEmails(scheduled);
        setSentEmails(sent);
        setBackendOffline(false);
      } catch (error) {
        console.error(
          "Failed to refresh dashboard:",
          error,
        );

        if (mounted) {
          setBackendOffline(true);
        }
      }
    }

    const interval =
      window.setInterval(
        refreshDashboard,
        3000,
      );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [user]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  }

  const displayedEmails =
    activeTab === "scheduled"
      ? scheduledEmails
      : sentEmails;

  const filteredEmails = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return displayedEmails;
    }

    return displayedEmails.filter(
      (email) =>
        email.recipient
          .toLowerCase()
          .includes(query) ||
        email.subject
          .toLowerCase()
          .includes(query) ||
        email.sender.email
          .toLowerCase()
          .includes(query),
    );
  }, [displayedEmails, search]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-sm text-slate-500">
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSearch("");
          }}
          onCompose={() =>
            setComposeOpen(true)
          }
          user={{
            name: user.name,
            email: user.email,
            avatar:
              user.avatar ?? undefined,
          }}
          scheduledCount={
            stats?.scheduled ?? 0
          }
          sentCount={stats?.sent ?? 0}
          onLogout={handleLogout}
        />

        {/* Main */}
        <main className="min-w-0 flex-1 bg-white">

          {/* Mobile top bar */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                <Mail className="h-4 w-4 text-white" />
              </div>

              <span className="font-semibold text-slate-900">
                ReachInbox
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setComposeOpen(true)
              }
              className="rounded-full border border-emerald-500 px-4 py-2 text-xs font-medium text-emerald-600"
            >
              Compose
            </button>
          </div>

          {/* Backend warning */}
          {backendOffline && (
            <div className="mx-5 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 lg:mx-8">
              Backend temporarily unavailable.
              Retrying automatically...
            </div>
          )}

          <div className="mx-auto min-h-screen max-w-[1400px]">

            {/* Toolbar */}
            <div className="flex h-[72px] items-center gap-4 border-b border-slate-200 px-5 lg:px-8">

              <div className="relative flex-1 max-w-[620px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search"
                  className="h-10 w-full rounded-lg border border-transparent bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-200 focus:bg-white"
                />
              </div>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                title="Filter"
              >
                <Filter className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setComposeOpen(true)
                }
                className="hidden rounded-full border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 lg:block"
              >
                Compose
              </button>
            </div>

            {/* Stats */}
            <DashboardStats stats={stats} />

            {/* Mobile tabs */}
            <div className="flex border-b border-slate-200 px-5 lg:hidden">
              <TabButton
                active={
                  activeTab === "scheduled"
                }
                icon={
                  <Clock3 className="h-4 w-4" />
                }
                label="Scheduled"
                onClick={() =>
                  setActiveTab("scheduled")
                }
              />

              <TabButton
                active={
                  activeTab === "sent"
                }
                icon={
                  <Send className="h-4 w-4" />
                }
                label="Sent"
                onClick={() =>
                  setActiveTab("sent")
                }
              />
            </div>

            {/* Email list */}
            <section>
              {emailsLoading ? (
                <div className="flex min-h-[420px] items-center justify-center">
                  <p className="text-sm text-slate-400">
                    Loading emails...
                  </p>
                </div>
              ) : activeTab === "scheduled" ? (
                <ScheduledEmails
                  emails={filteredEmails}
                  search={search}
                />
              ) : (
                <SentEmails
                  emails={filteredEmails}
                  search={search}
                />
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Compose */}
      <ComposeEmailModal
        open={composeOpen}
        onClose={() =>
          setComposeOpen(false)
        }
        onScheduled={() => {
          setComposeOpen(false);
        }}
      />
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm ${
        active
          ? "border-emerald-500 font-semibold text-slate-900"
          : "border-transparent text-slate-500"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

