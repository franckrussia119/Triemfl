import React, { useEffect, useState } from "react";

// Minimal client-side router using real URLs (so every page and paper has a
// shareable link and can be indexed by search engines).

const listeners = new Set<() => void>();

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (to === window.location.pathname + window.location.search + window.location.hash) return;
  if (opts.replace) window.history.replaceState(null, "", to);
  else window.history.pushState(null, "", to);
  listeners.forEach((l) => l());
  const hash = to.split("#")[1];
  if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 50);
  else window.scrollTo(0, 0);
}

export function useLocation() {
  const read = () => ({ path: window.location.pathname.replace(/\/+$/, "") || "/", search: window.location.search });
  const [loc, setLoc] = useState(read);
  useEffect(() => {
    const on = () => setLoc(read());
    listeners.add(on);
    window.addEventListener("popstate", on);
    return () => { listeners.delete(on); window.removeEventListener("popstate", on); };
  }, []);
  return loc;
}

export function Link({ to, className, children, onClick, ...rest }: { to: string; className?: string; children: React.ReactNode; onClick?: () => void } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export function usePageTitle(title: string) {
  useEffect(() => { if (title) document.title = title; }, [title]);
}
