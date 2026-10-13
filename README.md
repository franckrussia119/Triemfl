# TRIEFML — Research and publishing platform

Website and editorial system of the Tango Research Institute of Economics,
Finance, Management and Law (TRIEFML).

## What it does

**Public website**
- Research library with search, filters, paper pages, PDF reading and download
  (counted), and citations in APA, MLA, Chicago, Harvard and BibTeX.
- Google Scholar citation tags on every paper, plus `sitemap.xml` and
  `robots.txt`, so published papers can be indexed.
- Manuscript submission with file upload (PDF/Word), co-authors, ORCID and
  declarations. Authors get a reference number and can track progress at `/track`.
- Project review, consulting and contact forms (with document upload for
  project reviews).
- Newsletter sign-up, announcements, editorial policies page.

**Admin portal (`/admin`)**
- Submissions: read and download manuscripts, record decisions (screening,
  under review, revisions, accepted, not accepted) with a message to the author
  and private internal notes.
- Publishing: turn an accepted submission into a publication, upload the
  final PDF and publish. You can also add existing papers directly.
- Inbox for project review, consulting and contact requests.
- Subscribers (CSV export) and announcements.

Everything is stored in a SQLite database and an uploads folder inside
`DATA_DIR`. New submissions and requests are also sent to Telegram if
configured.

## Editing institute information

Open `src/lib/site.ts`. It holds the address, emails, licence, ISSN and DOI
prefix, editorial board, advisory council, partners, indexing services and
project-review fees. Empty lists hide their sections automatically.

Only add facts that are true and verifiable: board members with their
consent, partners with a signed agreement, an ISSN once assigned, a DOI
prefix once Crossref has issued it.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | **yes** | Password for `/admin`. Use a long, unique password. Without it the admin portal is disabled. |
| `ADMIN_USER` | no | Admin username (default `admin`). |
| `DATA_DIR` | no | Where the database and uploads are kept (default `/app/data` in Docker). |
| `PUBLIC_URL` | recommended | Public address, e.g. `https://triefml.org`. Used in the sitemap and Google Scholar tags. |
| `SESSION_SECRET` | no | Secret for signing admin sessions. Generated automatically if not set. |
| `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID` | no | Telegram alerts for new submissions and requests. |
| `RESEND_API_KEY`, `MAIL_FROM` | no | Emails to authors and clients via [Resend](https://resend.com), e.g. `MAIL_FROM="TRIEFML Editorial Office <editorial@triefml.org>"` (domain must be verified in Resend). |
| `MAX_UPLOAD_MB` | no | Upload size limit (default 25). |

## Deploying on Coolify

1. Build pack: **Dockerfile**. Port **3000**.
2. Add the environment variables above (at least `ADMIN_PASSWORD` and `PUBLIC_URL`).
3. **Add persistent storage** mounted at `/app/data`
   (Coolify → your application → Storages → Add volume, destination path `/app/data`).
   **Without this, every redeploy erases all submissions, papers and uploaded files.**
4. Deploy, then open `/admin` and sign in.
5. Back up `/app/data` regularly (it contains the whole database and all files).

Requires Node.js 22.13 or later (the Dockerfile uses Node 22).

## Local development

```bash
npm ci
ADMIN_PASSWORD=change-me npm run dev    # http://localhost:3000
```

`npm run build` then `npm start` runs the production build.
