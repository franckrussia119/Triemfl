import express, { type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { db, parseJSON, publicationRow, uniqueSlug, type Author } from "./db";
import { requireAdmin, checkCredentials, setSession, clearSession, isAdmin, adminConfigured, rateLimit } from "./auth";
import { uploader, verifyFile, removeFile, filePath, MAX_UPLOAD_MB } from "./uploads";
import { sendEmail, emailEnabled } from "./notify";
import { SITE } from "../src/lib/site";

export const adminRouter = express.Router();

const str = (v: unknown, max = 8000) => String(v ?? "").trim().slice(0, max);

export const SUBMISSION_STATUSES = ["submitted", "screening", "under-review", "revisions", "accepted", "rejected", "published", "withdrawn"];
const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted", screening: "Initial screening", "under-review": "Under peer review", revisions: "Revisions requested",
  accepted: "Accepted", rejected: "Not accepted", published: "Published", withdrawn: "Withdrawn",
};
const REQUEST_STATUSES = ["new", "in-progress", "closed"];

function withUpload(mw: express.RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) =>
    mw(req, res, (err: any) => {
      if (!err) return next();
      if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "file_too_large", maxMb: MAX_UPLOAD_MB });
      if (String(err.message).startsWith("unsupported_type")) return res.status(415).json({ error: "unsupported_type" });
      return res.status(400).json({ error: "upload_failed" });
    });
}

function sendStored(res: Response, stored: string, originalName: string) {
  const p = filePath(stored);
  if (!stored || !fs.existsSync(p)) return res.status(404).send("File not found");
  res.download(p, originalName || path.basename(p));
}

// ---------- Session ----------
adminRouter.get("/me", (req, res) => res.json({ authenticated: isAdmin(req), configured: adminConfigured(), emailEnabled: emailEnabled() }));

adminRouter.post("/login", rateLimit("login", 8, 15 * 60 * 1000), (req, res) => {
  if (!adminConfigured()) return res.status(503).json({ error: "not_configured" });
  if (!checkCredentials(str(req.body.user, 100), String(req.body.password ?? ""))) return res.status(401).json({ error: "invalid" });
  setSession(req, res);
  res.json({ ok: true });
});

adminRouter.post("/logout", (_req, res) => { clearSession(res); res.json({ ok: true }); });

adminRouter.use(requireAdmin);

// ---------- Overview ----------
adminRouter.get("/overview", (_req, res) => {
  const count = (sql: string) => (db.prepare(sql).get() as any).n;
  res.json({
    submissionsOpen: count("SELECT COUNT(*) n FROM submissions WHERE status IN ('submitted','screening','under-review','revisions','accepted')"),
    submissionsNew: count("SELECT COUNT(*) n FROM submissions WHERE status = 'submitted'"),
    publications: count("SELECT COUNT(*) n FROM publications WHERE status = 'published'"),
    drafts: count("SELECT COUNT(*) n FROM publications WHERE status = 'draft'"),
    requestsNew: count("SELECT COUNT(*) n FROM requests WHERE status = 'new'"),
    subscribers: count("SELECT COUNT(*) n FROM subscribers"),
    downloads: count("SELECT COALESCE(SUM(downloads),0) n FROM publications"),
    views: count("SELECT COALESCE(SUM(views),0) n FROM publications"),
  });
});

// ---------- Submissions (editorial workflow) ----------
adminRouter.get("/submissions", (_req, res) => {
  const rows = db.prepare("SELECT id, ref, type, title, authors, email, category, status, created_at, updated_at FROM submissions ORDER BY id DESC").all() as any[];
  res.json(rows.map((r) => ({ ...r, authors: parseJSON<Author[]>(r.authors, []) })));
});

adminRouter.get("/submissions/:id", (req, res) => {
  const s = db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.id) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  const events = db.prepare("SELECT * FROM submission_events WHERE submission_id = ? ORDER BY id").all(s.id);
  const pub = db.prepare("SELECT id, slug, status FROM publications WHERE submission_id = ?").get(s.id);
  res.json({ ...s, authors: parseJSON<Author[]>(s.authors, []), events, publication: pub || null });
});

