import React, { useRef, useState } from "react";
import { Paperclip, Send, FileText, Download, X } from "lucide-react";
import { formatDate, errorMessage } from "../lib/api";
import { postForm } from "../lib/auth";
import { Notice } from "./ui";

// Shared building blocks for "My space" and the admin area.

export const SUBMISSION_STATUS: Record<string, { label: string; tone: string }> = {
  submitted: { label: "Submitted", tone: "blue" }, screening: { label: "Initial screening", tone: "slate" },
  "under-review": { label: "Under peer review", tone: "indigo" }, revisions: { label: "Revisions requested", tone: "amber" },
  revised: { label: "Revised version received", tone: "blue" }, accepted: { label: "Accepted", tone: "green" },
  rejected: { label: "Not accepted", tone: "gray" }, published: { label: "Published", tone: "green-strong" }, withdrawn: { label: "Withdrawn", tone: "gray" },
};
export const PROJECT_STATUS: Record<string, { label: string; tone: string }> = {
  new: { label: "Received", tone: "blue" }, screening: { label: "Screening", tone: "slate" }, "in-review": { label: "Under expert review", tone: "indigo" },
  "awaiting-client": { label: "Waiting for client reply", tone: "amber" }, "report-delivered": { label: "Report delivered", tone: "green" },
  closed: { label: "Closed", tone: "gray" }, declined: { label: "Declined", tone: "gray" },
  "in-progress": { label: "In progress", tone: "amber" },
};
export const REVIEW_STATUS: Record<string, { label: string; tone: string }> = {
  invited: { label: "Invitation pending", tone: "amber" }, accepted: { label: "In progress", tone: "indigo" }, declined: { label: "Declined", tone: "gray" },
  submitted: { label: "Report submitted", tone: "green" }, cancelled: { label: "Cancelled", tone: "gray" },
};
export const RECOMMENDATION: Record<string, string> = { accept: "Accept", minor: "Minor revisions", major: "Major revisions", reject: "Reject" };

