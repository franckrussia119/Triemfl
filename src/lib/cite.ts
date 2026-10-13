import type { Publication, Author } from "./api";
import { SITE } from "./site";

// Citation strings built from the paper's real metadata.

function split(name: string) {
  const clean = name.replace(/^(dr|prof|professor|mr|mrs|ms)\.?\s+/i, "").trim();
  const parts = clean.split(/\s+/);
  const last = parts.pop() || clean;
  return { first: parts.join(" "), last };
}
const initials = (first: string) => first.split(/[\s-]+/).filter(Boolean).map((p) => p[0].toUpperCase() + ".").join(" ");

function listAPA(a: Author[]) {
  const f = a.map((x) => { const n = split(x.name); return `${n.last}, ${initials(n.first)}`.replace(/, $/, ""); });
  if (f.length <= 1) return f[0] || "";
  return f.slice(0, -1).join(", ") + ", & " + f[f.length - 1];
}
function listMLA(a: Author[]) {
  if (!a.length) return "";
  const first = split(a[0].name);
  const lead = `${first.last}, ${first.first}`.replace(/, $/, "");
  if (a.length === 1) return lead;
  if (a.length === 2) return `${lead}, and ${a[1].name}`;
  return `${lead}, et al`;
}
function listChicago(a: Author[]) {
  if (!a.length) return "";
  const first = split(a[0].name);
  const lead = `${first.last}, ${first.first}`.replace(/, $/, "");
  if (a.length === 1) return lead;
  return lead + ", " + a.slice(1, -1).map((x) => x.name).join(", ") + (a.length > 2 ? "," : "") + " and " + a[a.length - 1].name;
}
function listHarvard(a: Author[]) {
  const f = a.map((x) => { const n = split(x.name); return `${n.last}, ${initials(n.first)}`.replace(/, $/, ""); });
  if (f.length <= 1) return f[0] || "";
  return f.slice(0, -1).join(", ") + " and " + f[f.length - 1];
}

function container(p: Publication) {
  if (p.type === "Journal Article" && SITE.publishing.journalName) {
    return { name: SITE.publishing.journalName, vol: p.volume, iss: p.issue, pages: p.pages };
  }
  const series = p.series || (p.type === "Working Paper" ? SITE.publishing.seriesName : "");
  return { name: series, number: p.number };
}

export function citations(p: Publication, url: string) {
  const year = (p.publishedDate || "").slice(0, 4) || "n.d.";
  const c = container(p) as any;
  const doi = p.doi ? `https://doi.org/${p.doi}` : url;
  const t = p.title.replace(/\.$/, "");
  const isJournal = p.type === "Journal Article" && c.vol !== undefined;

  const apa = isJournal
    ? `${listAPA(p.authors)} (${year}). ${t}. ${c.name}${c.vol ? `, ${c.vol}` : ""}${c.iss ? `(${c.iss})` : ""}${c.pages ? `, ${c.pages}` : ""}. ${doi}`
    : `${listAPA(p.authors)} (${year}). ${t}${c.number ? ` (${c.name ? c.name + " No. " : ""}${c.number})` : c.name ? ` (${c.name})` : ""}. ${SITE.name}. ${doi}`;

  const mla = isJournal
    ? `${listMLA(p.authors)}. "${t}." ${c.name}${c.vol ? `, vol. ${c.vol}` : ""}${c.iss ? `, no. ${c.iss}` : ""}, ${year}${c.pages ? `, pp. ${c.pages}` : ""}. ${doi}.`
    : `${listMLA(p.authors)}. "${t}." ${c.name ? c.name + (c.number ? ` ${c.number}` : "") + ", " : ""}${SITE.name}, ${year}. ${doi}.`;

  const chicago = isJournal
    ? `${listChicago(p.authors)}. "${t}." ${c.name} ${c.vol || ""}${c.iss ? `, no. ${c.iss}` : ""} (${year})${c.pages ? `: ${c.pages}` : ""}. ${doi}.`
    : `${listChicago(p.authors)}. "${t}." ${c.name ? c.name + (c.number ? ` ${c.number}` : "") + ". " : ""}${SITE.address.city}: ${SITE.name}, ${year}. ${doi}.`;

  const harvard = isJournal
    ? `${listHarvard(p.authors)} (${year}) '${t}', ${c.name}${c.vol ? `, ${c.vol}` : ""}${c.iss ? `(${c.iss})` : ""}${c.pages ? `, pp. ${c.pages}` : ""}. Available at: ${doi}.`
    : `${listHarvard(p.authors)} (${year}) ${t}. ${c.name ? c.name + (c.number ? ` ${c.number}` : "") + ". " : ""}${SITE.name}. Available at: ${doi}.`;

  const key = (split(p.authors[0]?.name || "anon").last + year).toLowerCase().replace(/[^a-z0-9]/g, "");
  const bib = [
    isJournal ? `@article{${key},` : `@techreport{${key},`,
    `  title = {${t}},`,
    `  author = {${p.authors.map((a) => { const n = split(a.name); return `${n.last}, ${n.first}`; }).join(" and ")}},`,
    `  year = {${year}},`,
    isJournal ? `  journal = {${c.name}},` : `  institution = {${SITE.name}},`,
    !isJournal && c.name ? `  type = {${c.name}},` : "",
    !isJournal && c.number ? `  number = {${c.number}},` : "",
    isJournal && c.vol ? `  volume = {${c.vol}},` : "",
    isJournal && c.iss ? `  number = {${c.iss}},` : "",
    isJournal && c.pages ? `  pages = {${String(c.pages).replace("-", "--")}},` : "",
    p.doi ? `  doi = {${p.doi}},` : "",
    `  url = {${url}}`,
    `}`,
  ].filter(Boolean).join("\n");

  return { APA: apa.replace(/\s+/g, " "), MLA: mla.replace(/\s+/g, " "), Chicago: chicago.replace(/\s+/g, " "), Harvard: harvard.replace(/\s+/g, " "), BibTeX: bib };
}
