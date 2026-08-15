"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";

import {
  createSender,
  getSenders,
} from "@/lib/emails";

import type { Sender } from "@/types/email";

interface SenderManagerProps {
  onChanged?: () => void;
}

export default function SenderManager({
  onChanged,
}: SenderManagerProps) {
  const [senders, setSenders] =
    useState<Sender[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [name, setName] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  async function loadSenders() {
    try {
      setLoading(true);
      setError(null);

      const data = await getSenders();

      setSenders(data);
    } catch (err) {
      console.error(
        "Failed to load senders:",
        err,
      );

      setError(
        "Failed to load senders.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSenders();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedName =
      name.trim();

    if (!normalizedEmail) {
      setError(
        "Sender email is required.",
      );
      return;
    }

    try {
      setSaving(true);

      const sender =
        await createSender({
          email: normalizedEmail,
          ...(normalizedName
            ? { name: normalizedName }
            : {}),
        });

      setSenders((current) => [
        ...current,
        sender,
      ]);

      setEmail("");
      setName("");

      setSuccess(
        "Sender added successfully.",
      );

      onChanged?.();
    } catch (err: any) {
      console.error(
        "Failed to create sender:",
        err,
      );

      const message =
        err?.response?.data?.error ??
        "Failed to add sender.";

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <UserPlus className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Email Senders
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Manage the email addresses used
              to send your campaigns.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
        >
          <div>
            <label
              htmlFor="sender-email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>

            <input
              id="sender-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="sender@example.com"
              disabled={saving}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="sender-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Display name
            </label>

            <input
              id="sender-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="ReachInbox"
              disabled={saving}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={
                saving ||
                !email.trim()
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              <Plus className="h-4 w-4" />

              {saving
                ? "Adding..."
                : "Add Sender"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="mt-6">
          <h4 className="mb-3 text-sm font-semibold text-slate-900">
            Your senders
          </h4>

          {loading ? (
            <p className="text-sm text-slate-500">
              Loading senders...
            </p>
          ) : senders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No senders added yet.
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Add a sender above to use it
                when composing emails.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {senders.map((sender) => (
                <div
                  key={sender.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {sender.name ||
                        sender.email}
                    </p>

                    {sender.name && (
                      <p className="truncate text-xs text-slate-500">
                        {sender.email}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled
                    title="Sender deletion will be implemented next"
                    className="rounded-lg p-2 text-slate-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}