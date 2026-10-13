import React, { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, Trash2, Star } from "lucide-react";
import { Link, navigate, useLocation } from "../../lib/router";
import { api, ApiError, errorMessage, formatDate, type Author } from "../../lib/api";
import { Field, Notice } from "../ui";
import { StatusPill, SUBMISSION_STATUS, REVIEW_STATUS, RECOMMENDATION, FileList, MessageThread, Panel, Timeline } from "../workspace";
import { H1, useLoad } from "./AdminPublishing";

const OPEN = ["submitted", "screening", "under-review", "revisions", "revised", "accepted"];

export function Manuscripts() {
  const { search } = useLocation();
  const { data, error } = useLoad<any[]>("/api/admin/submissions");
  const [status, setStatus] = useState(new URLSearchParams(search).get("status") || "open");
  const [q, setQ] = useState("");
  const rows = useMemo(() => (data || []).filter((s) => {
    if (status === "open" && !OPEN.includes(s.status)) return false;
    if (status !== "open" && status !== "all" && s.status !== status) return false;
    const hay = `${s.title} ${s.ref} ${s.authors.map((a: Author) => a.name).join(" ")} ${s.email}`.toLowerCase();
    return !q || hay.includes(q.toLowerCase());
  }), [data, status, q]);
  const count = (st: string) => (data || []).filter((s) => s.status === st).length;

  return (
    <>
      <H1>Manuscripts</H1>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <label htmlFor="ms-q" className="sr-only">Search manuscripts</label>
          <input id="ms-q" className="input !min-h-[38px] !py-1.5 pl-9 w-64" placeholder="Title, reference, author" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label htmlFor="ms-st" className="sr-only">Status</label>
        <select id="ms-st" className="input !min-h-[38px] !py-1.5 !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">In progress</option>
          {Object.entries(SUBMISSION_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label} ({count(k)})</option>)}
          <option value="all">All</option>
        </select>
      </div>
      {data && rows.length === 0 ? <div className="card p-8 text-center text-slate-600">No manuscripts match. New submissions appear here as soon as authors send them.</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-[0.95rem]">
            <thead className="bg-paper text-slate-600 text-sm"><tr><th className="p-3">Manuscript</th><th className="p-3 hidden lg:table-cell">Reviews</th><th className="p-3">Status</th><th className="p-3 hidden md:table-cell">Updated</th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-paper cursor-pointer" onClick={() => navigate(`/admin/manuscripts/${s.id}`)}>
                  <td className="p-3">
                    <Link to={`/admin/manuscripts/${s.id}`} className="font-semibold text-navy-ink hover:underline">{s.title}</Link>
                    <div className="text-sm text-slate-500">{s.ref} · {s.type} · {s.authors.map((a: Author) => a.name).join(", ")}{s.round > 1 ? ` · round ${s.round}` : ""}</div>
                    {s.unread > 0 && <span className="pill bg-gold text-navy-deep mt-1">{s.unread} unread</span>}
                  </td>
                  <td className="p-3 hidden lg:table-cell text-slate-600 whitespace-nowrap">{s.reviews_total ? `${s.reviews_in} of ${s.reviews_total} in` : "–"}</td>
                  <td className="p-3"><StatusPill status={s.status} map={SUBMISSION_STATUS} /></td>
                  <td className="p-3 hidden md:table-cell text-slate-600 whitespace-nowrap">{formatDate(s.updated_at, { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

const TEMPLATES: Record<string, string> = {
  screening: "Your manuscript has passed initial checks and is being screened by the editorial office.",
  revisions: "The reviewers have asked for revisions. Their comments are below. Please upload a revised manuscript and a response letter from your account.",
  accepted: "We are pleased to accept your manuscript for publication. The editorial office will contact you about the final version.",
  rejected: "After careful review, we are unable to accept your manuscript for publication. The reviewers' comments are below and we hope they are useful.",
};

export function ManuscriptDetail({ id, admin }: { id: string; admin: boolean }) {
  const { data: s, error, reload } = useLoad<any>(`/api/admin/submissions/${id}`);
  const [tab, setTab] = useState<"decision" | "reviews" | "messages">("reviews");
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!s) return null;
  const currentReviews = s.reviews.filter((r: any) => r.round === s.round && r.status !== "cancelled");
  const remove = async () => {
    if (!confirm(`Delete ${s.ref} with all files and messages permanently? This can't be undone.`)) return;
    await api(`/api/admin/submissions/${id}`, { method: "DELETE" }); navigate("/admin/manuscripts");
  };
  const createPub = async () => { const r = await api<{ id: number }>(`/api/admin/submissions/${id}/create-publication`, { method: "POST" }); navigate(`/admin/publications/${r.id}`); };
  const unread = s.messages.filter((m: any) => !m.fromStaff).length;

  return (
    <>
      <H1 back="/admin/manuscripts" action={<StatusPill status={s.status} map={SUBMISSION_STATUS} />}>{s.title}</H1>
      <p className="-mt-4 mb-6 text-slate-600">{s.ref} · {s.type}{s.category ? `, ${s.category}` : ""} · received {formatDate(s.created_at)}{s.round > 1 ? ` · round ${s.round}` : ""}</p>

      {s.status === "accepted" && (
        <div className="card p-5 mb-6 border-emerald-300 bg-emerald-50/50 flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-800">{s.publication ? (s.publication.status === "published" ? "This paper is published." : "A draft publication exists. Upload the final PDF and publish it.") : "Accepted. Prepare the publication: check the metadata, upload the final PDF, publish."}</p>
          {s.publication ? <Link to={`/admin/publications/${s.publication.id}`} className="btn btn-navy btn-sm">Open the publication</Link> : <button onClick={createPub} className="btn btn-gold btn-sm">Prepare publication</button>}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div role="tablist" className="flex gap-1 border-b border-slate-200">
            {([["reviews", `Peer review (${currentReviews.length})`], ["decision", "Decision"], ["messages", `Messages${unread ? ` (${s.messages.length})` : ""}`]] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`px-4 py-2.5 -mb-px border-b-2 font-semibold text-[0.95rem] ${tab === k ? "border-navy text-navy-ink" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{l}</button>
            ))}
          </div>
          {tab === "reviews" && <ReviewsPanel s={s} reload={reload} />}
          {tab === "decision" && <DecisionPanel s={s} reload={reload} />}
          {tab === "messages" && (
            <Panel title="Correspondence with the author">
              <MessageThread viewer="staff" messages={s.messages} postUrl={`/api/admin/submissions/${id}/messages`} fileHref={(f) => `/api/admin/files/${f.id}`} onSent={reload} placeholder="Write to the author (they'll see it in their account)" />
            </Panel>
          )}
        </div>
        <div className="xl:col-span-2 space-y-6">
          <Panel title="Submission">
            <p className="text-sm text-slate-500">Authors</p>
            <ul className="text-slate-800">{s.authors.map((a: Author) => <li key={a.name}>{a.name}{a.affiliation ? `, ${a.affiliation}` : ""}</li>)}</ul>
            <p className="text-sm text-slate-500 mt-3">Account</p>
            <p className="text-slate-800">{s.owner ? <Link to={`/admin/users/${s.owner.id}`} className="link">{s.owner.name}</Link> : "No account (legacy submission)"} · <a className="link break-all" href={`mailto:${s.email}`}>{s.email}</a></p>
            <p className="text-sm text-slate-500 mt-3">Abstract</p>
            <p className="text-slate-700 text-[0.95rem] leading-relaxed whitespace-pre-line">{s.abstract}</p>
            {(s.keywords || s.jel_codes) && <p className="text-sm text-slate-600 mt-3">Keywords: {s.keywords || "–"} · JEL: {s.jel_codes || "–"}</p>}
            {s.cover_letter && <><p className="text-sm text-slate-500 mt-3">Cover letter</p><p className="text-slate-700 text-[0.95rem] whitespace-pre-line">{s.cover_letter}</p></>}
          </Panel>
          <Panel title="Files"><FileList files={s.files} href={(f) => `/api/admin/submissions/${id}/files/${f.id}`} /></Panel>
          <Panel title="History"><Timeline events={s.events} labels={SUBMISSION_STATUS} /></Panel>
          {admin && <button onClick={remove} className="btn btn-danger btn-sm"><Trash2 className="w-4 h-4" aria-hidden /> Delete manuscript</button>}
        </div>
      </div>
    </>
  );
}

function ReviewsPanel({ s, reload }: { s: any; reload: () => void }) {
  const { data: reviewers } = useLoad<any[]>("/api/admin/reviewers");
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [reviewerId, setReviewerId] = useState("");
  const [nv, setNv] = useState({ name: "", email: "", institution: "" });
  const [due, setDue] = useState(new Date(Date.now() + 21 * 864e5).toISOString().slice(0, 10));
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: React.ReactNode } | null>(null);
  const [busy, setBusy] = useState(false);
  const canInvite = !["rejected", "withdrawn", "published", "accepted"].includes(s.status);
  const eligible = (reviewers || []).filter((r) => r.id !== s.owner?.id && !s.reviews.some((x: any) => x.reviewer_id === r.id && x.round === s.round && x.status !== "cancelled"));

  async function invite(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      const r = await api<{ emailed: boolean; setupLink: string }>(`/api/admin/submissions/${s.id}/reviews`, { method: "POST", json: mode === "existing" ? { reviewerId: Number(reviewerId), dueDate: due } : { ...nv, dueDate: due } });
      setMsg({ tone: "success", text: r.setupLink
        ? <>Reviewer invited. Emails are off, so send them this link to set their password and respond: <input readOnly className="input mt-2 text-sm" value={r.setupLink} onFocus={(e) => e.target.select()} /></>
        : r.emailed ? "Invitation emailed to the reviewer." : "Reviewer invited. They'll see it when they sign in." });
      setReviewerId(""); setNv({ name: "", email: "", institution: "" }); reload();
    } catch (x) {
      setMsg({ tone: "error", text: x instanceof ApiError && x.data?.error === "already_invited" ? "This reviewer is already invited for this round." : (x instanceof ApiError && Object.values(x.data?.errors || {})[0] as string) || errorMessage(x) });
    } finally { setBusy(false); }
  }
  const cancel = async (rid: number) => { if (!confirm("Cancel this review invitation?")) return; await api(`/api/admin/reviews/${rid}/cancel`, { method: "POST" }); reload(); };

  return (
    <div className="space-y-6">
      {s.reviews.length === 0 ? <Panel><p className="text-slate-600">No reviewers yet. Invite at least two independent reviewers below.</p></Panel> : (
        s.reviews.slice().reverse().map((r: any) => (
          <Panel key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-ink">{r.reviewer_name} <span className="font-normal text-slate-500 text-sm">· round {r.round}</span></p>
                <p className="text-sm text-slate-500">{r.reviewer_institution || r.reviewer_email} · invited {formatDate(r.invited_at, { day: "numeric", month: "short" })}{r.due_date ? ` · due ${formatDate(r.due_date, { day: "numeric", month: "short" })}` : ""}</p>
              </div>
              <div className="flex items-center gap-2"><StatusPill status={r.status} map={REVIEW_STATUS} />{["invited", "accepted"].includes(r.status) && <button className="link text-sm" onClick={() => cancel(r.id)}>Cancel</button>}</div>
            </div>
            {r.status === "submitted" && (
              <div className="mt-4 space-y-3">
                <p><span className="pill bg-navy text-white">{RECOMMENDATION[r.recommendation] || r.recommendation}</span></p>
                {Object.keys(r.scores || {}).length > 0 && (
                  <ul className="flex flex-wrap gap-3 text-sm text-slate-600">{Object.entries(r.scores).map(([k, v]) => <li key={k} className="inline-flex items-center gap-1 capitalize">{k}: <Star className="w-3.5 h-3.5 text-gold" aria-hidden />{String(v)}/5</li>)}</ul>
                )}
                <div><p className="text-sm text-slate-500">For the authors</p><p className="text-slate-700 whitespace-pre-line leading-relaxed text-[0.95rem]">{r.comments_author}</p></div>
                {r.comments_editor && <div className="bg-amber-50 rounded-md p-3"><p className="text-sm text-amber-900 font-semibold">Confidential to the editor</p><p className="text-slate-700 whitespace-pre-line text-[0.95rem]">{r.comments_editor}</p></div>}
              </div>
            )}
          </Panel>
        ))
      )}

      {canInvite && (
        <Panel title="Invite a reviewer">
          <form onSubmit={invite} className="space-y-4">
            {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
            <div role="tablist" className="flex gap-2">
              {([["existing", "From the reviewer list"], ["new", "New reviewer by email"]] as const).map(([k, l]) => (
                <button type="button" key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${mode === k ? "bg-navy text-white" : "bg-paper border border-slate-200"}`}>{l}</button>
              ))}
            </div>
            {mode === "existing" ? (
              <Field id="rv-pick" label="Reviewer" hint={eligible.length ? "Expertise and current workload are shown." : "No reviewers available yet. Add one by email, or give an account the Reviewer role."}>
                <select id="rv-pick" className="input" value={reviewerId} onChange={(e) => setReviewerId(e.target.value)} required>
                  <option value="">Choose a reviewer</option>
                  {eligible.map((r) => <option key={r.id} value={r.id}>{r.name}{r.institution ? `, ${r.institution}` : ""}{r.expertise ? ` (${r.expertise})` : ""} · {r.active} active, {r.done} done</option>)}
                </select>
              </Field>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id="rv-name" label="Name"><input id="rv-name" className="input" required value={nv.name} onChange={(e) => setNv({ ...nv, name: e.target.value })} /></Field>
                <Field id="rv-email" label="Email"><input id="rv-email" type="email" className="input" required value={nv.email} onChange={(e) => setNv({ ...nv, email: e.target.value })} /></Field>
                <div className="sm:col-span-2"><Field id="rv-inst" label="Institution"><input id="rv-inst" className="input" value={nv.institution} onChange={(e) => setNv({ ...nv, institution: e.target.value })} /></Field></div>
              </div>
            )}
            <Field id="rv-due" label="Review due by"><input id="rv-due" type="date" className="input sm:max-w-[220px]" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
            <button className="btn btn-navy" disabled={busy}><UserPlus className="w-4 h-4" aria-hidden /> {busy ? "Inviting…" : "Send invitation"}</button>
          </form>
        </Panel>
      )}
    </div>
  );
}

function DecisionPanel({ s, reload }: { s: any; reload: () => void }) {
  const [status, setStatus] = useState(s.status === "published" ? "accepted" : s.status);
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [flash, setFlash] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setStatus(s.status === "published" ? "accepted" : s.status); }, [s.status]);

  const includeReviews = async () => {
    const r = await api<{ text: string }>(`/api/admin/submissions/${s.id}/decision-draft`);
    setMessage((m) => `${m ? m + "\n\n" : ""}${r.text || "(No reviewer reports submitted for this round yet.)"}`);
  };
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setFlash(null);
    try {
      const r = await api<{ emailed: boolean }>(`/api/admin/submissions/${s.id}/status`, { method: "POST", json: { status, message, note } });
      setFlash({ tone: "success", text: `Decision saved.${r.emailed ? " The author has been emailed." : " The author will see it in their account."}` }); setMessage(""); setNote(""); reload();
    } catch (x) { setFlash({ tone: "error", text: errorMessage(x) }); } finally { setBusy(false); }
  }
  if (s.status === "published") return <Panel><p className="text-slate-700">This paper is published. Decisions are closed.</p></Panel>;
  return (
    <Panel title="Record a decision">
      <form onSubmit={save} className="space-y-4">
        {flash && <Notice tone={flash.tone}>{flash.text}</Notice>}
        <Field id="dc-st" label="New status">
          <select id="dc-st" className="input" value={status} onChange={(e) => { setStatus(e.target.value); if (!message && TEMPLATES[e.target.value]) setMessage(TEMPLATES[e.target.value]); }}>
            {Object.entries(SUBMISSION_STATUS).filter(([k]) => k !== "published").map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <div>
          <div className="flex flex-wrap justify-between items-baseline gap-2"><label htmlFor="dc-msg" className="field-label">Letter to the author</label><button type="button" className="link text-sm" onClick={includeReviews}>Insert reviewer comments (anonymous)</button></div>
          <textarea id="dc-msg" className="input !min-h-[220px]" value={message} onChange={(e) => setMessage(e.target.value)} />
          <p className="field-hint">Shown in the author's account{" "}and emailed when email is on. Reviewer names are never included.</p>
        </div>
        <Field id="dc-note" label="Internal note (staff only)"><textarea id="dc-note" className="input !min-h-[80px]" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        <button className="btn btn-navy" disabled={busy}>{busy ? "Saving…" : "Save decision"}</button>
      </form>
    </Panel>
  );
}
