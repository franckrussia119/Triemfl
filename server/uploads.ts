import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { UPLOAD_DIR } from "./db";

const MAX_MB = Number(process.env.MAX_UPLOAD_MB || 25);

const KINDS: Record<string, { exts: string[]; magic: (b: Buffer) => boolean }> = {
  pdf: { exts: [".pdf"], magic: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  docx: { exts: [".docx"], magic: (b) => b[0] === 0x50 && b[1] === 0x4b },
  doc: { exts: [".doc"], magic: (b) => b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0 },
  xlsx: { exts: [".xlsx"], magic: (b) => b[0] === 0x50 && b[1] === 0x4b },
  pptx: { exts: [".pptx"], magic: (b) => b[0] === 0x50 && b[1] === 0x4b },
};

export function uploader(allowed: (keyof typeof KINDS)[]) {
  const exts = allowed.flatMap((k) => KINDS[k].exts);
  return multer({
    storage: multer.diskStorage({
      destination: UPLOAD_DIR,
      filename: (_req, file, cb) => cb(null, crypto.randomBytes(16).toString("hex") + path.extname(file.originalname).toLowerCase()),
    }),
    limits: { fileSize: MAX_MB * 1024 * 1024, files: 1, fields: 40 },
    fileFilter: (_req, file, cb) => {
      const ok = exts.includes(path.extname(file.originalname).toLowerCase());
      if (ok) cb(null, true);
      else cb(new Error(`unsupported_type:${exts.join(",")}`));
    },
  });
}

// Confirms the file content matches its extension (stops renamed executables).
export function verifyFile(file: Express.Multer.File | undefined): boolean {
  if (!file) return true;
  const ext = path.extname(file.originalname).toLowerCase();
  const kind = Object.values(KINDS).find((k) => k.exts.includes(ext));
  if (!kind) return false;
  const fd = fs.openSync(file.path, "r");
  const buf = Buffer.alloc(8);
  fs.readSync(fd, buf, 0, 8, 0);
  fs.closeSync(fd);
  return kind.magic(buf);
}

export function removeFile(storedName: string | undefined) {
  if (!storedName) return;
  const p = path.join(UPLOAD_DIR, path.basename(storedName));
  fs.rm(p, { force: true }, () => {});
}

export function filePath(storedName: string) {
  return path.join(UPLOAD_DIR, path.basename(storedName));
}

export const MAX_UPLOAD_MB = MAX_MB;
