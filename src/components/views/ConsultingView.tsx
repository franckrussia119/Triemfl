import React from "react";
import { Landmark, BarChart3, ShieldCheck, GraduationCap } from "lucide-react";
import { usePageTitle } from "../../lib/router";
import { SITE } from "../../lib/site";
import { PageHero, SectionHeader } from "../ui";
import RequestForm from "../RequestForm";

const SERVICES = [
  { icon: Landmark, t: "Policy analysis", who: "Governments and state institutions", d: "Evaluation of macro-stabilisation frameworks, trade corridors and financial regulation, with recommendations grounded in the evidence.", items: ["Fiscal and monetary framework reviews", "Cross-border regulatory guidance"] },
  { icon: BarChart3, t: "Feasibility review", who: "Development banks, NGOs and companies", d: "Independent modelling of infrastructure, transport, energy and agribusiness investments.", items: ["Cost-benefit and sensitivity analysis", "Review of funding proposals"] },
  { icon: ShieldCheck, t: "Regulatory compliance", who: "Banks and private companies", d: "Assessment of tax, banking and monetary compliance to reduce legal risk in emerging markets.", items: ["Compliance gap analysis", "Guidance on local regulatory integration"] },
  { icon: GraduationCap, t: "Research methodology", who: "Universities and think tanks", d: "Workshops and guidance on econometric modelling, panel data and research data management.", items: ["Training workshops for research staff", "Methodology review of studies"] },
];

const STEPS = [
  ["First conversation", "Tell us your goals, region and any constraints on data or timing."],
  ["Proposal", "We send terms of reference with the specialists assigned, timeline and fee."],
  ["Delivery", "Work proceeds in agreed milestones, each reviewed before delivery."],
];

export default function ConsultingView() {
  usePageTitle(`Consulting | ${SITE.short}`);
  return (
    <>
      <PageHero eyebrow="Consulting" title="Expert analysis for public and private institutions"
        intro="Independent economic, financial and legal analysis drawing on the institute's research divisions." />

      <section className="py-16">
        <div className="container-x grid md:grid-cols-2 gap-6">
          {SERVICES.map((s) => (
            <div key={s.t} className="card p-6 sm:p-8">
              <s.icon className="w-7 h-7 text-navy" aria-hidden />
              <h2 className="mt-4 text-2xl font-semibold text-navy-ink">{s.t}</h2>
              <p className="text-gold-deep font-semibold text-sm mt-1">{s.who}</p>
              <p className="mt-3 text-slate-600 leading-relaxed">{s.d}</p>
              <ul className="mt-4 list-disc pl-5 text-slate-700 space-y-1 marker:text-gold">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-paper">
        <div className="container-x">
          <SectionHeader eyebrow="Working with us" title="How an engagement runs" />
          <ol className="mt-10 grid md:grid-cols-3 gap-5">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="card p-6">
                <span className="w-8 h-8 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center">{i + 1}</span>
                <h3 className="mt-3 text-xl font-semibold text-navy-ink">{t}</h3>
                <p className="mt-1.5 text-slate-600 leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <SectionHeader eyebrow="Get in touch" title="Start a conversation" />
            <p className="mt-4 text-slate-600 leading-relaxed">We reply within two working days. Information you share is treated as confidential.</p>
          </div>
          <div className="lg:col-span-8">
            <RequestForm kind="consulting" submitLabel="Send inquiry" subjectLabel="Service" subjectOptions={SERVICES.map((s) => s.t).concat("Other")}
              messageLabel="What do you need?" messageHint="Goals, geography, timeline and any data constraints." />
          </div>
        </div>
      </section>
    </>
  );
}
