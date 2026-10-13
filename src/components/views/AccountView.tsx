import React, { useCallback, useEffect, useRef, useState } from "react";
import { LayoutDashboard, FileText, Briefcase, ClipboardCheck, UserCircle, LogOut, Plus, ArrowLeft, ShieldCheck, AlertTriangle, Upload, ExternalLink, Camera } from "lucide-react";
import { Link, navigate, useLocation, usePageTitle } from "../../lib/router";
import { api, ApiError, errorMessage, formatDate } from "../../lib/api";
import { useAuth, postForm, isStaff, type Account } from "../../lib/auth";
import { SITE, DIVISIONS } from "../../lib/site";
import { Field, Notice, EmptyState } from "../ui";
import { StatusPill, SUBMISSION_STATUS, PROJECT_STATUS, REVIEW_STATUS, RECOMMENDATION, FileList, MessageThread, Panel, Timeline } from "../workspace";
import SubmitView from "./SubmitView";

export default function AccountView() {
  const { user, loading, counts, signOut } = useAuth();
  const { path, search } = useLocation();
  usePageTitle(`My space | ${SITE.short}`);

  useEffect(() => { if (!loading && !user) navigate(`/signin?next=${encodeURIComponent(path + search)}`, { replace: true }); }, [loading, user, path, search]);
  if (loading || !user) return <div className="min-h-[60vh] bg-paper" />;

  const seg = path.split("/").slice(2);
  const showReviews = user.role !== "user" || (counts?.pendingReviews ?? 0) > 0;
  const nav = [
    { to: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/account/manuscripts", label: "My manuscripts", icon: FileText },
    { to: "/account/projects", label: user.accountType === "institution" ? "Projects and requests" : "My requests", icon: Briefcase },
    ...(showReviews ? [{ to: "/account/reviews", label: "Reviews to do", icon: ClipboardCheck, badge: counts?.pendingReviews }] : []),
    { to: "/account/profile", label: "Profile and password", icon: UserCircle },
  ];

  let page: React.ReactNode;
  if (!seg[0]) page = <Overview user={user} />;
  else if (seg[0] === "manuscripts") page = seg[1] === "new" ? <SubmitView embedded /> : seg[1] ? <ManuscriptDetail id={seg[1]} /> : <Manuscripts />;
  else if (seg[0] === "projects") page = seg[1] === "new" ? <NewProject user={user} /> : seg[1] ? <ProjectDetail id={seg[1]} /> : <Projects user={user} />;
  else if (seg[0] === "reviews") page = seg[1] ? <ReviewDetail id={seg[1]} /> : <Reviews />;
  else if (seg[0] === "profile") page = <Profile />;
  else page = <p>Page not found.</p>;

  const active = (n: { to: string; exact?: boolean }) => (n.exact ? path === n.to : path.startsWith(n.to));

  return (
    <div className="bg-paper min-h-[70vh]">
      <div className="container-x py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 min-w-0">
          <div className="card p-4 flex items-center gap-3">
            <Avatar user={user} />
            <div className="min-w-0">
              <p className="font-semibold text-navy-ink truncate">{user.name}</p>
              <p className="text-sm text-slate-500 truncate">{user.accountType === "institution" ? user.institution || "Institution" : user.institution || "Researcher"}</p>
            </div>
          </div>
          <nav aria-label="My space" className="mt-3 card p-2 flex lg:flex-col overflow-x-auto gap-1">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} aria-current={active(n) ? "page" : undefined}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md whitespace-nowrap text-[0.95rem] ${active(n) ? "bg-navy text-white" : "text-slate-700 hover:bg-paper"}`}>
                <n.icon className="w-4 h-4" aria-hidden />{n.label}
                {"badge" in n && n.badge ? <span className="ml-auto pill bg-gold text-navy-deep !py-0">{n.badge}</span> : null}
              </Link>
            ))}
            {isStaff(user) && <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2.5 rounded-md whitespace-nowrap text-[0.95rem] text-slate-700 hover:bg-paper"><ShieldCheck className="w-4 h-4" aria-hidden />Admin area</Link>}
            <button onClick={async () => { await signOut(); navigate("/"); }} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md whitespace-nowrap text-[0.95rem] text-slate-700 hover:bg-paper text-left"><LogOut className="w-4 h-4" aria-hidden />Sign out</button>
          </nav>
        </aside>
        <div className="lg:col-span-9 min-w-0">{page}</div>
      </div>
    </div>
  );
}

export function Avatar({ user, size = 48 }: { user: { name: string; photo?: string }; size?: number }) {
  const initials = user.name.replace(/^(dr|prof)\.?\s+/i, "").split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return user.photo
    ? <img src={user.photo} alt="" className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />
    : <span className="rounded-full bg-navy text-gold font-serif flex items-center justify-center shrink-0" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden>{initials}</span>;
}

function Head({ title, back, action, sub }: { title: string; back?: string; action?: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="mb-6">
      {back && <Link to={back} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-navy-ink mb-2"><ArrowLeft className="w-4 h-4" aria-hidden /> Back</Link>}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="text-2xl sm:text-3xl font-semibold text-navy-ink leading-tight">{title}</h1>{sub && <div className="mt-1.5 text-slate-600">{sub}</div>}</div>
        {action}
      </div>
    </div>
  );
}

function useData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => { api<T>(url).then((d) => { setData(d); setError(""); }).catch((e) => setError(e instanceof ApiError && e.status === 404 ? "not_found" : errorMessage(e, "This page couldn't be loaded. Refresh to try again."))); }, [url]);
  useEffect(() => { load(); }, [load]);
  return { data, error, reload: load };
}

function AccountNotices({ user }: { user: Account }) {
  const { emailEnabled } = useAuth();
  const [sent, setSent] = useState(false);
  return (
    <div className="space-y-3 mb-6">
      {user.accountType === "institution" && user.status === "pending" && (
        <Notice><strong>Your institution account is awaiting approval.</strong> Our team checks institution accounts before projects can be submitted. You'll receive an email once {user.institution || "your institution"} is approved.</Notice>
      )}
      {emailEnabled && !user.emailVerified && (
        <Notice>
          Confirm your email address using the link we sent to <strong>{user.email}</strong>.{" "}
          {sent ? "A new link is on its way." : <button className="link" onClick={() => api("/api/account/resend-verification", { method: "POST" }).then(() => setSent(true))}>Send it again</button>}
        </Notice>
      )}
    </div>
  );
}

// ------------------------------------------------------------ Overview
function Overview({ user }: { user: Account }) {
  const ms = useData<any[]>("/api/account/submissions");
  const rq = useData<any[]>("/api/account/requests");
  const rv = useData<any[]>("/api/account/reviews");
  const todo = (rv.data || []).filter((r) => ["invited", "accepted"].includes(r.status));
  const actionNeeded = (ms.data || []).filter((s) => s.status === "revisions" || s.unread > 0);
  const projectsAction = (rq.data || []).filter((r) => r.status === "awaiting-client" || r.unread > 0);
  const first = user.name.replace(/^(dr|prof)\.?\s+/i, "").split(" ")[0];

  return (
    <>
      <Head title={`Welcome, ${first}`} sub={user.accountType === "institution" ? user.institution : "Your manuscripts, requests and reviews in one place."} />
      <AccountNotices user={user} />

      {(todo.length > 0 || actionNeeded.length > 0 || projectsAction.length > 0) && (
        <Panel title="Needs your attention" className="mb-6 border-amber-200">
          <ul className="divide-y divide-slate-100">
            {todo.map((r) => <li key={`r${r.id}`} className="py-3 flex flex-wrap items-center justify-between gap-3"><span><strong>Review:</strong> {r.title}</span><Link to={`/account/reviews/${r.id}`} className="btn btn-gold btn-sm">{r.status === "invited" ? "Respond to invitation" : "Continue review"}</Link></li>)}
            {actionNeeded.map((s) => <li key={`s${s.id}`} className="py-3 flex flex-wrap items-center justify-between gap-3"><span><strong>{s.status === "revisions" ? "Revisions requested" : "New message"}:</strong> {s.title}</span><Link to={`/account/manuscripts/${s.id}`} className="btn btn-navy btn-sm">Open</Link></li>)}
            {projectsAction.map((r) => <li key={`p${r.id}`} className="py-3 flex flex-wrap items-center justify-between gap-3"><span><strong>{r.status === "awaiting-client" ? "Reply needed" : "New message"}:</strong> {r.subject}</span><Link to={`/account/projects/${r.id}`} className="btn btn-navy btn-sm">Open</Link></li>)}
          </ul>
        </Panel>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Panel title="Manuscripts" action={<Link to="/account/manuscripts/new" className="btn btn-outline btn-sm"><Plus className="w-4 h-4" aria-hidden /> Submit</Link>}>
          {(ms.data || []).length === 0 ? <p className="text-slate-600">You haven't submitted a manuscript yet.</p> : (
            <ul className="space-y-3">{(ms.data || []).slice(0, 4).map((s) => (
              <li key={s.id}><Link to={`/account/manuscripts/${s.id}`} className="block group"><p className="font-medium text-navy-ink group-hover:underline line-clamp-1">{s.title}</p><div className="mt-1"><StatusPill status={s.status} map={SUBMISSION_STATUS} /></div></Link></li>
            ))}</ul>
          )}
        </Panel>
        <Panel title={user.accountType === "institution" ? "Project reviews" : "Requests"} action={<Link to="/account/projects/new" className="btn btn-outline btn-sm"><Plus className="w-4 h-4" aria-hidden /> New project</Link>}>
          {(rq.data || []).length === 0 ? <p className="text-slate-600">No project review requests yet.</p> : (
            <ul className="space-y-3">{(rq.data || []).slice(0, 4).map((r) => (
              <li key={r.id}><Link to={`/account/projects/${r.id}`} className="block group"><p className="font-medium text-navy-ink group-hover:underline line-clamp-1">{r.subject || r.ref}</p><div className="mt-1"><StatusPill status={r.status} map={PROJECT_STATUS} /></div></Link></li>
            ))}</ul>
          )}
        </Panel>
      </div>
      {user.accountType === "researcher" && user.publicProfile && (
        <p className="mt-6 text-slate-600 text-[0.95rem]">Your public author page: <Link to={`/authors/${user.id}`} className="link">view profile</Link>. Published papers appear on it automatically.</p>
      )}
    </>
  );
}

// ------------------------------------------------------------ Manuscripts
function Manuscripts() {
  const { data } = useData<any[]>("/api/account/submissions");
  return (
    <>
      <Head title="My manuscripts" action={<Link to="/account/manuscripts/new" className="btn btn-navy"><Plus className="w-4 h-4" aria-hidden /> Submit a manuscript</Link>} />
      {data && data.length === 0 ? (
        <EmptyState icon={<FileText className="w-6 h-6" />} title="No manuscripts yet" action={<Link to="/account/manuscripts/new" className="btn btn-navy">Submit your first manuscript</Link>}>
          Submitted papers go through double-blind peer review. You'll follow each step here.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {(data || []).map((s) => (
            <li key={s.id}>
              <Link to={`/account/manuscripts/${s.id}`} className="card p-5 flex flex-wrap items-center gap-4 hover:border-slate-400">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-ink">{s.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{s.ref} · {s.type} · submitted {formatDate(s.created_at, { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                {s.unread > 0 && <span className="pill bg-gold text-navy-deep">{s.unread} new</span>}
                <StatusPill status={s.status} map={SUBMISSION_STATUS} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const PATH = ["submitted", "under-review", "accepted", "published"];

function ManuscriptDetail({ id }: { id: string }) {
  const { data: s, error, reload } = useData<any>(`/api/account/submissions/${id}`);
  const { refresh } = useAuth();
  useEffect(() => { if (s) refresh(); }, [s, refresh]);
  const isNew = new URLSearchParams(window.location.search).get("new") === "1";
  if (error === "not_found") return <EmptyState title="Manuscript not found" action={<Link to="/account/manuscripts" className="btn btn-navy">My manuscripts</Link>} />;
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!s) return null;
  const stage = Math.max(PATH.indexOf({ screening: "submitted", revisions: "under-review", revised: "under-review" }[s.status as string] || s.status), 0);
  const stopped = ["rejected", "withdrawn"].includes(s.status);
  const withdraw = async () => {
    if (!confirm("Withdraw this manuscript? The editorial office will stop processing it. This can't be undone.")) return;
    await api(`/api/account/submissions/${id}/withdraw`, { method: "POST" }); reload();
  };

  return (
    <>
      <Head title={s.title} back="/account/manuscripts" sub={<span className="flex flex-wrap items-center gap-2">{s.ref} · {s.type} <StatusPill status={s.status} map={SUBMISSION_STATUS} /></span>}
        action={s.publicationSlug ? <Link to={`/research/${s.publicationSlug}`} className="btn btn-gold"><ExternalLink className="w-4 h-4" aria-hidden /> View published paper</Link> : undefined} />

      {!stopped && (
        <ol className="grid grid-cols-4 gap-1.5 mb-6" aria-label="Progress">
          {PATH.map((p, i) => (
            <li key={p}><div className={`h-1.5 rounded-full ${i <= stage ? "bg-navy" : "bg-slate-200"}`} /><p className={`mt-2 text-xs sm:text-sm ${i <= stage ? "text-navy-ink font-semibold" : "text-slate-400"}`}>{SUBMISSION_STATUS[p].label}</p></li>
          ))}
        </ol>
      )}

      {isNew && <div className="mb-6"><Notice tone="success">Your manuscript has been received ({s.ref}). The editorial office will screen it and write to you here.</Notice></div>}
      {s.canRevise && <RevisionForm id={id} onDone={reload} />}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 space-y-5">
          <Panel title="Correspondence with the editorial office">
            <MessageThread viewer="owner" messages={s.messages} postUrl={`/api/account/submissions/${id}/messages`} fileHref={(f) => `/api/account/messages/files/${f.id}`} onSent={reload} placeholder="Write to the editorial office" />
          </Panel>
          {s.reviews.length > 0 && (
            <Panel title="Reviewer comments">
              <p className="text-sm text-slate-500 mb-3">Reviews are anonymous. Reviewers don't see your name and you don't see theirs.</p>
              <div className="space-y-4">{s.reviews.map((r: any, i: number) => (
                <div key={i} className="border-l-4 border-gold pl-4"><p className="font-semibold text-navy-ink">{r.reviewer}{r.round > 1 ? ` (round ${r.round})` : ""}</p><p className="text-slate-700 whitespace-pre-line leading-relaxed mt-1">{r.comments}</p></div>
              ))}</div>
            </Panel>
          )}
        </div>
        <div className="xl:col-span-2 space-y-5">
          <Panel title="History"><Timeline events={s.events} labels={SUBMISSION_STATUS} /></Panel>
          <Panel title="Files"><FileList files={s.files} href={(f) => `/api/account/submissions/${id}/files/${f.id}`} /></Panel>
          <Panel title="Details">
            <p className="text-sm text-slate-500">Authors</p>
            <p className="text-slate-800">{s.authors.map((a: any) => a.name).join(", ")}</p>
            <p className="text-sm text-slate-500 mt-3">Abstract</p>
            <p className="text-slate-700 text-[0.95rem] leading-relaxed line-clamp-6">{s.abstract}</p>
          </Panel>
          {!["published", "rejected", "withdrawn"].includes(s.status) && <button onClick={withdraw} className="btn btn-danger btn-sm">Withdraw manuscript</button>}
        </div>
      </div>
    </>
  );
}

function RevisionForm({ id, onDone }: { id: string; onDone: () => void }) {
  const [ms, setMs] = useState<File | null>(null);
  const [resp, setResp] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const a = useRef<HTMLInputElement>(null); const b = useRef<HTMLInputElement>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ms) return setErr("Attach the revised manuscript.");
    setBusy(true); setErr("");
    const fd = new FormData(); fd.append("manuscript", ms); if (resp) fd.append("response", resp); fd.append("note", note);
    try { await postForm(`/api/account/submissions/${id}/revision`, fd); onDone(); }
    catch (x) { setErr(x instanceof ApiError && x.data?.errors?.manuscript ? x.data.errors.manuscript : errorMessage(x)); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="card p-5 sm:p-6 mb-6 border-amber-300 bg-amber-50/40 space-y-4">
      <h2 className="font-sans text-lg font-semibold text-navy-ink flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-700" aria-hidden /> Revisions requested</h2>
      <p className="text-slate-700">Read the reviewer comments below, then upload the revised manuscript and a letter explaining how you responded to each point.</p>
      {err && <Notice tone="error">{err}</Notice>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><p className="field-label">Revised manuscript</p><button type="button" className="btn btn-outline btn-sm" onClick={() => a.current?.click()}><Upload className="w-4 h-4" aria-hidden /> {ms ? "Replace" : "Choose file"}</button>{ms && <p className="text-sm mt-1 break-all">{ms.name}</p>}<input ref={a} type="file" className="sr-only" aria-label="Revised manuscript" accept=".pdf,.doc,.docx" onChange={(e) => setMs(e.target.files?.[0] || null)} /></div>
        <div><p className="field-label">Response to reviewers (recommended)</p><button type="button" className="btn btn-outline btn-sm" onClick={() => b.current?.click()}><Upload className="w-4 h-4" aria-hidden /> {resp ? "Replace" : "Choose file"}</button>{resp && <p className="text-sm mt-1 break-all">{resp.name}</p>}<input ref={b} type="file" className="sr-only" aria-label="Response to reviewers" accept=".pdf,.doc,.docx" onChange={(e) => setResp(e.target.files?.[0] || null)} /></div>
      </div>
      <Field id="rev-note" label="Note to the editor (optional)"><textarea id="rev-note" className="input !min-h-[80px]" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <button className="btn btn-gold" disabled={busy}>{busy ? "Uploading…" : "Submit revised version"}</button>
    </form>
  );
}

// ------------------------------------------------------------ Projects and requests
function Projects({ user }: { user: Account }) {
  const { data } = useData<any[]>("/api/account/requests");
  const KIND: Record<string, string> = { "project-review": "Project review", consulting: "Consulting inquiry", contact: "Message" };
  return (
    <>
      <Head title={user.accountType === "institution" ? "Projects and requests" : "My requests"} action={<Link to="/account/projects/new" className="btn btn-navy"><Plus className="w-4 h-4" aria-hidden /> Submit a project</Link>} />
      {data && data.length === 0 ? (
        <EmptyState icon={<Briefcase className="w-6 h-6" />} title="No projects yet" action={<Link to="/account/projects/new" className="btn btn-navy">Submit a project for review</Link>}>
          Submit an economic, infrastructure or policy project for independent expert review. Correspondence and the final report will appear here.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {(data || []).map((r) => (
            <li key={r.id}>
              <Link to={`/account/projects/${r.id}`} className="card p-5 flex flex-wrap items-center gap-4 hover:border-slate-400">
                <div className="min-w-0 flex-1"><p className="font-semibold text-navy-ink">{r.subject || KIND[r.kind]}</p><p className="text-sm text-slate-500 mt-0.5">{r.ref} · {KIND[r.kind]} · {formatDate(r.created_at, { day: "numeric", month: "short", year: "numeric" })}</p></div>
                {r.unread > 0 && <span className="pill bg-gold text-navy-deep">{r.unread} new</span>}
                <StatusPill status={r.status} map={PROJECT_STATUS} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const LEVELS = ["Initial evaluation", "Standard review", "Comprehensive examination", "Institutional partnership", "Not sure yet"];

function NewProject({ user }: { user: Account }) {
  const [v, setV] = useState({ title: "", division: DIVISIONS[4].name, level: "Standard review", size: "", country: user.country, timeline: "", organization: user.institution, message: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value });
  const blocked = user.accountType === "institution" && user.status !== "active";

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(""); setErrors({});
    const fd = new FormData(); Object.entries(v).forEach(([k, x]) => fd.append(k, x || "")); files.forEach((f) => fd.append("documents", f));
    try { const r = await postForm<{ id: number }>("/api/account/projects", fd); navigate(`/account/projects/${r.id}`); }
    catch (x) { if (x instanceof ApiError && x.data?.errors) setErrors(x.data.errors); setErr(x instanceof ApiError && x.data?.error === "pending_approval" ? "Your institution account must be approved before you can submit projects." : errorMessage(x)); }
    finally { setBusy(false); }
  }

  return (
    <>
      <Head title="Submit a project for review" back="/account/projects" sub="Projects are examined by specialists from the relevant division. Everything you send is confidential." />
      {blocked ? <Notice>Your institution account is awaiting approval. You'll be able to submit projects once it's approved.</Notice> : (
        <form onSubmit={submit} noValidate className="card p-6 sm:p-8 space-y-5">
          {err && <Notice tone="error">{err}</Notice>}
          <Field id="np-title" label="Project name" error={errors.title}><input id="np-title" className="input" value={v.title} onChange={set("title")} aria-invalid={!!errors.title} /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="np-org" label="Organisation"><input id="np-org" className="input" value={v.organization} onChange={set("organization")} /></Field>
            <Field id="np-country" label="Country"><input id="np-country" className="input" value={v.country} onChange={set("country")} /></Field>
            <Field id="np-div" label="Area"><select id="np-div" className="input" value={v.division} onChange={set("division")}>{DIVISIONS.map((d) => <option key={d.code}>{d.name}</option>)}</select></Field>
            <Field id="np-level" label="Depth of review"><select id="np-level" className="input" value={v.level} onChange={set("level")}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></Field>
            <Field id="np-size" label="Approximate project size"><input id="np-size" className="input" value={v.size} onChange={set("size")} placeholder="e.g. USD 40 million" /></Field>
            <Field id="np-time" label="When do you need the report?"><input id="np-time" className="input" value={v.timeline} onChange={set("timeline")} placeholder="e.g. Before March 2027" /></Field>
          </div>
          <Field id="np-msg" label="Project description" hint="Objectives, budget, financing, timeline, and the questions the review should answer." error={errors.message}>
            <textarea id="np-msg" className="input !min-h-[180px]" value={v.message} onChange={set("message")} aria-invalid={!!errors.message} />
          </Field>
          <div>
            <p className="field-label">Documents (up to 5)</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => input.current?.click()} disabled={files.length >= 5}><Upload className="w-4 h-4" aria-hidden /> Add documents</button>
            <p className="field-hint">Project plan, financial model, feasibility studies. PDF, Word, Excel or PowerPoint, up to 25 MB each.</p>
            {errors.documents && <p className="field-error">{errors.documents}</p>}
            {files.length > 0 && <ul className="mt-2 space-y-1">{files.map((f, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="break-all">{f.name}</span><button type="button" className="link" onClick={() => setFiles(files.filter((_, j) => j !== i))}>Remove</button></li>)}</ul>}
            <input ref={input} type="file" multiple className="sr-only" aria-label="Project documents" accept=".pdf,.doc,.docx,.xlsx,.pptx" onChange={(e) => { setFiles([...files, ...Array.from(e.target.files || [])].slice(0, 5)); e.target.value = ""; }} />
          </div>
          <button className="btn btn-navy" disabled={busy}>{busy ? "Uploading…" : "Submit project"}</button>
        </form>
      )}
    </>
  );
}

function ProjectDetail({ id }: { id: string }) {
  const { data: r, error, reload } = useData<any>(`/api/account/requests/${id}`);
  const { refresh } = useAuth();
  useEffect(() => { if (r) refresh(); }, [r, refresh]);
  if (error === "not_found") return <EmptyState title="Request not found" action={<Link to="/account/projects" className="btn btn-navy">My requests</Link>} />;
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!r) return null;
  const reports = r.files.filter((f: any) => f.kind === "report");
  return (
    <>
      <Head title={r.title || r.ref} back="/account/projects" sub={<span className="flex flex-wrap items-center gap-2">{r.ref} <StatusPill status={r.status} map={PROJECT_STATUS} /></span>} />
      {reports.length > 0 && (
        <div className="card p-5 sm:p-6 mb-6 border-emerald-300 bg-emerald-50/50">
          <h2 className="font-sans text-lg font-semibold text-navy-ink mb-3">Your evaluation report</h2>
          <FileList files={reports} href={(f) => `/api/account/requests/${id}/files/${f.id}`} />
        </div>
      )}
      {r.status === "awaiting-client" && <div className="mb-6"><Notice>The team is waiting for your reply. Answer in the conversation below.</Notice></div>}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3">
          <Panel title="Conversation"><MessageThread viewer="owner" messages={r.messages} postUrl={`/api/account/requests/${id}/messages`} fileHref={(f) => `/api/account/messages/files/${f.id}`} onSent={reload} placeholder="Write to the team" /></Panel>
        </div>
        <div className="xl:col-span-2 space-y-5">
          <Panel title="Request">
            <dl className="space-y-2 text-[0.95rem]">
              {Object.entries(r.details || {}).filter(([, x]) => x).map(([k, x]) => <div key={k}><dt className="text-sm text-slate-500">{k}</dt><dd className="text-slate-800">{String(x)}</dd></div>)}
            </dl>
            <p className="text-sm text-slate-500 mt-3">Description</p>
            <p className="text-slate-700 text-[0.95rem] whitespace-pre-line leading-relaxed">{r.message}</p>
          </Panel>
          <Panel title="Documents"><FileList files={r.files.filter((f: any) => f.kind !== "report")} href={(f) => `/api/account/requests/${id}/files/${f.id}`} empty="No documents attached." /></Panel>
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------ Reviews (for reviewers)
function Reviews() {
  const { data } = useData<any[]>("/api/account/reviews");
  return (
    <>
      <Head title="Reviews" sub="Manuscripts the editorial office has asked you to review. Reviews are double-blind." />
      {data && data.length === 0 ? <EmptyState icon={<ClipboardCheck className="w-6 h-6" />} title="No review assignments">When the editorial office invites you to review a manuscript, it will appear here.</EmptyState> : (
        <ul className="space-y-3">
          {(data || []).map((r) => (
            <li key={r.id}>
              <Link to={`/account/reviews/${r.id}`} className="card p-5 flex flex-wrap items-center gap-4 hover:border-slate-400">
                <div className="min-w-0 flex-1"><p className="font-semibold text-navy-ink">{r.title}</p><p className="text-sm text-slate-500 mt-0.5">{r.type} · {r.category}{r.due_date ? ` · due ${formatDate(r.due_date)}` : ""}{r.round > 1 ? ` · round ${r.round}` : ""}</p></div>
                <StatusPill status={r.status} map={REVIEW_STATUS} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const CRITERIA = [["originality", "Originality"], ["methodology", "Methodology"], ["evidence", "Evidence and results"], ["policy", "Policy relevance"], ["clarity", "Clarity of writing"]];

function ReviewDetail({ id }: { id: string }) {
  const { data: r, error, reload } = useData<any>(`/api/account/reviews/${id}`);
  const { refresh } = useAuth();
  useEffect(() => { if (r) refresh(); }, [r, refresh]);
  const [form, setForm] = useState<{ recommendation: string; commentsAuthor: string; commentsEditor: string; scores: Record<string, number> }>({ recommendation: "", commentsAuthor: "", commentsEditor: "", scores: {} });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (r) setForm({ recommendation: r.recommendation, commentsAuthor: r.commentsAuthor, commentsEditor: r.commentsEditor, scores: r.scores || {} }); }, [r]);
  if (error === "not_found") return <EmptyState title="Review not found" action={<Link to="/account/reviews" className="btn btn-navy">My reviews</Link>} />;
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!r) return null;

  const respond = async (accept: boolean) => { await api(`/api/account/reviews/${id}/respond`, { method: "POST", json: { accept } }); reload(); };
  const save = async (draft: boolean) => {
    setBusy(true); setErrors({}); setFlash(null);
    try { await api(`/api/account/reviews/${id}/submit`, { method: "POST", json: { ...form, draft } }); setFlash({ tone: "success", text: draft ? "Draft saved." : "Thank you. Your review has been sent to the editor." }); reload(); }
    catch (x) { if (x instanceof ApiError && x.data?.errors) setErrors(x.data.errors); setFlash({ tone: "error", text: errorMessage(x) }); }
    finally { setBusy(false); }
  };
  const locked = r.status === "submitted";

  return (
    <>
      <Head title={r.title} back="/account/reviews" sub={<span className="flex flex-wrap items-center gap-2">{r.type} · {r.category}{r.dueDate ? ` · due ${formatDate(r.dueDate)}` : ""} <StatusPill status={r.status} map={REVIEW_STATUS} /></span>} />
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Panel title="Abstract"><p className="text-slate-700 leading-relaxed whitespace-pre-line text-[0.95rem]">{r.abstract}</p>{r.keywords && <p className="text-sm text-slate-500 mt-3">Keywords: {r.keywords}</p>}</Panel>
          {r.status !== "invited" && <Panel title="Manuscript"><FileList files={r.files} href={(f) => `/api/account/reviews/${id}/files/${f.id}`} /></Panel>}
        </div>
        <div className="xl:col-span-3">
          {r.status === "invited" ? (
            <Panel title="Will you review this manuscript?">
              <p className="text-slate-700 leading-relaxed">Read the abstract. If you have the expertise and no conflict of interest, accept to download the manuscript. The review is double-blind.</p>
              <div className="mt-5 flex gap-3"><button className="btn btn-navy" onClick={() => respond(true)}>Accept and start</button><button className="btn btn-outline" onClick={() => respond(false)}>Decline</button></div>
            </Panel>
          ) : r.status === "declined" ? <Panel><p className="text-slate-700">You declined this invitation. Thank you for letting us know.</p></Panel> : (
            <Panel title={locked ? "Your review (submitted)" : "Your review"}>
              <div className="space-y-5">
                {flash && <Notice tone={flash.tone}>{flash.text}</Notice>}
                <fieldset disabled={locked}>
                  <legend className="field-label">Assessment (1 = weak, 5 = excellent)</legend>
                  <div className="space-y-2">
                    {CRITERIA.map(([k, l]) => (
                      <div key={k} className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-slate-700">{l}</span>
                        <div className="flex gap-1" role="radiogroup" aria-label={l}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <label key={n} className={`w-9 h-9 rounded-md border flex items-center justify-center cursor-pointer text-sm font-semibold ${form.scores[k] === n ? "bg-navy text-white border-navy" : "border-slate-300 text-slate-600"}`}>
                              <input type="radio" className="sr-only" name={k} checked={form.scores[k] === n} onChange={() => setForm({ ...form, scores: { ...form.scores, [k]: n } })} />{n}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </fieldset>
                <Field id="rv-rec" label="Recommendation" error={errors.recommendation}>
                  <select id="rv-rec" className="input" disabled={locked} value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })}>
                    <option value="">Choose</option>{Object.entries(RECOMMENDATION).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </Field>
                <Field id="rv-ca" label="Comments for the authors" hint="Shared with the authors without your name. Be specific and constructive." error={errors.commentsAuthor}>
                  <textarea id="rv-ca" className="input !min-h-[260px]" disabled={locked} value={form.commentsAuthor} onChange={(e) => setForm({ ...form, commentsAuthor: e.target.value })} />
                </Field>
                <Field id="rv-ce" label="Confidential comments for the editor (optional)"><textarea id="rv-ce" className="input !min-h-[100px]" disabled={locked} value={form.commentsEditor} onChange={(e) => setForm({ ...form, commentsEditor: e.target.value })} /></Field>
                {!locked && <div className="flex flex-wrap gap-3"><button className="btn btn-gold" disabled={busy} onClick={() => save(false)}>Submit review</button><button className="btn btn-outline" disabled={busy} onClick={() => save(true)}>Save draft</button></div>}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------ Profile
function Profile() {
  const { user, refresh } = useAuth();
  const u = user!;
  const [v, setV] = useState({ name: u.name, title: u.title, institution: u.institution, position: u.position, country: u.country, orcid: u.orcid, bio: u.bio, expertise: u.expertise, phone: u.phone, website: u.website, publicProfile: u.publicProfile });
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pw, setPw] = useState({ current: "", password: "" });
  const [pwMsg, setPwMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });
  const preview = photo ? URL.createObjectURL(photo) : removePhoto ? "" : u.photo;

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErrors({}); setFlash(null);
    const fd = new FormData(); Object.entries(v).forEach(([k, x]) => fd.append(k, String(x ?? ""))); if (photo) fd.append("photo", photo); if (removePhoto) fd.append("removePhoto", "true");
    try { await postForm("/api/account/profile", fd, "PUT"); await refresh(); setPhoto(null); setRemovePhoto(false); setFlash({ tone: "success", text: "Profile saved." }); }
    catch (x) { if (x instanceof ApiError && x.data?.errors) setErrors(x.data.errors); setFlash({ tone: "error", text: errorMessage(x) }); }
  }
  async function changePw(e: React.FormEvent) {
    e.preventDefault(); setPwMsg(null);
    try { await api("/api/account/password", { method: "PUT", json: pw }); setPw({ current: "", password: "" }); setPwMsg({ tone: "success", text: "Password changed. Other devices have been signed out." }); }
    catch (x) { setPwMsg({ tone: "error", text: (x instanceof ApiError && (x.data?.errors?.current || x.data?.errors?.password)) || errorMessage(x) }); }
  }

  return (
    <>
      <Head title="Profile and password" action={u.accountType === "researcher" && v.publicProfile ? <Link to={`/authors/${u.id}`} className="btn btn-outline btn-sm"><ExternalLink className="w-4 h-4" aria-hidden /> Public profile</Link> : undefined} />
      <form onSubmit={save} className="card p-6 sm:p-8 space-y-5">
        {flash && <Notice tone={flash.tone}>{flash.text}</Notice>}
        <div className="flex items-center gap-4">
          {preview ? <img src={preview} alt="" className="w-20 h-20 rounded-full object-cover" /> : <Avatar user={{ name: v.name }} size={80} />}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => input.current?.click()}><Camera className="w-4 h-4" aria-hidden /> {preview ? "Change photo" : "Add a photo"}</button>
            {preview && <button type="button" className="btn btn-danger btn-sm" onClick={() => { setPhoto(null); setRemovePhoto(true); }}>Remove</button>}
          </div>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Profile photo" onChange={(e) => { setPhoto(e.target.files?.[0] || null); setRemovePhoto(false); }} />
        </div>
        {errors.photo && <p className="field-error">{errors.photo}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
          <Field id="pf-title" label="Title"><input id="pf-title" className="input" value={v.title} onChange={set("title")} placeholder="Dr., Prof." /></Field>
          <Field id="pf-name" label="Full name" error={errors.name}><input id="pf-name" className="input" value={v.name} onChange={set("name")} /></Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="pf-inst" label="Institution"><input id="pf-inst" className="input" value={v.institution} onChange={set("institution")} /></Field>
          <Field id="pf-pos" label="Position"><input id="pf-pos" className="input" value={v.position} onChange={set("position")} /></Field>
          <Field id="pf-country" label="Country"><input id="pf-country" className="input" value={v.country} onChange={set("country")} /></Field>
          <Field id="pf-orcid" label="ORCID iD" error={errors.orcid}><input id="pf-orcid" className="input" value={v.orcid} onChange={set("orcid")} placeholder="0000-0000-0000-0000" /></Field>
          <Field id="pf-phone" label="Phone (private)"><input id="pf-phone" className="input" value={v.phone} onChange={set("phone")} autoComplete="tel" /></Field>
          <Field id="pf-web" label="Website"><input id="pf-web" className="input" value={v.website} onChange={set("website")} /></Field>
        </div>
        <Field id="pf-exp" label="Areas of expertise" hint="Separated by commas. Helps editors match you with manuscripts to review."><input id="pf-exp" className="input" value={v.expertise} onChange={set("expertise")} /></Field>
        <Field id="pf-bio" label="Short biography"><textarea id="pf-bio" className="input" value={v.bio} onChange={set("bio")} /></Field>
        {u.accountType === "researcher" && (
          <label className="flex gap-3 items-start text-slate-700"><input type="checkbox" className="mt-1 w-4 h-4 accent-[#0a2463]" checked={v.publicProfile} onChange={(e) => setV({ ...v, publicProfile: e.target.checked })} /><span>Show a public author page with my name, photo, institution, biography and published papers. Email and phone are never shown.</span></label>
        )}
        <button className="btn btn-navy">Save profile</button>
      </form>

      <form onSubmit={changePw} className="card p-6 sm:p-8 space-y-5 mt-6">
        <h2 className="font-sans text-lg font-semibold text-navy-ink">Change password</h2>
        {pwMsg && <Notice tone={pwMsg.tone}>{pwMsg.text}</Notice>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="pw-cur" label="Current password"><input id="pw-cur" type="password" className="input" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></Field>
          <Field id="pw-new" label="New password" hint="At least 10 characters, letters and numbers."><input id="pw-new" type="password" className="input" value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} autoComplete="new-password" /></Field>
        </div>
        <button className="btn btn-outline">Change password</button>
      </form>
      <p className="text-sm text-slate-500 mt-4">Signed in as {u.email}. To change your email address or close your account, contact <a className="link" href={`mailto:${SITE.email.general}`}>{SITE.email.general}</a>.</p>
    </>
  );
}
