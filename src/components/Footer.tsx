import React, { useState } from "react";
import { Mail, MapPin } from "lucide-react";
import { Link } from "../lib/router";
import { SITE, CATEGORIES } from "../lib/site";
import { Logo } from "./Navbar";
import { api, errorMessage } from "../lib/api";

export function NewsletterForm({ dark = true, stacked = false }: { dark?: boolean; stacked?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try { await api("/api/subscribe", { method: "POST", json: { email } }); setState("done"); }
    catch (err: any) { setState("error"); setMsg(err?.data?.errors?.email || errorMessage(err)); }
  };
  if (state === "done") return <p role="status" className={dark ? "text-slate-200" : "text-slate-700"}>Subscribed. New papers and calls for papers will arrive at {email}.</p>;
  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className={`flex flex-col gap-2 ${stacked ? "" : "sm:flex-row"}`}>
        <label htmlFor={`nl-${dark}-${stacked}`} className="sr-only">Email address</label>
        <input id={`nl-${dark}-${stacked}`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address"
          className={`input flex-1 ${dark ? "!bg-white/10 !border-white/20 !text-white placeholder:text-slate-400" : ""}`} />
        <button className="btn btn-gold" disabled={state === "sending"}>{state === "sending" ? "Subscribing…" : "Subscribe"}</button>
      </div>
      {state === "error" && <p className="field-error !text-red-300 mt-2">{msg}</p>}
    </form>
  );
}

export default function Footer() {
  const p = SITE.publishing;
  return (
    <footer className="bg-navy-deep text-slate-300 on-dark">
      <div className="container-x py-14 grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-4">
          <Logo />
          <p className="text-[0.95rem] leading-relaxed max-w-sm">{SITE.tagline}</p>
          <dl className="text-sm space-y-1 text-slate-400">
            <div><dt className="inline">Peer review: </dt><dd className="inline">{p.reviewModel}</dd></div>
            <div><dt className="inline">Licence: </dt><dd className="inline"><a className="underline underline-offset-2 hover:text-white" href={p.licenseUrl} target="_blank" rel="noopener noreferrer">{p.license}</a></dd></div>
            {p.issnOnline && <div><dt className="inline">ISSN (online): </dt><dd className="inline">{p.issnOnline}</dd></div>}
            {p.issnPrint && <div><dt className="inline">ISSN (print): </dt><dd className="inline">{p.issnPrint}</dd></div>}
            {p.doiPrefix && <div><dt className="inline">DOI prefix: </dt><dd className="inline">{p.doiPrefix}</dd></div>}
          </dl>
        </div>
        <nav aria-label="Research areas" className="lg:col-span-3">
          <h2 className="font-sans text-white font-semibold mb-3">Research areas</h2>
          <ul className="space-y-2 text-[0.95rem]">
            {CATEGORIES.slice(0, 6).map((c) => <li key={c}><Link className="hover:text-white" to={`/research?category=${encodeURIComponent(c)}`}>{c}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Institute" className="lg:col-span-2">
          <h2 className="font-sans text-white font-semibold mb-3">Institute</h2>
          <ul className="space-y-2 text-[0.95rem]">
            {[["/submit", "Submit research"], ["/signup", "Create an account"], ["/policies", "Editorial policies"], ["/project-review", "Project review"], ["/consulting", "Consulting"], ["/about", "About"]].map(([to, l]) => (
              <li key={to}><Link className="hover:text-white" to={to}>{l}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="lg:col-span-3 space-y-4 text-[0.95rem]">
          <h2 className="font-sans text-white font-semibold">Contact</h2>
          <p className="flex gap-2"><MapPin className="w-4 h-4 mt-1 shrink-0 text-gold" aria-hidden /><span>{SITE.address.lines.map((l) => <span key={l} className="block">{l}</span>)}</span></p>
          <p className="flex gap-2 break-all"><Mail className="w-4 h-4 mt-1 shrink-0 text-gold" aria-hidden /><a className="hover:text-white" href={`mailto:${SITE.email.general}`}>{SITE.email.general}</a></p>
          <div className="pt-2">
            <p className="text-white font-semibold mb-2">New research by email</p>
            <NewsletterForm stacked />
          </div>
        </div>
      </div>
      {(SITE.partners.length > 0 || SITE.indexedIn.length > 0) && (
        <div className="border-t border-white/10">
          <div className="container-x py-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            {SITE.partners.length > 0 && <span>Partners: {SITE.partners.map((x) => x.name).join(", ")}</span>}
            {SITE.indexedIn.length > 0 && <span>Indexed in: {SITE.indexedIn.join(", ")}</span>}
          </div>
        </div>
      )}
      <div className="border-t border-white/10">
        <div className="container-x py-5 flex flex-wrap justify-between gap-3 text-sm text-slate-400">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span className="flex gap-4"><Link to="/policies" className="hover:text-white">Policies</Link><Link to="/signin" className="hover:text-white">Sign in</Link></span>
        </div>
      </div>
    </footer>
  );
}
