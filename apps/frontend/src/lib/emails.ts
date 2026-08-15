import { api } from "./api";

import type {
  EmailStats,
  ScheduledEmail,
  Sender,
} from "@/types/email";

interface EmailListResponse {
  success: boolean;
  data: ScheduledEmail[];
}

interface EmailStatsResponse {
  success: boolean;
  data: EmailStats;
}

interface SenderListResponse {
  success: boolean;
  data: Sender[];
}

interface SenderResponse {
  success: boolean;
  data: Sender;
}

export async function getScheduledEmails() {
  const response =
    await api.get<EmailListResponse>(
      "/api/emails/scheduled",
    );

  return response.data.data;
}

export async function getSentEmails() {
  const response =
    await api.get<EmailListResponse>(
      "/api/emails/sent",
    );

  return response.data.data;
}

export async function getEmailStats() {
  const response =
    await api.get<EmailStatsResponse>(
      "/api/emails/stats",
    );

  return response.data.data;
}

export async function getSenders() {
  const response =
    await api.get<SenderListResponse>(
      "/api/emails/senders",
    );

  return response.data.data;
}

export async function createSender(input: {
  email: string;
  name?: string;
}) {
  const response =
    await api.post<SenderResponse>(
      "/api/emails/senders",
      input,
    );

  return response.data.data;
}