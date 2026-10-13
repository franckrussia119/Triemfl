import express from "express";
import fs from "fs";
import path from "path";
import { db, parseJSON, publicationRow, uniqueSlug, addFile, filesFor, logActivity, getSettings, type Author } from "./db";
import { requireRole, publicUser, issueToken, destroyAllSessions, type Role } from "./auth";
import { uploader, uploadedFiles, verifyAll, removeAll, removeFile, verifyFile, filePath, DOC_TYPES, IMAGE_TYPES } from "./uploads";
import { sendEmail, emailEnabled } from "./notify";
import { str, isEmail, withUpload, sendStored, sendFileRow, SUBMISSION_STATUS, PROJECT_STATUS, REVIEW_RECOMMENDATION } from "./common";
import { SITE } from "../src/lib/site";

export const adminRouter = express.Router();
adminRouter.use(requireRole("editor", "admin"));
const adminOnly = requireRole("admin");
const base = () => (process.env.PUBLIC_URL || SITE.url).replace(/\/$/, "");
const me = (req: express.Request) => req.user!.id;

// ================================================================ Overview
adminRouter.get("/overview", (_req, res) => {
  const n = (sql: string, ...a: any[]) => (db.prepare(sql).get(...a) as any).n;
  const attention = {
    newSubmissions: n("SELECT COUNT(*) n FROM submissions WHERE status = 'submitted'"),
    revisedSubmissions: n("SELECT COUNT(*) n FROM submissions WHERE status = 'revised'"),
    reviewsToRead: n(`SELECT COUNT(DISTINCT s.id) n FROM submissions s JOIN reviews r ON r.submission_id = s.id AND r.round = s.round
      WHERE s.status = 'under-review' AND r.status = 'submitted'`),
    reviewsOverdue: n("SELECT COUNT(*) n FROM reviews WHERE status IN ('invited','accepted') AND due_date <> '' AND due_date < date('now')"),
    newProjects: n("SELECT COUNT(*) n FROM requests WHERE kind = 'project-review' AND status = 'new'"),
    newMessages: n("SELECT COUNT(*) n FROM requests WHERE kind <> 'project-review' AND status = 'new'"),
    unreadReplies: n("SELECT COUNT(*) n FROM messages WHERE from_staff = 0 AND read_by_staff = 0"),
    pendingInstitutions: n("SELECT COUNT(*) n FROM users WHERE account_type = 'institution' AND status = 'pending'"),
    acceptedToPublish: n("SELECT COUNT(*) n FROM submissions WHERE status = 'accepted'"),
  };
  const totals = {
    users: n("SELECT COUNT(*) n FROM users WHERE role = 'user'"),
    institutions: n("SELECT COUNT(*) n FROM users WHERE account_type = 'institution' AND status = 'active'"),
    reviewers: n("SELECT COUNT(*) n FROM users WHERE role = 'reviewer'"),
    submissions: n("SELECT COUNT(*) n FROM submissions"),
    published: n("SELECT COUNT(*) n FROM publications WHERE status = 'published'"),
    projects: n("SELECT COUNT(*) n FROM requests WHERE kind = 'project-review'"),
    subscribers: n("SELECT COUNT(*) n FROM subscribers"),
    downloads: n("SELECT COALESCE(SUM(downloads),0) n FROM publications"),
    views: n("SELECT COALESCE(SUM(views),0) n FROM publications"),
  };
  const recent = db.prepare(`SELECT a.action, a.target_type, a.target_id, a.detail, a.created_at, u.name FROM activity a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 12`).all();
  res.json({ attention, totals, recent, emailEnabled: emailEnabled() });
});

// ================================================================ Submissions
adminRouter.get("/submissions", (_req, res) => {
  const rows = db.prepare(`SELECT s.id, s.ref, s.type, s.title, s.authors, s.email, s.category, s.status, s.round, s.created_at, s.updated_at,
      (SELECT COUNT(*) FROM reviews r WHERE r.submission_id = s.id AND r.round = s.round AND r.status = 'submitted') reviews_in,
      (SELECT COUNT(*) FROM reviews r WHERE r.submission_id = s.id AND r.round = s.round AND r.status IN ('invited','accepted','submitted')) reviews_total,
      (SELECT COUNT(*) FROM messages m WHERE m.thread_type='submission' AND m.thread_id = s.id AND m.from_staff = 0 AND m.read_by_staff = 0) unread
    FROM submissions s ORDER BY s.id DESC`).all() as any[];
  res.json(rows.map((r) => ({ ...r, authors: parseJSON<Author[]>(r.authors, []) })));
});

