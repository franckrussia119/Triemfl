import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

// All persistent data (database + uploaded files) lives in DATA_DIR.
// In production this folder MUST be a persistent volume (see README).
export const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "data"));
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, "triefml.db"));
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  authors TEXT NOT NULL DEFAULT '[]',
  abstract TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  jel_codes TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  published_date TEXT NOT NULL DEFAULT '',
  series TEXT NOT NULL DEFAULT '',
  number TEXT NOT NULL DEFAULT '',
  volume TEXT NOT NULL DEFAULT '',
  issue TEXT NOT NULL DEFAULT '',
  pages TEXT NOT NULL DEFAULT '',
  doi TEXT NOT NULL DEFAULT '',
  pdf_file TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  submission_id INTEGER,
  downloads INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT NOT NULL DEFAULT '',
  jel_codes TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  cover_letter TEXT NOT NULL DEFAULT '',
  authors TEXT NOT NULL DEFAULT '[]',
  email TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submission_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT UNIQUE NOT NULL,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '{}',
  file_path TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

export type Author = { name: string; affiliation?: string; orcid?: string };

export function parseJSON<T>(s: string, fallback: T): T {
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

export function slugify(s: string) {
  return s
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "paper";
}

export function uniqueSlug(base: string, excludeId?: number) {
  let slug = slugify(base);
  let n = 2;
  const q = db.prepare("SELECT id FROM publications WHERE slug = ?");
  for (;;) {
    const row = q.get(slug) as { id: number } | undefined;
    if (!row || row.id === excludeId) return slug;
    slug = `${slugify(base)}-${n++}`;
  }
}

export function makeRef(prefix: string) {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${year}-${rand}`;
}

export function metaGet(key: string) {
  const r = db.prepare("SELECT value FROM meta WHERE key = ?").get(key) as { value: string } | undefined;
  return r?.value;
}
export function metaSet(key: string, value: string) {
  db.prepare("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
}

export function publicationRow(r: any, opts: { admin?: boolean } = {}) {
  if (!r) return r;
  const out: any = {
    id: r.id, slug: r.slug, type: r.type, title: r.title,
    authors: parseJSON<Author[]>(r.authors, []),
    abstract: r.abstract,
    keywords: r.keywords ? r.keywords.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    jelCodes: r.jel_codes ? r.jel_codes.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    category: r.category, publishedDate: r.published_date,
    series: r.series, number: r.number, volume: r.volume, issue: r.issue, pages: r.pages, doi: r.doi,
    hasPdf: !!r.pdf_file, downloads: r.downloads, views: r.views,
  };
  if (opts.admin) Object.assign(out, { status: r.status, submissionId: r.submission_id, createdAt: r.created_at, updatedAt: r.updated_at });
  return out;
}
