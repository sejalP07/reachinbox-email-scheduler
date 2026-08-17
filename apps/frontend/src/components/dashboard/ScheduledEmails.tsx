"use client";

import EmailTable from "./EmailTable";

import type { ScheduledEmail } from "@/types/email";

interface ScheduledEmailsProps {
  emails: ScheduledEmail[];
  search?: string;
}

export default function ScheduledEmails({
  emails,
  search,
}: ScheduledEmailsProps) {
  return (
    <EmailTable
      emails={emails}
      type="scheduled"
      search={search}
    />
  );
}
