import React from "react";
import { Link, usePageTitle } from "../../lib/router";
import { SITE, DIVISIONS, type Person } from "../../lib/site";
import { PageHero, SectionHeader } from "../ui";

function People({ list }: { list: Person[] }) {
  return (
    <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {list.map((m) => (
        <li key={m.name} className="card p-5">
          <p className="font-semibold text-navy-ink text-lg">{m.name}</p>
          <p className="text-gold-deep font-medium text-sm">{m.role}</p>
          {m.affiliation && <p className="text-slate-600 mt-1">{m.affiliation}</p>}
          {m.orcid && <a className="link text-sm mt-2 inline-block" href={`https://orcid.org/${m.orcid}`} target="_blank" rel="noopener noreferrer">ORCID</a>}
        </li>
      ))}
    </ul>
  );
}

export default function AboutView() {
  usePageTitle(`About | ${SITE.short}`);
  return (
    <>
      <PageHero eyebrow="About the institute" title={SITE.name} intro={SITE.tagline} />

      <section className="py-16">
        <div className="container-x grid lg:grid-cols-2 gap-10">
          <div className="card p-8">
            <h2 className="text-2xl font-semibold text-navy-ink">Mission</h2>
            <p className="mt-3 text-slate-700 leading-relaxed text-lg">To connect rigorous research with economic policy, by publishing peer-reviewed work in the open and giving decision-makers independent, evidence-based evaluation of their projects.</p>
          </div>
          <div className="card p-8">
            <h2 className="text-2xl font-semibold text-navy-ink">Vision</h2>
            <p className="mt-3 text-slate-700 leading-relaxed text-lg">Public and development projects evaluated objectively, by independent specialists, against transparent and consistent standards.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-paper">
        <div className="container-x grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow="Why the institute exists" title="One standard of evidence across economics, finance, management and law" />
          </div>
          <div className="lg:col-span-7 prose-body text-slate-700 text-lg leading-relaxed">
            <p>Development plans, fiscal reforms and large investments are often evaluated with inconsistent methods from one country or institution to the next. The result is decisions that are hard to compare and hard to trust.</p>
            <p>{SITE.short} brings economists, lawyers and management specialists together to publish research under {SITE.publishing.reviewModel.toLowerCase()}, and to examine projects with methods that are documented and repeatable.</p>
            <p>The institute is based in {SITE.address.city} and works with researchers and institutions internationally.</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x">
          <SectionHeader eyebrow="Structure" title="Research divisions" />
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DIVISIONS.map((d) => (
              <div key={d.code} className="card p-6">
                <p className="eyebrow">{SITE.short}-{d.code}</p>
                <h3 className="mt-1 text-xl font-semibold text-navy-ink">{d.name}</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">{d.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="board" className="py-16 bg-paper scroll-mt-28">
        <div className="container-x">
          <SectionHeader eyebrow="Governance" title="Editorial board" />
          {SITE.editorialBoard.length > 0 ? <People list={SITE.editorialBoard} /> : (
            <div className="mt-8 card p-8 max-w-2xl">
              <p className="text-slate-700 leading-relaxed text-lg">The founding editorial board is being formed. Members will be listed here with their affiliations once appointed.</p>
              <p className="mt-3 text-slate-600">Researchers interested in serving as reviewers or board members are invited to <Link to="/contact" className="link">get in touch</Link>.</p>
            </div>
          )}
          {SITE.advisoryCouncil.length > 0 && (
            <>
              <h3 className="mt-14 text-2xl font-semibold text-navy-ink">Advisory council</h3>
              <People list={SITE.advisoryCouncil} />
            </>
          )}
        </div>
      </section>

      {SITE.partners.length > 0 && (
        <section className="py-16">
          <div className="container-x">
            <SectionHeader eyebrow="Partners" title="Institutional partners" />
            <ul className="mt-8 flex flex-wrap gap-3">
              {SITE.partners.map((p) => <li key={p.name} className="card px-5 py-3 font-semibold text-navy-ink">{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{p.name}</a> : p.name}</li>)}
            </ul>
          </div>
        </section>
      )}

      <section className="py-16 bg-navy text-white on-dark">
        <div className="container-x flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold">How we publish</h2>
            <p className="mt-2 text-slate-300 text-lg">Peer review, open access, ethics and author guidelines.</p>
          </div>
          <Link to="/policies" className="btn btn-gold">Read the editorial policies</Link>
        </div>
      </section>
    </>
  );
}
