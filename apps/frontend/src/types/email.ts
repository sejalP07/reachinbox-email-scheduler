export interface Sender {
  id: string;
  email: string;
  name: string | null;
}

export interface Campaign {
  id: string;
  subject: string;
  body: string;
  startTime: string;
  delayMs: number;
  hourlyLimit: number;
}

export interface ScheduledEmail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt: string | null;
  status:
    | "SCHEDULED"
    | "PROCESSING"
    | "SENT"
    | "FAILED"
    | "CANCELLED";
  attempts: number;
  lastError: string | null;
  messageId: string | null;
  previewUrl: string | null;
  sender: Sender;
  campaign: Campaign;
}

export interface EmailStats {
  scheduled: number;
  processing: number;
  sent: number;
  failed: number;
  total: number;
}