function staffThread(type: string, id: number) {
  db.prepare("UPDATE messages SET read_by_staff = 1 WHERE thread_type = ? AND thread_id = ? AND from_staff = 0").run(type, id);
  return (db.prepare(`SELECT m.id, m.body, m.from_staff, m.created_at, u.name author FROM messages m LEFT JOIN users u ON u.id = m.user_id
    WHERE m.thread_type = ? AND m.thread_id = ? ORDER BY m.id`).all(type, id) as any[])
    .map((m) => ({ id: m.id, body: m.body, fromStaff: !!m.from_staff, author: m.author || "Staff", createdAt: m.created_at, files: filesFor("message", m.id) }));
}

adminRouter.get("/submissions/:id", (req, res) => {
  const s = db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.id) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  const owner = s.user_id ? db.prepare("SELECT id, name, email, institution, country FROM users WHERE id = ?").get(s.user_id) : null;
  const reviews = db.prepare(`SELECT r.*, u.name reviewer_name, u.email reviewer_email, u.institution reviewer_institution FROM reviews r JOIN users u ON u.id = r.reviewer_id
    WHERE r.submission_id = ? ORDER BY r.round, r.id`).all(s.id) as any[];
  res.json({
    ...s, authors: parseJSON<Author[]>(s.authors, []), owner,
    events: db.prepare("SELECT * FROM submission_events WHERE submission_id = ? ORDER BY id").all(s.id),
    files: filesFor("submission", s.id), messages: staffThread("submission", s.id),
    reviews: reviews.map((r) => ({ ...r, scores: parseJSON(r.scores, {}) })),
    publication: db.prepare("SELECT id, slug, status FROM publications WHERE submission_id = ?").get(s.id) || null,
  });
});

adminRouter.get("/submissions/:id/files/:fid", (req, res) => sendFileRow(res, req.params.fid, "submission", Number(req.params.id)));
adminRouter.get("/files/:fid", (req, res) => {
  const f = db.prepare("SELECT path, name FROM files WHERE id = ?").get(req.params.fid) as any;
  if (!f) return res.status(404).send("Not found");
  sendStored(res, f.path, f.name);
});

adminRouter.post("/submissions/:id/status", async (req, res) => {
  const s = db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.id) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  const status = str(req.body.status, 30);
  if (!SUBMISSION_STATUS[status] || status === "published") return res.status(400).json({ error: "bad_status" });
  const message = str(req.body.message, 20000);
  const note = str(req.body.note, 6000);
  db.prepare("UPDATE submissions SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, s.id);
  db.prepare("INSERT INTO submission_events (submission_id, status, message, note) VALUES (?,?,?,?)").run(s.id, status, message, note);
  if (["rejected", "withdrawn", "accepted"].includes(status)) db.prepare("UPDATE reviews SET status = 'cancelled' WHERE submission_id = ? AND status IN ('invited','accepted')").run(s.id);
  logActivity(me(req), `submission_${status}`, "submission", s.id, s.ref);
  let emailed = false;
  if (req.body.notify !== false && (message || status !== s.status)) {
    const name = parseJSON<Author[]>(s.authors, [])[0]?.name || "Author";
    emailed = await sendEmail(s.email, `Update on your submission ${s.ref}: ${SUBMISSION_STATUS[status]}`,
      `Dear ${name},\n\nThe status of your manuscript "${s.title}" (${s.ref}) is now: ${SUBMISSION_STATUS[status]}.\n\n${message ? message + "\n\n" : ""}${s.user_id ? `Read the details and reply in your account: ${base()}/account/manuscripts/${s.id}` : `Follow it at ${base()}/track`}\n\nEditorial Office\n${SITE.short}`,
      SITE.email.editorial);
  }
  res.json({ ok: true, emailed });
});

