"use client";

import { Clock3, Send } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";

import type { ScheduledEmail } from "@/types/email";

interface EmailTableProps {
  emails: ScheduledEmail[];
  type: "scheduled" | "sent";
  search?: string;
}

export default function EmailTable({
  emails,
  type,
  search = "",
}: EmailTableProps) {
  if (emails.length === 0) {
    return (
      <EmptyState
        icon={
          type === "scheduled" ? (
            <Clock3 className="h-5 w-5 text-slate-400" />
          ) : (
            <Send className="h-5 w-5 text-slate-400" />
          )
        }
        title={
          search
            ? "No matching emails"
            : `No ${type} emails`
        }
        description={
          search
            ? "Try a different search."
            : "Your emails will appear here."
        }
      />
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {emails.map((email) => (
        <EmailRow
          key={email.id}
          email={email}
          type={type}
        />
      ))}
    </div>
  );
}

function EmailRow({
  email,
  type,
}: {
  email: ScheduledEmail;
  type: "scheduled" | "sent";
}) {
  const date =
    type === "scheduled"
      ? email.scheduledAt
      : email.sentAt;

  return (
    <article className="group flex min-h-[82px] items-center gap-4 px-5 py-4 transition hover:bg-slate-50 lg:px-8">
      {/* Status icon */}
      <div
        className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-full sm:flex ${
          type === "scheduled"
            ? "bg-amber-50 text-amber-500"
            : "bg-emerald-50 text-emerald-500"
        }`}
      >
        {type === "scheduled" ? (
          <Clock3 className="h-4 w-4" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </div>

      {/* Email content */}
      <div className="min-w-0 flex-1">
        {/* Recipient */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-xs font-medium text-slate-500">
            To:
          </span>

          <span className="truncate text-sm font-semibold text-slate-800">
            {email.recipient}
          </span>
        </div>

        {/* Subject */}
        <div className="mt-1 flex min-w-0 items-center gap-2">
          <span className="truncate text-sm text-slate-700">
            {email.subject}
          </span>

          <span className="hidden truncate text-sm text-slate-400 md:block">
            — {email.body.replace(/\s+/g, " ").slice(0, 90)}
          </span>
        </div>
      </div>

      {/* Date */}
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-slate-400">
          {formatDate(date)}
        </p>

        <div className="mt-1">
          <StatusBadge status={email.status} />
        </div>
      </div>

      {/* Mobile status */}
      <div className="sm:hidden">
        <StatusBadge status={email.status} />
      </div>
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: ScheduledEmail["status"];
}) {
  const classes: Record<
    ScheduledEmail["status"],
    string
  > = {
    SCHEDULED: "bg-amber-50 text-amber-600",
    PROCESSING: "bg-blue-50 text-blue-600",
    SENT: "bg-emerald-50 text-emerald-600",
    FAILED: "bg-red-50 text-red-600",
    CANCELLED: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${classes[status]}`}
    >
      {status.toLowerCase()}
    </span>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
