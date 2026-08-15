import { api } from "./api";
import type {
  EmailStats,
  ScheduledEmail,
} from "@/types/email";

interface EmailListResponse {
  success: boolean;
  data: ScheduledEmail[];
}

interface EmailStatsResponse {
  success: boolean;
  data: EmailStats;
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