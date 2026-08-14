import nodemailer from "nodemailer";

const host = process.env.ETHEREAL_HOST;
const port = Number(
  process.env.ETHEREAL_PORT ?? 587,
);
const user = process.env.ETHEREAL_USER;
const password = process.env.ETHEREAL_PASSWORD;

if (!host || !user || !password) {
  throw new Error(
    "Ethereal SMTP configuration is missing",
  );
}

export const smtpTransporter =
  nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
  });

export interface SendEmailInput {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(
  input: SendEmailInput,
) {
  const info = await smtpTransporter.sendMail({
    from: input.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });

  return info;
}

export async function verifySmtpConnection(): Promise<void> {
  await smtpTransporter.verify();

  console.log("✅ Ethereal SMTP connected");
}