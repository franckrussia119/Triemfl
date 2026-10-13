import React, { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Link, usePageTitle } from "../../lib/router";
import { api, ApiError, errorMessage, formatDate } from "../../lib/api";
import { SITE } from "../../lib/site";
import { PageHero, Field, Notice } from "../ui";

const LABEL: Record<string, string> = {
  submitted: "Submitted", screening: "Initial screening", "under-review": "Under peer review", revisions: "Revisions requested",
  accepted: "Accepted", rejected: "Not accepted", published: "Published", withdrawn: "Withdrawn",
};
const PATH = ["submitted", "screening", "under-review", "accepted", "published"];

type Result = { ref: string; title: string; status: string; submittedAt: string; events: { status: string; message: string; created_at: string }[]; publicationSlug: string | null };

export default function TrackView({ search }: { search: string }) {
  usePageTitle(`Track a submission | ${SITE.short}`);
  const [ref, setRef] = useState(new URLSearchParams(search).get("ref") || "");
  const [email, setEmail] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(""); setRes(null);
    try { setRes(await api<Result>("/api/submissions/track", { method: "POST", json: { ref, email } })); }
    catch (x) { setErr(x instanceof ApiError && x.status === 404 ? "No submission matches this reference number and email. Check both and try again; the email must be the one used to submit." : errorMessage(x)); }
    finally { setBusy(false); }
  }

  const stage = res ? Math.max(PATH.indexOf(res.status === "revisions" ? "under-review" : res.status), 0) : 0;
  const stopped = res && ["rejected", "withdrawn"].includes(res.status);

  return (
    <>
      <PageHero eyebrow="Manuscript submission" title="Track a submission" intro="Enter the reference number you received when you submitted, and the email address you used." />
      <section className="py-12 bg-paper">
        <div className="container-x max-w-2xl space-y-6">
          <form onSubmit={lookup} className="card p-6 sm:p-8 grid sm:grid-cols-2 gap-4 items-end">
            <Field id="ref" label="Reference number"><input id="ref" className="input uppercase" required value={ref} onChange={(e) => setRef(e.target.value)} placeholder="TRIEFML-MS-2026-XXXXX" /></Field>
            <Field id="t-email" label="Email address"><input id="t-email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
            <button className="btn btn-navy sm:col-span-2" disabled={busy}>{busy ? "Checking…" : "Check status"}</button>
          </form>
          {err && <Notice tone="error">{err}</Notice>}
          {res && (
            <div className="card p-6 sm:p-8">
              <p className="text-sm text-slate-500">{res.ref} · submitted {formatDate(res.submittedAt)}</p>
              <h2 className="mt-1 text-2xl font-semibold text-navy-ink">{res.title}</h2>
              <p className="mt-3"><span className={`pill ${stopped ? "bg-slate-100 text-slate-700" : res.status === "revisions" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>{LABEL[res.status]}</span></p>
              {!stopped && (
                <ol className="mt-6 grid grid-cols-5 gap-1.5" aria-label="Progress">
                  {PATH.map((s, i) => (
                    <li key={s} className="text-center">
                      <div className={`h-1.5 rounded-full ${i <= stage ? "bg-navy" : "bg-slate-200"}`} />
                      <p className={`mt-2 text-[0.72rem] sm:text-xs ${i <= stage ? "text-navy-ink font-semibold" : "text-slate-400"}`}>{LABEL[s]}</p>
                    </li>
                  ))}
                </ol>
              )}
              {res.publicationSlug && <Link to={`/research/${res.publicationSlug}`} className="btn btn-gold mt-6">View the published paper</Link>}
              <h3 className="mt-8 font-sans font-semibold text-navy-ink">Messages from the editorial office</h3>
              <ol className="mt-3 space-y-4">
                {res.events.slice().reverse().map((ev, i) => (
                  <li key={i} className="flex gap-3">
                    {i === 0 ? <CheckCircle2 className="w-5 h-5 text-navy shrink-0 mt-0.5" aria-hidden /> : <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" aria-hidden />}
                    <div>
                      <p className="font-semibold text-slate-800">{LABEL[ev.status]} <span className="font-normal text-sm text-slate-500">· {formatDate(ev.created_at)}</span></p>
                      {ev.message && <p className="text-slate-600 whitespace-pre-line leading-relaxed mt-0.5">{ev.message}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
