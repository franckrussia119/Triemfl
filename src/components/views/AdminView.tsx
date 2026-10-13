import React, { useCallback, useEffect, useRef, useState } from "react";
import { LayoutDashboard, FileInput, BookOpen, Inbox, Users, Megaphone, LogOut, ArrowLeft, Download, Plus, Trash2, ExternalLink, Lock } from "lucide-react";
import { Link, navigate, useLocation, usePageTitle } from "../../lib/router";
import { api, ApiError, errorMessage, formatDate, type Author, type Publication, type Announcement } from "../../lib/api";
import { SITE, CATEGORIES, PUBLICATION_TYPES } from "../../lib/site";
import { Field, Notice } from "../ui";
import { Logo } from "../Navbar";

const SUB_STATUS: Record<string, { label: string; cls: string }> = {
  submitted: { label: "New", cls: "bg-blue-50 text-blue-800" },
  screening: { label: "Screening", cls: "bg-slate-100 text-slate-700" },
  "under-review": { label: "Under review", cls: "bg-indigo-50 text-indigo-800" },
  revisions: { label: "Revisions requested", cls: "bg-amber-50 text-amber-800" },
  accepted: { label: "Accepted", cls: "bg-emerald-50 text-emerald-800" },
  rejected: { label: "Not accepted", cls: "bg-slate-100 text-slate-600" },
  published: { label: "Published", cls: "bg-emerald-100 text-emerald-900" },
  withdrawn: { label: "Withdrawn", cls: "bg-slate-100 text-slate-600" },
};
const REQ_KIND: Record<string, string> = { "project-review": "Project review", consulting: "Consulting", contact: "Contact" };
const REQ_STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-blue-50 text-blue-800" }, "in-progress": { label: "In progress", cls: "bg-amber-50 text-amber-800" }, closed: { label: "Closed", cls: "bg-slate-100 text-slate-600" },
};
const Pill = ({ s, map }: { s: string; map: Record<string, { label: string; cls: string }> }) => <span className={`pill ${map[s]?.cls || "bg-slate-100"}`}>{map[s]?.label || s}</span>;

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/submissions", label: "Submissions", icon: FileInput },
  { to: "/admin/publications", label: "Publications", icon: BookOpen },
  { to: "/admin/inbox", label: "Inbox", icon: Inbox },
  { to: "/admin/subscribers", label: "Subscribers", icon: Users },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
];

type Me = { authenticated: boolean; configured: boolean; emailEnabled: boolean };

