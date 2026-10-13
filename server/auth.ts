import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { db, logActivity } from "./db";

// Accounts, sessions and roles.
//   role:  user (researchers and institutions) | reviewer | editor | admin
//   account_type: researcher | institution
// Passwords are hashed with scrypt. Sessions are random tokens stored hashed
// in the database, so they can be revoked (sign out, suspension).

export type Role = "user" | "reviewer" | "editor" | "admin";
export type User = {
  id: number; email: string; name: string; account_type: string; role: Role; status: string; email_verified: number;
  title: string; institution: string; position: string; country: string; orcid: string; bio: string; expertise: string;
  photo: string; phone: string; website: string; public_profile: number; created_at: string;
};

declare global {
  namespace Express { interface Request { user?: User } }
}

const COOKIE = "triefml_session";
const SESSION_DAYS = 30;
const STAFF: Role[] = ["editor", "admin"];

export const isStaff = (u?: User) => !!u && STAFF.includes(u.role);
export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export function hashPassword(pw: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}
export function verifyPassword(pw: string, stored: string) {
  const [alg, saltHex, hashHex] = stored.split("$");
  if (alg !== "scrypt" || !saltHex || !hashHex) return false;
  const hash = crypto.scryptSync(pw, Buffer.from(saltHex, "hex"), 64, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(hash, Buffer.from(hashHex, "hex"));
}
export function passwordProblem(pw: string) {
  if (pw.length < 10) return "Use at least 10 characters.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return "Use a mix of letters and numbers.";
  return "";
}

export function createSession(req: Request, res: Response, userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?,?,?)").run(sha256(token), userId, expires);
  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(userId);
  const secure = req.secure || req.headers["x-forwarded-proto"] === "https";
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: "lax", secure, maxAge: SESSION_DAYS * 864e5, path: "/" });
}

export function destroySession(req: Request, res: Response) {
  const t = readCookie(req);
  if (t) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(t));
  res.clearCookie(COOKIE, { path: "/" });
}

export function destroyAllSessions(userId: number) {
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

function readCookie(req: Request) {
  const raw = req.headers.cookie || "";
  const m = raw.split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  return m ? decodeURIComponent(m.slice(COOKIE.length + 1)) : "";
}

// Attaches req.user when a valid session cookie is present.
export function loadUser(req: Request, _res: Response, next: NextFunction) {
  const t = readCookie(req);
  if (t) {
    const row = db.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?`).get(sha256(t), new Date().toISOString()) as any;
    if (row && row.status !== "suspended") { delete row.password_hash; req.user = row as User; }
  }
  next();
}

// Blocks state-changing requests coming from other websites.
export function sameOrigin(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.headers.origin || (req.headers.referer ? new URL(String(req.headers.referer)).origin : "");
  if (!origin) return next(); // non-browser clients (curl, server-side)
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  try { if (new URL(origin).host === host) return next(); } catch { /* fallthrough */ }
  res.status(403).json({ error: "bad_origin" });
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (req.user) return next();
  res.status(401).json({ error: "unauthorized" });
}
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "forbidden" });
    next();
  };
}

// One-time tokens for email verification and password reset.
export function issueToken(userId: number, kind: "verify" | "reset", hours: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  db.prepare("DELETE FROM tokens WHERE user_id = ? AND kind = ?").run(userId, kind);
  db.prepare("INSERT INTO tokens (token_hash, user_id, kind, expires_at) VALUES (?,?,?,?)").run(sha256(token), userId, kind, new Date(Date.now() + hours * 36e5).toISOString());
  return token;
}
export function consumeToken(token: string, kind: "verify" | "reset"): number | null {
  const row = db.prepare("SELECT user_id, expires_at FROM tokens WHERE token_hash = ? AND kind = ?").get(sha256(token), kind) as any;
  if (!row) return null;
  db.prepare("DELETE FROM tokens WHERE token_hash = ?").run(sha256(token));
  return row.expires_at > new Date().toISOString() ? row.user_id : null;
}

// First administrator from environment variables (ADMIN_EMAIL + ADMIN_PASSWORD).
export function bootstrapAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!email || !pw) return;
  const existing = db.prepare("SELECT id, role FROM users WHERE email = ?").get(email) as any;
  if (!existing) {
    const info = db.prepare("INSERT INTO users (email, password_hash, name, role, account_type, email_verified, status) VALUES (?,?,?,?,?,1,'active')")
      .run(email, hashPassword(pw), process.env.ADMIN_NAME || "Administrator", "admin", "researcher");
    logActivity(Number(info.lastInsertRowid), "admin_bootstrapped", "user", Number(info.lastInsertRowid));
    console.log(`Administrator account created for ${email}.`);
  } else if (process.env.ADMIN_PASSWORD_RESET === "true") {
    db.prepare("UPDATE users SET password_hash = ?, role = 'admin', status = 'active' WHERE id = ?").run(hashPassword(pw), existing.id);
    destroyAllSessions(existing.id);
    console.log(`Administrator password reset for ${email}. Remove ADMIN_PASSWORD_RESET now.`);
  }
}

export function publicUser(u: User | any) {
  if (!u) return null;
  return {
    id: u.id, email: u.email, name: u.name, accountType: u.account_type, role: u.role, status: u.status, emailVerified: !!u.email_verified,
    title: u.title, institution: u.institution, position: u.position, country: u.country, orcid: u.orcid, bio: u.bio,
    expertise: u.expertise, photo: u.photo ? `/media/${u.photo}` : "", phone: u.phone, website: u.website, publicProfile: !!u.public_profile, createdAt: u.created_at,
  };
}

// Simple in-memory rate limiter.
const buckets = new Map<string, number[]>();
export function rateLimit(name: string, max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${name}:${req.ip}`;
    const now = Date.now();
    const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
    hits.push(now);
    buckets.set(key, hits);
    if (hits.length > max) return res.status(429).json({ error: "rate_limited" });
    next();
  };
}
