import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

import { db, publicationRow, DATA_DIR } from "./server/db";
import { publicRouter, downloadHandler, mediaHandler } from "./server/public-routes";
import { adminRouter } from "./server/admin-routes";
import { accountRouter } from "./server/account-routes";
import { loadUser, sameOrigin, bootstrapAdmin } from "./server/auth";
import { esc } from "./server/notify";
import { SITE } from "./src/lib/site";

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/": { title: `${SITE.name} (${SITE.short})`, description: SITE.tagline },
  "/research": { title: `Research library | ${SITE.short}`, description: "Open-access working papers, articles and policy briefs in economics, finance, management and law." },
  "/publications": { title: `Books and reports | ${SITE.short}`, description: `Books and reports published by the ${SITE.name}.` },
  "/submit": { title: `Submit a manuscript | ${SITE.short}`, description: "Submit your research for double-blind peer review and open-access publication." },
  "/track": { title: `Track a submission | ${SITE.short}`, description: "Follow the status of a manuscript submitted to TRIEFML." },
  "/project-review": { title: `Project review | ${SITE.short}`, description: "Independent expert examination of economic and development projects." },
  "/consulting": { title: `Consulting | ${SITE.short}`, description: "Policy analysis, feasibility, compliance and research methodology consulting." },
  "/about": { title: `About | ${SITE.short}`, description: `About the ${SITE.name}.` },
  "/policies": { title: `Editorial policies | ${SITE.short}`, description: "Peer review, open access, publication ethics and author guidelines." },
  "/contact": { title: `Contact | ${SITE.short}`, description: `Contact the ${SITE.name}.` },
  "/signin": { title: `Sign in | ${SITE.short}`, description: `Sign in to your ${SITE.short} account.` },
  "/signup": { title: `Create an account | ${SITE.short}`, description: "Create a researcher or institution account to submit papers and projects." },
};
const NOINDEX = ["/account", "/admin", "/signin", "/signup", "/verify", "/reset-password", "/forgot-password", "/track"];

function baseUrl(req: express.Request) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  return `${req.headers["x-forwarded-proto"] || req.protocol}://${req.headers.host}`;
}

