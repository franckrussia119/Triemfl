import React, { useEffect, useRef, useState } from "react";
import { Camera, Plus, Trash2 } from "lucide-react";
import { api, ApiError, errorMessage, formatDate } from "../../lib/api";
import { postForm } from "../../lib/auth";
import { Field, Notice } from "../ui";
import { Panel } from "../workspace";
import { H1, useLoad } from "./AdminPublishing";
import { actionLabel } from "./AdminApp";
import { Avatar } from "../views/AccountView";

const TEXTS = [
  { key: "hero_title", label: "Homepage headline", hint: "Leave empty to use the animated headline \"Research that informs …\" with the topics below.", rows: 2 },
  { key: "hero_topics", label: "Homepage rotating topics", hint: "Topics that change in the animated headline, separated by commas. Keep each short (under 18 characters). Leave empty for the defaults: economic policy, public finance, sovereign debt, banking reform, trade integration, business law, fiscal reform.", rows: 2 },
  { key: "hero_intro", label: "Homepage introduction", hint: "One or two sentences under the headline.", rows: 3 },
  { key: "call_for_papers", label: "Call for papers banner", hint: "Short text shown on the homepage, e.g. the theme and deadline of the current call. Leave empty to hide.", rows: 2 },
  { key: "mission", label: "About page: mission", rows: 3 },
  { key: "vision", label: "About page: vision", rows: 3 },
  { key: "about_history", label: "About page: why the institute exists", hint: "Separate paragraphs with an empty line.", rows: 6 },
];

export function SiteContent() {
  return (
    <>
      <H1>Site content</H1>
      <p className="-mt-3 mb-6 text-slate-600 max-w-2xl">Edit the main texts of the website and the people shown on the About page. Changes appear immediately.</p>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <Texts />
        <People />
      </div>
    </>
  );
}

function Texts() {
  const { data } = useLoad<Record<string, string>>("/api/admin/settings");
  const [v, setV] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  useEffect(() => { if (data) setV(Object.fromEntries(TEXTS.map((t) => [t.key, data[t.key] || ""]))); }, [data]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    try { await api("/api/admin/settings", { method: "PUT", json: v }); setMsg({ tone: "success", text: "Texts saved. They're live on the site." }); }
    catch (x) { setMsg({ tone: "error", text: errorMessage(x) }); }
  };
  return (
    <form onSubmit={save} className="card p-5 sm:p-6 space-y-4">
      <h2 className="font-sans text-lg font-semibold text-navy-ink">Website texts</h2>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      {TEXTS.map((t) => (
        <Field key={t.key} id={`st-${t.key}`} label={t.label} hint={t.hint}>
          <textarea id={`st-${t.key}`} className="input" style={{ minHeight: `${t.rows * 28 + 24}px` }} value={v[t.key] || ""} onChange={(e) => setV({ ...v, [t.key]: e.target.value })} />
        </Field>
      ))}
      <button className="btn btn-navy">Save texts</button>
    </form>
  );
}

type Person = { id: number; grp: string; name: string; role: string; affiliation: string; orcid: string; bio: string; photo: string; sort: number };

