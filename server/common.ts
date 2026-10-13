import type express from "express";
import type { Request, Response, NextFunction } from "express";
import fs from "fs";
import { MAX_UPLOAD_MB, filePath } from "./uploads";
import { db } from "./db";

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const str = (v: unknown, max = 5000) => String(v ?? "").trim().slice(0, max);

// Wraps multer so upload errors return clean JSON instead of crashing.
export function withUpload(mw: express.RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) =>
    mw(req, res, (err: any) => {
      if (!err) return next();
      if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "file_too_large", maxMb: MAX_UPLOAD_MB });
      if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") return res.status(400).json({ error: "too_many_files" });
      if (String(err.message).startsWith("unsupported_type")) return res.status(415).json({ error: "unsupported_type", allowed: String(err.message).split(":")[1] });
      return res.status(400).json({ error: "upload_failed" });
    });
}

export function sendStored(res: Response, stored: string, originalName: string, inline = false) {
  const p = filePath(stored);
  if (!stored || !fs.existsSync(p)) return res.status(404).send("File not found");
  if (inline) { res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(originalName)}"`); return res.sendFile(p); }
  res.download(p, originalName);
}

export function sendFileRow(res: Response, id: number | string, ownerType: string, ownerId: number) {
  const f = db.prepare("SELECT path, name FROM files WHERE id = ? AND owner_type = ? AND owner_id = ?").get(id, ownerType, ownerId) as any;
  if (!f) return res.status(404).send("File not found");
  sendStored(res, f.path, f.name);
}

export const SUBMISSION_STATUS: Record<string, string> = {
  submitted: "Submitted", screening: "Initial screening", "under-review": "Under peer review", revisions: "Revisions requested",
  revised: "Revised version received", accepted: "Accepted", rejected: "Not accepted", published: "Published", withdrawn: "Withdrawn",
};
export const PROJECT_STATUS: Record<string, string> = {
  new: "Received", screening: "Screening", "in-review": "Under expert review", "awaiting-client": "Waiting for your reply",
  "report-delivered": "Report delivered", closed: "Closed", declined: "Declined",
};
export const REVIEW_RECOMMENDATION: Record<string, string> = {
  accept: "Accept", minor: "Minor revisions", major: "Major revisions", reject: "Reject",
};