const TONE: Record<string, string> = {
  blue: "bg-blue-50 text-blue-800 ring-blue-200", slate: "bg-slate-100 text-slate-700 ring-slate-200", indigo: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  amber: "bg-amber-50 text-amber-900 ring-amber-200", green: "bg-emerald-50 text-emerald-800 ring-emerald-200", "green-strong": "bg-emerald-100 text-emerald-900 ring-emerald-300",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatusPill({ status, map }: { status: string; map: Record<string, { label: string; tone: string }> }) {
  const s = map[status] || { label: status, tone: "slate" };
  return <span className={`pill ring-1 ring-inset ${TONE[s.tone]}`}>{s.label}</span>;
}

export type FileRow = { id: number; kind: string; version?: number; name: string; size?: number; created_at?: string };

const KIND_LABEL: Record<string, string> = { manuscript: "Manuscript", "response-letter": "Response to reviewers", document: "Supporting document", report: "Evaluation report", attachment: "Attachment" };

export function FileList({ files, href, empty = "No files." }: { files: FileRow[]; href: (f: FileRow) => string; empty?: string }) {
  if (!files.length) return <p className="text-slate-500 text-sm">{empty}</p>;
  return (
    <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
      {files.map((f) => (
        <li key={f.id} className="flex items-center gap-3 px-3 py-2.5">
          <FileText className={`w-5 h-5 shrink-0 ${f.kind === "report" ? "text-gold-deep" : "text-slate-400"}`} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[0.95rem] font-medium text-slate-800 truncate">{KIND_LABEL[f.kind] || f.kind}{f.version && f.version > 1 ? `, version ${f.version}` : ""}</p>
            <p className="text-xs text-slate-500 truncate">{f.name}{f.created_at ? ` · ${formatDate(f.created_at, { day: "numeric", month: "short", year: "numeric" })}` : ""}</p>
          </div>
          <a href={href(f)} className="btn btn-outline btn-sm shrink-0" aria-label={`Download ${f.name}`}><Download className="w-4 h-4" aria-hidden /><span className="hidden sm:inline">Download</span></a>
        </li>
      ))}
    </ul>
  );
}

export type Msg = { id: number; body: string; fromStaff: boolean; author: string; createdAt: string; files: FileRow[] };

export function MessageThread({ messages, postUrl, fileHref, onSent, viewer, extra, placeholder = "Write a message" }: {
  messages: Msg[]; postUrl: string; fileHref: (f: FileRow) => string; onSent: () => void; viewer: "owner" | "staff";
  extra?: (fd: FormData) => React.ReactNode; placeholder?: string;
}) {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [flag, setFlag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() && !files.length) return setErr("Write a message or attach a file.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("body", body);
    files.forEach((f) => fd.append("files", f));
    if (viewer === "staff" && flag) fd.append("awaitReply", "true");
    try { await postForm(postUrl, fd); setBody(""); setFiles([]); setFlag(false); onSent(); }
    catch (x) { setErr(errorMessage(x, "The message couldn't be sent. Try again.")); }
    finally { setBusy(false); }
  }

  return (
    <div>
      {messages.length === 0 ? <p className="text-slate-500 text-[0.95rem] mb-4">No messages yet.</p> : (
        <ol className="space-y-3 mb-5">
          {messages.map((m) => {
            const mine = viewer === "staff" ? m.fromStaff : !m.fromStaff;
            return (
              <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] min-w-0 break-words rounded-xl px-4 py-3 ${mine ? "bg-navy text-white" : "bg-paper border border-slate-200 text-slate-800"}`}>
                  <p className={`text-xs mb-1 ${mine ? "text-slate-300" : "text-slate-500"}`}><span className="font-semibold">{m.author}</span> · {formatDate(m.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  {m.body && <p className="whitespace-pre-line leading-relaxed text-[0.95rem]">{m.body}</p>}
                  {m.files.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {m.files.map((f) => <li key={f.id}><a href={fileHref(f)} className={`inline-flex items-center gap-1.5 text-sm underline underline-offset-2 ${mine ? "text-gold" : "text-navy"}`}><Paperclip className="w-3.5 h-3.5" aria-hidden />{f.name}</a></li>)}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <form onSubmit={send} className="space-y-2">
        {err && <Notice tone="error">{err}</Notice>}
        <label htmlFor={`msg-${postUrl}`} className="sr-only">Message</label>
        <textarea id={`msg-${postUrl}`} className="input !min-h-[96px]" placeholder={placeholder} value={body} onChange={(e) => setBody(e.target.value)} />
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {files.map((f, i) => <li key={i} className="pill bg-paper border border-slate-200 text-slate-700">{f.name}<button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5" /></button></li>)}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => input.current?.click()} disabled={files.length >= 3}><Paperclip className="w-4 h-4" aria-hidden /> Attach</button>
          {viewer === "staff" && extra === undefined && postUrl.includes("/requests/") && (
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" className="w-4 h-4 accent-[#0a2463]" checked={flag} onChange={(e) => setFlag(e.target.checked)} /> Waiting for their reply</label>
          )}
          <button className="btn btn-navy btn-sm ml-auto" disabled={busy}><Send className="w-4 h-4" aria-hidden /> {busy ? "Sending…" : "Send"}</button>
        </div>
        <input ref={input} type="file" multiple className="sr-only" aria-label="Attach files" accept=".pdf,.doc,.docx,.xlsx,.pptx" onChange={(e) => { setFiles([...files, ...Array.from(e.target.files || [])].slice(0, 3)); e.target.value = ""; }} />
      </form>
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      {(title || action) && <div className="flex items-center justify-between gap-3 mb-4">{title && <h2 className="font-sans text-lg font-semibold text-navy-ink">{title}</h2>}{action}</div>}
      {children}
    </section>
  );
}

export function Timeline({ events, labels }: { events: { status: string; message: string; created_at: string; note?: string }[]; labels: Record<string, { label: string }> }) {
  return (
    <ol className="relative border-l-2 border-slate-200 ml-2 space-y-5">
      {events.slice().reverse().map((ev, i) => (
        <li key={i} className="pl-5 relative">
          <span className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ${i === 0 ? "bg-navy" : "bg-slate-300"}`} aria-hidden />
          <p className="font-semibold text-slate-800">{labels[ev.status]?.label || ev.status} <span className="font-normal text-sm text-slate-500">· {formatDate(ev.created_at)}</span></p>
          {ev.message && <p className="text-slate-600 whitespace-pre-line leading-relaxed mt-0.5 text-[0.95rem]">{ev.message}</p>}
          {ev.note && <p className="text-slate-500 italic text-sm mt-1">Internal note: {ev.note}</p>}
        </li>
      ))}
    </ol>
  );
}
