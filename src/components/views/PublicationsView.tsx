import React, { useEffect, useState } from "react";
import { BookOpen, Download } from "lucide-react";
import { Link, usePageTitle } from "../../lib/router";
import { api, type Publication, authorNames, formatDate } from "../../lib/api";
import { SITE, LIBRARY_TYPES } from "../../lib/site";
import { PageHero, EmptyState, LoadingRows, TypeBadge } from "../ui";

export default function PublicationsView() {
  usePageTitle(`Books and reports | ${SITE.short}`);
  const [items, setItems] = useState<Publication[] | null>(null);
  const [type, setType] = useState("");

  useEffect(() => {
    api<Publication[]>("/api/publications").then((all) => setItems(all.filter((p) => LIBRARY_TYPES.includes(p.type)))).catch(() => setItems([]));
  }, []);

  const shown = (items || []).filter((p) => !type || p.type === type);

  return (
    <>
      <PageHero eyebrow="Institute press" title="Books and reports"
        intro={`Monographs, handbooks and reports published by the ${SITE.name}. Research papers are in the research library.`} />
      <section className="py-12 bg-paper min-h-[40vh]">
        <div className="container-x">
          {items && items.length > 0 && (
            <div role="tablist" aria-label="Filter by type" className="flex gap-2 mb-6">
              {["", ...LIBRARY_TYPES].map((t) => (
                <button key={t || "all"} role="tab" aria-selected={type === t} onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-md font-semibold text-sm ${type === t ? "bg-navy text-white" : "bg-white border border-slate-200 text-slate-700"}`}>{t ? `${t}s` : "All"}</button>
              ))}
            </div>
          )}
          {items === null ? <LoadingRows /> : shown.length === 0 ? (
            <EmptyState icon={<BookOpen className="w-6 h-6" />} title="No books or reports yet"
              action={<Link to="/research" className="btn btn-navy">Open the research library</Link>}>
              The institute's first books and reports will appear here when they are published.
            </EmptyState>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2">
              {shown.map((p) => (
                <li key={p.id} className="card p-6 flex gap-5">
                  <div aria-hidden className="w-20 shrink-0 aspect-[3/4] rounded bg-navy text-gold flex items-center justify-center font-serif text-sm text-center px-2 leading-tight">{SITE.short}<br />{p.publishedDate.slice(0, 4)}</div>
                  <div className="min-w-0 flex flex-col">
                    <TypeBadge type={p.type} />
                    <h2 className="mt-2 text-xl font-semibold leading-snug text-navy-ink"><Link to={`/research/${p.slug}`} className="hover:underline underline-offset-4">{p.title}</Link></h2>
                    <p className="text-slate-700 mt-1">{authorNames(p.authors)}</p>
                    <p className="text-sm text-slate-500 mt-1">{formatDate(p.publishedDate, { year: "numeric", month: "long" })}{p.pages ? ` · ${p.pages} pages` : ""}</p>
                    <p className="text-slate-600 mt-3 line-clamp-3 leading-relaxed">{p.abstract}</p>
                    {p.hasPdf && <a href={`/files/${p.slug}.pdf`} target="_blank" rel="noopener" className="btn btn-outline btn-sm mt-4 self-start"><Download className="w-4 h-4" aria-hidden /> Download PDF</a>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
