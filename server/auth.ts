import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { metaGet, metaSet } from "./db";

// Admin login is checked on the server against environment variables, never
// in the browser. Sessions are HMAC-signed cookies.

const COOKIE = "triefml_admin";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  let s = metaGet("session_secret");
  if (!s) { s = crypto.randomBytes(32).toString("hex"); metaSet("session_secret", s); }
  return s;
}

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD;
const adminUser = () => process.env.ADMIN_USER || "admin";

function safeEqual(a: string, b: string) {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkCredentials(user: string, pass: string) {
  if (!adminConfigured()) return false;
  const okUser = safeEqual(user.trim().toLowerCase(), adminUser().toLowerCase());
  const okPass = safeEqual(pass, process.env.ADMIN_PASSWORD!);
  return okUser && okPass;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function setSession(req: Request, res: Response) {
  const exp = Date.now() + MAX_AGE_MS;
  const payload = `${adminUser()}.${exp}`;
  const secure = req.secure || req.headers["x-forwarded-proto"] === "https";
  res.cookie(COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: "lax", secure, maxAge: MAX_AGE_MS, path: "/" });
}

export function clearSession(res: Response) {
  res.clearCookie(COOKIE, { path: "/" });
}

function readCookie(req: Request) {
  const raw = req.headers.cookie || "";
  const m = raw.split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  return m ? decodeURIComponent(m.slice(COOKIE.length + 1)) : "";
}

export function isAdmin(req: Request) {
  if (!adminConfigured()) return false;
  const v = readCookie(req);
  const i = v.lastIndexOf(".");
  if (i < 0) return false;
  const payload = v.slice(0, i);
  const sig = v.slice(i + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const exp = Number(payload.split(".").pop());
  return Number.isFinite(exp) && exp > Date.now();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (isAdmin(req)) return next();
  res.status(401).json({ error: "unauthorized" });
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
