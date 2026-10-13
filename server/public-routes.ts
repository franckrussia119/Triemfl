import express, { type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import { db, makeRef, parseJSON, publicationRow, getSettings, type Author } from "./db";
import { notifyStaff, sendEmail, esc } from "./notify";
import { rateLimit } from "./auth";
import { filePath } from "./uploads";
import { isEmail, str } from "./common";
import { SITE } from "../src/lib/site";

export const publicRouter = express.Router();

// ---------- Site content editable from the admin area ----------
publicRouter.get("/content", (_req, res) => {
  const people = db.prepare("SELECT id, grp, name, role, affiliation, orcid, bio, photo FROM people ORDER BY grp, sort, id").all() as any[];
  res.json({ settings: getSettings(), people: people.map((p) => ({ ...p, photo: p.photo ? `/media/${p.photo}` : "" })) });
});

// ---------- Public author profiles ----------
publicRouter.get("/authors/:id", (req, res) => {
  const u = db.prepare("SELECT id, name, title, institution, position, country, orcid, bio, expertise, photo, website, created_at FROM users WHERE id = ? AND public_profile = 1 AND status = 'active'").get(req.params.id) as any;
  if (!u) return res.status(404).json({ error: "not_found" });
  const pubs = db.prepare(`SELECT p.* FROM publications p JOIN submissions s ON s.id = p.submission_id WHERE s.user_id = ? AND p.status = 'published' ORDER BY p.published_date DESC`).all(u.id);
  res.json({ ...u, photo: u.photo ? `/media/${u.photo}` : "", publications: pubs.map((r) => publicationRow(r)) });
});

// Author accounts linked to each published paper (for "author profile" links).
publicRouter.get("/publications/:slug/owner", (req, res) => {
  const r = db.prepare(`SELECT u.id, u.name FROM publications p JOIN submissions s ON s.id = p.submission_id JOIN users u ON u.id = s.user_id
    WHERE p.slug = ? AND p.status = 'published' AND u.public_profile = 1 AND u.status = 'active'`).get(req.params.slug);
  res.json(r || null);
});

// ---------- Publications ----------
publicRouter.get("/publications", (req, res) => {
  const rows = db.prepare("SELECT * FROM publications WHERE status = 'published' ORDER BY published_date DESC, id DESC").all();
  res.json(rows.map((r) => publicationRow(r)));
});

publicRouter.get("/publications/:slug", (req, res) => {
  const r = db.prepare("SELECT * FROM publications WHERE slug = ? AND status = 'published'").get(req.params.slug);
  if (!r) return res.status(404).json({ error: "not_found" });
  db.prepare("UPDATE publications SET views = views + 1 WHERE id = ?").run((r as any).id);
  (r as any).views += 1;
  res.json(publicationRow(r));
});

publicRouter.get("/stats", (_req, res) => {
  const p = db.prepare("SELECT COUNT(*) n, COALESCE(SUM(downloads),0) d FROM publications WHERE status='published'").get() as any;
  const rows = db.prepare("SELECT authors FROM publications WHERE status='published'").all() as any[];
  const names = new Set<string>();
  rows.forEach((r) => parseJSON<Author[]>(r.authors, []).forEach((a) => a.name && names.add(a.name.toLowerCase())));
  const cats = db.prepare("SELECT category, COUNT(*) n FROM publications WHERE status='published' GROUP BY category").all();
  res.json({ publications: p.n, downloads: p.d, authors: names.size, categories: cats });
});

publicRouter.get("/announcements", (_req, res) => {
  res.json(db.prepare("SELECT id, kind, title, body, date, link FROM announcements ORDER BY date DESC, id DESC LIMIT 12").all());
});

publicRouter.post("/submissions/track", rateLimit("track", 30, 15 * 60 * 1000), (req, res) => {
  const ref = str(req.body.ref, 40).toUpperCase();
  const email = str(req.body.email, 200).toLowerCase();
  const s = db.prepare("SELECT * FROM submissions WHERE ref = ? AND lower(email) = ?").get(ref, email) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  const events = db.prepare("SELECT status, message, created_at FROM submission_events WHERE submission_id = ? AND (message <> '' OR status = 'submitted') ORDER BY id").all(s.id);
  const pub = db.prepare("SELECT slug FROM publications WHERE submission_id = ? AND status = 'published'").get(s.id) as any;
  res.json({ ref: s.ref, title: s.title, status: s.status, submittedAt: s.created_at, events, publicationSlug: pub?.slug || null });
});

// ---------- Consulting and contact messages (no account needed) ----------
const KINDS: Record<string, { label: string; prefix: string }> = {
  consulting: { label: "Consulting inquiry", prefix: "TRIEFML-CO" },
  contact: { label: "Contact message", prefix: "TRIEFML-CT" },
};

publicRouter.post("/requests", rateLimit("request", 8, 60 * 60 * 1000), async (req, res) => {
  const b = req.body;
  const kind = KINDS[b.kind];
  if (!kind) return res.status(400).json({ error: "bad_kind" });
  if (b.company) return res.json({ ref: "OK" }); // honeypot
  const d = { name: str(b.name, 200), email: str(b.email, 200), org: str(b.organization, 300), subject: str(b.subject, 300), message: str(b.message, 8000) };
  const details = b.details && typeof b.details === "object" ? b.details : {};
  const errors: Record<string, string> = {};
  if (!d.name) errors.name = "Enter your name.";
  if (!isEmail(d.email)) errors.email = "Enter a valid email address.";
  if (d.message.length < 20) errors.message = "Describe your request in at least 20 characters.";
  if (Object.keys(errors).length) return res.status(422).json({ error: "validation", errors });

  const ref = makeRef(kind.prefix);
  db.prepare("INSERT INTO requests (ref, kind, name, email, organization, subject, message, details, user_id) VALUES (?,?,?,?,?,?,?,?,?)")
    .run(ref, b.kind, d.name, d.email, d.org, d.subject, d.message, JSON.stringify(details), req.user?.id ?? null);
  notifyStaff(`<b>${esc(kind.label)}</b> ${esc(ref)}\n${esc(d.name)}${d.org ? " · " + esc(d.org) : ""}\n${esc(d.email)}\n${d.subject ? "<b>" + esc(d.subject) + "</b>\n" : ""}\n${esc(d.message.slice(0, 1500))}`);
  sendEmail(d.email, `We received your message (${ref})`,
    `Dear ${d.name},\n\nThank you for contacting the ${SITE.name}. Your reference is ${ref}.\n\nA member of our team will reply to you at this address.\n\n${SITE.short}`, SITE.email.general);
  res.json({ ref });
});

// ---------- Newsletter ----------
publicRouter.post("/subscribe", rateLimit("subscribe", 10, 60 * 60 * 1000), (req, res) => {
  const email = str(req.body.email, 200).toLowerCase();
  if (!isEmail(email)) return res.status(422).json({ error: "validation", errors: { email: "Enter a valid email address." } });
  db.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").run(email);
  res.json({ ok: true });
});

// ---------- Public images (profile and board photos only) ----------
export function mediaHandler(req: Request, res: Response) {
  const name = String(req.params.file || "");
  if (!/^[a-f0-9]{32}\.(jpg|jpeg|png|webp)$/.test(name)) return res.status(404).send("Not found");
  const used = db.prepare("SELECT 1 FROM users WHERE photo = ? AND public_profile = 1 UNION SELECT 1 FROM people WHERE photo = ? UNION SELECT 1 FROM settings WHERE value = ?").get(name, name, name);
  if (!used || !fs.existsSync(filePath(name))) return res.status(404).send("Not found");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(filePath(name));
}

// ---------- PDF download (counted) ----------
export function downloadHandler(req: Request, res: Response) {
  const slug = String(req.params.slug || "").replace(/\.pdf$/, "");
  const r = db.prepare("SELECT id, title, pdf_file FROM publications WHERE slug = ? AND status = 'published'").get(slug) as any;
  if (!r || !r.pdf_file || !fs.existsSync(filePath(r.pdf_file))) return res.status(404).send("Not found");
  if (!/bot|crawl|spider/i.test(String(req.headers["user-agent"] || ""))) {
    db.prepare("UPDATE publications SET downloads = downloads + 1 WHERE id = ?").run(r.id);
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${slug}.pdf"`);
  res.setHeader("Cache-Control", "public, max-age=3600");
  fs.createReadStream(filePath(r.pdf_file)).pipe(res);
}