adminRouter.delete("/submissions/:id", requireRole("admin"), (req, res) => {
  const s = db.prepare("SELECT id, ref FROM submissions WHERE id = ?").get(req.params.id) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  filesFor("submission", s.id).forEach((f) => { const row = db.prepare("SELECT path FROM files WHERE id = ?").get(f.id) as any; removeFile(row?.path); });
  db.prepare("DELETE FROM files WHERE owner_type = 'submission' AND owner_id = ?").run(s.id);
  db.prepare("UPDATE publications SET submission_id = NULL WHERE submission_id = ?").run(s.id);
  db.prepare("DELETE FROM messages WHERE thread_type = 'submission' AND thread_id = ?").run(s.id);
  db.prepare("DELETE FROM submissions WHERE id = ?").run(s.id);
  logActivity(me(req), "submission_deleted", "submission", s.id, s.ref);
  res.json({ ok: true });
});

const staffMsgUpload = withUpload(uploader(DOC_TYPES, 3).array("files", 3));
function staffPost(req: express.Request, res: express.Response, type: "submission" | "request") {
  const table = type === "submission" ? "submissions" : "requests";
  const t = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id) as any;
  const files = uploadedFiles(req);
  if (!t) { removeAll(files); return res.status(404).json({ error: "not_found" }); }
  if (!verifyAll(files)) { removeAll(files); return res.status(422).json({ error: "validation", errors: { files: "A file is damaged or not an accepted type." } }); }
  const body = str(req.body.body, 20000);
  if (!body && !files.length) return res.status(422).json({ error: "validation", errors: { body: "Write a message." } });
  const info = db.prepare("INSERT INTO messages (thread_type, thread_id, user_id, from_staff, body, read_by_staff) VALUES (?,?,?,1,?,1)").run(type, t.id, me(req), body);
  files.forEach((f) => addFile("message", Number(info.lastInsertRowid), "attachment", f, me(req)));
  if (type === "request" && req.body.awaitReply === "true") db.prepare("UPDATE requests SET status = 'awaiting-client', updated_at = datetime('now') WHERE id = ?").run(t.id);
  logActivity(me(req), "message_sent", type, t.id, t.ref);
  const link = t.user_id ? `${base()}/account/${type === "submission" ? "manuscripts" : "projects"}/${t.id}` : "";
  sendEmail(t.email, `New message about ${t.ref}`,
    `${body}\n\n${files.length ? `${files.length} file(s) attached in your account.\n\n` : ""}${link ? `Reply in your account: ${link}` : `Reply to this email to answer.`}\n\n${SITE.short}`, type === "submission" ? SITE.email.editorial : SITE.email.reviews)
    .then((ok) => res.json({ ok: true, emailed: ok }));
}
adminRouter.post("/submissions/:id/messages", staffMsgUpload, (req, res) => staffPost(req, res, "submission"));

// ---- Peer review assignments
adminRouter.get("/reviewers", (_req, res) => {
  res.json(db.prepare(`SELECT u.id, u.name, u.email, u.institution, u.expertise,
      (SELECT COUNT(*) FROM reviews r WHERE r.reviewer_id = u.id AND r.status IN ('invited','accepted')) active,
      (SELECT COUNT(*) FROM reviews r WHERE r.reviewer_id = u.id AND r.status = 'submitted') done
    FROM users u WHERE u.role IN ('reviewer','editor','admin') AND u.status = 'active' ORDER BY u.name`).all());
});

