import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Copy, Check, Eye, Share2, FileText } from "lucide-react";
import { Link, usePageTitle } from "../../lib/router";
import { api, ApiError, type Publication, formatDate } from "../../lib/api";
import { citations } from "../../lib/cite";
import { SITE } from "../../lib/site";
import { TypeBadge, PaperCard, EmptyState } from "../ui";

export default function ResearchDetailView({ slug }: { slug: string }) {
  const [p, setP] = useState<Publication | null>(null);
  const [missing, setMissing] = useState(false);
  const [related, setRelated] = useState<Publication[]>([]);
  const [style, setStyle] = useState<keyof ReturnType<typeof citations>>("APA");
  const [copied, setCopied] = useState("");
  const [showReader, setShowReader] = useState(false);
  usePageTitle(p ? `${p.title} | ${SITE.short}` : `Research | ${SITE.short}`);

  useEffect(() => {
    setP(null); setMissing(false); setShowReader(false);
    api<Publication>(`/api/publications/${slug}`).then(setP).catch((e) => { if (e instanceof ApiError && e.status === 404) setMissing(true); });
    api<Publication[]>("/api/publications").then(setRelated).catch(() => {});
  }, [slug]);

  const url = `${window.location.origin}/research/${slug}`;
  const cites = useMemo(() => (p ? citations(p, url) : null), [p, url]);
  const more = related.filter((r) => r.slug !== slug && p && (r.category === p.category || r.authors.some((a) => p.authors.some((b) => b.name === a.name)))).slice(0, 3);

  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 2000); } catch { /* clipboard blocked */ }
  };

  if (missing) {
    return (
      <div className="container-x py-20">
        <EmptyState title="This paper isn't available" action={<Link to="/research" className="btn btn-navy">Back to the library</Link>}>
          The link may be wrong, or the paper may have been withdrawn.
        </EmptyState>
      </div>
    );
  }
  if (!p || !cites) return <div className="container-x py-20"><div className="card h-64 animate-pulse bg-slate-50" aria-busy="true" /></div>;

  const pdf = `/files/${p.slug}.pdf`;
  const meta: [string, string][] = [
    ["Published", formatDate(p.publishedDate)],
    ["Type", p.type],
    ...(p.series || p.number ? [["Series", [p.series, p.number].filter(Boolean).join(", ")] as [string, string]] : []),
    ...(p.volume ? [["Volume / issue", `${p.volume}${p.issue ? ` (${p.issue})` : ""}${p.pages ? `, pp. ${p.pages}` : ""}`] as [string, string]] : []),
    ["Research area", p.category],
    ["Licence", SITE.publishing.license],
  ];

  return (
    <>
      <section className="bg-navy text-white on-dark">
        <div className="container-x py-10 sm:py-14">
          <Link to="/research" className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm"><ArrowLeft className="w-4 h-4" aria-hidden /> Research library</Link>
          <div className="mt-6 flex flex-wrap items-center gap-3"><TypeBadge type={p.type} />{p.number && <span className="text-slate-300 text-sm">{p.number}</span>}</div>
          <h1 className="mt-4 text-3xl sm:text-[2.6rem] font-semibold leading-tight max-w-4xl">{p.title}</h1>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {p.authors.map((a) => (
              <li key={a.name} className="text-slate-200">
                <span className="font-semibold text-white">{a.name}</span>
                {a.affiliation && <span className="text-slate-300">, {a.affiliation}</span>}
                {a.orcid && <a href={`https://orcid.org/${a.orcid}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-gold underline underline-offset-2">ORCID</a>}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            {p.hasPdf && <a href={pdf} className="btn btn-gold" target="_blank" rel="noopener"><Download className="w-4 h-4" aria-hidden /> Download PDF</a>}
            {p.hasPdf && <button className="btn btn-ghost-light" onClick={() => setShowReader(!showReader)} aria-expanded={showReader}><FileText className="w-4 h-4" aria-hidden /> {showReader ? "Hide reader" : "Read online"}</button>}
            <button className="btn btn-ghost-light" onClick={() => copy(url, "link")}>{copied === "link" ? <Check className="w-4 h-4" aria-hidden /> : <Share2 className="w-4 h-4" aria-hidden />} {copied === "link" ? "Link copied" : "Copy link"}</button>
          </div>
        </div>
      </section>

      {showReader && p.hasPdf && (
        <section className="bg-slate-100 border-b border-slate-200">
          <div className="container-x py-6">
            <iframe src={pdf} title={`PDF: ${p.title}`} className="w-full h-[80vh] rounded-lg border border-slate-300 bg-white" />
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="container-x grid lg:grid-cols-12 gap-10">
          <article className="lg:col-span-8">
            <h2 className="text-2xl font-semibold text-navy-ink">Abstract</h2>
            <div className="mt-4 text-[1.05rem] leading-[1.8] text-slate-700 max-w-[70ch] whitespace-pre-line">{p.abstract}</div>

            {(p.keywords.length > 0 || p.jelCodes.length > 0) && (
              <dl className="mt-8 space-y-3">
                {p.keywords.length > 0 && <div><dt className="font-semibold text-navy-ink">Keywords</dt><dd className="mt-1.5 flex flex-wrap gap-2">{p.keywords.map((k) => <Link key={k} to={`/research?q=${encodeURIComponent(k)}`} className="pill bg-paper border border-slate-200 text-slate-700 !text-sm">{k}</Link>)}</dd></div>}
                {p.jelCodes.length > 0 && <div><dt className="font-semibold text-navy-ink">JEL classification</dt><dd className="mt-1 text-slate-700">{p.jelCodes.join(", ")}</dd></div>}
              </dl>
            )}

            <div className="mt-12 card p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-navy-ink">Cite this paper</h2>
              <div role="tablist" aria-label="Citation style" className="mt-4 flex flex-wrap gap-1.5">
                {(Object.keys(cites) as (keyof typeof cites)[]).map((k) => (
                  <button key={k} role="tab" aria-selected={style === k} onClick={() => setStyle(k)}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold ${style === k ? "bg-navy text-white" : "bg-paper text-slate-700 hover:bg-slate-200"}`}>{k}</button>
                ))}
              </div>
              <pre className="mt-4 p-4 bg-paper rounded-lg text-[0.92rem] text-slate-800 whitespace-pre-wrap break-words font-sans leading-relaxed">{cites[style]}</pre>
              <button className="btn btn-outline btn-sm mt-3" onClick={() => copy(cites[style], "cite")}>
                {copied === "cite" ? <Check className="w-4 h-4" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />} {copied === "cite" ? "Copied" : `Copy ${style}`}
              </button>
            </div>
          </article>

          <aside className="lg:col-span-4 space-y-6">
            <div className="card p-5">
              <dl className="divide-y divide-slate-100">
                {meta.map(([k, v]) => v ? (<div key={k} className="py-2.5 flex justify-between gap-4 text-[0.95rem]"><dt className="text-slate-500">{k}</dt><dd className="text-slate-800 text-right font-medium">{v}</dd></div>) : null)}
                {p.doi && <div className="py-2.5 flex justify-between gap-4 text-[0.95rem]"><dt className="text-slate-500">DOI</dt><dd className="text-right break-all"><a className="link" href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer">{p.doi}</a></dd></div>}
              </dl>
              <div className="mt-3 pt-3 border-t border-slate-100 flex gap-5 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5"><Eye className="w-4 h-4" aria-hidden /> {p.views} views</span>
                {p.hasPdf && <span className="inline-flex items-center gap-1.5"><Download className="w-4 h-4" aria-hidden /> {p.downloads} downloads</span>}
              </div>
            </div>
            <div className="card p-5 bg-paper border-0">
              <h2 className="font-sans font-semibold text-navy-ink">Publish your research</h2>
              <p className="mt-2 text-slate-600 text-[0.95rem] leading-relaxed">{SITE.publishing.reviewModel}, open access and {SITE.publishing.processingCharges.toLowerCase()}.</p>
              <Link to="/submit" className="btn btn-navy btn-sm mt-4">Submit a manuscript</Link>
            </div>
          </aside>
        </div>
      </section>

      {more.length > 0 && (
        <section className="py-12 bg-paper">
          <div className="container-x">
            <h2 className="text-2xl font-semibold text-navy-ink mb-6">Related research</h2>
            <div className="grid gap-5 md:grid-cols-3">{more.map((r) => <PaperCard key={r.id} p={r} compact />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
