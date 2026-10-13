import React, { useRef, useState } from "react";
import { CheckCircle2, Paperclip } from "lucide-react";
import { api, ApiError, errorMessage } from "../lib/api";
import { Field, Notice } from "./ui";

type Extra = { id: string; label: string; options?: string[]; placeholder?: string };

// One form for project-review, consulting and contact requests. Saved in the
// database (visible in the admin portal) and sent to staff on Telegram.
export default function RequestForm({ kind, subjectLabel, subjectOptions, extras = [], withFile, messageLabel = "Message", messageHint, submitLabel = "Send" }: {
  kind: "consulting" | "contact"; subjectLabel?: string; subjectOptions?: string[]; extras?: Extra[];
  withFile?: boolean; messageLabel?: string; messageHint?: string; submitLabel?: string;
}) {
  const [v, setV] = useState<Record<string, string>>({ name: "", email: "", organization: "", subject: subjectOptions?.[0] || "", message: "", company: "" });
  const [details, setDetails] = useState<Record<string, string>>(Object.fromEntries(extras.map((x) => [x.label, x.options?.[0] || ""])));
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!v.name.trim()) errs.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errs.email = "Enter a valid email address so we can reply.";
    if (v.message.trim().length < 20) errs.message = "Describe your request in at least 20 characters.";
    if (file && file.size > 25 * 1048576) errs.document = "The file is larger than 25 MB.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setFormError("");
    try {
      const data = await api<{ ref: string }>("/api/requests", { method: "POST", json: { kind, ...v, details } });
      setRef(data.ref);
    } catch (err) {
      if (err instanceof ApiError && err.data?.errors) setErrors(err.data.errors);
      setFormError(errorMessage(err, "Your request couldn't be sent. Nothing you typed has been lost; try again in a moment."));
    } finally { setBusy(false); }
  }

  if (ref) {
    return (
      <div className="card p-8 text-center" role="status">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" aria-hidden />
        <h3 className="mt-3 text-2xl font-semibold text-navy-ink">Request sent</h3>
        <p className="mt-2 text-slate-600">Reference <strong className="select-all">{ref}</strong>. We'll reply to {v.email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card p-6 sm:p-8 space-y-5">
      {formError && <Notice tone="error">{formError}</Notice>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field id={`${kind}-name`} label="Your name" error={errors.name}><input id={`${kind}-name`} className="input" value={v.name} onChange={set("name")} autoComplete="name" aria-invalid={!!errors.name} /></Field>
        <Field id={`${kind}-email`} label="Email" error={errors.email}><input id={`${kind}-email`} type="email" className="input" value={v.email} onChange={set("email")} autoComplete="email" aria-invalid={!!errors.email} /></Field>
      </div>
      <Field id={`${kind}-org`} label="Organisation (optional)"><input id={`${kind}-org`} className="input" value={v.organization} onChange={set("organization")} autoComplete="organization" /></Field>
      {subjectLabel && (
        <Field id={`${kind}-subject`} label={subjectLabel}>
          {subjectOptions
            ? <select id={`${kind}-subject`} className="input" value={v.subject} onChange={set("subject")}>{subjectOptions.map((o) => <option key={o}>{o}</option>)}</select>
            : <input id={`${kind}-subject`} className="input" value={v.subject} onChange={set("subject")} />}
        </Field>
      )}
      {extras.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {extras.map((x) => (
            <Field key={x.id} id={`${kind}-${x.id}`} label={x.label}>
              {x.options
                ? <select id={`${kind}-${x.id}`} className="input" value={details[x.label]} onChange={(e) => setDetails({ ...details, [x.label]: e.target.value })}>{x.options.map((o) => <option key={o}>{o}</option>)}</select>
                : <input id={`${kind}-${x.id}`} className="input" placeholder={x.placeholder} value={details[x.label]} onChange={(e) => setDetails({ ...details, [x.label]: e.target.value })} />}
            </Field>
          ))}
        </div>
      )}
      <Field id={`${kind}-message`} label={messageLabel} hint={messageHint} error={errors.message}>
        <textarea id={`${kind}-message`} className="input" value={v.message} onChange={set("message")} aria-invalid={!!errors.message} />
      </Field>
      {withFile && (
        <div>
          <p className="field-label">Supporting document (optional)</p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}><Paperclip className="w-4 h-4" aria-hidden /> {file ? "Replace file" : "Attach a file"}</button>
            {file && <span className="text-sm text-slate-700 break-all">{file.name} <button type="button" className="link ml-2" onClick={() => setFile(null)}>Remove</button></span>}
          </div>
          <p className="field-hint">PDF, Word, Excel or PowerPoint, up to 25 MB.</p>
          {errors.document && <p className="field-error">{errors.document}</p>}
          <input ref={fileRef} type="file" className="sr-only" aria-label="Supporting document" accept=".pdf,.doc,.docx,.xlsx,.pptx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
      )}
      <div className="hidden" aria-hidden><label>Company<input tabIndex={-1} autoComplete="off" value={v.company} onChange={set("company")} /></label></div>
      <button className="btn btn-navy" disabled={busy}>{busy ? "Sending…" : submitLabel}</button>
    </form>
  );
}