adminRouter.post("/submissions/:id/reviews", async (req, res) => {
  const s = db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.id) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  let reviewerId = Number(req.body.reviewerId || 0);
  let setupLink = "";
  // Invite a new reviewer by email: creates a reviewer account with a password-setup link.
  if (!reviewerId) {
    const email = str(req.body.email, 200).toLowerCase();
    const name = str(req.body.name, 150);
    if (!isEmail(email) || !name) return res.status(422).json({ error: "validation", errors: { email: "Enter the reviewer's name and a valid email." } });
    const existing = db.prepare("SELECT id, role FROM users WHERE email = ?").get(email) as any;
    if (existing) {
      reviewerId = existing.id;
      if (existing.role === "user") db.prepare("UPDATE users SET role = 'reviewer' WHERE id = ?").run(existing.id);
    } else {
      const info = db.prepare("INSERT INTO users (email, name, role, institution, email_verified, status) VALUES (?,?,?,?,1,'active')").run(email, name, "reviewer", str(req.body.institution, 300));
      reviewerId = Number(info.lastInsertRowid);
      setupLink = `${base()}/reset-password?token=${issueToken(reviewerId, "reset", 24 * 14)}&welcome=1`;
      logActivity(me(req), "reviewer_created", "user", reviewerId, email);
    }
  }
  const reviewer = db.prepare("SELECT id, name, email FROM users WHERE id = ?").get(reviewerId) as any;
  if (!reviewer) return res.status(404).json({ error: "reviewer_not_found" });
  if (db.prepare("SELECT 1 FROM reviews WHERE submission_id = ? AND reviewer_id = ? AND round = ? AND status <> 'cancelled'").get(s.id, reviewerId, s.round))
    return res.status(409).json({ error: "already_invited" });
  if (s.user_id === reviewerId) return res.status(422).json({ error: "validation", errors: { reviewerId: "Authors can't review their own manuscript." } });
  const due = str(req.body.dueDate, 10) || new Date(Date.now() + 21 * 864e5).toISOString().slice(0, 10);
  const info = db.prepare("INSERT INTO reviews (submission_id, reviewer_id, round, due_date) VALUES (?,?,?,?)").run(s.id, reviewerId, s.round, due);
  if (["submitted", "screening", "revised"].includes(s.status)) {
    db.prepare("UPDATE submissions SET status = 'under-review', updated_at = datetime('now') WHERE id = ?").run(s.id);
    db.prepare("INSERT INTO submission_events (submission_id, status, message) VALUES (?, 'under-review', ?)").run(s.id, "Your manuscript has been sent to independent reviewers.");
  }
  logActivity(me(req), "reviewer_invited", "submission", s.id, reviewer.name);
  const emailed = await sendEmail(reviewer.email, `Invitation to review for ${SITE.short}`,
    `Dear ${reviewer.name},\n\nThe editorial office of the ${SITE.name} invites you to review a manuscript:\n\n"${s.title}"\n\nAbstract:\n${s.abstract}\n\nPlease respond by signing in to your account${setupLink ? " (first, choose a password with this link: " + setupLink + ")" : ""}:\n${base()}/account/reviews/${info.lastInsertRowid}\n\nRequested by: ${due}. The review is double-blind: you will not see the authors' identities, and they will not see yours.\n\nThank you,\nEditorial Office`,
    SITE.email.editorial);
  res.json({ ok: true, emailed, setupLink: emailed ? "" : setupLink });
});

adminRouter.post("/reviews/:id/cancel", (req, res) => {
  db.prepare("UPDATE reviews SET status = 'cancelled' WHERE id = ? AND status IN ('invited','accepted')").run(req.params.id);
  logActivity(me(req), "review_cancelled", "review", Number(req.params.id));
  res.json({ ok: true });
});

// Builds the decision letter with reviewer comments for the author (anonymised).
adminRouter.get("/submissions/:id/decision-draft", (req, res) => {
  const s = db.prepare("SELECT round FROM submissions WHERE id = ?").get(req.params.id) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  const rv = db.prepare("SELECT recommendation, comments_author FROM reviews WHERE submission_id = ? AND round = ? AND status = 'submitted' ORDER BY id").all(req.params.id, s.round) as any[];
  res.json({ text: rv.map((r, i) => `Reviewer ${i + 1} (recommendation: ${REVIEW_RECOMMENDATION[r.recommendation] || r.recommendation})\n${r.comments_author}`).join("\n\n---\n\n") });
});

adminRouter.post("/submissions/:id/create-publication", (req, res) => {
  const s = db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.id) as any;
  if (!s) return res.status(404).json({ error: "not_found" });
  const existing = db.prepare("SELECT id FROM publications WHERE submission_id = ?").get(s.id) as any;
  if (existing) return res.json({ id: existing.id });
  const latest = db.prepare("SELECT path FROM files WHERE owner_type = 'submission' AND owner_id = ? AND kind = 'manuscript' ORDER BY version DESC, id DESC").get(s.id) as any;
  let pdf = "";
  if (latest?.path?.endsWith(".pdf") && fs.existsSync(filePath(latest.path))) {
    pdf = "pub-" + path.basename(latest.path);
    fs.copyFileSync(filePath(latest.path), filePath(pdf));
  }
  const info = db.prepare(`INSERT INTO publications (slug, type, title, authors, abstract, keywords, jel_codes, category, published_date, series, pdf_file, status, submission_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,'draft',?)`).run(uniqueSlug(s.title), s.type, s.title, s.authors, s.abstract, s.keywords, s.jel_codes, s.category,
    new Date().toISOString().slice(0, 10), s.type === "Working Paper" ? SITE.publishing.seriesName : "", pdf, s.id);
  logActivity(me(req), "publication_drafted", "publication", Number(info.lastInsertRowid), s.ref);
  res.json({ id: Number(info.lastInsertRowid) });
});

