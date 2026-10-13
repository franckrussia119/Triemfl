import React from "react";
import { Check } from "lucide-react";
import { usePageTitle } from "../../lib/router";
import { SITE, DIVISIONS } from "../../lib/site";
import { PageHero, SectionHeader } from "../ui";
import { Link } from "../../lib/router";
import { useAuth } from "../../lib/auth";

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
        <div className="container-x">
          <div className="card p-8 sm:p-12 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <p className="eyebrow">Request a review</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-navy-ink leading-tight">Submit your project from an institution account</h2>
              <p className="mt-4 text-slate-600 text-lg leading-relaxed">Upload your documents, follow the review, answer the panel's questions and receive the final report, all in one secure place. Institution accounts are verified by our team.</p>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-3">
              <ProjectCTA />
              <p className="text-sm text-slate-500">Questions first? Write to <a className="link" href={`mailto:${SITE.email.reviews}`}>{SITE.email.reviews}</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ProjectCTA() {
  const { user } = useAuth();
  if (user) return <Link to="/account/projects/new" className="btn btn-gold">Submit a project</Link>;
  return (
    <>
      <Link to="/signup?type=institution&next=/account/projects/new" className="btn btn-navy">Create an institution account</Link>
      <Link to="/signin?next=/account/projects/new" className="btn btn-outline">I already have an account</Link>
    </>
  );
}