export default function AdminView() {
  usePageTitle(`Admin | ${SITE.short}`);
  const { path } = useLocation();
  const [me, setMe] = useState<Me | null>(null);
  const refreshMe = useCallback(() => api<Me>("/api/admin/me").then(setMe).catch(() => setMe({ authenticated: false, configured: true, emailEnabled: false })), []);
  useEffect(() => { refreshMe(); }, [refreshMe]);

  if (!me) return <div className="min-h-screen bg-paper" />;
  if (!me.configured) return <Gate><Notice>The admin portal is switched off because no admin password has been set. Add the <code>ADMIN_PASSWORD</code> environment variable on the server (see README), then redeploy.</Notice></Gate>;
  if (!me.authenticated) return <Login onDone={refreshMe} />;

  const logout = async () => { await api("/api/admin/logout", { method: "POST" }).catch(() => {}); refreshMe(); };
  const seg = path.split("/").slice(2);
  let page: React.ReactNode;
  if (!seg[0]) page = <Overview />;
  else if (seg[0] === "submissions") page = seg[1] ? <SubmissionDetail id={seg[1]} emailEnabled={me.emailEnabled} /> : <Submissions />;
  else if (seg[0] === "publications") page = seg[1] ? <PublicationEditor id={seg[1]} /> : <Publications />;
  else if (seg[0] === "inbox") page = seg[1] ? <RequestDetail id={seg[1]} /> : <Requests />;
  else if (seg[0] === "subscribers") page = <Subscribers />;
  else if (seg[0] === "announcements") page = <Announcements />;
  else page = <p>Page not found.</p>;

  const active = (to: string) => (to === "/admin" ? path === "/admin" : path.startsWith(to));
  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="bg-navy-deep text-white lg:w-64 lg:min-h-screen shrink-0 flex lg:flex-col">
        <div className="p-4 lg:p-5 border-b border-white/10 hidden lg:block"><Logo /></div>
        <nav aria-label="Admin" className="flex lg:flex-col overflow-x-auto lg:overflow-visible p-2 lg:p-3 gap-1 flex-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} aria-current={active(n.to) ? "page" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md whitespace-nowrap text-[0.95rem] ${active(n.to) ? "bg-white/10 text-white" : "text-slate-300 hover:text-white"}`}>
              <n.icon className="w-4 h-4" aria-hidden />{n.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 lg:p-3 border-l lg:border-l-0 lg:border-t border-white/10 flex lg:flex-col gap-1">
          <a href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-slate-300 hover:text-white text-[0.95rem] whitespace-nowrap"><ExternalLink className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">View site</span></a>
          <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-slate-300 hover:text-white text-[0.95rem] whitespace-nowrap"><LogOut className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">Sign out</span></button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 sm:p-8">
        {!me.emailEnabled && path === "/admin" && <div className="mb-6"><Notice>Emails to authors are off. Decisions are still saved and shown on the tracking page. To email authors automatically, set <code>RESEND_API_KEY</code> and <code>MAIL_FROM</code> (see README).</Notice></div>}
        {page}
      </main>
    </div>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-deep flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="card p-6 sm:p-8">{children}</div>
        <p className="text-center mt-6"><a href="/" className="text-slate-300 hover:text-white text-sm">Back to the website</a></p>
      </div>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await api("/api/admin/login", { method: "POST", json: { user, password } }); onDone(); }
    catch (x) { setErr(x instanceof ApiError && x.status === 401 ? "The username or password is incorrect." : errorMessage(x)); }
    finally { setBusy(false); }
  };
  return (
    <Gate>
      <form onSubmit={submit} className="space-y-4">
        <h1 className="text-2xl font-semibold text-navy-ink flex items-center gap-2"><Lock className="w-5 h-5" aria-hidden /> Staff sign in</h1>
        {err && <Notice tone="error">{err}</Notice>}
        <Field id="u" label="Username"><input id="u" className="input" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" required /></Field>
        <Field id="p" label="Password"><input id="p" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></Field>
        <button className="btn btn-navy w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </Gate>
  );
}

function H1({ children, back, action }: { children: React.ReactNode; back?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6">
      {back && <Link to={back} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-navy-ink mb-2"><ArrowLeft className="w-4 h-4" aria-hidden /> Back</Link>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold text-navy-ink">{children}</h1>
        {action}
      </div>
    </div>
  );
}

function useLoad<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => { api<T>(url).then(setData).catch((e) => setError(errorMessage(e, "This page couldn't be loaded. Refresh to try again."))); }, [url]);
  useEffect(() => { load(); }, [load]);
  return { data, error, reload: load };
}

// ---------------- Overview ----------------
function Overview() {
  const { data } = useLoad<any>("/api/admin/overview");
  const cards = data ? [
    { n: data.submissionsNew, l: "New submissions", to: "/admin/submissions" },
    { n: data.submissionsOpen, l: "Submissions in progress", to: "/admin/submissions" },
    { n: data.requestsNew, l: "New messages and requests", to: "/admin/inbox" },
    { n: data.publications, l: "Published papers", to: "/admin/publications" },
    { n: data.drafts, l: "Draft publications", to: "/admin/publications" },
    { n: data.subscribers, l: "Newsletter subscribers", to: "/admin/subscribers" },
    { n: data.views, l: "Paper views", to: "/admin/publications" },
    { n: data.downloads, l: "PDF downloads", to: "/admin/publications" },
  ] : [];
  return (
    <>
      <H1>Overview</H1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.l} to={c.to} className="card p-5 hover:border-slate-400">
            <p className="font-serif text-3xl text-navy-ink">{Number(c.n).toLocaleString("en")}</p>
            <p className="text-slate-600 text-sm mt-1">{c.l}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/publications/new" className="btn btn-navy"><Plus className="w-4 h-4" aria-hidden /> Add a publication</Link>
        <Link to="/admin/announcements" className="btn btn-outline">Post an announcement</Link>
      </div>
    </>
  );
}

