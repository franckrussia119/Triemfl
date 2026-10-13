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

-- Accounts --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'researcher',
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  email_verified INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT '',
  institution TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  orcid TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  expertise TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  public_profile INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tokens (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

-- Files attached to submissions, requests and messages --------------------
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_type TEXT NOT NULL,
  owner_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  uploaded_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS files_owner ON files(owner_type, owner_id);

-- Conversation threads on submissions and requests ------------------------
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_type TEXT NOT NULL,
  thread_id INTEGER NOT NULL,
  user_id INTEGER,
  from_staff INTEGER NOT NULL DEFAULT 0,
  body TEXT NOT NULL,
  read_by_owner INTEGER NOT NULL DEFAULT 0,
  read_by_staff INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS messages_thread ON messages(thread_type, thread_id);

-- Peer review ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  round INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'invited',
  due_date TEXT NOT NULL DEFAULT '',
  recommendation TEXT NOT NULL DEFAULT '',
  scores TEXT NOT NULL DEFAULT '{}',
  comments_author TEXT NOT NULL DEFAULT '',
  comments_editor TEXT NOT NULL DEFAULT '',
  invited_at TEXT NOT NULL DEFAULT (datetime('now')),
  responded_at TEXT,
  submitted_at TEXT
);

-- People shown on the site (board, council) and editable site texts --------
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grp TEXT NOT NULL DEFAULT 'board',
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  affiliation TEXT NOT NULL DEFAULT '',
  orcid TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT '',
  target_id INTEGER,
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// ---- Migrations for databases created by earlier versions ----
function addColumn(table: string, col: string, def: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
}
addColumn("submissions", "user_id", "INTEGER");
addColumn("submissions", "round", "INTEGER NOT NULL DEFAULT 1");
addColumn("requests", "user_id", "INTEGER");
addColumn("requests", "division", "TEXT NOT NULL DEFAULT ''");
addColumn("requests", "assigned_to", "INTEGER");

// Older submissions stored their single file on the row: copy into `files`.
{
  const legacy = db.prepare(`SELECT s.id, s.file_path, s.file_name, s.created_at FROM submissions s
    WHERE s.file_path <> '' AND NOT EXISTS (SELECT 1 FROM files f WHERE f.owner_type='submission' AND f.owner_id=s.id)`).all() as any[];
  const ins = db.prepare("INSERT INTO files (owner_type, owner_id, kind, version, path, name, created_at) VALUES ('submission', ?, 'manuscript', 1, ?, ?, ?)");
  legacy.forEach((s) => ins.run(s.id, s.file_path, s.file_name, s.created_at));
  const legacyReq = db.prepare(`SELECT r.id, r.file_path, r.file_name, r.created_at FROM requests r
    WHERE r.file_path <> '' AND NOT EXISTS (SELECT 1 FROM files f WHERE f.owner_type='request' AND f.owner_id=r.id)`).all() as any[];
  const insR = db.prepare("INSERT INTO files (owner_type, owner_id, kind, path, name, created_at) VALUES ('request', ?, 'document', ?, ?, ?)");
  legacyReq.forEach((r) => insR.run(r.id, r.file_path, r.file_name, r.created_at));
}

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

export function getSettings(): Record<string, string> {
  const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function logActivity(userId: number | null | undefined, action: string, targetType = "", targetId: number | null = null, detail = "") {
  db.prepare("INSERT INTO activity (user_id, action, target_type, target_id, detail) VALUES (?,?,?,?,?)").run(userId ?? null, action, targetType, targetId, detail.slice(0, 500));
}

export function addFile(ownerType: string, ownerId: number, kind: string, f: Express.Multer.File, uploadedBy: number | null, version = 1) {
  const info = db.prepare("INSERT INTO files (owner_type, owner_id, kind, version, path, name, size, uploaded_by) VALUES (?,?,?,?,?,?,?,?)")
    .run(ownerType, ownerId, kind, version, f.filename, f.originalname.slice(0, 200), f.size, uploadedBy);
  return Number(info.lastInsertRowid);
}

export function filesFor(ownerType: string, ownerId: number) {
  return db.prepare("SELECT id, kind, version, name, size, uploaded_by, created_at FROM files WHERE owner_type = ? AND owner_id = ? ORDER BY id").all(ownerType, ownerId) as any[];
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
