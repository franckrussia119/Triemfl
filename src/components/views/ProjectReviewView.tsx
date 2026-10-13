import React from "react";
import { Check } from "lucide-react";
import { usePageTitle } from "../../lib/router";
import { SITE, DIVISIONS } from "../../lib/site";
import { PageHero, SectionHeader } from "../ui";
import RequestForm from "../RequestForm";

const STAGES = [
  ["Submission", "You send the project documentation and the questions you need answered."],
  ["Screening", "We check scope and completeness and propose terms, timeline and fee."],
  ["Panel review", "Specialists matched to the project examine it independently."],
  ["Synthesis", "Findings are consolidated and checked by a second reviewer."],
  ["Report", "You receive the written evaluation and can discuss it with the panel."],
];

const LEVELS = [
  { key: "basic", name: "Initial evaluation", points: ["Desk review of documentation", "Key risks and gaps identified", "Short written memo"] },
  { key: "standard", name: "Standard review", points: ["Full review by a specialist panel", "Financial and fiscal assumptions tested", "Written report with recommendations"] },
  { key: "comprehensive", name: "Comprehensive examination", points: ["Multi-disciplinary panel (economic, legal, governance)", "Scenario and sensitivity analysis", "Detailed report and debrief session"] },
  { key: "institutional", name: "Institutional partnership", points: ["Ongoing review of a programme or portfolio", "Dedicated contact on the panel", "Periodic reports and methodology support"] },
] as const;

export default function ProjectReviewView() {
  usePageTitle(`Project review | ${SITE.short}`);
  return (
    <>
      <PageHero eyebrow="Project examination" title="Independent review of your project"
        intro="Governments, development institutions and companies submit economic, infrastructure and policy projects for examination by specialists who have no stake in the outcome." />

      <section className="py-16">
        <div className="container-x">
          <SectionHeader eyebrow="How it works" title="From submission to report" />
          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STAGES.map(([t, d], i) => (
              <li key={t} className="card p-5">
                <span className="w-8 h-8 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center">{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-navy-ink">{t}</h3>
                <p className="mt-1.5 text-slate-600 text-[0.95rem] leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 bg-paper">
        <div className="container-x">
          <SectionHeader eyebrow="Service levels" title="Choose the depth of review" intro="Fees depend on the size and complexity of the project and are confirmed in writing after screening." />
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {LEVELS.map((l) => (
              <div key={l.key} className="card p-6 flex flex-col">
                <h3 className="text-xl font-semibold text-navy-ink">{l.name}</h3>
                <p className="mt-2 text-gold-deep font-semibold">{SITE.reviewFees[l.key] || "Quoted after screening"}</p>
                <ul className="mt-4 space-y-2.5">
                  {l.points.map((p) => <li key={p} className="flex gap-2 text-slate-700 text-[0.95rem]"><Check className="w-4 h-4 text-navy mt-1 shrink-0" aria-hidden />{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16" id="request">
        <div className="container-x grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <SectionHeader eyebrow="Request a review" title="Tell us about the project" />
            <p className="mt-4 text-slate-600 leading-relaxed">Describe the project, its budget and timeline, and what you need the review to answer. Attach the main document if you have one. Everything you send is treated as confidential.</p>
            <p className="mt-4 text-slate-600">Or write to <a className="link" href={`mailto:${SITE.email.reviews}`}>{SITE.email.reviews}</a>.</p>
          </div>
          <div className="lg:col-span-8">
            <RequestForm kind="project-review" withFile submitLabel="Send review request"
              subjectLabel="Service level" subjectOptions={[...LEVELS.map((l) => l.name as string), "Not sure yet"]}
              extras={[
                { id: "division", label: "Area", options: DIVISIONS.map((d) => d.name) },
                { id: "size", label: "Approximate project size", placeholder: "e.g. USD 40 million" },
              ]}
              messageLabel="Project description" messageHint="Objectives, budget, timeline and the questions the review should answer." />
          </div>
        </div>
      </section>
    </>
  );
}
