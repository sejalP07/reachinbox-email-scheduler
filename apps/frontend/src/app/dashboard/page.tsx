"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  MailCheck,
  MailPlus,
  Send,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import ComposeEmailModal from "@/components/email/ComposeEmailModal";

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
  const [backendOffline, setBackendOffline] =
    useState(false);
  const [scheduledEmails, setScheduledEmails] =
    useState<ScheduledEmail[]>([]);

  const [sentEmails, setSentEmails] =
    useState<ScheduledEmail[]>([]);

  const [composeOpen, setComposeOpen] =
  useState(false);

  const [emailsLoading, setEmailsLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadInitialDashboard() {
      try {
        setLoading(true);
        setEmailsLoading(true);

        const currentUser = await getCurrentUser();

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
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error,
        );

        // Do not immediately redirect.
        // Keep the user on the dashboard.
      } finally {
        if (mounted) {
          setLoading(false);
          setEmailsLoading(false);
        }
      }
    }

    loadInitialDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;

    async function refreshEmailData() {
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
      } catch {
      if (mounted) {
        setBackendOffline(true);
        }
      }
    }

    const refreshInterval =
      window.setInterval(
        refreshEmailData,
        3000,
      );

    return () => {
      mounted = false;
      window.clearInterval(refreshInterval);
    };
  }, [user]);
  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayedEmails =
    activeTab === "scheduled"
      ? scheduledEmails
      : sentEmails;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        user={{ ...user, avatar: user.avatar ?? undefined }}
        onLogout={handleLogout}
      />

      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <main className="min-w-0 flex-1 p-6 lg:p-8">
            {backendOffline && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Backend temporarily unavailable. Retrying automatically...
            </div>
          )}
          <div className="mx-auto max-w-7xl">

            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-1 text-sm font-medium text-indigo-600">
                  Workspace
                </p>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Email Dashboard
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage and monitor your email campaigns.
                </p>
              </div>

              <Button onClick={() => setComposeOpen(true)}>
                <span className="flex items-center gap-2">
                  <MailPlus className="h-4 w-4" />
                  Compose New Email
                </span>
              </Button>
              <ComposeEmailModal
                open={composeOpen}
                onClose={() => setComposeOpen(false)}
                onScheduled={() => {
                  // The polling interval will pick up the new scheduled email.
                }}
              />
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Scheduled"
                value={String(
                  stats?.scheduled ?? 0,
                )}
                icon={
                  <Clock3 className="h-5 w-5" />
                }
              />

              <StatCard
                label="Sent"
                value={String(
                  stats?.sent ?? 0,
                )}
                icon={
                  <Send className="h-5 w-5" />
                }
              />

              <StatCard
                label="Failed"
                value={String(
                  stats?.failed ?? 0,
                )}
                icon={
                  <MailCheck className="h-5 w-5" />
                }
              />

              <StatCard
                label="Total Emails"
                value={String(
                  stats?.total ?? 0,
                )}
                icon={
                  <MailPlus className="h-5 w-5" />
                }
              />
            </div>

            {/* Email table */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 pt-4">
                <div className="flex gap-6">
                  <button
                    onClick={() =>
                      setActiveTab("scheduled")
                    }
                    className={`border-b-2 pb-3 text-sm font-medium ${
                      activeTab === "scheduled"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-500"
                    }`}
                  >
                    Scheduled Emails
                  </button>

                  <button
                    onClick={() =>
                      setActiveTab("sent")
                    }
                    className={`border-b-2 pb-3 text-sm font-medium ${
                      activeTab === "sent"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-500"
                    }`}
                  >
                    Sent Emails
                  </button>
                </div>
              </div>

              {emailsLoading ? (
                <div className="flex min-h-75 items-center justify-center">
                  <p className="text-sm text-slate-500">
                    Loading emails...
                  </p>
                </div>
              ) : (
                <EmailTable
                  emails={displayedEmails}
                  type={activeTab}
                />
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function EmailTable({
  emails,
  type,
}: {
  emails: ScheduledEmail[];
  type: "scheduled" | "sent";
}) {
  if (emails.length === 0) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <div className="text-center">
          <h3 className="text-sm font-semibold text-slate-900">
            No {type} emails
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Your emails will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-175 text-left">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-6 py-4 font-medium">
              Recipient
            </th>

            <th className="px-6 py-4 font-medium">
              Subject
            </th>

            <th className="px-6 py-4 font-medium">
              Sender
            </th>

            <th className="px-6 py-4 font-medium">
              {type === "scheduled"
                ? "Scheduled At"
                : "Sent At"}
            </th>

            <th className="px-6 py-4 font-medium">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {emails.map((email) => (
            <tr
              key={email.id}
              className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
            >
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {email.recipient}
              </td>

              <td className="max-w-62.5 truncate px-6 py-4 text-sm text-slate-600">
                {email.subject}
              </td>

              <td className="px-6 py-4 text-sm text-slate-600">
                {email.sender.email}
              </td>

              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                {formatDate(
                  type === "scheduled"
                    ? email.scheduledAt
                    : email.sentAt,
                )}
              </td>

              <td className="px-6 py-4">
                <StatusBadge
                  status={email.status}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ScheduledEmail["status"];
}) {
  const classes = {
    SCHEDULED:
      "bg-blue-50 text-blue-700",
    PROCESSING:
      "bg-yellow-50 text-yellow-700",
    SENT:
      "bg-green-50 text-green-700",
    FAILED:
      "bg-red-50 text-red-700",
    CANCELLED:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}