// Builds the <head> tags for a URL. Paper pages get Google Scholar
// (Highwire) citation tags so they can be indexed as scholarly articles.
function headFor(urlPath: string, base: string) {
  const m = urlPath.match(/^\/research\/([a-z0-9-]+)\/?$/);
  if (m) {
    const r = db.prepare("SELECT * FROM publications WHERE slug = ? AND status = 'published'").get(m[1]);
    if (r) {
      const p = publicationRow(r);
      const tags = [
        `<title>${esc(p.title)} | ${SITE.short}</title>`,
        `<meta name="description" content="${esc(p.abstract.slice(0, 300))}">`,
        `<link rel="canonical" href="${base}/research/${p.slug}">`,
        `<meta property="og:type" content="article"><meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.abstract.slice(0, 300))}"><meta property="og:url" content="${base}/research/${p.slug}">`,
        `<meta name="citation_title" content="${esc(p.title)}">`,
        ...p.authors.map((a: any) => `<meta name="citation_author" content="${esc(a.name)}">${a.affiliation ? `<meta name="citation_author_institution" content="${esc(a.affiliation)}">` : ""}${a.orcid ? `<meta name="citation_author_orcid" content="${esc(a.orcid)}">` : ""}`),
        p.publishedDate ? `<meta name="citation_publication_date" content="${esc(p.publishedDate.replace(/-/g, "/"))}">` : "",
        `<meta name="citation_publisher" content="${esc(SITE.name)}">`,
        p.type === "Journal Article" && SITE.publishing.journalName ? `<meta name="citation_journal_title" content="${esc(SITE.publishing.journalName)}">` : "",
        p.type === "Working Paper" ? `<meta name="citation_technical_report_institution" content="${esc(SITE.name)}">` : "",
        p.number ? `<meta name="citation_technical_report_number" content="${esc(p.number)}">` : "",
        p.volume ? `<meta name="citation_volume" content="${esc(p.volume)}">` : "",
        p.issue ? `<meta name="citation_issue" content="${esc(p.issue)}">` : "",
        SITE.publishing.issnOnline ? `<meta name="citation_issn" content="${esc(SITE.publishing.issnOnline)}">` : "",
        p.doi ? `<meta name="citation_doi" content="${esc(p.doi)}">` : "",
        p.keywords.length ? `<meta name="citation_keywords" content="${esc(p.keywords.join("; "))}">` : "",
        `<meta name="citation_abstract_html_url" content="${base}/research/${p.slug}">`,
        p.hasPdf ? `<meta name="citation_pdf_url" content="${base}/files/${p.slug}.pdf">` : "",
        `<meta name="citation_language" content="en">`,
      ];
      return tags.filter(Boolean).join("\n    ");
    }
  }
  const a = urlPath.match(/^\/authors\/(\d+)$/);
  if (a) {
    const u = db.prepare("SELECT name, institution, bio FROM users WHERE id = ? AND public_profile = 1 AND status = 'active'").get(a[1]) as any;
    if (u) return `<title>${esc(u.name)} | ${SITE.short}</title>\n    <meta name="description" content="${esc((u.institution ? u.institution + ". " : "") + (u.bio || "").slice(0, 250))}">\n    <link rel="canonical" href="${base}${urlPath}">`;
  }
  const key = "/" + (urlPath.split("/")[1] || "");
  const meta = PAGE_META[key] || PAGE_META["/"];
  const robots = NOINDEX.includes(key) ? `\n    <meta name="robots" content="noindex">` : "";
  return `<title>${esc(meta.title)}</title>${robots}\n    <meta name="description" content="${esc(meta.description)}">\n    <meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.description)}">`;
}

async function startServer() {
  bootstrapAdmin();
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const prod = process.env.NODE_ENV === "production";

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
  });

  app.use(loadUser);
  app.use("/api", sameOrigin);
  app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
  app.use("/api/account", accountRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api", publicRouter);
  app.use("/api", (_req, res) => res.status(404).json({ error: "not_found" }));
  app.get("/files/:slug", downloadHandler);
  app.get("/media/:file", mediaHandler);

  app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /api/\nSitemap: ${baseUrl(req)}/sitemap.xml\n`);
  });
  app.get("/sitemap.xml", (req, res) => {
    const base = baseUrl(req);
    const pages = Object.keys(PAGE_META).filter((p) => !NOINDEX.includes(p));
    const papers = db.prepare("SELECT slug, updated_at FROM publications WHERE status='published'").all() as any[];
    const urls = [
      ...pages.map((p) => `<url><loc>${base}${p === "/" ? "" : p}</loc></url>`),
      ...papers.map((p) => `<url><loc>${base}/research/${p.slug}</loc><lastmod>${String(p.updated_at).slice(0, 10)}</lastmod></url>`),
    ];
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
  });

  const injectHead = (html: string, urlPath: string, base: string) =>
    html.replace(/<title>[\s\S]*?<\/title>/, "").replace("<!--HEAD-->", headFor(urlPath, base));

  if (!prod) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "custom" });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      try {
        let html = fs.readFileSync(path.resolve("index.html"), "utf8");
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.type("html").send(injectHead(html, req.path, baseUrl(req)));
      } catch (e) { next(e); }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const indexHtml = fs.readFileSync(path.join(distPath, "index.html"), "utf8");
    app.use(express.static(distPath, { index: false, maxAge: "7d" }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.type("html").send(injectHead(indexHtml, req.path, baseUrl(req)));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TRIEFML server running on http://localhost:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
    const admins = (db.prepare("SELECT COUNT(*) n FROM users WHERE role = 'admin'").get() as any).n;
    if (!admins) console.warn("No administrator account yet. Set ADMIN_EMAIL and ADMIN_PASSWORD and restart.");
  });
}

startServer();