// ================================================================ Publications
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
  const authors = parseJSON<Author[]>(b.authors || "[]", []).map((a) => ({ name: str(a.name, 200), affiliation: str(a.affiliation, 300), orcid: str(a.orcid, 40) })).filter((a) => a.name);
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
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(uniqueSlug(f.slug || f.title), f.type, f.title, JSON.stringify(f.authors), f.abstract, f.keywords, f.jel, f.category, f.date,
    f.series, f.number, f.volume, f.issue, f.pages, f.doi, req.file?.filename || "", f.status);
  logActivity(me(req), f.status === "published" ? "publication_published" : "publication_created", "publication", Number(info.lastInsertRowid), f.title);
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
  db.prepare(`UPDATE publications SET slug=?, type=?, title=?, authors=?, abstract=?, keywords=?, jel_codes=?, category=?, published_date=?, series=?, number=?, volume=?, issue=?, pages=?, doi=?, pdf_file=?, status=?, updated_at=datetime('now') WHERE id=?`)
    .run(slug, f.type, f.title, JSON.stringify(f.authors), f.abstract, f.keywords, f.jel, f.category, f.date, f.series, f.number, f.volume, f.issue, f.pages, f.doi, req.file ? req.file.filename : cur.pdf_file, f.status, cur.id);
  if (req.file && cur.pdf_file) removeFile(cur.pdf_file);
  if (f.status === "published" && cur.status !== "published") {
    logActivity(me(req), "publication_published", "publication", cur.id, f.title);
    if (cur.submission_id) {
      db.prepare("UPDATE submissions SET status='published', updated_at=datetime('now') WHERE id=?").run(cur.submission_id);
      db.prepare("INSERT INTO submission_events (submission_id, status, message) VALUES (?, 'published', ?)").run(cur.submission_id, `Your paper has been published: ${base()}/research/${slug}`);
      const s = db.prepare("SELECT email, ref, title, authors FROM submissions WHERE id=?").get(cur.submission_id) as any;
      if (s) sendEmail(s.email, `Published: ${s.title}`, `Dear ${parseJSON<Author[]>(s.authors, [])[0]?.name || "Author"},\n\nYour paper "${s.title}" (${s.ref}) is now published and openly available at:\n${base()}/research/${slug}\n\nThank you for publishing with ${SITE.short}.\n\nEditorial Office`, SITE.email.editorial);
    }
  } else logActivity(me(req), "publication_updated", "publication", cur.id, f.title);
  res.json({ ok: true, slug });
});

adminRouter.delete("/publications/:id", adminOnly, (req, res) => {
  const cur = db.prepare("SELECT pdf_file, title FROM publications WHERE id = ?").get(req.params.id) as any;
  if (!cur) return res.status(404).json({ error: "not_found" });
  db.prepare("DELETE FROM publications WHERE id = ?").run(req.params.id);
  removeFile(cur.pdf_file);
  logActivity(me(req), "publication_deleted", "publication", Number(req.params.id), cur.title);
  res.json({ ok: true });
});

// ================================================================ Projects and messages (requests)
adminRouter.get("/requests", (_req, res) => {
  res.json(db.prepare(`SELECT r.id, r.ref, r.kind, r.name, r.email, r.organization, r.subject, r.status, r.division, r.user_id, r.created_at, r.updated_at,
      (SELECT COUNT(*) FROM files f WHERE f.owner_type='request' AND f.owner_id=r.id) files,
      (SELECT COUNT(*) FROM messages m WHERE m.thread_type='request' AND m.thread_id=r.id AND m.from_staff=0 AND m.read_by_staff=0) unread,
      u.name assignee FROM requests r LEFT JOIN users u ON u.id = r.assigned_to ORDER BY r.id DESC`).all());
});

adminRouter.get("/requests/:id", (req, res) => {
  const r = db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id) as any;
  if (!r) return res.status(404).json({ error: "not_found" });
  const owner = r.user_id ? db.prepare("SELECT id, name, email, institution, country, account_type, status FROM users WHERE id = ?").get(r.user_id) : null;
  res.json({ ...r, details: parseJSON(r.details, {}), owner, files: filesFor("request", r.id), messages: staffThread("request", r.id) });
});

