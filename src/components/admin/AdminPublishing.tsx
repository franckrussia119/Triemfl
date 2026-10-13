import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Plus, Trash2, ExternalLink } from "lucide-react";
import { Link, navigate } from "../../lib/router";
import { api, ApiError, errorMessage, formatDate, type Author, type Publication, type Announcement } from "../../lib/api";
import { SITE, CATEGORIES, PUBLICATION_TYPES } from "../../lib/site";
import { Field, Notice } from "../ui";

// Publications, subscribers and announcements screens of the admin area.

export function H1({ children, back, action }: { children: React.ReactNode; back?: string; action?: React.ReactNode }) {
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

export function useLoad<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => { api<T>(url).then(setData).catch((e) => setError(errorMessage(e, "This page couldn't be loaded. Refresh to try again."))); }, [url]);
  useEffect(() => { load(); }, [load]);
  return { data, error, reload: load };
}

// ---------------- Publications ----------------
export function Publications() {
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

export function PublicationEditor({ id }: { id: string }) {
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
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6 space-y-5">
          {input("title", "Title")}
          <fieldset className="space-y-3">
            <legend className="field-label">Authors</legend>
            {errors.authors && <p className="field-error">{errors.authors}</p>}
            {p.authors.map((a: Author, i: number) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_160px_auto] gap-2 items-start">
                <input aria-label={`Author ${i + 1} name`} className="input" placeholder="Full name" value={a.name} onChange={(e) => setAuthor(i, "name", e.target.value)} />
                <input aria-label={`Author ${i + 1} institution`} className="input" placeholder="Institution" value={a.affiliation || ""} onChange={(e) => setAuthor(i, "affiliation", e.target.value)} />
                <input aria-label={`Author ${i + 1} ORCID`} className="input" placeholder="ORCID" value={a.orcid || ""} onChange={(e) => setAuthor(i, "orcid", e.target.value)} />
                <button type="button" className="btn btn-danger btn-sm" aria-label={`Remove author ${i + 1}`} disabled={p.authors.length === 1} onClick={() => set("authors", p.authors.filter((_: Author, j: number) => j !== i))}><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={() => set("authors", [...p.authors, { name: "", affiliation: "", orcid: "" }])}><Plus className="w-4 h-4" aria-hidden /> Add author</button>
          </fieldset>
          <Field id="pe-abstract" label="Abstract" error={errors.abstract}><textarea id="pe-abstract" className="input !min-h-[200px]" value={p.abstract} onChange={(e) => set("abstract", e.target.value)} /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

// ---------------- Subscribers ----------------
export function Subscribers() {
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
export function Announcements() {
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={save} className="card p-6 space-y-4 self-start">
          <h2 className="font-sans font-semibold text-navy-ink">{a.id ? "Edit announcement" : "New announcement"}</h2>
          {err && <Notice tone="error">{err}</Notice>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
