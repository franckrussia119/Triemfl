import React, { useEffect, useMemo, useRef, useState } from "react";
import { Trash2, Upload, Search } from "lucide-react";
import { Link, navigate } from "../../lib/router";
import { api, errorMessage, formatDate } from "../../lib/api";
import { postForm } from "../../lib/auth";
import { DIVISIONS } from "../../lib/site";
import { Field, Notice } from "../ui";
import { StatusPill, PROJECT_STATUS, FileList, MessageThread, Panel } from "../workspace";
import { H1, useLoad } from "./AdminPublishing";

const KIND: Record<string, string> = { "project-review": "Project review", consulting: "Consulting", contact: "Contact" };
const INBOX_STATUS: Record<string, { label: string; tone: string }> = { new: { label: "New", tone: "blue" }, "in-progress": { label: "In progress", tone: "amber" }, closed: { label: "Closed", tone: "gray" } };

export function Requests({ kind }: { kind: "project-review" | "messages" }) {
  const { data, error } = useLoad<any[]>("/api/admin/requests");
  const [status, setStatus] = useState("open");
  const [q, setQ] = useState("");
  const projects = kind === "project-review";
  const map = projects ? PROJECT_STATUS : INBOX_STATUS;
  const rows = useMemo(() => (data || []).filter((r) => (projects ? r.kind === "project-review" : r.kind !== "project-review"))
    .filter((r) => status === "all" || (status === "open" ? !["closed", "declined", "report-delivered"].includes(r.status) : r.status === status))
    .filter((r) => !q || `${r.subject} ${r.ref} ${r.name} ${r.organization} ${r.email}`.toLowerCase().includes(q.toLowerCase())), [data, status, q, projects]);
  const base = projects ? "/admin/projects" : "/admin/inbox";

  return (
    <>
      <H1>{projects ? "Project reviews" : "Inbox"}</H1>
      {!projects && <p className="-mt-3 mb-5 text-slate-600">Contact and consulting messages sent from the public website.</p>}
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <label htmlFor="rq-q" className="sr-only">Search</label>
          <input id="rq-q" className="input !min-h-[38px] !py-1.5 pl-9 w-64" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label htmlFor="rq-st" className="sr-only">Status</label>
        <select id="rq-st" className="input !min-h-[38px] !py-1.5 !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">Open</option>
          {Object.entries(map).filter(([k]) => projects || k !== "open").map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          <option value="all">All</option>
        </select>
      </div>
      {data && rows.length === 0 ? <div className="card p-8 text-center text-slate-600">{projects ? "No project review requests match. Institutions submit them from their accounts." : "No messages match."}</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-[0.95rem]">
            <thead className="bg-paper text-slate-600 text-sm"><tr><th className="p-3">{projects ? "Project" : "From"}</th><th className="p-3 hidden lg:table-cell">{projects ? "Assigned to" : "Type"}</th><th className="p-3">Status</th><th className="p-3 hidden md:table-cell">Received</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-paper cursor-pointer" onClick={() => navigate(`${base}/${r.id}`)}>
                  <td className="p-3">
                    <Link to={`${base}/${r.id}`} className="font-semibold text-navy-ink hover:underline">{projects ? r.subject : `${r.name}${r.organization ? `, ${r.organization}` : ""}`}</Link>
                    <div className="text-sm text-slate-500">{r.ref} · {projects ? `${r.organization || r.name}${r.division ? ` · ${r.division}` : ""}` : r.subject}{r.files ? ` · ${r.files} file(s)` : ""}</div>
                    {r.unread > 0 && <span className="pill bg-gold text-navy-deep mt-1">{r.unread} unread</span>}
                  </td>
                  <td className="p-3 hidden lg:table-cell text-slate-600">{projects ? r.assignee || "–" : KIND[r.kind]}</td>
                  <td className="p-3"><StatusPill status={r.status} map={map} /></td>
                  <td className="p-3 hidden md:table-cell text-slate-600 whitespace-nowrap">{formatDate(r.created_at, { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function RequestDetail({ id, admin }: { id: string; admin: boolean }) {
  const { data: r, error, reload } = useLoad<any>(`/api/admin/requests/${id}`);
  const { data: staff } = useLoad<any[]>("/api/admin/reviewers");
  const [form, setForm] = useState({ status: "", note: "", division: "", assignedTo: "" });
  const [flash, setFlash] = useState("");
  useEffect(() => { if (r) setForm({ status: r.status, note: r.note || "", division: r.division || "", assignedTo: r.assigned_to ? String(r.assigned_to) : "" }); }, [r]);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!r) return null;
  const projects = r.kind === "project-review";
  const back = projects ? "/admin/projects" : "/admin/inbox";
  const map = projects ? PROJECT_STATUS : INBOX_STATUS;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api(`/api/admin/requests/${id}`, { method: "POST", json: { ...form, assignedTo: form.assignedTo ? Number(form.assignedTo) : 0 } });
    setFlash("Saved."); reload();
  };
  const remove = async () => { if (!confirm(`Delete ${r.ref} and its files permanently?`)) return; await api(`/api/admin/requests/${id}`, { method: "DELETE" }); navigate(back); };

  return (
    <>
      <H1 back={back} action={<StatusPill status={r.status} map={map} />}>{projects ? r.subject : `${KIND[r.kind]}: ${r.name}`}</H1>
      <p className="-mt-4 mb-6 text-slate-600">{r.ref} · received {formatDate(r.created_at)}</p>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {projects && <ReportUpload id={id} files={r.files.filter((f: any) => f.kind === "report")} onDone={reload} />}
          <Panel title={r.user_id ? "Conversation" : "Message"}>
            {r.user_id ? (
              <MessageThread viewer="staff" messages={r.messages} postUrl={`/api/admin/requests/${id}/messages`} fileHref={(f) => `/api/admin/files/${f.id}`} onSent={reload} placeholder="Write to the client (shown in their account)" />
            ) : (
              <>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">{r.message}</p>
                <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: ${r.subject || r.ref}`)}`} className="btn btn-navy btn-sm mt-4">Reply by email</a>
              </>
            )}
          </Panel>
        </div>
        <div className="xl:col-span-2 space-y-6">
          <Panel title={projects ? "Client" : "Sender"}>
            <dl className="space-y-2 text-[0.95rem]">
              <div><dt className="text-sm text-slate-500">Name</dt><dd>{r.owner ? <Link to={`/admin/users/${r.owner.id}`} className="link">{r.name}</Link> : r.name}</dd></div>
              {r.organization && <div><dt className="text-sm text-slate-500">Organisation</dt><dd>{r.organization}</dd></div>}
              <div><dt className="text-sm text-slate-500">Email</dt><dd><a className="link break-all" href={`mailto:${r.email}`}>{r.email}</a></dd></div>
              {Object.entries(r.details || {}).filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-sm text-slate-500">{k}</dt><dd>{String(v)}</dd></div>)}
            </dl>
            {projects && <><p className="text-sm text-slate-500 mt-3">Description</p><p className="text-slate-700 text-[0.95rem] whitespace-pre-line leading-relaxed">{r.message}</p></>}
          </Panel>
          {projects && <Panel title="Documents"><FileList files={r.files.filter((f: any) => f.kind !== "report")} href={(f) => `/api/admin/files/${f.id}`} empty="No documents attached." /></Panel>}
          <form onSubmit={save} className="card p-5 sm:p-6 space-y-4">
            <h2 className="font-sans text-lg font-semibold text-navy-ink">Handling</h2>
            {flash && <Notice tone="success">{flash}</Notice>}
            <Field id="rq-status" label="Status"><select id="rq-status" className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{Object.entries(map).filter(([k]) => projects ? k !== "in-progress" : true).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
            {projects && <>
              <Field id="rq-div" label="Division"><select id="rq-div" className="input" value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })}><option value="">Not set</option>{DIVISIONS.map((d) => <option key={d.code}>{d.name}</option>)}</select></Field>
              <Field id="rq-as" label="Lead specialist"><select id="rq-as" className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}><option value="">Unassigned</option>{(staff || []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field>
            </>}
            <Field id="rq-note" label="Internal note"><textarea id="rq-note" className="input !min-h-[90px]" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
            <button className="btn btn-navy w-full">Save</button>
          </form>
          {admin && <button onClick={remove} className="btn btn-danger btn-sm"><Trash2 className="w-4 h-4" aria-hidden /> Delete</button>}
        </div>
      </div>
    </>
  );
}

function ReportUpload({ id, files, onDone }: { id: string; files: any[]; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setMsg({ tone: "error", text: "Choose the report file." });
    setBusy(true); setMsg(null);
    const fd = new FormData(); fd.append("report", file); fd.append("message", message);
    try { const r = await postForm<{ emailed: boolean }>(`/api/admin/requests/${id}/report`, fd); setFile(null); setMessage(""); setMsg({ tone: "success", text: `Report delivered.${r.emailed ? " The client has been emailed." : ""}` }); onDone(); }
    catch (x) { setMsg({ tone: "error", text: errorMessage(x) }); } finally { setBusy(false); }
  }
  return (
    <Panel title="Evaluation report">
      {files.length > 0 && <div className="mb-4"><FileList files={files} href={(f) => `/api/admin/files/${f.id}`} /></div>}
      <form onSubmit={send} className="space-y-3">
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => input.current?.click()}><Upload className="w-4 h-4" aria-hidden /> {file ? "Change file" : files.length ? "Upload a new version" : "Choose report file"}</button>
          {file && <span className="text-sm break-all">{file.name}</span>}
          <input ref={input} type="file" className="sr-only" aria-label="Report file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <Field id="rp-msg" label="Message to the client (optional)"><textarea id="rp-msg" className="input !min-h-[80px]" value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
        <button className="btn btn-gold" disabled={busy}>{busy ? "Delivering…" : "Deliver report to client"}</button>
      </form>
    </Panel>
  );
}