adminRouter.post("/requests/:id", async (req, res) => {
  const r = db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id) as any;
  if (!r) return res.status(404).json({ error: "not_found" });
  const statuses = r.kind === "project-review" ? Object.keys(PROJECT_STATUS) : ["new", "in-progress", "closed"];
  const status = str(req.body.status, 30) || r.status;
  if (!statuses.includes(status)) return res.status(400).json({ error: "bad_status" });
  const assigned = req.body.assignedTo === undefined ? r.assigned_to : (Number(req.body.assignedTo) || null);
  db.prepare("UPDATE requests SET status = ?, note = ?, division = ?, assigned_to = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, str(req.body.note ?? r.note), str(req.body.division ?? r.division, 120), assigned, r.id);
  if (status !== r.status) {
    logActivity(me(req), `request_${status}`, "request", r.id, r.ref);
    if (r.kind === "project-review" && r.user_id)
      sendEmail(r.email, `${r.ref}: ${PROJECT_STATUS[status]}`, `Dear ${r.name},\n\nThe status of your project review request "${r.subject}" is now: ${PROJECT_STATUS[status]}.\n\nSee the details in your account: ${base()}/account/projects/${r.id}\n\n${SITE.short}`, SITE.email.reviews);
  }
  res.json({ ok: true });
});

adminRouter.post("/requests/:id/messages", staffMsgUpload, (req, res) => staffPost(req, res, "request"));

const reportUpload = withUpload(uploader(DOC_TYPES, 1).single("report"));
adminRouter.post("/requests/:id/report", reportUpload, async (req, res) => {
  const r = db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id) as any;
  const files = uploadedFiles(req);
  if (!r || r.kind !== "project-review") { removeAll(files); return res.status(404).json({ error: "not_found" }); }
  if (!files.length || !verifyAll(files)) { removeAll(files); return res.status(422).json({ error: "validation", errors: { report: "Attach the report (PDF or Word)." } }); }
  addFile("request", r.id, "report", files[0], me(req));
  db.prepare("UPDATE requests SET status = 'report-delivered', updated_at = datetime('now') WHERE id = ?").run(r.id);
  const note = str(req.body.message, 8000) || "Your evaluation report is ready. You can download it from this page.";
  db.prepare("INSERT INTO messages (thread_type, thread_id, user_id, from_staff, body, read_by_staff) VALUES ('request', ?, ?, 1, ?, 1)").run(r.id, me(req), note);
  logActivity(me(req), "report_delivered", "request", r.id, r.ref);
  const emailed = await sendEmail(r.email, `Your evaluation report is ready (${r.ref})`, `Dear ${r.name},\n\n${note}\n\n${r.user_id ? `Download it from your account: ${base()}/account/projects/${r.id}` : ""}\n\n${SITE.short}`, SITE.email.reviews);
  res.json({ ok: true, emailed });
});

adminRouter.delete("/requests/:id", adminOnly, (req, res) => {
  const r = db.prepare("SELECT id, ref FROM requests WHERE id = ?").get(req.params.id) as any;
  if (!r) return res.status(404).json({ error: "not_found" });
  (db.prepare("SELECT path FROM files WHERE owner_type='request' AND owner_id=?").all(r.id) as any[]).forEach((f) => removeFile(f.path));
  db.prepare("DELETE FROM files WHERE owner_type='request' AND owner_id=?").run(r.id);
  db.prepare("DELETE FROM messages WHERE thread_type='request' AND thread_id=?").run(r.id);
  db.prepare("DELETE FROM requests WHERE id = ?").run(r.id);
  logActivity(me(req), "request_deleted", "request", r.id, r.ref);
  res.json({ ok: true });
});

// ================================================================ Users
adminRouter.get("/users", (_req, res) => {
  res.json(db.prepare(`SELECT u.id, u.email, u.name, u.account_type, u.role, u.status, u.email_verified, u.institution, u.country, u.created_at, u.last_login_at,
      (SELECT COUNT(*) FROM submissions s WHERE s.user_id = u.id) submissions,
      (SELECT COUNT(*) FROM requests r WHERE r.user_id = u.id) requests
    FROM users u ORDER BY u.id DESC`).all());
});

