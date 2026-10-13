import React, { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, Link2 } from "lucide-react";
import { Link, navigate, useLocation } from "../../lib/router";
import { api, ApiError, errorMessage, formatDate } from "../../lib/api";
import { Field, Notice } from "../ui";
import { StatusPill, SUBMISSION_STATUS, PROJECT_STATUS, REVIEW_STATUS, Panel } from "../workspace";
import { H1, useLoad } from "./AdminPublishing";
import { actionLabel } from "./AdminApp";
import { Avatar } from "../views/AccountView";

const ROLE: Record<string, string> = { user: "Member", reviewer: "Reviewer", editor: "Editor", admin: "Administrator" };
const ACCOUNT_STATUS: Record<string, { label: string; tone: string }> = { active: { label: "Active", tone: "green" }, pending: { label: "Awaiting approval", tone: "amber" }, suspended: { label: "Suspended", tone: "gray" } };

export function UsersList({ admin }: { admin: boolean }) {
  const { search } = useLocation();
  const { data, reload } = useLoad<any[]>("/api/admin/users");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState(new URLSearchParams(search).get("status") || "");
  const [showNew, setShowNew] = useState(false);
  const rows = useMemo(() => (data || []).filter((u) => (!role || u.role === role) && (!type || u.account_type === type) && (!status || u.status === status)
    && (!q || `${u.name} ${u.email} ${u.institution} ${u.country}`.toLowerCase().includes(q.toLowerCase()))), [data, q, role, type, status]);

  return (
    <>
      <H1 action={admin ? <button className="btn btn-navy btn-sm" onClick={() => setShowNew(!showNew)}><UserPlus className="w-4 h-4" aria-hidden /> Add a user</button> : undefined}>Users and roles</H1>
      {showNew && <NewUser onDone={() => { setShowNew(false); reload(); }} />}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <label htmlFor="us-q" className="sr-only">Search users</label>
          <input id="us-q" className="input !min-h-[38px] !py-1.5 pl-9 w-64" placeholder="Name, email, institution" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {([["us-role", role, setRole, "All roles", ROLE], ["us-type", type, setType, "All account types", { researcher: "Researchers", institution: "Institutions" }],
          ["us-st", status, setStatus, "Any status", Object.fromEntries(Object.entries(ACCOUNT_STATUS).map(([k, v]) => [k, v.label]))]] as const).map(([id, val, set, any, opts]) => (
          <select key={id} aria-label={any} className="input !min-h-[38px] !py-1.5 !w-auto" value={val} onChange={(e) => (set as any)(e.target.value)}>
            <option value="">{any}</option>{Object.entries(opts).map(([k, l]) => <option key={k} value={k}>{l as string}</option>)}
          </select>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-[0.95rem]">
          <thead className="bg-paper text-slate-600 text-sm"><tr><th className="p-3">User</th><th className="p-3 hidden md:table-cell">Type</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3 hidden lg:table-cell">Activity</th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-slate-100 hover:bg-paper cursor-pointer" onClick={() => navigate(`/admin/users/${u.id}`)}>
                <td className="p-3"><Link to={`/admin/users/${u.id}`} className="font-semibold text-navy-ink hover:underline">{u.name}</Link><div className="text-sm text-slate-500 break-all">{u.email}{u.institution ? ` · ${u.institution}` : ""}</div></td>
                <td className="p-3 hidden md:table-cell text-slate-600 capitalize">{u.account_type}</td>
                <td className="p-3 text-slate-700">{ROLE[u.role]}</td>
                <td className="p-3"><StatusPill status={u.status} map={ACCOUNT_STATUS} /></td>
                <td className="p-3 hidden lg:table-cell text-sm text-slate-600 whitespace-nowrap">{u.submissions} ms · {u.requests} req{u.last_login_at ? ` · last in ${formatDate(u.last_login_at, { day: "numeric", month: "short" })}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && rows.length === 0 && <p className="p-6 text-center text-slate-600">No users match these filters.</p>}
      </div>
    </>
  );
}

function NewUser({ onDone }: { onDone: () => void }) {
  const [v, setV] = useState({ name: "", email: "", role: "reviewer", institution: "" });
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: React.ReactNode } | null>(null);
  const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    try {
      const r = await api<{ link: string; emailed: boolean }>("/api/admin/users", { method: "POST", json: v });
      setDone(true);
      setMsg({ tone: "success", text: r.emailed ? `Account created. ${v.email} has received an email to set their password.` : <>Account created. Send this link to {v.name} so they can set their password (valid 7 days): <input readOnly className="input mt-2 text-sm" value={r.link} onFocus={(e) => e.target.select()} /></> });
    } catch (x) { setMsg({ tone: "error", text: (x instanceof ApiError && x.data?.errors?.email) || errorMessage(x) }); }
  }
  return (
    <form onSubmit={submit} className="card p-5 sm:p-6 mb-6 space-y-4">
      <h2 className="font-sans text-lg font-semibold text-navy-ink">Add a team member or reviewer</h2>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      {!done && <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field id="nu-name" label="Full name"><input id="nu-name" className="input" required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
          <Field id="nu-email" label="Email"><input id="nu-email" type="email" className="input" required value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
          <Field id="nu-inst" label="Institution"><input id="nu-inst" className="input" value={v.institution} onChange={(e) => setV({ ...v, institution: e.target.value })} /></Field>
          <Field id="nu-role" label="Role"><select id="nu-role" className="input" value={v.role} onChange={(e) => setV({ ...v, role: e.target.value })}>{Object.entries(ROLE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
        </div>
        <button className="btn btn-navy">Create account</button>
      </>}
      {done && <button type="button" className="btn btn-outline" onClick={onDone}>Done</button>}
    </form>
  );
}

export function UserDetail({ id, admin }: { id: string; admin: boolean }) {
  const { data: u, error, reload } = useLoad<any>(`/api/admin/users/${id}`);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: React.ReactNode } | null>(null);
  useEffect(() => { if (u) { setRole(u.role); setStatus(u.status); } }, [u]);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!u) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    try { await api(`/api/admin/users/${id}`, { method: "POST", json: { role, status } }); setMsg({ tone: "success", text: "Saved." }); reload(); }
    catch (x) { setMsg({ tone: "error", text: (x instanceof ApiError && x.data?.errors?.role) || errorMessage(x) }); }
  };
  const resetLink = async () => {
    const r = await api<{ link: string; emailed: boolean }>(`/api/admin/users/${id}/reset-link`, { method: "POST" });
    setMsg({ tone: "success", text: r.emailed ? "A password reset email has been sent." : <>Send this link to the user (valid 48 hours): <input readOnly className="input mt-2 text-sm" value={r.link} onFocus={(e) => e.target.select()} /></> });
  };
  const approve = async () => { await api(`/api/admin/users/${id}`, { method: "POST", json: { status: "active" } }); setMsg({ tone: "success", text: "Institution approved." }); reload(); };

  return (
    <>
      <H1 back="/admin/users" action={<StatusPill status={u.status} map={ACCOUNT_STATUS} />}>{u.name}</H1>
      {u.status === "pending" && admin && (
        <div className="card p-5 mb-6 border-amber-300 bg-amber-50/50 flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-800"><strong>{u.institution || "This institution"}</strong> is waiting for approval before it can submit projects.</p>
          <button className="btn btn-gold btn-sm" onClick={approve}>Approve institution</button>
        </div>
      )}
      {msg && <div className="mb-5"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <Panel>
            <div className="flex gap-4 items-center">
              <Avatar user={u} size={64} />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-navy-ink">{u.title ? `${u.title} ` : ""}{u.name}</p>
                <p className="text-slate-600 break-all">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
                <p className="text-slate-600">{[u.position, u.institution, u.country].filter(Boolean).join(", ")}</p>
              </div>
            </div>
            <dl className="mt-4 grid sm:grid-cols-2 gap-3 text-[0.95rem]">
              <div><dt className="text-sm text-slate-500">Account type</dt><dd className="capitalize">{u.accountType}</dd></div>
              <div><dt className="text-sm text-slate-500">Registered</dt><dd>{formatDate(u.createdAt)}</dd></div>
              <div><dt className="text-sm text-slate-500">Email confirmed</dt><dd>{u.emailVerified ? "Yes" : "No"}</dd></div>
              <div><dt className="text-sm text-slate-500">Last sign-in</dt><dd>{u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}</dd></div>
              {u.orcid && <div><dt className="text-sm text-slate-500">ORCID</dt><dd>{u.orcid}</dd></div>}
              {u.expertise && <div className="sm:col-span-2"><dt className="text-sm text-slate-500">Expertise</dt><dd>{u.expertise}</dd></div>}
            </dl>
            {u.accountType === "researcher" && u.publicProfile && <Link to={`/authors/${u.id}`} className="link text-sm mt-3 inline-block">Public author page</Link>}
          </Panel>
          {u.submissions.length > 0 && <Panel title="Manuscripts"><ul className="divide-y divide-slate-100">{u.submissions.map((s: any) => <li key={s.id} className="py-2.5 flex flex-wrap justify-between gap-2"><Link to={`/admin/manuscripts/${s.id}`} className="link">{s.title}</Link><StatusPill status={s.status} map={SUBMISSION_STATUS} /></li>)}</ul></Panel>}
          {u.requests.length > 0 && <Panel title="Projects and requests"><ul className="divide-y divide-slate-100">{u.requests.map((r: any) => <li key={r.id} className="py-2.5 flex flex-wrap justify-between gap-2"><Link to={`/admin/${r.kind === "project-review" ? "projects" : "inbox"}/${r.id}`} className="link">{r.subject || r.ref}</Link><StatusPill status={r.status} map={PROJECT_STATUS} /></li>)}</ul></Panel>}
          {u.reviews.length > 0 && <Panel title="Reviews"><ul className="divide-y divide-slate-100">{u.reviews.map((r: any) => <li key={r.id} className="py-2.5 flex flex-wrap justify-between gap-2"><Link to={`/admin/manuscripts/${r.submission_id}`} className="link">{r.title}</Link><StatusPill status={r.status} map={REVIEW_STATUS} /></li>)}</ul></Panel>}
        </div>
        <div className="xl:col-span-2 space-y-6">
          {admin ? (
            <form onSubmit={save} className="card p-5 sm:p-6 space-y-4">
              <h2 className="font-sans text-lg font-semibold text-navy-ink">Access</h2>
              <Field id="ud-role" label="Role" hint="Reviewers review assigned manuscripts. Editors manage manuscripts and projects. Administrators also manage users and site content.">
                <select id="ud-role" className="input" value={role} onChange={(e) => setRole(e.target.value)}>{Object.entries(ROLE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              </Field>
              <Field id="ud-st" label="Status">
                <select id="ud-st" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>{Object.entries(ACCOUNT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
              </Field>
              <button className="btn btn-navy w-full">Save access</button>
              <button type="button" className="btn btn-outline w-full" onClick={resetLink}><Link2 className="w-4 h-4" aria-hidden /> Password reset link</button>
            </form>
          ) : <Panel><p className="text-slate-600">Role: <strong>{ROLE[u.role]}</strong>. Only administrators can change roles and access.</p></Panel>}
          <Panel title="Recent activity">
            {u.activity.length === 0 ? <p className="text-slate-500 text-sm">No activity yet.</p> : (
              <ul className="space-y-2 text-sm">{u.activity.map((a: any, i: number) => <li key={i} className="flex justify-between gap-2"><span className="text-slate-700">{actionLabel(a.action)}{a.detail ? `: ${a.detail}` : ""}</span><span className="text-slate-500 whitespace-nowrap">{formatDate(a.created_at, { day: "numeric", month: "short" })}</span></li>)}</ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
