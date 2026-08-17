"use client";

import EmailTable from "./EmailTable";

import type { ScheduledEmail } from "@/types/email";

interface SentEmailsProps {
  emails: ScheduledEmail[];
  search?: string;
}

export default function SentEmails({
  emails,
  search,
}: SentEmailsProps) {
  return (
    <EmailTable
      emails={emails}
      type="sent"
      search={search}
    />
  );
}
