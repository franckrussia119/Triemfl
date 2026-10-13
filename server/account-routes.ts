import express from "express";
import { db, makeRef, parseJSON, addFile, filesFor, logActivity, type Author } from "./db";
import {
  createSession, destroySession, destroyAllSessions, hashPassword, verifyPassword, passwordProblem, requireUser, rateLimit,
  issueToken, consumeToken, publicUser, isStaff, type User,
} from "./auth";
import { notifyStaff, sendEmail, emailEnabled, esc } from "./notify";
import { uploader, uploadedFiles, verifyAll, removeAll, removeFile, filePath, DOC_TYPES, IMAGE_TYPES } from "./uploads";
import { isEmail, str, withUpload, sendFileRow, SUBMISSION_STATUS, PROJECT_STATUS } from "./common";
import { SITE } from "../src/lib/site";

export const accountRouter = express.Router();

const base = () => (process.env.PUBLIC_URL || SITE.url).replace(/\/$/, "");

function sendVerification(u: { id: number; email: string; name: string }) {
  const token = issueToken(u.id, "verify", 72);
  return sendEmail(u.email, `Confirm your email for ${SITE.short}`,
    `Dear ${u.name},\n\nConfirm your email address to activate your ${SITE.short} account:\n\n${base()}/verify?token=${token}\n\nThis link is valid for 3 days. If you didn't create an account, ignore this email.\n\n${SITE.name}`);
}

// ---------------------------------------------------------------- Auth
accountRouter.get("/me", (req, res) => {
  if (!req.user) return res.json({ user: null, emailEnabled: emailEnabled() });
  const u = req.user;
  const counts = {
    unread: (db.prepare(`SELECT COUNT(*) n FROM messages m WHERE m.from_staff = 1 AND m.read_by_owner = 0 AND (
      (m.thread_type='submission' AND m.thread_id IN (SELECT id FROM submissions WHERE user_id = ?)) OR
      (m.thread_type='request' AND m.thread_id IN (SELECT id FROM requests WHERE user_id = ?)))`).get(u.id, u.id) as any).n,
    pendingReviews: (db.prepare("SELECT COUNT(*) n FROM reviews WHERE reviewer_id = ? AND status IN ('invited','accepted')").get(u.id) as any).n,
  };
  res.json({ user: publicUser(u), counts, emailEnabled: emailEnabled() });
});

accountRouter.post("/signup", rateLimit("signup", 5, 60 * 60 * 1000), async (req, res) => {
  const b = req.body;
  const d = { email: str(b.email, 200).toLowerCase(), password: String(b.password ?? ""), name: str(b.name, 150), type: b.accountType === "institution" ? "institution" : "researcher",
    institution: str(b.institution, 300), country: str(b.country, 100), position: str(b.position, 150) };
  const errors: Record<string, string> = {};
  if (!d.name) errors.name = d.type === "institution" ? "Enter the contact person's full name." : "Enter your full name.";
  if (!isEmail(d.email)) errors.email = "Enter a valid email address.";
  const pw = passwordProblem(d.password); if (pw) errors.password = pw;
  if (d.type === "institution" && !d.institution) errors.institution = "Enter the name of the institution.";
  if (b.terms !== true) errors.terms = "Accept the terms to create an account.";
  if (!errors.email && db.prepare("SELECT 1 FROM users WHERE email = ?").get(d.email)) errors.email = "An account already exists with this email. Sign in, or reset your password.";
  if (Object.keys(errors).length) return res.status(422).json({ error: "validation", errors });

  const verified = emailEnabled() ? 0 : 1; // without email delivery, verification can't happen
  const status = d.type === "institution" ? "pending" : "active";
  const info = db.prepare("INSERT INTO users (email, password_hash, name, account_type, status, email_verified, institution, country, position) VALUES (?,?,?,?,?,?,?,?,?)")
    .run(d.email, hashPassword(d.password), d.name, d.type, status, verified, d.institution, d.country, d.position);
  const id = Number(info.lastInsertRowid);
  logActivity(id, "signed_up", "user", id, d.type);
  if (!verified) await sendVerification({ id, email: d.email, name: d.name });
  if (d.type === "institution") notifyStaff(`<b>New institution account to approve</b>\n${esc(d.institution)}\n${esc(d.name)} · ${esc(d.email)}${d.country ? " · " + esc(d.country) : ""}`);
  createSession(req, res, id);
  res.json({ ok: true, needsVerification: !verified, pendingApproval: status === "pending" });
});

