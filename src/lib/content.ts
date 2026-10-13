import { useEffect, useState } from "react";
import { api } from "./api";
import { SITE, type Person } from "./site";

export type SitePerson = Person & { id: number; grp: "board" | "advisory"; bio?: string };
type Content = { settings: Record<string, string>; people: SitePerson[] };

let cache: Content | null = null;
let inflight: Promise<Content> | null = null;

// Texts and people edited in the admin area, merged with lib/site.ts.
export function useContent() {
  const [c, setC] = useState<Content | null>(cache);
  useEffect(() => {
    if (cache) return;
    inflight = inflight || api<Content>("/api/content").catch(() => ({ settings: {}, people: [] }));
    inflight.then((d) => { cache = d; setC(d); });
  }, []);
  const s = c?.settings || {};
  const fromDb = c?.people || [];
  return {
    loaded: !!c,
    text: (key: string, fallback: string) => (s[key] && s[key].trim()) || fallback,
    setting: (key: string) => s[key] || "",
    board: [...fromDb.filter((p) => p.grp === "board"), ...SITE.editorialBoard] as (SitePerson | Person)[],
    advisory: [...fromDb.filter((p) => p.grp === "advisory"), ...SITE.advisoryCouncil] as (SitePerson | Person)[],
  };
}