adminRouter.get("/users/:id", (req, res) => {
  const u = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id) as any;
  if (!u) return res.status(404).json({ error: "not_found" });
  res.json({
    ...publicUser(u), lastLoginAt: u.last_login_at,
    submissions: db.prepare("SELECT id, ref, title, status, created_at FROM submissions WHERE user_id = ? ORDER BY id DESC").all(u.id),
    requests: db.prepare("SELECT id, ref, kind, subject, status, created_at FROM requests WHERE user_id = ? ORDER BY id DESC").all(u.id),
    reviews: db.prepare("SELECT r.id, r.status, r.recommendation, s.title, s.id submission_id FROM reviews r JOIN submissions s ON s.id = r.submission_id WHERE r.reviewer_id = ? ORDER BY r.id DESC").all(u.id),
    activity: db.prepare("SELECT action, target_type, detail, created_at FROM activity WHERE user_id = ? ORDER BY id DESC LIMIT 20").all(u.id),
  });
});

adminRouter.post("/users/:id", adminOnly, async (req, res) => {
  const u = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id) as any;
  if (!u) return res.status(404).json({ error: "not_found" });
  const role = (str(req.body.role, 20) || u.role) as Role;
  const status = str(req.body.status, 20) || u.status;
  if (!["user", "reviewer", "editor", "admin"].includes(role) || !["active", "pending", "suspended"].includes(status)) return res.status(400).json({ error: "bad_value" });
  if (u.id === me(req) && (role !== "admin" || status !== "active")) return res.status(422).json({ error: "validation", errors: { role: "You can't remove your own administrator access." } });
  db.prepare("UPDATE users SET role = ?, status = ?, updated_at = datetime('now') WHERE id = ?").run(role, status, u.id);
  if (status === "suspended") destroyAllSessions(u.id);
  if (role !== u.role) logActivity(me(req), "user_role_changed", "user", u.id, `${u.email}: ${u.role} → ${role}`);
  if (status !== u.status) {
    logActivity(me(req), `user_${status}`, "user", u.id, u.email);
    if (u.status === "pending" && status === "active" && u.account_type === "institution")
      sendEmail(u.email, `Your ${SITE.short} institution account is approved`, `Dear ${u.name},\n\nThe account for ${u.institution} has been approved. You can now submit projects for review:\n${base()}/account\n\n${SITE.short}`, SITE.email.general);
  }
  res.json({ ok: true });
});

adminRouter.post("/users/:id/reset-link", adminOnly, async (req, res) => {
  const u = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(req.params.id) as any;
  if (!u) return res.status(404).json({ error: "not_found" });
  const link = `${base()}/reset-password?token=${issueToken(u.id, "reset", 48)}`;
  const emailed = await sendEmail(u.email, `Set your ${SITE.short} password`, `Dear ${u.name},\n\nUse this link to choose a new password (valid for 48 hours):\n\n${link}\n\n${SITE.short}`);
  logActivity(me(req), "reset_link_issued", "user", u.id, u.email);
  res.json({ link, emailed });
});

adminRouter.post("/users", adminOnly, async (req, res) => {
  const email = str(req.body.email, 200).toLowerCase();
  const name = str(req.body.name, 150);
  const role = str(req.body.role, 20) as Role;
  if (!isEmail(email) || !name || !["user", "reviewer", "editor", "admin"].includes(role)) return res.status(422).json({ error: "validation", errors: { email: "Enter a name, a valid email and a role." } });
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) return res.status(422).json({ error: "validation", errors: { email: "An account with this email already exists." } });
  const info = db.prepare("INSERT INTO users (email, name, role, institution, email_verified, status) VALUES (?,?,?,?,1,'active')").run(email, name, role, str(req.body.institution, 300));
  const id = Number(info.lastInsertRowid);
  const link = `${base()}/reset-password?token=${issueToken(id, "reset", 24 * 7)}&welcome=1`;
  const emailed = await sendEmail(email, `Your ${SITE.short} account`, `Dear ${name},\n\nAn account has been created for you on the ${SITE.name} platform.\n\nChoose your password with this link (valid 7 days):\n${link}\n\n${SITE.short}`);
  logActivity(me(req), "user_created", "user", id, `${email} (${role})`);
  res.json({ id, link, emailed });
});

// ================================================================ Site content (admin only)
adminRouter.get("/settings", (_req, res) => res.json(getSettings()));
adminRouter.put("/settings", adminOnly, (req, res) => {
  const allowed = ["hero_title", "hero_topics", "hero_intro", "mission", "vision", "about_history", "call_for_papers"];
  const up = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  const del = db.prepare("DELETE FROM settings WHERE key = ?");
  for (const k of allowed) if (k in req.body) { const v = str(req.body[k], 6000); v ? up.run(k, v) : del.run(k); }
  logActivity(me(req), "site_texts_updated", "settings", null);
  res.json({ ok: true, settings: getSettings() });
});

