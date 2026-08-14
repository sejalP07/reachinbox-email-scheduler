export interface ScheduleEmailRequest {
  senderId: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayMs: number;
  hourlyLimit: number;
}

export interface ScheduleEmailResponse {
  campaignId: string;
  totalEmails: number;
  scheduledEmails: number;
}