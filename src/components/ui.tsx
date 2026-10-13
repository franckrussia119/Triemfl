import React from "react";
import { FileText, Download, Eye, ArrowRight } from "lucide-react";
import { Link } from "../lib/router";
import { type Publication, authorNames, formatDate } from "../lib/api";

export function PageHero({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="on-dark bg-navy text-white relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="container-x relative py-14 sm:py-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 text-3xl sm:text-5xl font-semibold leading-tight max-w-3xl">{title}</h1>
        {intro && <div className="mt-5 text-lg text-slate-200 max-w-2xl leading-relaxed">{intro}</div>}
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, intro, align = "left", dark }: { eyebrow?: string; title: string; intro?: React.ReactNode; align?: "left" | "center"; dark?: boolean }) {
  return (
    <div className={`${align === "center" ? "text-center mx-auto" : ""} max-w-2xl ${dark ? "on-dark" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className={`mt-2 text-3xl sm:text-4xl font-semibold leading-tight ${dark ? "text-white" : "text-navy-ink"}`}>{title}</h2>
      {intro && <p className={`mt-4 text-lg leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>{intro}</p>}
    </div>
  );
}

export function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: React.ReactNode }) {
  const cls = tone === "error" ? "bg-red-50 border-red-200 text-red-900" : tone === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-700";
  return <div role={tone === "error" ? "alert" : "status"} className={`border rounded-lg px-4 py-3 text-[0.95rem] leading-relaxed ${cls}`}>{children}</div>;
}

export function EmptyState({ icon, title, children, action }: { icon?: React.ReactNode; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="card p-8 sm:p-10 text-center">
      {icon && <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-paper flex items-center justify-center text-navy">{icon}</div>}
      <h3 className="text-xl font-semibold text-navy-ink">{title}</h3>
      {children && <div className="mt-2 text-slate-600 max-w-md mx-auto leading-relaxed">{children}</div>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function TypeBadge({ type }: { type: string }) {
  return <span className="pill bg-amber-50 text-gold-deep border border-amber-200">{type}</span>;
}

export function PaperCard({ p, compact }: { p: Publication; compact?: boolean }) {
  return (
    <article className="card p-5 sm:p-6 flex flex-col h-full hover:border-slate-300 transition-colors">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <TypeBadge type={p.type} />
        {p.category && <span>{p.category}</span>}
      </div>
      <h3 className="mt-3 text-lg sm:text-xl font-semibold leading-snug text-navy-ink">
        <Link to={`/research/${p.slug}`} className="hover:underline decoration-slate-300 underline-offset-4">{p.title}</Link>
      </h3>
      <p className="mt-1.5 text-[0.95rem] text-slate-700">{authorNames(p.authors)}</p>
      {!compact && <p className="mt-3 text-[0.95rem] text-slate-600 leading-relaxed line-clamp-3">{p.abstract}</p>}
      <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span>{formatDate(p.publishedDate, { year: "numeric", month: "short" })}{p.number ? ` · ${p.number}` : ""}</span>
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1" title="Views"><Eye className="w-4 h-4" aria-hidden />{p.views}<span className="sr-only">views</span></span>
          {p.hasPdf && <span className="inline-flex items-center gap-1" title="Downloads"><Download className="w-4 h-4" aria-hidden />{p.downloads}<span className="sr-only">downloads</span></span>}
        </span>
      </div>
    </article>
  );
}

export function LoadingRows({ n = 3 }: { n?: number }) {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: n }).map((_, i) => <div key={i} className="card h-36 animate-pulse bg-slate-50" />)}
    </div>
  );
}

export function SubmitCTA({ dark }: { dark?: boolean }) {
  return (
    <Link to="/submit" className={`btn ${dark ? "btn-gold" : "btn-navy"}`}>
      <FileText className="w-4 h-4" aria-hidden /> Submit a manuscript <ArrowRight className="w-4 h-4" aria-hidden />
    </Link>
  );
}
