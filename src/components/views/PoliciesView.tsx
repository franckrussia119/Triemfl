import React from "react";
import { Link, usePageTitle } from "../../lib/router";
import { SITE } from "../../lib/site";
import { PageHero } from "../ui";

const P = SITE.publishing;

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "scope", title: "Scope",
    body: <p>We publish original research in economics, finance, management and law, with particular interest in emerging and developing economies, public finance, banking, trade, regulation and governance. We accept working papers, journal articles and policy briefs.</p>,
  },
  {
    id: "review", title: "Peer review",
    body: (
      <>
        <p>Every manuscript first receives an editorial screening for scope, quality and completeness. Manuscripts that pass are sent for {P.reviewModel.toLowerCase()}: reviewers don't know the authors' identities, and authors don't know the reviewers'.</p>
        <p>Each paper is reviewed by at least two independent specialists. The editor makes the decision (accept, revise, or decline) based on the reviews, and shares the reviewers' comments with the authors.</p>
        <p>We aim to reach a first decision within {P.firstDecisionWeeks}. Authors can follow their submission at any time on the <Link to="/track" className="link">tracking page</Link>.</p>
      </>
    ),
  },
  {
    id: "open-access", title: "Open access and licensing",
    body: (
      <>
        <p>All published papers are free to read and download immediately on publication, with no registration.</p>
        <p>Papers are published under the <a className="link" href={P.licenseUrl} target="_blank" rel="noopener noreferrer">{P.license}</a> licence. Authors keep their copyright.</p>
      </>
    ),
  },
  {
    id: "fees", title: "Fees",
    body: <p>{P.processingCharges}. Authors don't pay to submit, to be reviewed, or to publish.</p>,
  },
  {
    id: "ethics", title: "Publication ethics",
    body: (
      <>
        <p>Authors must submit original work that is not under consideration elsewhere, cite their sources, and disclose funding and conflicts of interest. Use of AI tools in writing or analysis must be described in the manuscript.</p>
        <p>Reviewers must keep manuscripts confidential, declare conflicts of interest, and decline reviews they cannot do impartially. Editors decide on the basis of scholarly merit alone.</p>
        <p>Manuscripts may be checked for plagiarism. Where misconduct is found after publication, the paper will be corrected or retracted with a public notice.</p>
      </>
    ),
  },
  {
    id: "guidelines", title: "Author guidelines",
    body: (
      <ul className="list-disc pl-5 space-y-1.5 marker:text-gold">
        <li>Language: English.</li>
        <li>File: PDF or Word, up to 25 MB. Remove author names and acknowledgements from the manuscript for blind review.</li>
        <li>Abstract: up to 300 words. Up to six keywords and, where relevant, JEL codes.</li>
        <li>References: any consistent author–date style (APA recommended).</li>
        <li>Data and code: share them where possible, or state how they can be obtained.</li>
      </ul>
    ),
  },
  {
    id: "corrections", title: "Corrections and withdrawals",
    body: <p>Authors who find a significant error in a published paper should contact the editorial office at <a className="link" href={`mailto:${SITE.email.editorial}`}>{SITE.email.editorial}</a>. Corrections are published alongside the original paper.</p>,
  },
];

export default function PoliciesView() {
  usePageTitle(`Editorial policies | ${SITE.short}`);
  return (
    <>
      <PageHero eyebrow="Publishing" title="Editorial policies" intro="How submissions are reviewed and published, and what we expect from authors, reviewers and editors." />
      <section className="py-14">
        <div className="container-x grid lg:grid-cols-12 gap-10">
          <nav aria-label="On this page" className="lg:col-span-3">
            <ul className="lg:sticky lg:top-28 space-y-1 border-l border-slate-200">
              {SECTIONS.map((s) => <li key={s.id}><a href={`#${s.id}`} className="block pl-4 py-1.5 text-slate-600 hover:text-navy-ink">{s.title}</a></li>)}
            </ul>
          </nav>
          <div className="lg:col-span-9 max-w-3xl space-y-12">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="text-2xl sm:text-3xl font-semibold text-navy-ink">{s.title}</h2>
                <div className="mt-4 prose-body text-slate-700 text-[1.05rem] leading-[1.8]">{s.body}</div>
              </section>
            ))}
            <div className="pt-4">
              <Link to="/submit" className="btn btn-navy">Submit a manuscript</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