accountRouter.post("/signin", rateLimit("signin", 10, 15 * 60 * 1000), (req, res) => {
  const email = str(req.body.email, 200).toLowerCase();
  const u = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!u || !u.password_hash || !verifyPassword(String(req.body.password ?? ""), u.password_hash)) return res.status(401).json({ error: "invalid" });
  if (u.status === "suspended") return res.status(403).json({ error: "suspended" });
  createSession(req, res, u.id);
  logActivity(u.id, "signed_in", "user", u.id);
  res.json({ ok: true, role: u.role });
});

accountRouter.post("/signout", (req, res) => { destroySession(req, res); res.json({ ok: true }); });

accountRouter.post("/verify", (req, res) => {
  const id = consumeToken(str(req.body.token, 200), "verify");
  if (!id) return res.status(400).json({ error: "invalid_token" });
  db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(id);
  logActivity(id, "email_verified", "user", id);
  res.json({ ok: true });
});

accountRouter.post("/resend-verification", requireUser, rateLimit("resend", 3, 60 * 60 * 1000), async (req, res) => {
  if (req.user!.email_verified) return res.json({ ok: true });
  res.json({ ok: await sendVerification(req.user!) });
});

accountRouter.post("/forgot", rateLimit("forgot", 5, 60 * 60 * 1000), async (req, res) => {
  const email = str(req.body.email, 200).toLowerCase();
  const u = db.prepare("SELECT id, name, email FROM users WHERE email = ? AND status <> 'suspended'").get(email) as any;
  if (u) {
    const token = issueToken(u.id, "reset", 2);
    await sendEmail(u.email, `Reset your ${SITE.short} password`,
      `Dear ${u.name},\n\nUse this link to choose a new password:\n\n${base()}/reset-password?token=${token}\n\nThe link is valid for 2 hours. If you didn't ask for this, ignore this email; your password hasn't changed.\n\n${SITE.name}`);
  }
  res.json({ ok: true, emailEnabled: emailEnabled() }); // same answer whether or not the account exists
});

accountRouter.post("/reset", rateLimit("reset", 10, 60 * 60 * 1000), (req, res) => {
  const pw = String(req.body.password ?? "");
  const problem = passwordProblem(pw);
  if (problem) return res.status(422).json({ error: "validation", errors: { password: problem } });
  const id = consumeToken(str(req.body.token, 200), "reset");
  if (!id) return res.status(400).json({ error: "invalid_token" });
  db.prepare("UPDATE users SET password_hash = ?, email_verified = 1, updated_at = datetime('now') WHERE id = ?").run(hashPassword(pw), id);
  destroyAllSessions(id);
  createSession(req, res, id);
  logActivity(id, "password_reset", "user", id);
  res.json({ ok: true });
});

// Everything below needs a signed-in user.
accountRouter.use(requireUser);

// ---------------------------------------------------------------- Profile
const photoUpload = withUpload(uploader(IMAGE_TYPES, 1, 5).single("photo"));
accountRouter.put("/profile", photoUpload, (req, res) => {
  const u = req.user!;
  const b = req.body;
  const files = uploadedFiles(req);
  if (!verifyAll(files)) { removeAll(files); return res.status(422).json({ error: "validation", errors: { photo: "Use a JPG, PNG or WebP image." } }); }
  const name = str(b.name, 150);
  if (!name) { removeAll(files); return res.status(422).json({ error: "validation", errors: { name: "Enter your name." } }); }
  const orcid = str(b.orcid, 19);
  if (orcid && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcid)) { removeAll(files); return res.status(422).json({ error: "validation", errors: { orcid: "ORCID iDs look like 0000-0002-1825-0097." } }); }
  const photo = files[0]?.filename || (b.removePhoto === "true" ? "" : u.photo);
  if ((files[0] || b.removePhoto === "true") && u.photo) removeFile(u.photo);
  db.prepare(`UPDATE users SET name=?, title=?, institution=?, position=?, country=?, orcid=?, bio=?, expertise=?, phone=?, website=?, public_profile=?, photo=?, updated_at=datetime('now') WHERE id=?`)
    .run(name, str(b.title, 30), str(b.institution, 300), str(b.position, 150), str(b.country, 100), orcid, str(b.bio, 2000), str(b.expertise, 500), str(b.phone, 40), str(b.website, 300), b.publicProfile === "false" ? 0 : 1, photo, u.id);
  res.json({ user: publicUser(db.prepare("SELECT * FROM users WHERE id = ?").get(u.id)) });
});