adminRouter.get("/people", (_req, res) => res.json((db.prepare("SELECT * FROM people ORDER BY grp, sort, id").all() as any[]).map((p) => ({ ...p, photo: p.photo ? `/media/${p.photo}` : "" }))));
const personPhoto = withUpload(uploader(IMAGE_TYPES, 1, 5).single("photo"));
adminRouter.post("/people", adminOnly, personPhoto, (req, res) => {
  const files = uploadedFiles(req);
  if (!verifyAll(files)) { removeAll(files); return res.status(422).json({ error: "validation", errors: { photo: "Use a JPG, PNG or WebP image." } }); }
  const b = req.body;
  const d = { grp: b.grp === "advisory" ? "advisory" : "board", name: str(b.name, 150), role: str(b.role, 150), affiliation: str(b.affiliation, 300), orcid: str(b.orcid, 19), bio: str(b.bio, 2000), sort: Number(b.sort) || 0 };
  if (!d.name) { removeAll(files); return res.status(422).json({ error: "validation", errors: { name: "Enter the person's name." } }); }
  const id = Number(b.id) || 0;
  if (id) {
    const cur = db.prepare("SELECT photo FROM people WHERE id = ?").get(id) as any;
    if (!cur) { removeAll(files); return res.status(404).json({ error: "not_found" }); }
    const photo = files[0]?.filename || (b.removePhoto === "true" ? "" : cur.photo);
    if ((files[0] || b.removePhoto === "true") && cur.photo) removeFile(cur.photo);
    db.prepare("UPDATE people SET grp=?, name=?, role=?, affiliation=?, orcid=?, bio=?, sort=?, photo=? WHERE id=?").run(d.grp, d.name, d.role, d.affiliation, d.orcid, d.bio, d.sort, photo, id);
  } else {
    db.prepare("INSERT INTO people (grp, name, role, affiliation, orcid, bio, sort, photo) VALUES (?,?,?,?,?,?,?,?)").run(d.grp, d.name, d.role, d.affiliation, d.orcid, d.bio, d.sort, files[0]?.filename || "");
  }
  logActivity(me(req), id ? "person_updated" : "person_added", "people", id || null, d.name);
  res.json({ ok: true });
});
adminRouter.delete("/people/:id", adminOnly, (req, res) => {
  const p = db.prepare("SELECT photo, name FROM people WHERE id = ?").get(req.params.id) as any;
  if (!p) return res.status(404).json({ error: "not_found" });
  db.prepare("DELETE FROM people WHERE id = ?").run(req.params.id);
  removeFile(p.photo);
  logActivity(me(req), "person_removed", "people", Number(req.params.id), p.name);
  res.json({ ok: true });
});

// ================================================================ Subscribers, announcements, activity
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

adminRouter.get("/announcements", (_req, res) => res.json(db.prepare("SELECT * FROM announcements ORDER BY date DESC, id DESC").all()));
adminRouter.post("/announcements", (req, res) => {
  const a = { kind: str(req.body.kind, 40) || "News", title: str(req.body.title, 300), body: str(req.body.body, 3000), date: str(req.body.date, 10), link: str(req.body.link, 500) };
  if (a.title.length < 3) return res.status(422).json({ error: "validation", errors: { title: "Enter a title." } });
  const id = req.body.id ? Number(req.body.id) : 0;
  if (id) db.prepare("UPDATE announcements SET kind=?, title=?, body=?, date=?, link=? WHERE id=?").run(a.kind, a.title, a.body, a.date, a.link, id);
  else db.prepare("INSERT INTO announcements (kind, title, body, date, link) VALUES (?,?,?,?,?)").run(a.kind, a.title, a.body, a.date, a.link);
  logActivity(me(req), id ? "announcement_updated" : "announcement_posted", "announcement", id || null, a.title);
  res.json({ ok: true });
});
adminRouter.delete("/announcements/:id", (req, res) => {
  db.prepare("DELETE FROM announcements WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

adminRouter.get("/activity", (_req, res) => {
  res.json(db.prepare(`SELECT a.id, a.action, a.target_type, a.target_id, a.detail, a.created_at, u.name, u.email FROM activity a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 300`).all());
});

