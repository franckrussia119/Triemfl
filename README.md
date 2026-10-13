# TRIEFML — Research and publishing platform

Website and editorial system of the Tango Research Institute of Economics,
Finance, Management and Law (TRIEFML).

## What it does

**Public website**
- Research library with search, filters, paper pages, PDF reading and counted
  downloads, citations (APA, MLA, Chicago, Harvard, BibTeX) and Google Scholar
  tags, plus `sitemap.xml` and `robots.txt`.
- Public author pages listing each researcher's published papers.
- Editorial policies, About (board and council from the admin area), consulting
  and contact forms, newsletter, announcements and calls for papers.

**Accounts ("My space")**
- *Researchers* create an account, submit manuscripts (with co-authors and
  ORCID), follow each stage of review, correspond with the editorial office,
  read anonymised reviewer comments and upload revised versions.
- *Institutions* (ministries, banks, NGOs, companies) create an account that
  the team approves, then submit projects with documents, answer the panel's
  questions and download the final evaluation report.
- *Reviewers* accept or decline invitations, download the anonymised
  manuscript and submit a structured report (scores, recommendation, comments
  for the authors, confidential comments for the editor).
- Email verification and password reset (when email is configured).

**Admin area (`/admin`)**
- Overview of everything that needs attention, live figures and recent activity.
- Manuscripts: invite reviewers (existing or new by email), read reports,
  write decision letters with reviewer comments inserted anonymously, accept
  and publish.
- Project reviews: assign a division and lead specialist, correspond with the
  client, deliver the report.
- Inbox, publications, announcements, subscribers.
- Users and roles: approve institutions, suspend accounts, change roles,
  create staff and reviewer accounts, issue password links.
- Site content: homepage headline, rotating headline topics and introduction, call for papers, About
  texts, editorial board and advisory council with photos.
- Activity log of who did what.

**Roles:** Member (researcher or institution) · Reviewer · Editor (manuscripts,
projects, publishing) · Administrator (everything, including users and content).

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
| `ADMIN_EMAIL` | **yes** | Email of the first administrator account, created at start-up. |
| `ADMIN_PASSWORD` | **yes** | Its initial password (at least 10 characters). It can be changed in the profile page afterwards. |
| `ADMIN_PASSWORD_RESET` | no | Set to `true` once to reset that administrator's password to `ADMIN_PASSWORD`, then remove it. |
| `DATA_DIR` | no | Where the database and uploads are kept (default `/app/data` in Docker). |
| `PUBLIC_URL` | recommended | Public address, e.g. `https://triefml.org`. Used in the sitemap and Google Scholar tags. |
| `SESSION_SECRET` | no | Secret for signing admin sessions. Generated automatically if not set. |
| `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID` | no | Telegram alerts for new submissions and requests. |
| `RESEND_API_KEY`, `MAIL_FROM` | strongly recommended | Emails via [Resend](https://resend.com): account confirmation, password reset, decisions, reviewer invitations, reports. Example: `MAIL_FROM="TRIEFML <editorial@triefml.org>"` (domain verified in Resend). Without email, accounts are confirmed automatically and the admin area shows password and invitation links to send by hand. |
| `MAX_UPLOAD_MB` | no | Upload size limit (default 25). |

## Deploying on Coolify

1. Build pack: **Dockerfile**. Port **3000**.
2. Add the environment variables above (at least `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `PUBLIC_URL`).
3. **Add persistent storage** mounted at `/app/data`
   (Coolify → your application → Storages → Add volume, destination path `/app/data`).
   **Without this, every redeploy erases all submissions, papers and uploaded files.**
4. Deploy, then sign in at `/signin` with the administrator email and password.
   Upgrading from the previous version keeps all existing papers and files.
5. Back up `/app/data` regularly (it contains the whole database and all files).

Requires Node.js 22.13 or later (the Dockerfile uses Node 22).

## Local development

```bash
npm ci
ADMIN_EMAIL=you@example.org ADMIN_PASSWORD=change-me-123 npm run dev    # http://localhost:3000
```

`npm run build` then `npm start` runs the production build.
