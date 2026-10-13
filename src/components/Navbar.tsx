import React, { useEffect, useState } from "react";
import { GraduationCap, Menu, X, Search } from "lucide-react";
import { Link, navigate, useLocation } from "../lib/router";
import { SITE } from "../lib/site";

export const NAV = [
  { to: "/research", label: "Research" },
  { to: "/publications", label: "Publications" },
  { to: "/project-review", label: "Project review" },
  { to: "/consulting", label: "Consulting" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Logo({ onDark = true, compact = false }: { onDark?: boolean; compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 min-w-0" aria-label={`${SITE.name}, home`}>
      <span className="bg-gold text-navy-deep rounded-md p-2 shrink-0"><GraduationCap className="w-6 h-6" aria-hidden /></span>
      <span className="flex flex-col min-w-0 leading-tight">
        <span className={`font-serif text-xl font-semibold ${onDark ? "text-white" : "text-navy-ink"}`}>{SITE.brand} <span className="text-gold">{SITE.short}</span></span>
        <span className={`text-[0.72rem] sm:text-xs truncate ${compact ? "hidden 2xl:block" : ""} ${onDark ? "text-slate-300" : "text-slate-500"}`}>Research Institute of Economics, Finance, Management and Law</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { path } = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  const active = (to: string) => path === to || path.startsWith(to + "/");
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/research${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
    setQ("");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-navy-deep text-slate-300 text-[0.8rem] py-1.5 hidden sm:block">
        <div className="container-x flex justify-center gap-3">
          <span>Peer-reviewed research</span><span aria-hidden className="text-slate-600">/</span>
          <span>Open access</span><span aria-hidden className="text-slate-600">/</span>
          <span>Independent project evaluation</span>
        </div>
      </div>
      <nav aria-label="Main" className="bg-navy/95 backdrop-blur border-b border-white/10">
        <div className="container-x h-[72px] flex items-center gap-4 2xl:gap-6">
          <Logo compact />
          <ul className="hidden xl:flex items-center gap-1 ml-auto">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} aria-current={active(n.to) ? "page" : undefined}
                  className={`px-3 py-2 rounded-md text-[0.95rem] whitespace-nowrap transition-colors ${active(n.to) ? "text-white bg-white/10" : "text-slate-300 hover:text-white"}`}>{n.label}</Link>
              </li>
            ))}
          </ul>
          <form onSubmit={search} role="search" className="hidden lg:flex xl:hidden 2xl:flex items-center relative ml-auto xl:ml-0">
            <label htmlFor="nav-search" className="sr-only">Search research</label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3" aria-hidden />
            <input id="nav-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search research"
              className="bg-white/10 border border-white/15 text-white placeholder:text-slate-400 rounded-md h-10 pl-9 pr-3 w-48 text-sm focus:outline-none focus:border-gold" />
          </form>
          <Link to="/submit" className="btn btn-gold btn-sm hidden md:inline-flex whitespace-nowrap">Submit research</Link>
          <button className="xl:hidden ml-auto md:ml-0 text-white w-11 h-11 flex items-center justify-center" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="xl:hidden fixed inset-x-0 top-[72px] sm:top-[103px] bottom-0 bg-navy-deep overflow-y-auto">
          <div className="container-x py-6">
            <form onSubmit={search} role="search" className="relative mb-4">
              <label htmlFor="m-search" className="sr-only">Search research</label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
              <input id="m-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search research"
                className="w-full bg-white/10 border border-white/15 text-white placeholder:text-slate-400 rounded-md h-12 pl-9 pr-3 focus:outline-none focus:border-gold" />
            </form>
            <ul>
              {[{ to: "/", label: "Home" }, ...NAV, { to: "/track", label: "Track a submission" }].map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className={`block py-3.5 border-b border-white/10 font-serif text-2xl ${path === n.to ? "text-gold" : "text-white"}`}>{n.label}</Link>
                </li>
              ))}
            </ul>
            <Link to="/submit" className="btn btn-gold w-full mt-6">Submit research</Link>
          </div>
        </div>
      )}
    </header>
  );
}
