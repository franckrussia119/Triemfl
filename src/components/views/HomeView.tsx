import React, { useEffect, useState } from "react";
import { Search, Users, BadgeCheck, Landmark, BarChart3, ShieldCheck, GraduationCap, ArrowRight, BookOpen, Send, Scale, Unlock, FileSearch } from "lucide-react";
import { Link, navigate, usePageTitle } from "../../lib/router";
import { api, type Publication, type Announcement, formatDate } from "../../lib/api";
import { SITE, DIVISIONS, CATEGORIES } from "../../lib/site";
import { PaperCard, SectionHeader, EmptyState, LoadingRows } from "../ui";
import { NewsletterForm } from "../Footer";
import Guilloche from "../Guilloche";
import { useAuth } from "../../lib/auth";
import { useContent } from "../../lib/content";
import { authorNames } from "../../lib/api";

type Stats = { publications: number; downloads: number; authors: number };

export default function HomeView() {
  usePageTitle(`${SITE.name} (${SITE.short})`);
  const [papers, setPapers] = useState<Publication[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [news, setNews] = useState<Announcement[]>([]);
  const [q, setQ] = useState("");
  const [division, setDivision] = useState(0);

  useEffect(() => {
    api<Publication[]>("/api/publications").then(setPapers).catch(() => setPapers([]));
    api<Stats>("/api/stats").then(setStats).catch(() => {});
    api<Announcement[]>("/api/announcements").then(setNews).catch(() => {});
  }, []);

  const { user } = useAuth();
  const content = useContent();
  const heroTitle = content.text("hero_title", "Research that informs economic policy");
  const heroIntro = content.text("hero_intro", `${SITE.short} publishes peer-reviewed, open-access research and gives governments and institutions independent expert evaluation of their projects.`);
  const cfp = content.setting("call_for_papers");
  const research = (papers || []).filter((p) => !["Book", "Report"].includes(p.type)).slice(0, 6);
  const featured = papers === null ? undefined : research[0] || null;
  const d = DIVISIONS[division];

  return (
    <>
      {/* Hero */}
      <section className="on-dark bg-navy-deep text-white relative overflow-hidden">
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(1200px 600px at 85% 30%, rgba(30,64,160,.45), transparent 60%), radial-gradient(800px 500px at 0% 100%, rgba(10,36,99,.9), transparent 70%)" }} />
        <Guilloche size={900} className="absolute -right-72 -top-24 w-[min(1000px,110vw)] h-auto pointer-events-none hidden md:block" opacity={0.2} />
        <div className="container-x relative pt-14 pb-10 sm:pt-20 sm:pb-14 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            {cfp && (
              <Link to="/submit" className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-3.5 py-1.5 text-sm text-gold hover:bg-gold/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden /><span className="font-semibold">Call for papers</span><span className="text-slate-200 hidden sm:inline">· {cfp}</span>
              </Link>
            )}
            <p className="eyebrow">{SITE.brand} Research Institute · {SITE.address.city}</p>
            <h1 className="mt-4 text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-[4.3rem] font-semibold tracking-[-0.01em] max-w-[14ch]">{heroTitle}</h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-200 leading-relaxed max-w-2xl">{heroIntro}</p>
            <form role="search" onSubmit={(e) => { e.preventDefault(); navigate(`/research${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); }} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-xl">
              <label htmlFor="hero-q" className="sr-only">Search the research library</label>
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden />
                <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search papers, authors, keywords"
                  className="w-full h-12 rounded-lg bg-white text-slate-900 pl-11 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-gold" />
              </div>
              <button className="btn btn-gold h-12">Search</button>
            </form>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={user ? "/account/manuscripts/new" : "/submit"} className="btn btn-ghost-light">Submit a manuscript <ArrowRight className="w-4 h-4" aria-hidden /></Link>
              <Link to="/project-review" className="btn btn-ghost-light">Request a project review</Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <CoverCard paper={featured} />
          </div>
        </div>
        <div className="relative border-t border-white/10 bg-black/10">
          <ul className="container-x py-4 flex flex-wrap gap-x-8 gap-y-2 text-sm" aria-label="Divisions">
            {DIVISIONS.map((d) => (
              <li key={d.code} className="flex items-baseline gap-2"><span className="text-gold font-semibold">{d.code}</span><span className="text-slate-300">{d.name}</span></li>
            ))}
          </ul>
        </div>
        {stats && stats.publications >= 10 && (
          <dl className="relative container-x py-6 grid grid-cols-3 gap-6 max-w-3xl">
            {[[stats.publications, "Published papers"], [stats.authors, "Authors"], [stats.downloads, "Downloads"]].map(([n, l]) => (
              <div key={l as string}><dt className="text-slate-400 text-sm">{l}</dt><dd className="font-serif text-3xl text-white">{Number(n).toLocaleString("en")}</dd></div>
            ))}
          </dl>
        )}
      </section>

      {/* Latest research */}
      <section className="py-20 bg-paper">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <SectionHeader eyebrow="Research library" title="Latest research" intro="Working papers, articles and policy briefs, free to read and cite." />
            {research.length > 0 && <Link to="/research" className="btn btn-outline">Browse the library <ArrowRight className="w-4 h-4" aria-hidden /></Link>}
          </div>
          {papers === null ? <LoadingRows /> : research.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{research.map((p) => <PaperCard key={p.id} p={p} />)}</div>
          ) : (
            <EmptyState icon={<BookOpen className="w-6 h-6" />} title="Our first papers are in review"
              action={<Link to="/submit" className="btn btn-navy">Submit a manuscript</Link>}>
              The library opens with its first peer-reviewed papers. Researchers in economics, finance, management and law are invited to submit their work now.
            </EmptyState>
          )}
          <div className="mt-10 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link key={c} to={`/research?category=${encodeURIComponent(c)}`} className="pill bg-white border border-slate-200 text-slate-700 hover:border-navy !py-1.5 !px-3 !text-sm">{c}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Divisions */}
      <section className="py-20">
        <div className="container-x">
          <SectionHeader eyebrow="Specialised divisions" title="Five divisions, one standard of evidence" intro="Each division leads research and project evaluation in its field." />
          <div className="mt-10 grid lg:grid-cols-12 gap-6">
            <div role="tablist" aria-label="Divisions" className="lg:col-span-5 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
              {DIVISIONS.map((x, i) => (
                <button key={x.code} role="tab" aria-selected={i === division} onClick={() => setDivision(i)}
                  className={`text-left shrink-0 lg:shrink rounded-lg px-4 py-3 border transition-colors ${i === division ? "border-navy bg-navy text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}>
                  <span className={`text-xs font-semibold ${i === division ? "text-gold" : "text-gold-deep"}`}>{SITE.short}-{x.code}</span>
                  <span className="block font-semibold whitespace-nowrap lg:whitespace-normal">{x.name}</span>
                </button>
              ))}
            </div>
            <div role="tabpanel" className="lg:col-span-7 card p-6 sm:p-10">
              <p className="eyebrow">{SITE.short}-{d.code}</p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-semibold text-navy-ink">{d.name}</h3>
              <p className="mt-4 text-lg text-slate-800 font-medium">{d.focus}</p>
              <p className="mt-3 text-slate-600 leading-relaxed">{d.body}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/project-review" className="btn btn-navy">Request a review</Link>
                <Link to="/submit" className="btn btn-outline">Submit research in this field</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project review */}
      <section className="py-20 bg-navy-deep text-white">
        <div className="container-x">
          <SectionHeader dark eyebrow="Project examination" title="Independent review of economic and development projects"
            intro="Governments, development institutions and companies submit projects for examination by a panel matched to the subject." />
          <ol className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: Send, t: "Submit documentation", d: "Send the project plan, financial model and supporting documents through a secure form." },
              { icon: Users, t: "Expert panel review", d: "Specialists examine feasibility, fiscal and legal risks, and the assumptions behind the numbers." },
              { icon: BadgeCheck, t: "Report and recommendations", d: "Receive a written evaluation with findings, risks and recommended revisions." },
            ].map((s, i) => (
              <li key={s.t} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-gold text-navy-deep font-semibold flex items-center justify-center">{i + 1}</span>
                  <s.icon className="w-5 h-5 text-gold" aria-hidden />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-slate-300 leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
          <Link to="/project-review" className="btn btn-gold mt-10">Request a project review</Link>
        </div>
      </section>

      {/* Consulting */}
      <section className="py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader eyebrow="Consulting" title="Expert analysis for public and private institutions" />
            <Link to="/consulting" className="btn btn-outline">Consulting services <ArrowRight className="w-4 h-4" aria-hidden /></Link>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Landmark, t: "Policy analysis", d: "Reviews of fiscal frameworks, trade corridors and financial regulation." },
              { icon: BarChart3, t: "Feasibility review", d: "Independent evaluation of infrastructure, energy and public investment plans." },
              { icon: ShieldCheck, t: "Compliance review", d: "Assessment of fiscal and regulatory models against international standards." },
              { icon: GraduationCap, t: "Research methodology", d: "Training and guidance on econometric modelling and data systems." },
            ].map((s) => (
              <div key={s.t} className="card p-6">
                <s.icon className="w-6 h-6 text-navy" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-navy-ink">{s.t}</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial board (only when configured) */}
      {content.board.length > 0 && (
        <section className="py-20 bg-paper">
          <div className="container-x">
            <SectionHeader eyebrow="Editorial board" title="The people behind the review" />
            <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {content.board.slice(0, 6).map((m) => (
                <li key={m.name} className="card p-5">
                  <p className="font-semibold text-navy-ink">{m.name}</p>
                  <p className="text-sm text-gold-deep font-medium">{m.role}</p>
                  {m.affiliation && <p className="text-sm text-slate-600 mt-1">{m.affiliation}</p>}
                </li>
              ))}
            </ul>
            <Link to="/about#board" className="link inline-block mt-6">Full editorial board</Link>
          </div>
        </section>
      )}

      {/* Announcements (only when published from the admin portal) */}
      {news.length > 0 && (
        <section className="py-20 bg-paper">
          <div className="container-x">
            <SectionHeader eyebrow="News and calls" title="Announcements" />
            <div className="mt-10 grid md:grid-cols-3 gap-5">
              {news.slice(0, 3).map((n) => (
                <article key={n.id} className="card p-6 flex flex-col">
                  <p className="eyebrow">{n.kind}</p>
                  <h3 className="mt-2 text-xl font-semibold text-navy-ink">{n.title}</h3>
                  {n.body && <p className="mt-2 text-slate-600 leading-relaxed">{n.body}</p>}
                  <div className="mt-auto pt-4 flex justify-between items-center text-sm text-slate-500">
                    <span>{formatDate(n.date)}</span>
                    {n.link && <a className="link" href={n.link} target={n.link.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer">Details</a>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-16 bg-navy on-dark text-white">
        <div className="container-x grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-semibold">New research in your inbox</h2>
            <p className="mt-3 text-slate-300 text-lg">Newly published papers, calls for papers and events. We only write when there's something new.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}

function CoverCard({ paper }: { paper: Publication | null | undefined }) {
  if (paper === undefined) return <div className="aspect-[4/5] max-w-md ml-auto rounded-lg bg-white/5 animate-pulse" />;
  const P = SITE.publishing;
  if (!paper) {
    return (
      <div className="max-w-md lg:ml-auto rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-sm p-7">
        <h2 className="font-sans text-base font-semibold text-gold">Publishing with {SITE.short}</h2>
        <ul className="mt-5 space-y-5">
          {[
            { icon: Scale, t: P.reviewModel, d: "Independent reviewers assess every manuscript without seeing the authors' names." },
            { icon: Unlock, t: "Open access", d: `Free to read and download, under ${P.license}.` },
            { icon: BadgeCheck, t: P.processingCharges, d: "Authors don't pay to submit or to publish." },
            { icon: FileSearch, t: "Follow every step", d: "Track review and correspond with editors from your account." },
          ].map((x) => (
            <li key={x.t} className="flex gap-4"><x.icon className="w-5 h-5 text-gold mt-0.5 shrink-0" aria-hidden /><div><p className="font-semibold text-white">{x.t}</p><p className="text-slate-300 text-[0.95rem] leading-relaxed">{x.d}</p></div></li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <Link to={`/research/${paper.slug}`} className="group block max-w-md lg:ml-auto">
      <article className="relative bg-[#fbfaf7] text-navy-ink rounded-md shadow-[0_30px_60px_-20px_rgba(0,0,0,.6)] overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
        <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide">{paper.series || (paper.type === "Working Paper" ? P.seriesName : paper.type)}</span>
          <span className="text-xs text-gold font-semibold">{paper.number || paper.publishedDate.slice(0, 4)}</span>
        </div>
        <div className="relative px-6 pt-7 pb-6 min-h-[300px] flex flex-col">
          <Guilloche size={400} className="absolute -right-24 -bottom-24 w-72 h-72" color="#0a2463" opacity={0.12} />
          <p className="text-xs font-semibold text-gold-deep">Latest {paper.type.toLowerCase()} · {paper.category}</p>
          <h2 className="relative mt-3 text-2xl leading-snug font-semibold line-clamp-4">{paper.title}</h2>
          <p className="relative mt-3 text-slate-700">{authorNames(paper.authors)}</p>
          <div className="relative mt-auto pt-6 flex items-center justify-between text-sm">
            <span className="text-slate-500">{SITE.short} · {formatDate(paper.publishedDate, { month: "long", year: "numeric" })}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-navy group-hover:gap-2 transition-all">Read <ArrowRight className="w-4 h-4" aria-hidden /></span>
          </div>
        </div>
        <div className="h-1.5 bg-gold" />
      </article>
    </Link>
  );
}
