import React, { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useLocation, Link } from "./lib/router";
import HomeView from "./components/views/HomeView";
import ResearchView from "./components/views/ResearchView";
import ResearchDetailView from "./components/views/ResearchDetailView";
import PublicationsView from "./components/views/PublicationsView";
import SubmitView from "./components/views/SubmitView";
import TrackView from "./components/views/TrackView";
import ProjectReviewView from "./components/views/ProjectReviewView";
import ConsultingView from "./components/views/ConsultingView";
import AboutView from "./components/views/AboutView";
import PoliciesView from "./components/views/PoliciesView";
import ContactView from "./components/views/ContactView";
import AuthorView from "./components/views/AuthorView";
import AccountView from "./components/views/AccountView";
import { SignInView, SignUpView, VerifyView, ForgotView, ResetView } from "./components/views/AuthViews";
import { AuthProvider } from "./lib/auth";

const AdminView = lazy(() => import("./components/admin/AdminApp"));

function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-2 text-4xl font-semibold text-navy-ink">This page doesn't exist</h1>
      <p className="mt-4 text-slate-600">The link may be out of date. Try the research library or go back to the home page.</p>
      <div className="mt-8 flex gap-3 justify-center flex-wrap">
        <Link to="/research" className="btn btn-navy">Open the library</Link>
        <Link to="/" className="btn btn-outline">Home</Link>
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><Routes /></AuthProvider>;
}

function Routes() {
  const { path, search } = useLocation();
  const author = path.match(/^\/authors\/(\d+)$/);
  const paper = path.match(/^\/research\/([a-z0-9-]+)$/);

  if (path.startsWith("/admin")) {
    return <Suspense fallback={<div className="p-10 text-slate-500">Loading…</div>}><AdminView /></Suspense>;
  }

  let page: React.ReactNode;
  if (path === "/") page = <HomeView />;
  else if (path === "/research") page = <ResearchView search={search} />;
  else if (paper) page = <ResearchDetailView slug={paper[1]} />;
  else if (path === "/publications") page = <PublicationsView />;
  else if (path === "/submit") page = <SubmitView />;
  else if (path === "/track") page = <TrackView search={search} />;
  else if (path === "/project-review") page = <ProjectReviewView />;
  else if (path === "/consulting") page = <ConsultingView />;
  else if (path === "/about") page = <AboutView />;
  else if (path === "/policies") page = <PoliciesView />;
  else if (path === "/contact") page = <ContactView />;
  else if (author) page = <AuthorView id={author[1]} />;
  else if (path === "/signin") page = <SignInView search={search} />;
  else if (path === "/signup") page = <SignUpView search={search} />;
  else if (path === "/verify") page = <VerifyView search={search} />;
  else if (path === "/forgot-password") page = <ForgotView />;
  else if (path === "/reset-password") page = <ResetView search={search} />;
  else if (path === "/account" || path.startsWith("/account/")) page = <AccountView />;
  else page = <NotFound />;

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-2 focus:left-2 btn btn-gold">Skip to content</a>
      <Navbar />
      <main id="main" className="flex-1">{page}</main>
      <Footer />
    </div>
  );
}