adminRouter.get("/submissions/:id/file", (req, res) => {
  const s = db.prepare("SELECT file_path, file_name FROM submissions WHERE id = ?").get(req.params.id) as any;
  if (!s) return res.status(404).send("Not found");
  sendStored(res, s.file_path, s.file_name);
});

adminRouter.post("/submissions/:id/status", async (req, res) => {
  const s = db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.id) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  const status = str(req.body.status, 30);
  if (!SUBMISSION_STATUSES.includes(status)) return res.status(400).json({ error: "bad_status" });
  const message = str(req.body.message, 6000);
  const note = str(req.body.note, 6000);
  const notify = req.body.notify !== false;
  db.prepare("UPDATE submissions SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, s.id);
  db.prepare("INSERT INTO submission_events (submission_id, status, message, note) VALUES (?,?,?,?)").run(s.id, status, message, note);
  let emailed = false;
  if (notify && (message || status !== s.status)) {
    const name = parseJSON<Author[]>(s.authors, [])[0]?.name || "Author";
    emailed = await sendEmail(s.email, `Update on your submission ${s.ref}: ${STATUS_LABEL[status]}`,
      `Dear ${name},\n\nThe status of your manuscript "${s.title}" (${s.ref}) is now: ${STATUS_LABEL[status]}.\n\n${message ? message + "\n\n" : ""}You can follow your submission at ${SITE.url}/track.\n\nEditorial Office\n${SITE.short}`,
      SITE.email.editorial);
  }
  res.json({ ok: true, emailed });
});

adminRouter.delete("/submissions/:id", (req, res) => {
  const s = db.prepare("SELECT file_path FROM submissions WHERE id = ?").get(req.params.id) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  db.prepare("UPDATE publications SET submission_id = NULL WHERE submission_id = ?").run(req.params.id);
  db.prepare("DELETE FROM submissions WHERE id = ?").run(req.params.id);
  removeFile(s.file_path);
  res.json({ ok: true });
});

// Creates a draft publication from an accepted submission.
adminRouter.post("/submissions/:id/create-publication", (req, res) => {
  const s = db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.id) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  const existing = db.prepare("SELECT id FROM publications WHERE submission_id = ?").get(s.id) as any;
  if (existing) return res.json({ id: existing.id });
  let pdf = "";
  if (s.file_path.endsWith(".pdf") && fs.existsSync(filePath(s.file_path))) {
    pdf = "pub-" + path.basename(s.file_path);
    fs.copyFileSync(filePath(s.file_path), filePath(pdf));
  }
  const info = db.prepare(`INSERT INTO publications (slug, type, title, authors, abstract, keywords, jel_codes, category, published_date, series, pdf_file, status, submission_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,'draft',?)`).run(
    uniqueSlug(s.title), s.type, s.title, s.authors, s.abstract, s.keywords, s.jel_codes, s.category,
    new Date().toISOString().slice(0, 10), s.type === "Working Paper" ? SITE.publishing.seriesName : "", pdf, s.id);
  res.json({ id: Number(info.lastInsertRowid) });
});

// ---------- Publications ----------
adminRouter.get("/publications", (_req, res) => {
  res.json(db.prepare("SELECT * FROM publications ORDER BY id DESC").all().map((r) => publicationRow(r, { admin: true })));
});

adminRouter.get("/publications/:id", (req, res) => {
  const r = db.prepare("SELECT * FROM publications WHERE id = ?").get(req.params.id);
  if (!r) return res.status(404).json({ error: "not_found" });
  res.json(publicationRow(r, { admin: true }));
});

adminRouter.get("/publications/:id/file", (req, res) => {
  const r = db.prepare("SELECT slug, pdf_file FROM publications WHERE id = ?").get(req.params.id) as any;
  if (!r) return res.status(404).send("Not found");
  sendStored(res, r.pdf_file, `${r.slug}.pdf`);
});

