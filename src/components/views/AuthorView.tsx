import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { Link, usePageTitle } from "../../lib/router";
import { api, type Publication } from "../../lib/api";
import { SITE } from "../../lib/site";
import { PaperCard, EmptyState } from "../ui";
import { Avatar } from "./AccountView";

type Author = { id: number; name: string; title: string; institution: string; position: string; country: string; orcid: string; bio: string; expertise: string; photo: string; website: string; publications: Publication[] };

export default function AuthorView({ id }: { id: string }) {
  const [a, setA] = useState<Author | null>(null);
  const [missing, setMissing] = useState(false);
  usePageTitle(a ? `${a.name} | ${SITE.short}` : `Author | ${SITE.short}`);
  useEffect(() => { api<Author>(`/api/authors/${id}`).then(setA).catch(() => setMissing(true)); }, [id]);

  if (missing) return <div className="container-x py-20"><EmptyState title="This profile isn't available" action={<Link to="/research" className="btn btn-navy">Research library</Link>}>The author may have made their profile private.</EmptyState></div>;
  if (!a) return <div className="container-x py-20"><div className="card h-48 animate-pulse bg-slate-50" /></div>;

  return (
    <>
      <section className="bg-navy text-white on-dark">
        <div className="container-x py-12 sm:py-16 flex flex-col sm:flex-row gap-6 sm:items-center">
          <Avatar user={a} size={112} />
          <div>
            <p className="eyebrow">Author</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-semibold">{a.title ? `${a.title} ` : ""}{a.name}</h1>
            <p className="mt-2 text-slate-200 text-lg">{[a.position, a.institution, a.country].filter(Boolean).join(", ")}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              {a.orcid && <a className="text-gold underline underline-offset-2" href={`https://orcid.org/${a.orcid}`} target="_blank" rel="noopener noreferrer">ORCID {a.orcid}</a>}
              {a.website && <a className="text-slate-200 underline underline-offset-2 inline-flex items-center gap-1" href={a.website.startsWith("http") ? a.website : `https://${a.website}`} target="_blank" rel="noopener noreferrer"><Globe className="w-4 h-4" aria-hidden />Website</a>}
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 bg-paper">
        <div className="container-x grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-5">
            {a.bio && <div className="card p-6"><h2 className="font-sans font-semibold text-navy-ink">Biography</h2><p className="mt-2 text-slate-700 leading-relaxed whitespace-pre-line">{a.bio}</p></div>}
            {a.expertise && <div className="card p-6"><h2 className="font-sans font-semibold text-navy-ink">Expertise</h2><div className="mt-3 flex flex-wrap gap-2">{a.expertise.split(",").map((x) => x.trim()).filter(Boolean).map((x) => <span key={x} className="pill bg-paper border border-slate-200 text-slate-700">{x}</span>)}</div></div>}
          </aside>
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-semibold text-navy-ink mb-5">Publications with {SITE.short}</h2>
            {a.publications.length ? <div className="grid gap-5 md:grid-cols-2">{a.publications.map((p) => <PaperCard key={p.id} p={p} />)}</div>
              : <p className="text-slate-600">No published papers yet.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