// ---------------- Submissions ----------------
function Submissions() {
  const { data, error } = useLoad<any[]>("/api/admin/submissions");
  const [filter, setFilter] = useState("open");
  const open = ["submitted", "screening", "under-review", "revisions", "accepted"];
  const rows = (data || []).filter((s) => filter === "all" || (filter === "open" ? open.includes(s.status) : !open.includes(s.status)));
  return (
    <>
      <H1>Submissions</H1>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex gap-2 mb-4" role="tablist">
        {[["open", "In progress"], ["closed", "Closed"], ["all", "All"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${filter === k ? "bg-navy text-white" : "bg-white border border-slate-200"}`}>{l}</button>
        ))}
      </div>
      {data && rows.length === 0 ? <div className="card p-8 text-center text-slate-600">No submissions here yet. New manuscripts appear here as soon as authors submit them.</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-[0.95rem]">
            <thead className="bg-paper text-slate-600 text-sm"><tr><th className="p-3">Manuscript</th><th className="p-3 hidden md:table-cell">Type</th><th className="p-3">Status</th><th className="p-3 hidden sm:table-cell">Received</th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-paper cursor-pointer" onClick={() => navigate(`/admin/submissions/${s.id}`)}>
                  <td className="p-3"><Link to={`/admin/submissions/${s.id}`} className="font-semibold text-navy-ink hover:underline">{s.title}</Link><div className="text-sm text-slate-500">{s.ref} · {s.authors.map((a: Author) => a.name).join(", ")}</div></td>
                  <td className="p-3 hidden md:table-cell text-slate-600">{s.type}</td>
                  <td className="p-3"><Pill s={s.status} map={SUB_STATUS} /></td>
                  <td className="p-3 hidden sm:table-cell text-slate-600 whitespace-nowrap">{formatDate(s.created_at, { day: "numeric", month: "short", year: "numeric" })}</td>
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
  screening: "Your manuscript has passed initial checks and is now being screened by the editorial office.",
  "under-review": "Your manuscript has been sent to independent reviewers. We will contact you as soon as their reports are in.",
  revisions: "The reviewers have asked for revisions. Their comments are below. Please send a revised manuscript and a response letter to the editorial office.\n\nReviewer comments:\n",
  accepted: "We are pleased to accept your manuscript for publication. The editorial office will contact you about the final version.",
  rejected: "After careful review, we are unable to accept your manuscript for publication. The reviewers' comments are below and we hope they are useful.\n\n",
};

function SubmissionDetail({ id, emailEnabled }: { id: string; emailEnabled: boolean }) {
  const { data: s, error, reload } = useLoad<any>(`/api/admin/submissions/${id}`);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState("");
  useEffect(() => { if (s) setStatus(s.status); }, [s]);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!s) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setFlash("");
    try {
      const r = await api<{ emailed: boolean }>(`/api/admin/submissions/${id}/status`, { method: "POST", json: { status, message, note } });
      setFlash(`Saved.${message ? (r.emailed ? " The author has been emailed." : " The message is visible to the author on the tracking page.") : ""}`);
      setMessage(""); setNote(""); reload();
    } catch (x) { setFlash(errorMessage(x)); } finally { setBusy(false); }
  };
  const createPub = async () => {
    const r = await api<{ id: number }>(`/api/admin/submissions/${id}/create-publication`, { method: "POST" });
    navigate(`/admin/publications/${r.id}`);
  };
  const remove = async () => {
    if (!confirm(`Delete submission ${s.ref} and its file permanently? This can't be undone.`)) return;
    await api(`/api/admin/submissions/${id}`, { method: "DELETE" }); navigate("/admin/submissions");
  };

  return (
    <>
      <H1 back="/admin/submissions" action={<Pill s={s.status} map={SUB_STATUS} />}>{s.title}</H1>
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[0.95rem]">
              <div><dt className="text-slate-500 text-sm">Reference</dt><dd className="font-semibold">{s.ref}</dd></div>
              <div><dt className="text-slate-500 text-sm">Received</dt><dd>{formatDate(s.created_at)}</dd></div>
              <div><dt className="text-slate-500 text-sm">Type and area</dt><dd>{s.type}{s.category ? `, ${s.category}` : ""}</dd></div>
              <div><dt className="text-slate-500 text-sm">Correspondence</dt><dd><a className="link break-all" href={`mailto:${s.email}?subject=${encodeURIComponent(`Your submission ${s.ref}`)}`}>{s.email}</a></dd></div>
            </dl>
            <div>
              <h2 className="font-sans font-semibold text-navy-ink">Authors</h2>
              <ul className="mt-1 text-slate-700">{s.authors.map((a: Author) => <li key={a.name}>{a.name}{a.affiliation ? `, ${a.affiliation}` : ""}{a.orcid ? ` (ORCID ${a.orcid})` : ""}</li>)}</ul>
            </div>
            <div><h2 className="font-sans font-semibold text-navy-ink">Abstract</h2><p className="mt-1 text-slate-700 whitespace-pre-line leading-relaxed">{s.abstract}</p></div>
            {(s.keywords || s.jel_codes) && <p className="text-slate-700"><strong>Keywords:</strong> {s.keywords || "–"} · <strong>JEL:</strong> {s.jel_codes || "–"}</p>}
            {s.cover_letter && <div><h2 className="font-sans font-semibold text-navy-ink">Cover letter</h2><p className="mt-1 text-slate-700 whitespace-pre-line leading-relaxed">{s.cover_letter}</p></div>}
            <a href={`/api/admin/submissions/${id}/file`} className="btn btn-navy btn-sm"><Download className="w-4 h-4" aria-hidden /> Download manuscript ({s.file_name})</a>
          </div>

          <div className="card p-6">
            <h2 className="font-sans font-semibold text-navy-ink mb-3">History</h2>
            <ol className="space-y-3">
              {s.events.slice().reverse().map((ev: any) => (
                <li key={ev.id} className="border-l-2 border-slate-200 pl-4">
                  <p className="font-semibold text-slate-800">{SUB_STATUS[ev.status]?.label} <span className="font-normal text-sm text-slate-500">· {formatDate(ev.created_at)}</span></p>
                  {ev.message && <p className="text-slate-700 whitespace-pre-line text-[0.95rem]"><span className="text-slate-500">To author:</span> {ev.message}</p>}
                  {ev.note && <p className="text-slate-600 whitespace-pre-line text-[0.95rem] italic"><span className="not-italic text-slate-500">Internal note:</span> {ev.note}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={save} className="card p-6 space-y-4">
            <h2 className="font-sans font-semibold text-navy-ink">Record a decision</h2>
            {flash && <Notice tone="success">{flash}</Notice>}
            <Field id="st" label="Status">
              <select id="st" className="input" value={status} onChange={(e) => { setStatus(e.target.value); if (!message && TEMPLATES[e.target.value]) setMessage(TEMPLATES[e.target.value]); }}>
                {Object.entries(SUB_STATUS).filter(([k]) => k !== "published").map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            <Field id="msg" label="Message to the author" hint={emailEnabled ? "Emailed to the author and shown on the tracking page." : "Shown to the author on the tracking page."}>
              <textarea id="msg" className="input" value={message} onChange={(e) => setMessage(e.target.value)} />
            </Field>
            <Field id="note" label="Internal note (staff only)"><textarea id="note" className="input !min-h-[80px]" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
            <button className="btn btn-navy w-full" disabled={busy}>{busy ? "Saving…" : "Save decision"}</button>
          </form>

          {(s.status === "accepted" || s.publication) && (
            <div className="card p-6">
              <h2 className="font-sans font-semibold text-navy-ink">Publication</h2>
              {s.publication ? (
                <>
                  <p className="text-slate-600 mt-1 text-[0.95rem]">{s.publication.status === "published" ? "Published." : "A draft exists. Complete it and publish."}</p>
                  <Link to={`/admin/publications/${s.publication.id}`} className="btn btn-outline btn-sm mt-3">Open the publication</Link>
                </>
              ) : (
                <>
                  <p className="text-slate-600 mt-1 text-[0.95rem]">Create a draft publication from this manuscript, then upload the final PDF and publish.</p>
                  <button onClick={createPub} className="btn btn-gold btn-sm mt-3">Prepare for publication</button>
                </>
              )}
            </div>
          )}
          <button onClick={remove} className="btn btn-danger btn-sm"><Trash2 className="w-4 h-4" aria-hidden /> Delete submission</button>
        </div>
      </div>
    </>
  );
}

// ---------------- Publications ----------------
function Publications() {
  const { data, error } = useLoad<Publication[]>("/api/admin/publications");
  return (
    <>
      <H1 action={<Link to="/admin/publications/new" className="btn btn-navy btn-sm"><Plus className="w-4 h-4" aria-hidden /> Add a publication</Link>}>Publications</H1>
      {error && <Notice tone="error">{error}</Notice>}
      {data && data.length === 0 ? <div className="card p-8 text-center text-slate-600">No publications yet. Add a paper you already have, or publish an accepted submission.</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-[0.95rem]">
            <thead className="bg-paper text-slate-600 text-sm"><tr><th className="p-3">Title</th><th className="p-3 hidden md:table-cell">Type</th><th className="p-3">Status</th><th className="p-3 hidden sm:table-cell text-right">Views / downloads</th></tr></thead>
            <tbody>
              {(data || []).map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-paper cursor-pointer" onClick={() => navigate(`/admin/publications/${p.id}`)}>
                  <td className="p-3"><Link to={`/admin/publications/${p.id}`} className="font-semibold text-navy-ink hover:underline">{p.title}</Link><div className="text-sm text-slate-500">{p.authors.map((a) => a.name).join(", ")}{p.publishedDate ? ` · ${p.publishedDate}` : ""}</div></td>
                  <td className="p-3 hidden md:table-cell text-slate-600">{p.type}</td>
                  <td className="p-3"><span className={`pill ${p.status === "published" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{p.status === "published" ? "Published" : "Draft"}</span>{!p.hasPdf && <span className="pill bg-amber-50 text-amber-800 ml-1">No PDF</span>}</td>
                  <td className="p-3 hidden sm:table-cell text-right text-slate-600">{p.views} / {p.downloads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function PublicationEditor({ id }: { id: string }) {
  const isNew = id === "new";
  const [p, setP] = useState<any>(isNew ? { type: "Working Paper", title: "", authors: [{ name: "", affiliation: "", orcid: "" }], abstract: "", keywords: [], jelCodes: [], category: "", publishedDate: new Date().toISOString().slice(0, 10), series: SITE.publishing.seriesName, number: "", volume: "", issue: "", pages: "", doi: "", status: "draft", hasPdf: false, slug: "" } : null);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!isNew) api(`/api/admin/publications/${id}`).then(setP).catch(() => setFlash({ tone: "error", text: "This publication couldn't be loaded." })); }, [id, isNew]);
  if (!p) return flash ? <Notice tone="error">{flash.text}</Notice> : null;

  const set = (k: string, v: any) => setP({ ...p, [k]: v });
  const setAuthor = (i: number, k: string, v: string) => set("authors", p.authors.map((a: Author, j: number) => (j === i ? { ...a, [k]: v } : a)));

  const save = async (publish?: boolean) => {
    setBusy(true); setFlash(null); setErrors({});
    const status = publish === undefined ? p.status : publish ? "published" : "draft";
    const fd = new FormData();
    Object.entries({ type: p.type, title: p.title, abstract: p.abstract, category: p.category, publishedDate: p.publishedDate, series: p.series, number: p.number, volume: p.volume, issue: p.issue, pages: p.pages, doi: p.doi, slug: p.slug || "", status })
      .forEach(([k, v]) => fd.append(k, String(v ?? "")));
    fd.append("authors", JSON.stringify(p.authors));
    fd.append("keywords", Array.isArray(p.keywords) ? p.keywords.join(", ") : p.keywords);
    fd.append("jelCodes", Array.isArray(p.jelCodes) ? p.jelCodes.join(", ") : p.jelCodes);
    if (file) fd.append("pdf", file);
    try {
      const res = await fetch(isNew ? "/api/admin/publications" : `/api/admin/publications/${id}`, { method: isNew ? "POST" : "PUT", body: fd, credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      setFile(null);
      if (isNew) { navigate(`/admin/publications/${data.id}`, { replace: true }); return; }
      const fresh = await api(`/api/admin/publications/${id}`); setP(fresh);
      setFlash({ tone: "success", text: status === "published" ? "Published. The paper is live in the research library." : "Saved as a draft. It isn't visible on the website." });
    } catch (x) {
      if (x instanceof ApiError && x.data?.errors) setErrors(x.data.errors);
      setFlash({ tone: "error", text: errorMessage(x, "The publication couldn't be saved.") });
    } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!confirm("Delete this publication and its PDF permanently? Links to it will stop working.")) return;
    await api(`/api/admin/publications/${id}`, { method: "DELETE" }); navigate("/admin/publications");
  };

  const input = (k: string, label: string, opts: { hint?: string; type?: string } = {}) => (
    <Field id={`pe-${k}`} label={label} hint={opts.hint} error={errors[k]}>
      <input id={`pe-${k}`} type={opts.type || "text"} className="input" value={Array.isArray(p[k]) ? p[k].join(", ") : p[k] ?? ""} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} />
    </Field>
  );

  return (
    <>
      <H1 back="/admin/publications" action={!isNew && p.status === "published" ? <a href={`/research/${p.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm"><ExternalLink className="w-4 h-4" aria-hidden /> View on site</a> : undefined}>
        {isNew ? "Add a publication" : p.title || "Untitled"}
      </H1>
      {flash && <div className="mb-5"><Notice tone={flash.tone}>{flash.text}</Notice></div>}
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6 space-y-5">
          {input("title", "Title")}
          <fieldset className="space-y-3">
            <legend className="field-label">Authors</legend>
            {errors.authors && <p className="field-error">{errors.authors}</p>}
            {p.authors.map((a: Author, i: number) => (
              <div key={i} className="grid sm:grid-cols-[1fr_1fr_160px_auto] gap-2 items-start">
                <input aria-label={`Author ${i + 1} name`} className="input" placeholder="Full name" value={a.name} onChange={(e) => setAuthor(i, "name", e.target.value)} />
                <input aria-label={`Author ${i + 1} institution`} className="input" placeholder="Institution" value={a.affiliation || ""} onChange={(e) => setAuthor(i, "affiliation", e.target.value)} />
                <input aria-label={`Author ${i + 1} ORCID`} className="input" placeholder="ORCID" value={a.orcid || ""} onChange={(e) => setAuthor(i, "orcid", e.target.value)} />
                <button type="button" className="btn btn-danger btn-sm" aria-label={`Remove author ${i + 1}`} disabled={p.authors.length === 1} onClick={() => set("authors", p.authors.filter((_: Author, j: number) => j !== i))}><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={() => set("authors", [...p.authors, { name: "", affiliation: "", orcid: "" }])}><Plus className="w-4 h-4" aria-hidden /> Add author</button>
          </fieldset>
          <Field id="pe-abstract" label="Abstract" error={errors.abstract}><textarea id="pe-abstract" className="input !min-h-[200px]" value={p.abstract} onChange={(e) => set("abstract", e.target.value)} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            {input("keywords", "Keywords", { hint: "Separated by commas" })}
            {input("jelCodes", "JEL codes", { hint: "Separated by commas" })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 space-y-3">
            <p className="text-slate-600 text-[0.95rem]">Status: <strong>{p.status === "published" ? "Published" : "Draft (not visible on the site)"}</strong></p>
            <div className="flex flex-wrap gap-2">
              {p.status !== "published"
                ? <><button type="button" className="btn btn-gold" disabled={busy} onClick={() => save(true)}>Publish</button><button type="button" className="btn btn-outline" disabled={busy} onClick={() => save(false)}>Save draft</button></>
                : <><button type="submit" className="btn btn-navy" disabled={busy}>Save changes</button><button type="button" className="btn btn-outline" disabled={busy} onClick={() => save(false)}>Unpublish</button></>}
            </div>
            {!isNew && <button type="button" onClick={remove} className="btn btn-danger btn-sm"><Trash2 className="w-4 h-4" aria-hidden /> Delete</button>}
          </div>
          <div className="card p-6 space-y-4">
            <Field id="pe-type" label="Type"><select id="pe-type" className="input" value={p.type} onChange={(e) => set("type", e.target.value)}>{PUBLICATION_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field id="pe-cat" label="Research area"><select id="pe-cat" className="input" value={p.category} onChange={(e) => set("category", e.target.value)}><option value="">Choose</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            {input("publishedDate", "Publication date", { type: "date" })}
            {input("series", "Series")}
            {input("number", "Number", { hint: "e.g. WP-2026-01" })}
            {p.type === "Journal Article" && <div className="grid grid-cols-3 gap-2">{input("volume", "Volume")}{input("issue", "Issue")}{input("pages", "Pages")}</div>}
            {p.type === "Book" || p.type === "Report" ? input("pages", "Page count") : null}
            {input("doi", "DOI (optional)", { hint: "Only once registered with Crossref, e.g. 10.xxxx/abc" })}
            {!isNew && input("slug", "Web address", { hint: `/research/${p.slug}` })}
          </div>

          <div className="card p-6 space-y-3">
            <p className="field-label !mb-0">Final PDF</p>
            {p.hasPdf && !isNew && <a className="link text-sm" href={`/api/admin/publications/${id}/file`}>Download current PDF</a>}
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>{p.hasPdf || file ? "Replace PDF" : "Upload PDF"}</button>
              {file && <span className="text-sm text-slate-700 break-all">{file.name}</span>}
            </div>
            {errors.pdf && <p className="field-error">{errors.pdf}</p>}
            <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="sr-only" aria-label="PDF file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

        </div>
      </form>
    </>
  );
}

// ---------------- Inbox ----------------
function Requests() {
  const { data, error } = useLoad<any[]>("/api/admin/requests");
  const [kind, setKind] = useState("");
  const rows = (data || []).filter((r) => !kind || r.kind === kind);
  return (
    <>
      <H1>Inbox</H1>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-2 mb-4" role="tablist">
        {[["", "All"], ...Object.entries(REQ_KIND)].map(([k, l]) => (
          <button key={k || "all"} role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${kind === k ? "bg-navy text-white" : "bg-white border border-slate-200"}`}>{l}</button>
        ))}
      </div>
      {data && rows.length === 0 ? <div className="card p-8 text-center text-slate-600">No messages yet. Project review requests, consulting inquiries and contact messages appear here.</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-[0.95rem]">
            <thead className="bg-paper text-slate-600 text-sm"><tr><th className="p-3">From</th><th className="p-3 hidden md:table-cell">Type</th><th className="p-3">Status</th><th className="p-3 hidden sm:table-cell">Received</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-paper cursor-pointer" onClick={() => navigate(`/admin/inbox/${r.id}`)}>
                  <td className="p-3"><Link to={`/admin/inbox/${r.id}`} className="font-semibold text-navy-ink hover:underline">{r.name}{r.organization ? `, ${r.organization}` : ""}</Link><div className="text-sm text-slate-500">{r.subject || r.ref}{r.file_name ? " · 📎" : ""}</div></td>
                  <td className="p-3 hidden md:table-cell text-slate-600">{REQ_KIND[r.kind]}</td>
                  <td className="p-3"><Pill s={r.status} map={REQ_STATUS} /></td>
                  <td className="p-3 hidden sm:table-cell text-slate-600 whitespace-nowrap">{formatDate(r.created_at, { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function RequestDetail({ id }: { id: string }) {
  const { data: r, error, reload } = useLoad<any>(`/api/admin/requests/${id}`);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [flash, setFlash] = useState("");
  useEffect(() => { if (r) { setStatus(r.status); setNote(r.note); } }, [r]);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!r) return null;
  const save = async (e: React.FormEvent) => { e.preventDefault(); await api(`/api/admin/requests/${id}`, { method: "POST", json: { status, note } }); setFlash("Saved."); reload(); };
  const remove = async () => { if (!confirm("Delete this message permanently?")) return; await api(`/api/admin/requests/${id}`, { method: "DELETE" }); navigate("/admin/inbox"); };
  return (
    <>
      <H1 back="/admin/inbox" action={<Pill s={r.status} map={REQ_STATUS} />}>{REQ_KIND[r.kind]}: {r.name}</H1>
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6 space-y-4">
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[0.95rem]">
            <div><dt className="text-slate-500 text-sm">Reference</dt><dd className="font-semibold">{r.ref}</dd></div>
            <div><dt className="text-slate-500 text-sm">Received</dt><dd>{formatDate(r.created_at)}</dd></div>
            <div><dt className="text-slate-500 text-sm">Email</dt><dd><a className="link break-all" href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: ${r.subject || r.ref}`)}`}>{r.email}</a></dd></div>
            {r.organization && <div><dt className="text-slate-500 text-sm">Organisation</dt><dd>{r.organization}</dd></div>}
            {r.subject && <div><dt className="text-slate-500 text-sm">Subject</dt><dd>{r.subject}</dd></div>}
            {Object.entries(r.details || {}).filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-slate-500 text-sm">{k}</dt><dd>{String(v)}</dd></div>)}
          </dl>
          <div><h2 className="font-sans font-semibold text-navy-ink">Message</h2><p className="mt-1 text-slate-700 whitespace-pre-line leading-relaxed">{r.message}</p></div>
          {r.file_name && <a href={`/api/admin/requests/${id}/file`} className="btn btn-navy btn-sm"><Download className="w-4 h-4" aria-hidden /> Download {r.file_name}</a>}
          <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: ${r.subject || r.ref}`)}`} className="btn btn-outline btn-sm ml-2">Reply by email</a>
        </div>
        <form onSubmit={save} className="card p-6 space-y-4 self-start">
          {flash && <Notice tone="success">{flash}</Notice>}
          <Field id="rs" label="Status"><select id="rs" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>{Object.entries(REQ_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
          <Field id="rn" label="Internal note"><textarea id="rn" className="input !min-h-[100px]" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <button className="btn btn-navy w-full">Save</button>
          <button type="button" onClick={remove} className="btn btn-danger btn-sm"><Trash2 className="w-4 h-4" aria-hidden /> Delete</button>
        </form>
      </div>
    </>
  );
}

// ---------------- Subscribers ----------------
function Subscribers() {
  const { data, reload } = useLoad<{ email: string; created_at: string }[]>("/api/admin/subscribers");
  const remove = async (email: string) => { if (!confirm(`Remove ${email} from the list?`)) return; await api(`/api/admin/subscribers/${encodeURIComponent(email)}`, { method: "DELETE" }); reload(); };
  return (
    <>
      <H1 action={data && data.length > 0 ? <a href="/api/admin/subscribers.csv" className="btn btn-outline btn-sm"><Download className="w-4 h-4" aria-hidden /> Export CSV</a> : undefined}>Subscribers {data ? `(${data.length})` : ""}</H1>
      {data && data.length === 0 ? <div className="card p-8 text-center text-slate-600">No subscribers yet. Visitors can subscribe from the homepage and the footer.</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-[0.95rem]">
            <thead className="bg-paper text-slate-600 text-sm"><tr><th className="p-3">Email</th><th className="p-3">Subscribed</th><th className="p-3"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{(data || []).map((s) => (
              <tr key={s.email} className="border-t border-slate-100"><td className="p-3 break-all">{s.email}</td><td className="p-3 text-slate-600 whitespace-nowrap">{formatDate(s.created_at, { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="p-3 text-right"><button className="link text-sm" onClick={() => remove(s.email)}>Remove</button></td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ---------------- Announcements ----------------
function Announcements() {
  const { data, reload } = useLoad<Announcement[]>("/api/admin/announcements");
  const empty = { id: 0, kind: "Call for papers", title: "", body: "", date: new Date().toISOString().slice(0, 10), link: "" };
  const [a, setA] = useState<Announcement>(empty);
  const [err, setErr] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    try { await api("/api/admin/announcements", { method: "POST", json: a }); setA(empty); reload(); }
    catch (x: any) { setErr(x?.data?.errors?.title || errorMessage(x)); }
  };
  const remove = async (id: number) => { if (!confirm("Delete this announcement?")) return; await api(`/api/admin/announcements/${id}`, { method: "DELETE" }); reload(); };
  return (
    <>
      <H1>Announcements</H1>
      <p className="text-slate-600 -mt-3 mb-6">The three most recent appear on the homepage. Use them for calls for papers, events and news.</p>
      <div className="grid xl:grid-cols-2 gap-6">
        <form onSubmit={save} className="card p-6 space-y-4 self-start">
          <h2 className="font-sans font-semibold text-navy-ink">{a.id ? "Edit announcement" : "New announcement"}</h2>
          {err && <Notice tone="error">{err}</Notice>}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="an-k" label="Type"><select id="an-k" className="input" value={a.kind} onChange={(e) => setA({ ...a, kind: e.target.value })}>{["Call for papers", "Event", "News", "Publication"].map((k) => <option key={k}>{k}</option>)}</select></Field>
            <Field id="an-d" label="Date"><input id="an-d" type="date" className="input" value={a.date} onChange={(e) => setA({ ...a, date: e.target.value })} /></Field>
          </div>
          <Field id="an-t" label="Title"><input id="an-t" className="input" value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} /></Field>
          <Field id="an-b" label="Text"><textarea id="an-b" className="input !min-h-[100px]" value={a.body} onChange={(e) => setA({ ...a, body: e.target.value })} /></Field>
          <Field id="an-l" label="Link (optional)" hint="A page on this site (e.g. /submit) or a full web address"><input id="an-l" className="input" value={a.link} onChange={(e) => setA({ ...a, link: e.target.value })} /></Field>
          <div className="flex gap-2"><button className="btn btn-navy">{a.id ? "Save changes" : "Publish announcement"}</button>{a.id ? <button type="button" className="btn btn-outline" onClick={() => setA(empty)}>Cancel</button> : null}</div>
        </form>
        <div className="space-y-3">
          {(data || []).length === 0 && <div className="card p-6 text-slate-600">No announcements yet.</div>}
          {(data || []).map((x) => (
            <div key={x.id} className="card p-5">
              <p className="eyebrow">{x.kind} · {formatDate(x.date)}</p>
              <p className="font-semibold text-navy-ink mt-1">{x.title}</p>
              {x.body && <p className="text-slate-600 text-[0.95rem] mt-1 line-clamp-2">{x.body}</p>}
              <div className="mt-3 flex gap-3"><button className="link text-sm" onClick={() => setA(x)}>Edit</button><button className="link text-sm !text-red-700" onClick={() => remove(x.id)}>Delete</button></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
