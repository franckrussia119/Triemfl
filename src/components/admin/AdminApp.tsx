import React, { useEffect } from "react";
import { LayoutDashboard, FileInput, BookOpen, Briefcase, Inbox, Users, PenSquare, Megaphone, Mail, History, LogOut, ExternalLink, UserCircle } from "lucide-react";
import { Link, navigate, useLocation, usePageTitle } from "../../lib/router";
import { useAuth, isStaff } from "../../lib/auth";
import { formatDate } from "../../lib/api";
import { SITE } from "../../lib/site";
import { Notice } from "../ui";
import { Logo } from "../Navbar";
import { H1, useLoad, Publications, PublicationEditor, Subscribers, Announcements } from "./AdminPublishing";
import { Manuscripts, ManuscriptDetail } from "./AdminManuscripts";
import { Requests, RequestDetail } from "./AdminRequests";
import { UsersList, UserDetail } from "./AdminUsers";
import { SiteContent, ActivityLog } from "./AdminContent";

export default function AdminApp() {
  usePageTitle(`Admin | ${SITE.short}`);
  const { user, loading, signOut } = useAuth();
  const { path } = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate(`/signin?next=${encodeURIComponent(path)}`, { replace: true });
  }, [loading, user, path]);
  if (loading || !user) return <div className="min-h-screen bg-paper" />;
  if (!isStaff(user)) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="card p-8 max-w-md text-center">
          <h1 className="text-2xl font-semibold text-navy-ink">Staff only</h1>
          <p className="mt-2 text-slate-600">The admin area is for the institute's editors and administrators.</p>
          <Link to="/account" className="btn btn-navy mt-6">Go to my space</Link>
        </div>
      </div>
    );
  }

  const admin = user.role === "admin";
  const NAV = [
    { group: "Work", items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
      { to: "/admin/manuscripts", label: "Manuscripts", icon: FileInput },
      { to: "/admin/projects", label: "Project reviews", icon: Briefcase },
      { to: "/admin/inbox", label: "Inbox", icon: Inbox },
    ] },
    { group: "Publishing", items: [
      { to: "/admin/publications", label: "Publications", icon: BookOpen },
      { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { to: "/admin/subscribers", label: "Subscribers", icon: Mail },
    ] },
    { group: "Institute", items: [
      { to: "/admin/users", label: "Users and roles", icon: Users },
      ...(admin ? [{ to: "/admin/content", label: "Site content", icon: PenSquare }] : []),
      { to: "/admin/activity", label: "Activity log", icon: History },
    ] },
  ];

  const seg = path.split("/").slice(2);
  let page: React.ReactNode;
  switch (seg[0]) {
    case undefined: case "": page = <Overview />; break;
    case "manuscripts": page = seg[1] ? <ManuscriptDetail id={seg[1]} admin={admin} /> : <Manuscripts />; break;
    case "projects": page = seg[1] ? <RequestDetail id={seg[1]} admin={admin} /> : <Requests kind="project-review" />; break;
    case "inbox": page = seg[1] ? <RequestDetail id={seg[1]} admin={admin} /> : <Requests kind="messages" />; break;
    case "publications": page = seg[1] ? <PublicationEditor id={seg[1]} /> : <Publications />; break;
    case "announcements": page = <Announcements />; break;
    case "subscribers": page = <Subscribers />; break;
    case "users": page = seg[1] ? <UserDetail id={seg[1]} admin={admin} /> : <UsersList admin={admin} />; break;
    case "content": page = admin ? <SiteContent /> : <p>Administrators only.</p>; break;
    case "activity": page = <ActivityLog />; break;
    default: page = <p>Page not found.</p>;
  }
  const active = (n: { to: string; exact?: boolean }) => (n.exact ? path === n.to : path.startsWith(n.to));

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="bg-navy-deep text-white lg:w-64 lg:min-h-screen lg:sticky lg:top-0 lg:h-screen shrink-0 flex flex-col">
        <div className="p-4 lg:p-5 border-b border-white/10 flex items-center justify-between gap-3"><Logo compact /></div>
        <nav aria-label="Admin" className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto p-2 lg:p-3 gap-1 lg:gap-4 flex-1">
          {NAV.map((g) => (
            <div key={g.group} className="flex lg:flex-col gap-1 shrink-0">
              <p className="hidden lg:block px-3 text-xs font-semibold text-slate-400 mb-1">{g.group}</p>
              {g.items.map((n) => (
                <Link key={n.to} to={n.to} aria-current={active(n) ? "page" : undefined}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md whitespace-nowrap text-[0.95rem] ${active(n) ? "bg-white/10 text-white" : "text-slate-300 hover:text-white"}`}>
                  <n.icon className="w-4 h-4" aria-hidden />{n.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="hidden lg:block p-3 border-t border-white/10 space-y-1">
          <p className="px-3 py-1 text-sm text-slate-300 truncate">{user.name} · <span className="text-gold">{user.role === "admin" ? "Administrator" : "Editor"}</span></p>
          <Link to="/account" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-300 hover:text-white text-[0.95rem]"><UserCircle className="w-4 h-4" aria-hidden /> My space</Link>
          <a href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-300 hover:text-white text-[0.95rem]"><ExternalLink className="w-4 h-4" aria-hidden /> View site</a>
          <button onClick={async () => { await signOut(); navigate("/"); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-300 hover:text-white text-[0.95rem]"><LogOut className="w-4 h-4" aria-hidden /> Sign out</button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 sm:p-8">{page}</main>
    </div>
  );
}

const ACTION_LABEL: Record<string, string> = {
  admin_bootstrapped: "set up the administrator account", signed_up: "created an account", password_reset: "reset their password", email_verified: "confirmed their email", signed_in: "signed in", submitted_manuscript: "submitted a manuscript", submitted_revision: "submitted a revision",
  submitted_project: "submitted a project", reviewer_invited: "invited a reviewer", review_accepted: "accepted a review", review_declined: "declined a review",
  review_submitted: "submitted a review", publication_published: "published a paper", report_delivered: "delivered a report", message_sent: "sent a message",
  user_active: "activated an account", user_suspended: "suspended an account", user_role_changed: "changed a role", publication_drafted: "prepared a publication",
};
export const actionLabel = (a: string) => ACTION_LABEL[a] || a.replace(/_/g, " ").replace(/^submission /, "set a manuscript to ").replace(/^request /, "set a request to ");

function Overview() {
  const { data } = useLoad<any>("/api/admin/overview");
  if (!data) return <H1>Overview</H1>;
  const a = data.attention;
  const todo = [
    { n: a.newSubmissions, l: "New manuscripts to screen", to: "/admin/manuscripts?status=submitted" },
    { n: a.revisedSubmissions, l: "Revised manuscripts received", to: "/admin/manuscripts?status=revised" },
    { n: a.reviewsToRead, l: "Manuscripts with new reviewer reports", to: "/admin/manuscripts?status=under-review" },
    { n: a.reviewsOverdue, l: "Overdue reviews", to: "/admin/manuscripts?status=under-review" },
    { n: a.acceptedToPublish, l: "Accepted papers to publish", to: "/admin/manuscripts?status=accepted" },
    { n: a.newProjects, l: "New project review requests", to: "/admin/projects" },
    { n: a.unreadReplies, l: "Unread replies from authors and clients", to: "/admin/manuscripts" },
    { n: a.newMessages, l: "New contact and consulting messages", to: "/admin/inbox" },
    { n: a.pendingInstitutions, l: "Institution accounts to approve", to: "/admin/users?status=pending" },
  ].filter((x) => x.n > 0);
  const t = data.totals;
  return (
    <>
      <H1>Overview</H1>
      {!data.emailEnabled && <div className="mb-6"><Notice>Emails are switched off, so authors, reviewers and clients only see updates when they sign in. Set <code>RESEND_API_KEY</code> and <code>MAIL_FROM</code> on the server to send them automatically (see README).</Notice></div>}
      <section className="card p-5 sm:p-6 mb-6">
        <h2 className="font-sans text-lg font-semibold text-navy-ink mb-3">Needs attention</h2>
        {todo.length === 0 ? <p className="text-slate-600">Nothing waiting. New work will appear here.</p> : (
          <ul className="divide-y divide-slate-100">
            {todo.map((x) => (
              <li key={x.l}><Link to={x.to} className="flex items-center justify-between gap-3 py-3 hover:bg-paper -mx-2 px-2 rounded">
                <span className="text-slate-800">{x.l}</span><span className="pill bg-gold text-navy-deep !text-sm">{x.n}</span>
              </Link></li>
            ))}
          </ul>
        )}
      </section>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[[t.published, "Published papers"], [t.submissions, "Manuscripts received"], [t.users, "Registered users"], [t.institutions, "Approved institutions"],
          [t.reviewers, "Reviewers"], [t.projects, "Project reviews"], [t.downloads, "PDF downloads"], [t.subscribers, "Subscribers"]].map(([n, l]) => (
          <div key={l as string} className="card p-5"><p className="font-serif text-3xl text-navy-ink">{Number(n).toLocaleString("en")}</p><p className="text-slate-600 text-sm mt-1">{l}</p></div>
        ))}
      </div>
      <section className="card p-5 sm:p-6">
        <div className="flex justify-between items-center mb-3"><h2 className="font-sans text-lg font-semibold text-navy-ink">Recent activity</h2><Link to="/admin/activity" className="link text-sm">Full log</Link></div>
        <ul className="divide-y divide-slate-100">
          {data.recent.map((r: any, i: number) => (
            <li key={i} className="py-2.5 flex flex-wrap justify-between gap-2 text-[0.95rem]">
              <span><strong className="text-slate-800">{r.name || "System"}</strong> <span className="text-slate-600">{actionLabel(r.action)}</span>{r.detail ? <span className="text-slate-500">: {r.detail}</span> : null}</span>
              <span className="text-sm text-slate-500">{formatDate(r.created_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
