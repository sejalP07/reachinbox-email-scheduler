"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  CalendarDays,
  ChevronDown,
  Clock3,
  FileText,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Paperclip,
  Quote,
  Redo2,
  Send,
  Strikethrough,
  Underline,
  Undo2,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { api } from "@/lib/api";

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



/* =========================================================
   DATE HELPERS
========================================================= */

function getTomorrowDate() {
  const date = new Date();

  date.setDate(
    date.getDate() + 1,
  );

  return date;
}

function toLocalDateTime(date: Date) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  const hours = String(
    date.getHours(),
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function tomorrowAt(hour: number) {
  const date =
    getTomorrowDate();

  date.setHours(
    hour,
    0,
    0,
    0,
  );

  return toLocalDateTime(date);
}

function formatScheduleLabel(
  value: string,
) {
  if (!value) {
    return "Pick date & time";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Pick date & time";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ComposeEmailModal({
  open,
  onClose,
  onScheduled,
}: ComposeEmailModalProps) {
  const [senders, setSenders] =
    useState<Sender[]>([]);

  const [senderId, setSenderId] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [body, setBody] =
    useState("");

  const [recipients, setRecipients] =
    useState("");

  const [recipientInput, setRecipientInput] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [delayMs, setDelayMs] =
    useState("2000");

  const [hourlyLimit, setHourlyLimit] =
    useState("200");

  const [loadingSenders, setLoadingSenders] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showSchedule, setShowSchedule] =
    useState(false);

  const editorRef =
    useRef<HTMLDivElement>(null);

  const leadFileInputRef =
    useRef<HTMLInputElement>(null);

  /* =========================================================
     LOAD SENDERS
  ========================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    async function loadSenders() {
      try {
        setLoadingSenders(true);
        setError("");

        const response =
          await api.get("/api/emails/senders");

        const result =
          response.data;

        if (response.status < 200 || response.status >= 300) {
          throw new Error(
            result.error ??
              "Failed to load senders.",
          );
        }

        const senderList: Sender[] =
          result.data ?? [];

        setSenders(
          senderList,
        );

        if (
          senderList.length > 0
        ) {
          setSenderId(
            senderList[0]!.id,
          );
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

  /* =========================================================
     SYNC EDITOR
  ========================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editorRef.current) {
      editorRef.current.innerHTML =
        body;
    }
  }, [open]);

  if (!open) {
    return null;
  }

  /* =========================================================
     RECIPIENT HELPERS
  ========================================================= */

  function getRecipientList() {
    return [
      ...new Set(
        recipients
          .split(/[\n,]+/)
          .map((email) =>
            email
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean),
      ),
    ];
  }

  function addRecipient(
    value: string,
  ) {
    const email =
      value
        .trim()
        .toLowerCase();

    if (!email) {
      return;
    }

    const existing =
      getRecipientList();

    if (
      existing.includes(email)
    ) {
      setRecipientInput("");
      return;
    }

    setRecipients(
      [
        ...existing,
        email,
      ].join("\n"),
    );

    setRecipientInput("");
  }

  function removeRecipient(
    email: string,
  ) {
    const updated =
      getRecipientList().filter(
        (item) =>
          item !== email,
      );

    setRecipients(
      updated.join("\n"),
    );
  }

  function handleRecipientKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();

      addRecipient(
        recipientInput,
      );
    }

    if (
      event.key === "Backspace" &&
      !recipientInput
    ) {
      const list =
        getRecipientList();

      const last =
        list[list.length - 1];

      if (last) {
        removeRecipient(last);
      }
    }
  }

  /* =========================================================
     CSV / TXT UPLOAD
  ========================================================= */

  function handleLeadFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const isAllowed =
      /\.(csv|txt)$/i.test(
        file.name,
      );

    if (!isAllowed) {
      setError(
        "Please upload a CSV or TXT file.",
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const content =
        String(
          reader.result ?? "",
        );

      const emails =
        content.match(
          /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
        ) ?? [];

      const uniqueEmails = [
        ...new Set(
          emails.map(
            (email) =>
              email
                .trim()
                .toLowerCase(),
          ),
        ),
      ];

      if (
        uniqueEmails.length === 0
      ) {
        setError(
          "No valid email addresses were found in the file.",
        );

        return;
      }

      const current =
        getRecipientList();

      const merged = [
        ...new Set([
          ...current,
          ...uniqueEmails,
        ]),
      ];

      setRecipients(
        merged.join("\n"),
      );

      setError("");

      event.target.value = "";
    };

    reader.onerror = () => {
      setError(
        "Failed to read the uploaded file.",
      );
    };

    reader.readAsText(file);
  }

  /* =========================================================
     EDITOR
  ========================================================= */

  function handleEditorInput() {
    const html =
      editorRef.current
        ?.innerHTML ?? "";

    setBody(html);
  }

  function format(
    command: string,
  ) {
    editorRef.current?.focus();

    document.execCommand(
      command,
      false,
    );

    handleEditorInput();
  }

  function insertLink() {
    const url =
      window.prompt(
        "Enter URL",
        "https://",
      );

    if (!url) {
      return;
    }

    editorRef.current?.focus();

    document.execCommand(
      "createLink",
      false,
      url,
    );

    handleEditorInput();
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(
    event?: React.FormEvent,
  ) {
    event?.preventDefault();

    setError("");

    let finalRecipients =
      getRecipientList();

    if (
      recipientInput.trim()
    ) {
      const pending =
        recipientInput
          .trim()
          .toLowerCase();

      if (
        !finalRecipients.includes(
          pending,
        )
      ) {
        finalRecipients = [
          ...finalRecipients,
          pending,
        ];
      }

      setRecipients(
        finalRecipients.join("\n"),
      );

      setRecipientInput("");
    }

    if (!senderId) {
      setError(
        "Please select a sender.",
      );

      return;
    }

    if (
      finalRecipients.length ===
      0
    ) {
      setError(
        "Add at least one recipient.",
      );

      return;
    }

    if (!subject.trim()) {
      setError(
        "Enter an email subject.",
      );

      return;
    }

    const cleanedBody =
      body.trim();

    if (!cleanedBody) {
      setError(
        "Write an email before sending.",
      );

      return;
    }

    /*
     * If no schedule was selected,
     * send one minute from now.
     */

    let selectedStartTime =
      startTime;

    if (!selectedStartTime) {
      const sendAt =
        new Date(
          Date.now() + 60_000,
        );

      selectedStartTime =
        toLocalDateTime(
          sendAt,
        );
    }

    try {
      setSubmitting(true);

      const response = await api.post(
  "/api/emails/schedule",
  {
    senderId,
    subject: subject.trim(),
    body: cleanedBody,
    recipients: finalRecipients,
    startTime: new Date(
      selectedStartTime,
    ).toISOString(),
    delayMs: Number(delayMs),
    hourlyLimit: Number(hourlyLimit),
  },
);

if (response.status < 200 || response.status >= 300) {
  throw new Error(
    response.data?.error ??
      response.data?.message ??
      "Failed to schedule emails.",
  );
}

      onScheduled?.();

      resetComposer();

      onClose();
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

  /* =========================================================
     RESET
  ========================================================= */

  function resetComposer() {
    setSenderId(
      senders[0]?.id ?? "",
    );

    setSubject("");
    setBody("");
    setRecipients("");
    setRecipientInput("");
    setStartTime("");
    setDelayMs("2000");
    setHourlyLimit("200");
    setError("");
    setShowSchedule(false);

    if (editorRef.current) {
      editorRef.current.innerHTML =
        "";
    }
  }

  /* =========================================================
     CLOSE
  ========================================================= */

  function handleClose() {
    if (submitting) {
      return;
    }

    onClose();
  }

  /* =========================================================
     SCHEDULE
  ========================================================= */

  function selectSchedule(
    value: string,
  ) {
    setStartTime(value);
    setShowSchedule(false);
    setError("");
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="fixed inset-0 z-100 overflow-hidden bg-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex h-15 items-center justify-between border-b border-slate-200 px-5 lg:px-7">

        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-3">

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="truncate text-[20px] font-medium text-slate-800">
            Compose New Email
          </h1>

        </div>

        {/* RIGHT */}

        <div className="relative flex items-center gap-3">

          {/* UPLOAD */}

          <button
            type="button"
            onClick={() =>
              leadFileInputRef.current?.click()
            }
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            title="Upload lead list"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </button>

          {/* SEND LATER */}

          <button
            type="button"
            onClick={() =>
              setShowSchedule(
                (current) =>
                  !current,
              )
            }
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              showSchedule
                ? "bg-emerald-50 text-emerald-600"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
            title="Send later"
          >
            <Clock3 className="h-4.5 w-4.5" />
          </button>

          {/* SEND */}

          <button
            type="button"
            onClick={() =>
              handleSubmit()
            }
            disabled={
              submitting ||
              loadingSenders
            }
            className="flex h-9 min-w-19 items-center justify-center gap-2 rounded-full border border-emerald-500 px-5 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />

            {submitting
              ? "Sending..."
              : "Send"}
          </button>

          {/* HIDDEN FILE INPUT */}

          <input
            ref={
              leadFileInputRef
            }
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            onChange={
              handleLeadFile
            }
            className="hidden"
          />

          {/* SEND LATER */}

          {showSchedule && (
            <SendLaterPanel
              startTime={
                startTime
              }
              onSelect={
                selectSchedule
              }
              onCancel={() =>
                setShowSchedule(false)
              }
              onDone={() =>
                setShowSchedule(false)
              }
            />
          )}

        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="h-[calc(100vh-60px)] overflow-y-auto bg-white">

        <div className="mx-auto w-full px-5 pb-20 pt-7 lg:px-8">

          {/* ERROR */}

          {error && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="ml-4"
              >
                <X className="h-4 w-4" />
              </button>

            </div>
          )}

          {/* =================================================
              EMAIL HEADER
          ================================================= */}

          <div className="divide-y divide-slate-100">

            {/* FROM */}

            <div className="flex min-h-12 items-center">

              <div className="w-18 shrink-0 text-[13px] font-medium text-slate-700">
                From
              </div>

              <div className="relative">

                <select
                  value={
                    senderId
                  }
                  onChange={(
                    event,
                  ) =>
                    setSenderId(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    loadingSenders ||
                    senders.length ===
                      0
                  }
                  className="appearance-none rounded-lg border-0 bg-slate-100 py-2 pl-3 pr-9 text-[13px] text-slate-700 outline-none focus:ring-1 focus:ring-slate-200 disabled:opacity-60"
                >
                  {loadingSenders ? (
                    <option value="">
                      Loading...
                    </option>
                  ) : (
                    <>
                      {senders.map(
                        (
                          sender,
                        ) => (
                          <option
                            key={
                              sender.id
                            }
                            value={
                              sender.id
                            }
                          >
                            {
                              sender.email
                            }
                          </option>
                        ),
                      )}
                    </>
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

              </div>
            </div>

            {/* TO */}

            <div className="flex min-h-12 items-start py-2">

              <div className="w-18 shrink-0 pt-2 text-[13px] font-medium text-slate-700">
                To
              </div>

              <div className="flex min-h-9 flex-1 flex-wrap items-center gap-2">

                {getRecipientList().map(
                  (email) => (
                    <span
                      key={
                        email
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700"
                    >
                      {email}

                      <button
                        type="button"
                        onClick={() =>
                          removeRecipient(
                            email,
                          )
                        }
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ),
                )}

                <input
                  value={
                    recipientInput
                  }
                  onChange={(
                    event,
                  ) =>
                    setRecipientInput(
                      event.target
                        .value,
                    )
                  }
                  onKeyDown={
                    handleRecipientKeyDown
                  }
                  onBlur={() => {
                    if (
                      recipientInput.trim()
                    ) {
                      addRecipient(
                        recipientInput,
                      );
                    }
                  }}
                  placeholder={
                    getRecipientList()
                      .length ===
                    0
                      ? "recipient@example.com"
                      : "Add recipient"
                  }
                  className="min-w-55 flex-1 border-0 bg-transparent px-1 py-2 text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
                />

                {/* RECIPIENT CSV / TXT UPLOAD */}
                <button
                  type="button"
                  onClick={() =>
                    leadFileInputRef.current?.click()
                  }
                  className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                  title="Upload recipient CSV or TXT file"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Upload CSV/TXT
                </button>

              </div>
            </div>

            {/* SUBJECT */}

            <div className="flex min-h-12 items-center">

              <div className="w-18 shrink-0 text-[13px] font-medium text-slate-700">
                Subject
              </div>

              <input
                value={
                  subject
                }
                onChange={(
                  event,
                ) =>
                  setSubject(
                    event.target
                      .value,
                  )
                }
                placeholder="Subject"
                className="flex-1 border-0 bg-transparent px-0 py-2 text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
              />

            </div>

          </div>

          {/* =================================================
              SETTINGS
          ================================================= */}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 py-3">

            {/* DELAY */}

            <div className="flex items-center gap-2">

              <span className="text-[12px] font-medium text-slate-600">
                Delay between 2 emails
              </span>

              <input
                type="number"
                min="0"
                max="60000"
                value={
                  Number(
                    delayMs,
                  ) / 1000
                }
                onChange={(
                  event,
                ) =>
                  setDelayMs(
                    String(
                      Math.max(
                        0,
                        Number(
                          event.target
                            .value,
                        ),
                      ) * 1000,
                    ),
                  )
                }
                className="h-8 w-13.5 rounded-md border border-slate-200 bg-white px-2 text-center text-xs text-slate-600 outline-none focus:border-emerald-400"
              />

              <span className="text-[11px] text-slate-400">
                sec
              </span>

            </div>

            {/* HOURLY LIMIT */}
            {/* HOURLY LIMIT */}

            <div className="flex items-center gap-2">

              <span className="text-[12px] font-medium text-slate-600">
                Hourly Limit
              </span>

              <input
                type="number"
                min="1"
                max="10000"
                value={hourlyLimit}
                onChange={(event) =>
                  setHourlyLimit(
                    event.target.value,
                  )
                }
                className="h-8 w-20 rounded-md border border-slate-200 bg-white px-2 text-center text-xs text-slate-600 outline-none focus:border-emerald-400"
              />

            </div>


            {/* SCHEDULED */}

            {startTime && (
              <button
                type="button"
                onClick={() =>
                  setShowSchedule(
                    true,
                  )
                }
                className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-600"
              >
                <Clock3 className="h-3.5 w-3.5" />

                {formatScheduleLabel(
                  startTime,
                )}
              </button>
            )}

          </div>

          {/* =================================================
              COMPACT EMAIL EDITOR
          ================================================= */}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

            {/* EMAIL BODY */}

            <div
              ref={
                editorRef
              }
              contentEditable
              suppressContentEditableWarning
              onInput={
                handleEditorInput
              }
              data-placeholder="Type Your Reply..."
              className="
                min-h-45
                max-h-90
                overflow-y-auto
                px-4
                py-4
                text-[14px]
                leading-6
                text-slate-700
                outline-none
                empty:before:pointer-events-none
                empty:before:text-slate-400
                empty:before:content-[attr(data-placeholder)]
              "
            />

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="flex flex-wrap items-center gap-0 border-t border-slate-200 bg-white px-3 py-2">

              {/* UNDO */}

              <ToolbarButton
                icon={
                  <Undo2 className="h-4 w-4" />
                }
                label="Undo"
                onClick={() =>
                  format(
                    "undo",
                  )
                }
              />

              {/* REDO */}

              <ToolbarButton
                icon={
                  <Redo2 className="h-4 w-4" />
                }
                label="Redo"
                onClick={() =>
                  format(
                    "redo",
                  )
                }
              />

              <ToolbarDivider />

              {/* TEXT */}

              <ToolbarButton
                icon={
                  <span className="text-sm font-medium">
                    Tt
                  </span>
                }
                label="Normal text"
                onClick={() =>
                  format(
                    "formatBlock",
                  )
                }
              />

              <ToolbarDivider />

              {/* BOLD */}

              <ToolbarButton
                icon={
                  <Bold className="h-4 w-4" />
                }
                label="Bold"
                onClick={() =>
                  format(
                    "bold",
                  )
                }
              />

              {/* ITALIC */}

              <ToolbarButton
                icon={
                  <Italic className="h-4 w-4" />
                }
                label="Italic"
                onClick={() =>
                  format(
                    "italic",
                  )
                }
              />

              {/* UNDERLINE */}

              <ToolbarButton
                icon={
                  <Underline className="h-4 w-4" />
                }
                label="Underline"
                onClick={() =>
                  format(
                    "underline",
                  )
                }
              />

              <ToolbarDivider />

              {/* ALIGN LEFT */}

              <ToolbarButton
                icon={
                  <AlignLeft className="h-4 w-4" />
                }
                label="Align left"
                onClick={() =>
                  format(
                    "justifyLeft",
                  )
                }
              />

              {/* ALIGN CENTER */}

              <ToolbarButton
                icon={
                  <AlignCenter className="h-4 w-4" />
                }
                label="Align center"
                onClick={() =>
                  format(
                    "justifyCenter",
                  )
                }
              />

              {/* ALIGN RIGHT */}

              <ToolbarButton
                icon={
                  <AlignRight className="h-4 w-4" />
                }
                label="Align right"
                onClick={() =>
                  format(
                    "justifyRight",
                  )
                }
              />

              <ToolbarDivider />

              {/* NUMBERED LIST */}

              <ToolbarButton
                icon={
                  <ListOrdered className="h-4 w-4" />
                }
                label="Numbered list"
                onClick={() =>
                  format(
                    "insertOrderedList",
                  )
                }
              />

              {/* BULLET LIST */}

              <ToolbarButton
                icon={
                  <List className="h-4 w-4" />
                }
                label="Bullet list"
                onClick={() =>
                  format(
                    "insertUnorderedList",
                  )
                }
              />

              <ToolbarDivider />

              {/* QUOTE */}

              <ToolbarButton
                icon={
                  <Quote className="h-4 w-4" />
                }
                label="Quote"
                onClick={() =>
                  format(
                    "formatBlock",
                  )
                }
              />

              {/* LINK */}

              <ToolbarButton
                icon={
                  <Link2 className="h-4 w-4" />
                }
                label="Insert link"
                onClick={
                  insertLink
                }
              />

              {/* STRIKETHROUGH */}

              <ToolbarButton
                icon={
                  <Strikethrough className="h-4 w-4" />
                }
                label="Strikethrough"
                onClick={() =>
                  format(
                    "strikeThrough",
                  )
                }
              />

              {/* IMAGE */}

              <ToolbarButton
                icon={
                  <ImageIcon className="h-4 w-4" />
                }
                label="Image"
                onClick={() =>
                  setError(
                    "Image upload is not configured yet.",
                  )
                }
              />

              {/* UPLOAD LEADS */}

              <ToolbarButton
                icon={
                  <FileText className="h-4 w-4" />
                }
                label="Upload leads"
                onClick={() =>
                  leadFileInputRef.current?.click()
                }
              />

            </div>

          </div>

          {/* =================================================
              RECIPIENT INFORMATION
          ================================================= */}

          {getRecipientList()
            .length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">

              <span>
                {
                  getRecipientList()
                    .length
                }{" "}
                recipient
                {getRecipientList()
                  .length !==
                1
                  ? "s"
                  : ""}{" "}
                selected
              </span>

              <span>
                •
              </span>

              <button
                type="button"
                onClick={() =>
                  leadFileInputRef.current?.click()
                }
                className="text-emerald-600 hover:underline"
              >
                Upload another CSV/TXT
              </button>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   SEND LATER PANEL
========================================================= */

function SendLaterPanel({
  startTime,
  onSelect,
  onCancel,
  onDone,
}: {
  startTime: string;
  onSelect: (
    value: string,
  ) => void;
  onCancel: () => void;
  onDone: () => void;
}) {
  return (
    <div className="absolute right-0 top-11 z-120 w-60.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

      {/* TITLE */}

      <div className="px-3 pb-2 pt-4">

        <h3 className="text-[13px] font-semibold text-slate-800">
          Send Later
        </h3>

      </div>

      {/* DATE / TIME */}

      <div className="px-3 pb-2">

        <div className="relative">

          <input
            type="datetime-local"
            value={
              startTime
            }
            onChange={(
              event,
            ) =>
              onSelect(
                event.target
                  .value,
              )
            }
            className="h-9 w-full appearance-none border-b border-slate-200 bg-transparent pr-8 text-xs text-slate-500 outline-none"
          />

          <CalendarDays className="pointer-events-none absolute right-1 top-2 h-4 w-4 text-slate-400" />

        </div>

      </div>

      {/* QUICK OPTIONS */}

      <div className="py-1">

        <ScheduleOption
          label="Tomorrow"
          onClick={() =>
            onSelect(
              tomorrowAt(
                new Date().getHours(),
              ),
            )
          }
        />

        <ScheduleOption
          label="Tomorrow, 10:00 AM"
          onClick={() =>
            onSelect(
              tomorrowAt(10),
            )
          }
        />

        <ScheduleOption
          label="Tomorrow, 11:00 AM"
          onClick={() =>
            onSelect(
              tomorrowAt(11),
            )
          }
        />

        <ScheduleOption
          label="Tomorrow, 3:00 PM"
          onClick={() =>
            onSelect(
              tomorrowAt(15),
            )
          }
        />

      </div>

      {/* FOOTER */}

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-3 py-3">

        <button
          type="button"
          onClick={
            onCancel
          }
          className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onDone}
          disabled={!startTime}
          className="rounded-full border border-emerald-500 px-4 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
        >
          Done
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   SCHEDULE OPTION
========================================================= */

function ScheduleOption({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full px-3 py-2 text-left text-xs text-slate-600 transition hover:bg-slate-50"
    >
      {label}
    </button>
  );
}

/* =========================================================
   TOOLBAR BUTTON
========================================================= */

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(
        event,
      ) =>
        event.preventDefault()
      }
      onClick={onClick}
      className="flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
    >
      {icon}
    </button>
  );
}

/* =========================================================
   TOOLBAR DIVIDER
========================================================= */

function ToolbarDivider() {
  return (
    <div className="mx-1 h-5 w-px bg-slate-200" />
  );
}