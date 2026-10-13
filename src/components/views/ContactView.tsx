import React from "react";
import { Mail, MapPin, FileSearch } from "lucide-react";
import { Link, usePageTitle } from "../../lib/router";
import { SITE } from "../../lib/site";
import { PageHero } from "../ui";
import RequestForm from "../RequestForm";

export default function ContactView() {
  usePageTitle(`Contact | ${SITE.short}`);
  return (
    <>
      <PageHero eyebrow="Contact" title="Contact the institute" intro="Questions about publishing, project reviews, consulting or partnerships." />
      <section className="py-14">
        <div className="container-x grid lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-4 space-y-6">
            <div>
              <h2 className="font-sans font-semibold text-navy-ink flex items-center gap-2"><MapPin className="w-5 h-5 text-gold-deep" aria-hidden /> Address</h2>
              <address className="not-italic mt-2 text-slate-700">{SITE.address.lines.map((l) => <span key={l} className="block">{l}</span>)}</address>
            </div>
            <div>
              <h2 className="font-sans font-semibold text-navy-ink flex items-center gap-2"><Mail className="w-5 h-5 text-gold-deep" aria-hidden /> Email</h2>
              <dl className="mt-2 space-y-2 text-slate-700">
                <div><dt className="text-sm text-slate-500">General</dt><dd><a className="link break-all" href={`mailto:${SITE.email.general}`}>{SITE.email.general}</a></dd></div>
                <div><dt className="text-sm text-slate-500">Editorial office</dt><dd><a className="link break-all" href={`mailto:${SITE.email.editorial}`}>{SITE.email.editorial}</a></dd></div>
                <div><dt className="text-sm text-slate-500">Project reviews</dt><dd><a className="link break-all" href={`mailto:${SITE.email.reviews}`}>{SITE.email.reviews}</a></dd></div>
              </dl>
            </div>
            <div className="card p-5 bg-paper border-0">
              <h2 className="font-sans font-semibold text-navy-ink flex items-center gap-2"><FileSearch className="w-5 h-5 text-gold-deep" aria-hidden /> Already submitted a paper?</h2>
              <p className="mt-1.5 text-slate-600 text-[0.95rem]">Check its status online with your reference number.</p>
              <Link to="/track" className="btn btn-outline btn-sm mt-3">Track a submission</Link>
            </div>
          </aside>
          <div className="lg:col-span-8">
            <RequestForm kind="contact" subjectLabel="Topic" subjectOptions={["General question", "Publishing and submissions", "Project review", "Consulting", "Partnership", "Media"]} submitLabel="Send message" />
          </div>
        </div>
      </section>
    </>
  );
}