accountRouter.put("/password", (req, res) => {
  const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(req.user!.id) as any;
  if (!verifyPassword(String(req.body.current ?? ""), row.password_hash)) return res.status(422).json({ error: "validation", errors: { current: "Your current password is incorrect." } });
  const problem = passwordProblem(String(req.body.password ?? ""));
  if (problem) return res.status(422).json({ error: "validation", errors: { password: problem } });
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(String(req.body.password)), req.user!.id);
  destroyAllSessions(req.user!.id);
  createSession(req, res, req.user!.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- Messages (shared helper)
function threadMessages(type: string, id: number, markReadForOwner: boolean) {
  const rows = db.prepare(`SELECT m.id, m.body, m.from_staff, m.created_at, u.name author FROM messages m LEFT JOIN users u ON u.id = m.user_id
    WHERE m.thread_type = ? AND m.thread_id = ? ORDER BY m.id`).all(type, id) as any[];
  if (markReadForOwner) db.prepare("UPDATE messages SET read_by_owner = 1 WHERE thread_type = ? AND thread_id = ? AND from_staff = 1").run(type, id);
  return rows.map((m) => ({ id: m.id, body: m.body, fromStaff: !!m.from_staff, author: m.from_staff ? `${SITE.short} ${type === "submission" ? "Editorial Office" : "Team"}` : m.author, createdAt: m.created_at, files: filesFor("message", m.id) }));
}

function postMessage(req: express.Request, res: express.Response, type: "submission" | "request", threadId: number, title: string, ref: string) {
  const files = uploadedFiles(req);
  if (!verifyAll(files)) { removeAll(files); return res.status(422).json({ error: "validation", errors: { files: "One of the files is damaged or not an accepted type." } }); }
  const body = str(req.body.body, 8000);
  if (!body && !files.length) return res.status(422).json({ error: "validation", errors: { body: "Write a message or attach a file." } });
  const info = db.prepare("INSERT INTO messages (thread_type, thread_id, user_id, from_staff, body, read_by_owner) VALUES (?,?,?,0,?,1)").run(type, threadId, req.user!.id, body);
  const mid = Number(info.lastInsertRowid);
  files.forEach((f) => addFile("message", mid, "attachment", f, req.user!.id));
  notifyStaff(`<b>New message</b> on ${esc(ref)}\n${esc(title)}\nFrom ${esc(req.user!.name)}\n\n${esc(body.slice(0, 800))}${files.length ? `\n📎 ${files.length} file(s)` : ""}`);
  res.json({ ok: true });
}

// ---------------------------------------------------------------- My manuscripts
const msUpload = withUpload(uploader(["pdf", "docx", "doc"], 1).single("manuscript"));

accountRouter.get("/submissions", (req, res) => {
  const rows = db.prepare(`SELECT s.id, s.ref, s.type, s.title, s.status, s.created_at, s.updated_at,
      (SELECT COUNT(*) FROM messages m WHERE m.thread_type='submission' AND m.thread_id=s.id AND m.from_staff=1 AND m.read_by_owner=0) unread,
      (SELECT slug FROM publications p WHERE p.submission_id = s.id AND p.status='published') slug
    FROM submissions s WHERE s.user_id = ? ORDER BY s.id DESC`).all(req.user!.id);
  res.json(rows);
});

accountRouter.post("/submissions", rateLimit("submit", 10, 60 * 60 * 1000), msUpload, (req, res) => {
  const u = req.user!;
  const b = req.body;
  const files = uploadedFiles(req);
  const file = files[0];
  const authors = parseJSON<Author[]>(b.authors || "[]", []).map((a) => ({ name: str(a.name, 200), affiliation: str(a.affiliation, 300), orcid: str(a.orcid, 40) })).filter((a) => a.name);
  const d = { type: str(b.type, 40) || "Working Paper", title: str(b.title, 400), abstract: str(b.abstract, 4000), keywords: str(b.keywords, 400), jel: str(b.jelCodes, 200), category: str(b.category, 80), cover: str(b.coverLetter, 6000) };
  const errors: Record<string, string> = {};
  if (!authors.length) errors.authors = "Add at least one author.";
  if (d.title.length < 5) errors.title = "Enter the full title.";
  if (d.abstract.length < 50) errors.abstract = "The abstract must be at least 50 characters.";
  if (!file) errors.manuscript = "Attach the manuscript (PDF or Word).";
  else if (!verifyAll(files)) errors.manuscript = "The file appears to be damaged or is not a real PDF/Word document.";
  if (b.declarations !== "accepted") errors.declarations = "Confirm all three declarations.";
  if (Object.keys(errors).length) { removeAll(files); return res.status(422).json({ error: "validation", errors }); }

  const ref = makeRef("TRIEFML-MS");
  const info = db.prepare(`INSERT INTO submissions (ref, type, title, abstract, keywords, jel_codes, category, cover_letter, authors, email, file_path, file_name, user_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(ref, d.type, d.title, d.abstract, d.keywords, d.jel, d.category, d.cover, JSON.stringify(authors), u.email, file.filename, file.originalname.slice(0, 200), u.id);
  const id = Number(info.lastInsertRowid);
  addFile("submission", id, "manuscript", file, u.id, 1);
  db.prepare("INSERT INTO submission_events (submission_id, status, message) VALUES (?, 'submitted', ?)").run(id, "Manuscript received. The editorial office will complete an initial screening.");
  logActivity(u.id, "submitted_manuscript", "submission", id, ref);
  notifyStaff(`<b>New manuscript</b> ${esc(ref)}\n<b>${esc(d.title)}</b>\n${esc(authors.map((a) => a.name).join(", "))}\n${esc(d.type)} · ${esc(d.category)}\nAccount: ${esc(u.name)} (${esc(u.email)})`);
  sendEmail(u.email, `Submission received: ${ref}`,
    `Dear ${u.name},\n\nThank you for submitting "${d.title}" to the ${SITE.name}. Your reference is ${ref}.\n\nFollow its progress and correspond with the editorial office from your account:\n${base()}/account/manuscripts/${id}\n\nEditorial Office\n${SITE.short}`, SITE.email.editorial);
  res.json({ id, ref });
});

function ownSubmission(req: express.Request) {
  return db.prepare("SELECT * FROM submissions WHERE id = ? AND user_id = ?").get(req.params.id, req.user!.id) as any;
}

accountRouter.get("/submissions/:id", (req, res) => {
  const s = ownSubmission(req);
  if (!s) return res.status(404).json({ error: "not_found" });
  const events = db.prepare("SELECT status, message, created_at FROM submission_events WHERE submission_id = ? ORDER BY id").all(s.id);
  const pub = db.prepare("SELECT slug FROM publications WHERE submission_id = ? AND status='published'").get(s.id) as any;
  // Reviewer reports are shared with authors anonymously, once the editor has recorded a decision on that round.
  const shared = ["revisions", "accepted", "rejected", "published", "revised"].includes(s.status)
    ? (db.prepare("SELECT round, recommendation, comments_author FROM reviews WHERE submission_id = ? AND status = 'submitted' AND comments_author <> '' ORDER BY round, id").all(s.id) as any[])
        .map((r, i) => ({ reviewer: `Reviewer ${i + 1}`, round: r.round, comments: r.comments_author }))
    : [];
  res.json({
    id: s.id, ref: s.ref, type: s.type, title: s.title, abstract: s.abstract, keywords: s.keywords, jelCodes: s.jel_codes, category: s.category,
    authors: parseJSON<Author[]>(s.authors, []), status: s.status, statusLabel: SUBMISSION_STATUS[s.status], round: s.round, createdAt: s.created_at,
    events, files: filesFor("submission", s.id), messages: threadMessages("submission", s.id, true), reviews: shared,
    canRevise: s.status === "revisions", publicationSlug: pub?.slug || null,
  });
});

accountRouter.get("/submissions/:id/files/:fid", (req, res) => {
  const s = ownSubmission(req);
  if (!s) return res.status(404).send("Not found");
  sendFileRow(res, req.params.fid, "submission", s.id);
});

const revisionUpload = withUpload(uploader(["pdf", "docx", "doc"], 2).fields([{ name: "manuscript", maxCount: 1 }, { name: "response", maxCount: 1 }]));
accountRouter.post("/submissions/:id/revision", revisionUpload, (req, res) => {
  const s = ownSubmission(req);
  const files = uploadedFiles(req);
  if (!s) { removeAll(files); return res.status(404).json({ error: "not_found" }); }
  if (s.status !== "revisions") { removeAll(files); return res.status(409).json({ error: "not_allowed" }); }
  const ms = (req.files as any)?.manuscript?.[0];
  const resp = (req.files as any)?.response?.[0];
  if (!ms) { removeAll(files); return res.status(422).json({ error: "validation", errors: { manuscript: "Attach the revised manuscript." } }); }
  if (!verifyAll(files)) { removeAll(files); return res.status(422).json({ error: "validation", errors: { manuscript: "A file is damaged or not a real PDF/Word document." } }); }
  const round = (s.round || 1) + 1;
  addFile("submission", s.id, "manuscript", ms, req.user!.id, round);
  if (resp) addFile("submission", s.id, "response-letter", resp, req.user!.id, round);
  const note = str(req.body.note, 4000);
  db.prepare("UPDATE submissions SET status = 'revised', round = ?, updated_at = datetime('now') WHERE id = ?").run(round, s.id);
  db.prepare("INSERT INTO submission_events (submission_id, status, message) VALUES (?, 'revised', ?)").run(s.id, `Revised version (round ${round}) received.`);
  if (note) db.prepare("INSERT INTO messages (thread_type, thread_id, user_id, from_staff, body, read_by_owner) VALUES ('submission', ?, ?, 0, ?, 1)").run(s.id, req.user!.id, note);
  logActivity(req.user!.id, "submitted_revision", "submission", s.id, s.ref);
  notifyStaff(`<b>Revised manuscript</b> ${esc(s.ref)} (round ${round})\n${esc(s.title)}`);
  res.json({ ok: true });
});

accountRouter.post("/submissions/:id/withdraw", (req, res) => {
  const s = ownSubmission(req);
  if (!s) return res.status(404).json({ error: "not_found" });
  if (["published", "rejected", "withdrawn"].includes(s.status)) return res.status(409).json({ error: "not_allowed" });
  db.prepare("UPDATE submissions SET status = 'withdrawn', updated_at = datetime('now') WHERE id = ?").run(s.id);
  db.prepare("INSERT INTO submission_events (submission_id, status, message) VALUES (?, 'withdrawn', 'Withdrawn by the author.')").run(s.id);
  db.prepare("UPDATE reviews SET status = 'cancelled' WHERE submission_id = ? AND status IN ('invited','accepted')").run(s.id);
  notifyStaff(`<b>Manuscript withdrawn</b> ${esc(s.ref)}\n${esc(s.title)}`);
  res.json({ ok: true });
});

const msgUpload = withUpload(uploader(DOC_TYPES, 3).array("files", 3));
accountRouter.post("/submissions/:id/messages", msgUpload, (req, res) => {
  const s = ownSubmission(req);
  if (!s) { removeAll(uploadedFiles(req)); return res.status(404).json({ error: "not_found" }); }
  postMessage(req, res, "submission", s.id, s.title, s.ref);
});

accountRouter.get("/messages/files/:fid", (req, res) => {
  // A message attachment is downloadable by the owner of the thread it belongs to.
  const f = db.prepare(`SELECT f.path, f.name, m.thread_type, m.thread_id FROM files f JOIN messages m ON m.id = f.owner_id WHERE f.id = ? AND f.owner_type = 'message'`).get(req.params.fid) as any;
  if (!f) return res.status(404).send("Not found");
  const table = f.thread_type === "submission" ? "submissions" : "requests";
  const own = db.prepare(`SELECT 1 FROM ${table} WHERE id = ? AND user_id = ?`).get(f.thread_id, req.user!.id);
  if (!own && !isStaff(req.user)) return res.status(404).send("Not found");
  res.download(filePath(f.path), f.name);
});

// ---------------------------------------------------------------- My projects and requests
const projectUpload = withUpload(uploader(DOC_TYPES, 5).array("documents", 5));

accountRouter.get("/requests", (req, res) => {
  res.json(db.prepare(`SELECT r.id, r.ref, r.kind, r.subject, r.status, r.created_at, r.updated_at,
      (SELECT COUNT(*) FROM messages m WHERE m.thread_type='request' AND m.thread_id=r.id AND m.from_staff=1 AND m.read_by_owner=0) unread
    FROM requests r WHERE r.user_id = ? ORDER BY r.id DESC`).all(req.user!.id));
});

accountRouter.post("/projects", rateLimit("project", 10, 60 * 60 * 1000), projectUpload, (req, res) => {
  const u = req.user!;
  const files = uploadedFiles(req);
  if (u.account_type === "institution" && u.status !== "active") { removeAll(files); return res.status(403).json({ error: "pending_approval" }); }
  const b = req.body;
  const d = { title: str(b.title, 300), division: str(b.division, 120), level: str(b.level, 80), size: str(b.size, 100), country: str(b.country, 100), timeline: str(b.timeline, 100), message: str(b.message, 8000), organization: str(b.organization, 300) || u.institution };
  const errors: Record<string, string> = {};
  if (d.title.length < 5) errors.title = "Give the project a name.";
  if (d.message.length < 40) errors.message = "Describe the project and what you need reviewed (at least 40 characters).";
  if (!verifyAll(files)) errors.documents = "One of the files is damaged or not an accepted type.";
  if (Object.keys(errors).length) { removeAll(files); return res.status(422).json({ error: "validation", errors }); }
  const ref = makeRef("TRIEFML-PR");
  const details = { "Service level": d.level, "Area": d.division, "Project size": d.size, "Country": d.country, "Timeline": d.timeline };
  const info = db.prepare("INSERT INTO requests (ref, kind, name, email, organization, subject, message, details, user_id, division) VALUES (?, 'project-review', ?,?,?,?,?,?,?,?)")
    .run(ref, u.name, u.email, d.organization, d.title, d.message, JSON.stringify(details), u.id, d.division);
  const id = Number(info.lastInsertRowid);
  files.forEach((f) => addFile("request", id, "document", f, u.id));
  logActivity(u.id, "submitted_project", "request", id, ref);
  notifyStaff(`<b>New project review request</b> ${esc(ref)}\n<b>${esc(d.title)}</b>\n${esc(d.organization)} · ${esc(u.name)}\n${esc(d.division)} · ${esc(d.size)}${files.length ? `\n📎 ${files.length} document(s)` : ""}`);
  sendEmail(u.email, `Project review request received: ${ref}`, `Dear ${u.name},\n\nWe received your request "${d.title}" (${ref}). Our team will screen it and reply in your account:\n${base()}/account/projects/${id}\n\n${SITE.short}`, SITE.email.reviews);
  res.json({ id, ref });
});

function ownRequest(req: express.Request) {
  return db.prepare("SELECT * FROM requests WHERE id = ? AND user_id = ?").get(req.params.id, req.user!.id) as any;
}

accountRouter.get("/requests/:id", (req, res) => {
  const r = ownRequest(req);
  if (!r) return res.status(404).json({ error: "not_found" });
  res.json({
    id: r.id, ref: r.ref, kind: r.kind, title: r.subject, message: r.message, details: parseJSON(r.details, {}), organization: r.organization,
    status: r.status, statusLabel: PROJECT_STATUS[r.status] || r.status, createdAt: r.created_at,
    files: filesFor("request", r.id), messages: threadMessages("request", r.id, true),
  });
});

accountRouter.get("/requests/:id/files/:fid", (req, res) => {
  const r = ownRequest(req);
  if (!r) return res.status(404).send("Not found");
  sendFileRow(res, req.params.fid, "request", r.id);
});

accountRouter.post("/requests/:id/messages", msgUpload, (req, res) => {
  const r = ownRequest(req);
  if (!r) { removeAll(uploadedFiles(req)); return res.status(404).json({ error: "not_found" }); }
  if (r.status === "awaiting-client") db.prepare("UPDATE requests SET status = 'in-review', updated_at = datetime('now') WHERE id = ?").run(r.id);
  postMessage(req, res, "request", r.id, r.subject, r.ref);
});

// ---------------------------------------------------------------- Peer review (reviewers)
accountRouter.get("/reviews", (req, res) => {
  const rows = db.prepare(`SELECT rv.id, rv.status, rv.round, rv.due_date, rv.recommendation, rv.invited_at, rv.submitted_at, s.title, s.type, s.category
    FROM reviews rv JOIN submissions s ON s.id = rv.submission_id WHERE rv.reviewer_id = ? AND rv.status <> 'cancelled' ORDER BY rv.id DESC`).all(req.user!.id);
  res.json(rows);
});

function ownReview(req: express.Request) {
  return db.prepare(`SELECT rv.*, s.title, s.abstract, s.keywords, s.jel_codes, s.type, s.category, s.round s_round FROM reviews rv JOIN submissions s ON s.id = rv.submission_id
    WHERE rv.id = ? AND rv.reviewer_id = ? AND rv.status <> 'cancelled'`).get(req.params.id, req.user!.id) as any;
}

accountRouter.get("/reviews/:id", (req, res) => {
  const r = ownReview(req);
  if (!r) return res.status(404).json({ error: "not_found" });
  // Reviewers only see the manuscript versions, never author names or emails (double-blind).
  const files = r.status === "invited" ? [] : filesFor("submission", r.submission_id).filter((f) => f.kind !== "response-letter" || f.version <= r.round);
  res.json({
    id: r.id, status: r.status, round: r.round, dueDate: r.due_date, title: r.title, abstract: r.abstract, keywords: r.keywords, jelCodes: r.jel_codes, type: r.type, category: r.category,
    recommendation: r.recommendation, scores: parseJSON(r.scores, {}), commentsAuthor: r.comments_author, commentsEditor: r.comments_editor, submittedAt: r.submitted_at,
    files: files.map((f) => ({ id: f.id, kind: f.kind, version: f.version, name: `${f.kind === "response-letter" ? "Response-to-reviewers" : "Manuscript"}-v${f.version}${String(f.name).match(/\.[a-z]+$/i)?.[0] || ""}` })),
  });
});

accountRouter.get("/reviews/:id/files/:fid", (req, res) => {
  const r = ownReview(req);
  if (!r || r.status === "invited") return res.status(404).send("Not found");
  const f = db.prepare("SELECT path, name, kind, version FROM files WHERE id = ? AND owner_type = 'submission' AND owner_id = ?").get(req.params.fid, r.submission_id) as any;
  if (!f) return res.status(404).send("Not found");
  const ext = String(f.name).match(/\.[a-z]+$/i)?.[0] || "";
  res.download(filePath(f.path), `${f.kind === "response-letter" ? "Response-to-reviewers" : "Manuscript"}-v${f.version}${ext}`);
});

accountRouter.post("/reviews/:id/respond", (req, res) => {
  const r = ownReview(req);
  if (!r || r.status !== "invited") return res.status(409).json({ error: "not_allowed" });
  const accept = req.body.accept === true;
  db.prepare("UPDATE reviews SET status = ?, responded_at = datetime('now') WHERE id = ?").run(accept ? "accepted" : "declined", r.id);
  logActivity(req.user!.id, accept ? "review_accepted" : "review_declined", "review", r.id);
  notifyStaff(`<b>Review invitation ${accept ? "accepted" : "declined"}</b>\n${esc(r.title)}\nReviewer: ${esc(req.user!.name)}`);
  res.json({ ok: true });
});

accountRouter.post("/reviews/:id/submit", (req, res) => {
  const r = ownReview(req);
  if (!r || !["accepted"].includes(r.status)) return res.status(409).json({ error: "not_allowed" });
  const rec = str(req.body.recommendation, 20);
  const ca = str(req.body.commentsAuthor, 20000);
  const ce = str(req.body.commentsEditor, 10000);
  const scores = req.body.scores && typeof req.body.scores === "object" ? req.body.scores : {};
  const draft = req.body.draft === true;
  const errors: Record<string, string> = {};
  if (!draft && !["accept", "minor", "major", "reject"].includes(rec)) errors.recommendation = "Choose a recommendation.";
  if (!draft && ca.length < 100) errors.commentsAuthor = "Comments for the authors must be at least 100 characters.";
  if (Object.keys(errors).length) return res.status(422).json({ error: "validation", errors });
  db.prepare("UPDATE reviews SET recommendation=?, comments_author=?, comments_editor=?, scores=?, status=?, submitted_at=? WHERE id=?")
    .run(rec, ca, ce, JSON.stringify(scores), draft ? "accepted" : "submitted", draft ? null : new Date().toISOString().replace("T", " ").slice(0, 19), r.id);
  if (!draft) {
    logActivity(req.user!.id, "review_submitted", "review", r.id);
    notifyStaff(`<b>Review submitted</b>\n${esc(r.title)}\nRecommendation: ${esc(rec)}`);
  }
  res.json({ ok: true });
});
