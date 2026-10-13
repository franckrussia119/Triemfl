import React, { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, BookOpen } from "lucide-react";
import { Link, navigate, usePageTitle } from "../../lib/router";
import { api, type Publication, authorNames } from "../../lib/api";
import { CATEGORIES, PUBLICATION_TYPES, SITE } from "../../lib/site";
import { PageHero, PaperCard, EmptyState, LoadingRows } from "../ui";

const PAGE = 12;

export default function ResearchView({ search }: { search: string }) {
  usePageTitle(`Research library | ${SITE.short}`);
  const params = new URLSearchParams(search);
  const [all, setAll] = useState<Publication[] | null>(null);
  const [q, setQ] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [type, setType] = useState(params.get("type") || "");
  const [year, setYear] = useState(params.get("year") || "");
  const [sort, setSort] = useState(params.get("sort") || "latest");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { api<Publication[]>("/api/publications").then(setAll).catch(() => setAll([])); }, []);

  // Keep the URL in sync so filtered views can be shared.
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q); if (category) p.set("category", category); if (type) p.set("type", type);
    if (year) p.set("year", year); if (sort !== "latest") p.set("sort", sort);
    const s = p.toString();
    window.history.replaceState(null, "", `/research${s ? "?" + s : ""}`);
    setPage(1);
  }, [q, category, type, year, sort]);

  const years = useMemo(() => Array.from(new Set((all || []).map((p) => p.publishedDate.slice(0, 4)).filter(Boolean))).sort().reverse(), [all]);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    let r = (all || []).filter((p) => {
      if (category && p.category !== category) return false;
      if (type && p.type !== type) return false;
      if (year && !p.publishedDate.startsWith(year)) return false;
      if (!words.length) return true;
      const hay = [p.title, p.abstract, authorNames(p.authors), p.authors.map((a) => a.affiliation).join(" "), p.keywords.join(" "), p.jelCodes.join(" "), p.number].join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    if (sort === "downloads") r = [...r].sort((a, b) => b.downloads - a.downloads);
    else if (sort === "views") r = [...r].sort((a, b) => b.views - a.views);
    else if (sort === "title") r = [...r].sort((a, b) => a.title.localeCompare(b.title));
    return r;
  }, [all, q, category, type, year, sort]);

  const pages = Math.max(1, Math.ceil(results.length / PAGE));
  const shown = results.slice((page - 1) * PAGE, page * PAGE);
  const filtersOn = !!(category || type || year);
  const clear = () => { setCategory(""); setType(""); setYear(""); setQ(""); };

  const select = (id: string, label: string, value: string, set: (v: string) => void, options: string[], any = "All") => (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <select id={id} className="input" value={value} onChange={(e) => set(e.target.value)}>
        <option value="">{any}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <PageHero eyebrow="Research library" title="Open-access research"
        intro="Peer-reviewed working papers, journal articles and policy briefs in economics, finance, management and law. Free to read, download and cite.">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-8 max-w-2xl relative">
          <label htmlFor="lib-q" className="sr-only">Search the library</label>
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden />
          <input id="lib-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, author, institution, keyword or JEL code"
            className="w-full h-12 rounded-lg bg-white text-slate-900 pl-11 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-gold" />
        </form>
      </PageHero>

      <section className="py-12 bg-paper min-h-[50vh]">
        <div className="container-x grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <button className="btn btn-outline w-full lg:hidden" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-4 h-4" aria-hidden /> {showFilters ? "Hide filters" : "Filters"}{filtersOn ? " (on)" : ""}
            </button>
            <div className={`${showFilters ? "block" : "hidden"} lg:block card p-5 space-y-5 mt-3 lg:mt-0 lg:sticky lg:top-28`}>
              {select("f-cat", "Research area", category, setCategory, [...CATEGORIES], "All areas")}
              {select("f-type", "Document type", type, setType, [...PUBLICATION_TYPES], "All types")}
              {select("f-year", "Year", year, setYear, years, "Any year")}
              {filtersOn && <button className="link text-sm" onClick={() => { setCategory(""); setType(""); setYear(""); }}>Clear filters</button>}
            </div>
          </aside>

          <div className="lg:col-span-9">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <p className="text-slate-700" aria-live="polite">
                {all === null ? "Loading…" : `${results.length} ${results.length === 1 ? "result" : "results"}`}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-slate-600">Sort by</label>
                <select id="sort" className="input !min-h-[38px] !py-1 !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="latest">Newest</option>
                  <option value="downloads">Most downloaded</option>
                  <option value="views">Most read</option>
                  <option value="title">Title A–Z</option>
                </select>
              </div>
            </div>

            {all === null ? <LoadingRows /> : all.length === 0 ? (
              <EmptyState icon={<BookOpen className="w-6 h-6" />} title="The library is opening soon"
                action={<Link to="/submit" className="btn btn-navy">Submit a manuscript</Link>}>
                The first papers are going through peer review. Submit your own research to be considered for publication.
              </EmptyState>
            ) : results.length === 0 ? (
              <EmptyState title="No papers match these filters" action={<button className="btn btn-outline" onClick={clear}>Clear search and filters</button>}>
                Try fewer words, or remove a filter.
              </EmptyState>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">{shown.map((p) => <PaperCard key={p.id} p={p} />)}</div>
                {pages > 1 && (
                  <nav aria-label="Pages" className="mt-8 flex items-center justify-center gap-3">
                    <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => { setPage(page - 1); window.scrollTo(0, 300); }}>Previous</button>
                    <span className="text-slate-600 text-sm">Page {page} of {pages}</span>
                    <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => { setPage(page + 1); window.scrollTo(0, 300); }}>Next</button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
