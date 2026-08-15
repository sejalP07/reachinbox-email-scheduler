"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ComposeEmailModalProps {
  open: boolean;
  onClose: () => void;
  onScheduled?: () => void;
}

interface Sender {
  id: string;
  email: string;
  name: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

export default function ComposeEmailModal({
  open,
  onClose,
  onScheduled,
}: ComposeEmailModalProps) {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [senderId, setSenderId] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("");
  const [startTime, setStartTime] = useState("");
  const [delayMs, setDelayMs] = useState("2000");
  const [hourlyLimit, setHourlyLimit] =
    useState("200");

  const [loadingSenders, setLoadingSenders] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    async function loadSenders() {
      try {
        setLoadingSenders(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/emails/senders`,
          {
            credentials: "include",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ??
              "Failed to load senders.",
          );
        }

        const senderList: Sender[] =
          result.data ?? [];

        setSenders(senderList);

        if (senderList.length > 0) {
          setSenderId(senderList[0].id);
        } else {
          setSenderId("");
          setError(
            "No email sender is configured for your account.",
          );
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load senders.",
        );
      } finally {
        setLoadingSenders(false);
      }
    }

    loadSenders();
  }, [open]);

  if (!open) {
    return null;
  }
  function handleLeadFile(
      event: React.ChangeEvent<HTMLInputElement>,
    ) {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const isAllowed =
        /\.(csv|txt)$/i.test(file.name);

      if (!isAllowed) {
        setError("Please upload a CSV or TXT file.");
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const content = String(reader.result ?? "");

        const emails =
          content.match(
            /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
          ) ?? [];

        const uniqueEmails = [
          ...new Set(
            emails.map((email) =>
              email.trim().toLowerCase(),
            ),
          ),
        ];

      if (uniqueEmails.length === 0) {
        setError(
          "No valid email addresses were found in the file.",
        );
        return;
      }

      setRecipients(uniqueEmails.join("\n"));
      setError("");
    };

    reader.onerror = () => {
      setError("Failed to read the uploaded file.");
    };

    reader.readAsText(file);
  }
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const recipientList = recipients
      .split(/[\n,]+/)
      .map((email) => email.trim())
      .filter(Boolean);

    if (!senderId) {
      setError("Please select a sender.");
      return;
    }

    if (recipientList.length === 0) {
      setError("Add at least one recipient.");
      return;
    }

    if (!startTime) {
      setError("Select a start time.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/emails/schedule`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId,
            subject,
            body,
            recipients: recipientList,
            startTime: new Date(
              startTime,
            ).toISOString(),
            delayMs: Number(delayMs),
            hourlyLimit: Number(hourlyLimit),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Failed to schedule emails.",
        );
      }

      onScheduled?.();
      onClose();

      setSenderId("");
      setSubject("");
      setBody("");
      setRecipients("");
      setStartTime("");
      setDelayMs("2000");
      setHourlyLimit("200");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to schedule emails.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Compose New Email
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Schedule an email campaign.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Sender */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Sender
            </label>

            <select
              value={senderId}
              onChange={(event) =>
                setSenderId(event.target.value)
              }
              disabled={
                loadingSenders ||
                senders.length === 0
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
            >
              <option value="">
                {loadingSenders
                  ? "Loading senders..."
                  : "Select a sender"}
              </option>

              {senders.map((sender) => (
                <option
                  key={sender.id}
                  value={sender.id}
                >
                  {sender.name
                    ? `${sender.name} — ${sender.email}`
                    : sender.email}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-slate-400">
              Select the email account used to send this
              campaign.
            </p>
          </div>
          {/* Lead Upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Upload Leads
            </label>

            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleLeadFile}
              className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />

            <p className="mt-1 text-xs text-slate-400">
              Upload a CSV or TXT file containing email addresses.
            </p>
          </div>

          {/* Recipients */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Recipients
            </label>
            {recipients && (
                <p className="mb-2 text-xs font-medium text-emerald-600">
                  {
                    recipients
                      .split(/[\n,]+/)
                      .map((email) => email.trim())
                      .filter(Boolean).length
                  }{" "}
                  email address(es) detected
                </p>
              )}
            <textarea
              value={recipients}
              onChange={(event) =>
                setRecipients(event.target.value)
              }
              rows={4}
              placeholder={`alice@example.com
bob@example.com`}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="mt-1 text-xs text-slate-400">
              Enter one email per line or separate emails
              with commas.
            </p>
          </div>

          {/* Subject */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Subject
            </label>

            <input
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
              placeholder="Your email subject"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Body */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email body
            </label>

            <textarea
              value={body}
              onChange={(event) =>
                setBody(event.target.value)
              }
              rows={7}
              placeholder="Write your email..."
              required
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Scheduling */}
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Start time
              </label>

              <input
                type="datetime-local"
                value={startTime}
                onChange={(event) =>
                  setStartTime(event.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Delay (ms)
              </label>

              <input
                type="number"
                min="0"
                max="60000"
                value={delayMs}
                onChange={(event) =>
                  setDelayMs(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Hourly limit
              </label>

              <input
                type="number"
                min="1"
                max="10000"
                value={hourlyLimit}
                onChange={(event) =>
                  setHourlyLimit(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingSenders ||
                senders.length === 0
              }
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Scheduling..."
                : "Schedule Emails"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}