function readPublicationFields(b: any) {
  const authors = parseJSON<Author[]>(b.authors || "[]", [])
    .map((a) => ({ name: str(a.name, 200), affiliation: str(a.affiliation, 300), orcid: str(a.orcid, 40) })).filter((a) => a.name);
  return {
    type: str(b.type, 40) || "Working Paper", title: str(b.title, 400), authors, abstract: str(b.abstract, 10000),
    keywords: str(b.keywords, 500), jel: str(b.jelCodes, 200), category: str(b.category, 80),
    date: str(b.publishedDate, 10), series: str(b.series, 200), number: str(b.number, 50), volume: str(b.volume, 20),
    issue: str(b.issue, 20), pages: str(b.pages, 30), doi: str(b.doi, 200).replace(/^https?:\/\/doi\.org\//, ""),
    status: b.status === "published" ? "published" : "draft", slug: str(b.slug, 90),
  };
}

function validatePublication(f: ReturnType<typeof readPublicationFields>, hasPdf: boolean) {
  const errors: Record<string, string> = {};
  if (f.title.length < 5) errors.title = "Enter the title.";
  if (!f.authors.length) errors.authors = "Add at least one author.";
  if (f.status === "published") {
    if (f.abstract.length < 50) errors.abstract = "Add the abstract before publishing.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) errors.publishedDate = "Set the publication date before publishing.";
    if (!hasPdf) errors.pdf = "Upload the final PDF before publishing.";
  }
  return errors;
}

const pdfUpload = withUpload(uploader(["pdf"]).single("pdf"));

adminRouter.post("/publications", pdfUpload, (req, res) => {
  const f = readPublicationFields(req.body);
  if (req.file && !verifyFile(req.file)) { removeFile(req.file.filename); return res.status(422).json({ error: "validation", errors: { pdf: "This is not a valid PDF file." } }); }
  const errors = validatePublication(f, !!req.file);
  if (Object.keys(errors).length) { removeFile(req.file?.filename); return res.status(422).json({ error: "validation", errors }); }
  const info = db.prepare(`INSERT INTO publications (slug, type, title, authors, abstract, keywords, jel_codes, category, published_date, series, number, volume, issue, pages, doi, pdf_file, status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    uniqueSlug(f.slug || f.title), f.type, f.title, JSON.stringify(f.authors), f.abstract, f.keywords, f.jel, f.category, f.date,
    f.series, f.number, f.volume, f.issue, f.pages, f.doi, req.file?.filename || "", f.status);
  res.json({ id: Number(info.lastInsertRowid) });
});

adminRouter.put("/publications/:id", pdfUpload, (req, res) => {
  const cur = db.prepare("SELECT * FROM publications WHERE id = ?").get(req.params.id) as any;
  if (!cur) { removeFile(req.file?.filename); return res.status(404).json({ error: "not_found" }); }
  const f = readPublicationFields(req.body);
  if (req.file && !verifyFile(req.file)) { removeFile(req.file.filename); return res.status(422).json({ error: "validation", errors: { pdf: "This is not a valid PDF file." } }); }
  const errors = validatePublication(f, !!req.file || !!cur.pdf_file);
  if (Object.keys(errors).length) { removeFile(req.file?.filename); return res.status(422).json({ error: "validation", errors }); }
  const slug = f.slug && f.slug !== cur.slug ? uniqueSlug(f.slug, cur.id) : cur.slug;
  db.prepare(`UPDATE publications SET slug=?, type=?, title=?, authors=?, abstract=?, keywords=?, jel_codes=?, category=?, published_date=?, series=?, number=?, volume=?, issue=?, pages=?, doi=?, pdf_file=?, status=?, updated_at=datetime('now') WHERE id=?`).run(
    slug, f.type, f.title, JSON.stringify(f.authors), f.abstract, f.keywords, f.jel, f.category, f.date, f.series, f.number, f.volume, f.issue, f.pages, f.doi,
    req.file ? req.file.filename : cur.pdf_file, f.status, cur.id);
  if (req.file && cur.pdf_file) removeFile(cur.pdf_file);
  // Publishing a paper that came from a submission marks the submission as published.
  if (f.status === "published" && cur.status !== "published" && cur.submission_id) {
    db.prepare("UPDATE submissions SET status='published', updated_at=datetime('now') WHERE id=?").run(cur.submission_id);
    db.prepare("INSERT INTO submission_events (submission_id, status, message) VALUES (?, 'published', ?)").run(cur.submission_id, `Your paper has been published: ${SITE.url}/research/${slug}`);
    const s = db.prepare("SELECT email, ref, title, authors FROM submissions WHERE id=?").get(cur.submission_id) as any;
    if (s) sendEmail(s.email, `Published: ${s.title}`, `Dear ${parseJSON<Author[]>(s.authors, [])[0]?.name || "Author"},\n\nYour paper "${s.title}" (${s.ref}) is now published and openly available at:\n${SITE.url}/research/${slug}\n\nThank you for publishing with ${SITE.short}.\n\nEditorial Office`, SITE.email.editorial);
  }
  res.json({ ok: true, slug });
});

adminRouter.delete("/publications/:id", (req, res) => {
  const cur = db.prepare("SELECT pdf_file FROM publications WHERE id = ?").get(req.params.id) as any;
  if (!cur) return res.status(404).json({ error: "not_found" });
  db.prepare("DELETE FROM publications WHERE id = ?").run(req.params.id);
  removeFile(cur.pdf_file);
  res.json({ ok: true });
});

// ---------- Requests inbox ----------
adminRouter.get("/requests", (_req, res) => {
  res.json(db.prepare("SELECT id, ref, kind, name, email, organization, subject, status, file_name, created_at FROM requests ORDER BY id DESC").all());
});
adminRouter.get("/requests/:id", (req, res) => {
  const r = db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id) as any;
  if (!r) return res.status(404).json({ error: "not_found" });
  res.json({ ...r, details: parseJSON(r.details, {}) });
});
adminRouter.get("/requests/:id/file", (req, res) => {
  const r = db.prepare("SELECT file_path, file_name FROM requests WHERE id = ?").get(req.params.id) as any;
  if (!r) return res.status(404).send("Not found");
  sendStored(res, r.file_path, r.file_name);
});
adminRouter.post("/requests/:id", (req, res) => {
  const status = str(req.body.status, 20);
  if (!REQUEST_STATUSES.includes(status)) return res.status(400).json({ error: "bad_status" });
  db.prepare("UPDATE requests SET status = ?, note = ?, updated_at = datetime('now') WHERE id = ?").run(status, str(req.body.note), req.params.id);
  res.json({ ok: true });
});
adminRouter.delete("/requests/:id", (req, res) => {
  const r = db.prepare("SELECT file_path FROM requests WHERE id = ?").get(req.params.id) as any;
  if (!r) return res.status(404).json({ error: "not_found" });
  db.prepare("DELETE FROM requests WHERE id = ?").run(req.params.id);
  removeFile(r.file_path);
  res.json({ ok: true });
});

// ---------- Subscribers ----------
adminRouter.get("/subscribers", (_req, res) => res.json(db.prepare("SELECT email, created_at FROM subscribers ORDER BY created_at DESC").all()));
adminRouter.get("/subscribers.csv", (_req, res) => {
  const rows = db.prepare("SELECT email, created_at FROM subscribers ORDER BY created_at").all() as any[];
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="triefml-subscribers.csv"');
  res.send("email,subscribed_at\n" + rows.map((r) => `${r.email},${r.created_at}`).join("\n"));
});
adminRouter.delete("/subscribers/:email", (req, res) => {
  db.prepare("DELETE FROM subscribers WHERE email = ?").run(req.params.email.toLowerCase());
  res.json({ ok: true });
});

// ---------- Announcements ----------
adminRouter.get("/announcements", (_req, res) => res.json(db.prepare("SELECT * FROM announcements ORDER BY date DESC, id DESC").all()));
adminRouter.post("/announcements", (req, res) => {
  const a = { kind: str(req.body.kind, 40) || "News", title: str(req.body.title, 300), body: str(req.body.body, 3000), date: str(req.body.date, 10), link: str(req.body.link, 500) };
  if (a.title.length < 3) return res.status(422).json({ error: "validation", errors: { title: "Enter a title." } });
  const id = req.body.id ? Number(req.body.id) : 0;
  if (id) db.prepare("UPDATE announcements SET kind=?, title=?, body=?, date=?, link=? WHERE id=?").run(a.kind, a.title, a.body, a.date, a.link, id);
  else db.prepare("INSERT INTO announcements (kind, title, body, date, link) VALUES (?,?,?,?,?)").run(a.kind, a.title, a.body, a.date, a.link);
  res.json({ ok: true });
});
adminRouter.delete("/announcements/:id", (req, res) => {
  db.prepare("DELETE FROM announcements WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});
