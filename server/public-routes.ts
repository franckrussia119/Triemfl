import express, { type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import { db, makeRef, parseJSON, publicationRow, type Author } from "./db";
import { notifyStaff, sendEmail, esc, emailEnabled } from "./notify";
import { rateLimit } from "./auth";
import { uploader, verifyFile, removeFile, filePath, MAX_UPLOAD_MB } from "./uploads";
import { SITE } from "../src/lib/site";

export const publicRouter = express.Router();

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const str = (v: unknown, max = 5000) => String(v ?? "").trim().slice(0, max);

// Wraps multer so upload errors return clean JSON instead of crashing.
function withUpload(mw: express.RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) =>
    mw(req, res, (err: any) => {
      if (!err) return next();
      if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "file_too_large", maxMb: MAX_UPLOAD_MB });
      if (String(err.message).startsWith("unsupported_type")) return res.status(415).json({ error: "unsupported_type", allowed: String(err.message).split(":")[1] });
      return res.status(400).json({ error: "upload_failed" });
    });
}

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

// ---------- Manuscript submission ----------
publicRouter.post(
  "/submissions",
  rateLimit("submit", 6, 60 * 60 * 1000),
  withUpload(uploader(["pdf", "docx", "doc"]).single("manuscript")),
  async (req, res) => {
    const b = req.body;
    const file = req.file;
    const authors = parseJSON<Author[]>(b.authors || "[]", []).map((a) => ({ name: str(a.name, 200), affiliation: str(a.affiliation, 300), orcid: str(a.orcid, 40) })).filter((a) => a.name);
    const data = {
      type: str(b.type, 40), title: str(b.title, 400), abstract: str(b.abstract, 4000), keywords: str(b.keywords, 400),
      jel: str(b.jelCodes, 200), category: str(b.category, 80), cover: str(b.coverLetter, 6000), email: str(b.email, 200),
    };
    const errors: Record<string, string> = {};
    if (!authors.length) errors.authors = "Add at least one author.";
    if (!isEmail(data.email)) errors.email = "Enter a valid email address for correspondence.";
    if (data.title.length < 5) errors.title = "Enter the full title.";
    if (data.abstract.length < 50) errors.abstract = "The abstract must be at least 50 characters.";
    if (!file) errors.manuscript = "Attach the manuscript (PDF or Word).";
    if (b.declarations !== "accepted") errors.declarations = "Confirm all three declarations.";
    if (file && !verifyFile(file)) errors.manuscript = "The file appears to be damaged or is not a real PDF/Word document.";
    if (Object.keys(errors).length) { removeFile(file?.filename); return res.status(422).json({ error: "validation", errors }); }

    const ref = makeRef("TRIEFML-MS");
    const info = db.prepare(`INSERT INTO submissions (ref, type, title, abstract, keywords, jel_codes, category, cover_letter, authors, email, file_path, file_name)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(ref, data.type || "Working Paper", data.title, data.abstract, data.keywords, data.jel, data.category, data.cover, JSON.stringify(authors), data.email, file!.filename, file!.originalname.slice(0, 200));
    db.prepare("INSERT INTO submission_events (submission_id, status, message) VALUES (?, 'submitted', ?)").run(info.lastInsertRowid, "Manuscript received. The editorial office will complete an initial screening.");

    notifyStaff(`<b>New manuscript</b> ${esc(ref)}\n<b>${esc(data.title)}</b>\n${esc(authors.map((a) => a.name).join(", "))}\n${esc(data.type)} · ${esc(data.category)}\nReply to: ${esc(data.email)}\n\nOpen the admin portal to review it.`);
    sendEmail(data.email, `Submission received: ${ref}`,
      `Dear ${authors[0].name},\n\nThank you for submitting "${data.title}" to the ${SITE.name}.\n\nYour reference number is ${ref}. Keep it to follow the status of your manuscript at ${SITE.url}/track.\n\nThe editorial office will complete an initial screening and contact you at this address.\n\nEditorial Office\n${SITE.short}`,
      SITE.email.editorial);

    res.json({ ref, emailSent: emailEnabled() });
  },
);

publicRouter.post("/submissions/track", rateLimit("track", 30, 15 * 60 * 1000), (req, res) => {
  const ref = str(req.body.ref, 40).toUpperCase();
  const email = str(req.body.email, 200).toLowerCase();
  const s = db.prepare("SELECT * FROM submissions WHERE ref = ? AND lower(email) = ?").get(ref, email) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  const events = db.prepare("SELECT status, message, created_at FROM submission_events WHERE submission_id = ? AND (message <> '' OR status = 'submitted') ORDER BY id").all(s.id);
  const pub = db.prepare("SELECT slug FROM publications WHERE submission_id = ? AND status = 'published'").get(s.id) as any;
  res.json({ ref: s.ref, title: s.title, status: s.status, submittedAt: s.created_at, events, publicationSlug: pub?.slug || null });
});

// ---------- Project review, consulting and contact requests ----------
const KINDS: Record<string, { label: string; prefix: string; withFile: boolean }> = {
  "project-review": { label: "Project review request", prefix: "TRIEFML-PR", withFile: true },
  consulting: { label: "Consulting inquiry", prefix: "TRIEFML-CO", withFile: false },
  contact: { label: "Contact message", prefix: "TRIEFML-CT", withFile: false },
};

publicRouter.post(
  "/requests",
  rateLimit("request", 8, 60 * 60 * 1000),
  withUpload(uploader(["pdf", "docx", "doc", "xlsx", "pptx"]).single("document")),
  async (req, res) => {
    const b = req.body;
    const kind = KINDS[b.kind];
    const file = req.file;
    if (!kind) { removeFile(file?.filename); return res.status(400).json({ error: "bad_kind" }); }
    if (file && (!kind.withFile || !verifyFile(file))) { removeFile(file.filename); return res.status(422).json({ error: "validation", errors: { document: "This file type isn't accepted or the file is damaged." } }); }

    const d = { name: str(b.name, 200), email: str(b.email, 200), org: str(b.organization, 300), subject: str(b.subject, 300), message: str(b.message, 8000) };
    const details = parseJSON<Record<string, string>>(b.details || "{}", {});
    const errors: Record<string, string> = {};
    if (!d.name) errors.name = "Enter your name.";
    if (!isEmail(d.email)) errors.email = "Enter a valid email address.";
    if (d.message.length < 20) errors.message = "Describe your request in at least 20 characters.";
    if (b.company) return res.json({ ref: "OK" }); // honeypot
    if (Object.keys(errors).length) { removeFile(file?.filename); return res.status(422).json({ error: "validation", errors }); }

    const ref = makeRef(kind.prefix);
    db.prepare("INSERT INTO requests (ref, kind, name, email, organization, subject, message, details, file_path, file_name) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .run(ref, b.kind, d.name, d.email, d.org, d.subject, d.message, JSON.stringify(details), file?.filename || "", file?.originalname.slice(0, 200) || "");

    const detailLines = Object.entries(details).filter(([, v]) => v).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join("\n");
    notifyStaff(`<b>${esc(kind.label)}</b> ${esc(ref)}\n${esc(d.name)}${d.org ? " · " + esc(d.org) : ""}\n${esc(d.email)}\n${d.subject ? "<b>" + esc(d.subject) + "</b>\n" : ""}${detailLines ? detailLines + "\n" : ""}\n${esc(d.message.slice(0, 1500))}${file ? "\n\n📎 Document attached (see admin portal)" : ""}`);
    sendEmail(d.email, `We received your ${kind.label.toLowerCase()} (${ref})`,
      `Dear ${d.name},\n\nThank you for contacting the ${SITE.name}. Your reference is ${ref}.\n\nA member of our team will reply to you at this address.\n\n${SITE.short}`, SITE.email.general);

    res.json({ ref });
  },
);

// ---------- Newsletter ----------
publicRouter.post("/subscribe", rateLimit("subscribe", 10, 60 * 60 * 1000), (req, res) => {
  const email = str(req.body.email, 200).toLowerCase();
  if (!isEmail(email)) return res.status(422).json({ error: "validation", errors: { email: "Enter a valid email address." } });
  db.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").run(email);
  res.json({ ok: true });
});

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