function People() {
  const { data, reload } = useLoad<Person[]>("/api/admin/people");
  const empty: Person = { id: 0, grp: "board", name: "", role: "", affiliation: "", orcid: "", bio: "", photo: "", sort: 0 };
  const [p, setP] = useState<Person>(empty);
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : p.photo;

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    const fd = new FormData(); Object.entries(p).forEach(([k, x]) => k !== "photo" && fd.append(k, String(x))); if (file) fd.append("photo", file);
    try { await postForm("/api/admin/people", fd); setMsg({ tone: "success", text: p.id ? "Saved." : `${p.name} added.` }); setP(empty); setFile(null); reload(); }
    catch (x) { setMsg({ tone: "error", text: (x instanceof ApiError && (x.data?.errors?.name || x.data?.errors?.photo)) || errorMessage(x) }); }
  };
  const remove = async (x: Person) => { if (!confirm(`Remove ${x.name} from the site?`)) return; await api(`/api/admin/people/${x.id}`, { method: "DELETE" }); reload(); };

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="card p-5 sm:p-6 space-y-4">
        <h2 className="font-sans text-lg font-semibold text-navy-ink">{p.id ? `Edit ${p.name}` : "Add a board or council member"}</h2>
        <p className="text-sm text-slate-600 -mt-2">Add only people who have agreed to be listed.</p>
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <div className="flex items-center gap-4">
          {preview ? <img src={preview} alt="" className="w-16 h-16 rounded-full object-cover" /> : <Avatar user={{ name: p.name || "?" }} size={64} />}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => input.current?.click()}><Camera className="w-4 h-4" aria-hidden /> {preview ? "Change photo" : "Add photo"}</button>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Photo" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field id="pp-name" label="Full name"><input id="pp-name" className="input" required value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></Field>
          <Field id="pp-grp" label="Group"><select id="pp-grp" className="input" value={p.grp} onChange={(e) => setP({ ...p, grp: e.target.value })}><option value="board">Editorial board</option><option value="advisory">Advisory council</option></select></Field>
          <Field id="pp-role" label="Role"><input id="pp-role" className="input" value={p.role} onChange={(e) => setP({ ...p, role: e.target.value })} placeholder="e.g. Editor-in-Chief" /></Field>
          <Field id="pp-aff" label="Affiliation"><input id="pp-aff" className="input" value={p.affiliation} onChange={(e) => setP({ ...p, affiliation: e.target.value })} /></Field>
          <Field id="pp-orcid" label="ORCID (optional)"><input id="pp-orcid" className="input" value={p.orcid} onChange={(e) => setP({ ...p, orcid: e.target.value })} /></Field>
          <Field id="pp-sort" label="Order" hint="Lower numbers appear first."><input id="pp-sort" type="number" className="input" value={p.sort} onChange={(e) => setP({ ...p, sort: Number(e.target.value) })} /></Field>
        </div>
        <Field id="pp-bio" label="Short biography (optional)"><textarea id="pp-bio" className="input !min-h-[90px]" value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} /></Field>
        <div className="flex gap-2"><button className="btn btn-navy"><Plus className="w-4 h-4" aria-hidden /> {p.id ? "Save" : "Add person"}</button>{p.id ? <button type="button" className="btn btn-outline" onClick={() => { setP(empty); setFile(null); }}>Cancel</button> : null}</div>
      </form>
      <Panel title="Listed on the site">
        {(data || []).length === 0 ? <p className="text-slate-600">Nobody yet. The About page shows "board being formed" until you add members.</p> : (
          <ul className="divide-y divide-slate-100">
            {(data || []).map((x) => (
              <li key={x.id} className="py-3 flex items-center gap-3">
                <Avatar user={x} size={40} />
                <div className="min-w-0 flex-1"><p className="font-semibold text-navy-ink">{x.name}</p><p className="text-sm text-slate-500">{x.grp === "board" ? "Editorial board" : "Advisory council"} · {x.role}</p></div>
                <button className="link text-sm" onClick={() => { setP(x); setFile(null); window.scrollTo(0, 0); }}>Edit</button>
                <button className="text-red-700 p-1" aria-label={`Remove ${x.name}`} onClick={() => remove(x)}><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

export function ActivityLog() {
  const { data } = useLoad<any[]>("/api/admin/activity");
  return (
    <>
      <H1>Activity log</H1>
      <p className="-mt-3 mb-6 text-slate-600">The last 300 actions on the platform: who did what, and when.</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-[0.95rem]">
          <thead className="bg-paper text-slate-600 text-sm"><tr><th className="p-3">When</th><th className="p-3">Who</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {(data || []).map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="p-3 text-slate-600 whitespace-nowrap text-sm">{formatDate(a.created_at, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                <td className="p-3">{a.name || "System"}</td>
                <td className="p-3 text-slate-700">{actionLabel(a.action)}{a.detail ? <span className="text-slate-500">: {a.detail}</span> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
