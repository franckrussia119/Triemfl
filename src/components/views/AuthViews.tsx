import React, { useEffect, useState } from "react";
import { GraduationCap, Landmark, Check } from "lucide-react";
import { Link, navigate, usePageTitle } from "../../lib/router";
import { api, ApiError, errorMessage } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { SITE } from "../../lib/site";
import { Field, Notice } from "../ui";
import { Logo } from "../Navbar";

const nextFrom = (search: string) => {
  const n = new URLSearchParams(search).get("next") || "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "";
};

function AuthShell({ title, intro, children, aside }: { title: string; intro?: React.ReactNode; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-103px)] grid lg:grid-cols-2">
      <aside className="hidden lg:flex bg-navy-deep text-white on-dark relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #c8960c 0, transparent 40%), radial-gradient(circle at 80% 70%, #3a5bb0 0, transparent 45%)" }} />
        <div className="relative p-14 flex flex-col justify-center max-w-xl ml-auto">
          {aside || (
            <>
              <p className="eyebrow">Your {SITE.short} account</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight">One place for your research and projects</h2>
              <ul className="mt-8 space-y-4 text-slate-200 text-lg">
                {["Submit manuscripts and follow every stage of peer review", "Correspond with the editorial office and upload revisions", "Request independent project reviews and receive reports", "A public author profile listing your published papers"].map((t) => (
                  <li key={t} className="flex gap-3"><Check className="w-5 h-5 text-gold mt-1 shrink-0" aria-hidden />{t}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>
      <div className="flex items-start lg:items-center justify-center p-4 sm:p-10 bg-paper">
        <div className="w-full max-w-md py-8">
          <h1 className="text-3xl font-semibold text-navy-ink">{title}</h1>
          {intro && <div className="mt-2 text-slate-600">{intro}</div>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SignInView({ search }: { search: string }) {
  usePageTitle(`Sign in | ${SITE.short}`);
  const { refresh, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const next = nextFrom(search);

  useEffect(() => { if (user) navigate(next || "/account", { replace: true }); }, [user, next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await api<{ role: string }>("/api/account/signin", { method: "POST", json: { email, password } });
      await refresh();
      navigate(next || (r.role === "admin" || r.role === "editor" ? "/admin" : "/account"), { replace: true });
    } catch (x) {
      setErr(x instanceof ApiError && x.status === 401 ? "The email or password is incorrect." : x instanceof ApiError && x.status === 403 ? "This account is suspended. Contact the institute if you think this is a mistake." : errorMessage(x));
    } finally { setBusy(false); }
  }

  return (
    <AuthShell title="Sign in" intro={<>New to {SITE.short}? <Link to={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="link">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-5">
        {err && <Notice tone="error">{err}</Notice>}
        <Field id="si-email" label="Email"><input id="si-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></Field>
        <div>
          <div className="flex justify-between items-baseline"><label htmlFor="si-pw" className="field-label">Password</label><Link to="/forgot-password" className="text-sm link">Forgot password?</Link></div>
          <input id="si-pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </div>
        <button className="btn btn-navy w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </AuthShell>
  );
}

export function SignUpView({ search }: { search: string }) {
  usePageTitle(`Create an account | ${SITE.short}`);
  const { refresh } = useAuth();
  const params = new URLSearchParams(search);
  const [type, setType] = useState<"researcher" | "institution">(params.get("type") === "institution" ? "institution" : "researcher");
  const [v, setV] = useState({ name: "", email: "", password: "", institution: "", country: "", position: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ needsVerification: boolean; pendingApproval: boolean } | null>(null);
  const next = nextFrom(search);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(""); setErrors({});
    try {
      const r = await api<{ needsVerification: boolean; pendingApproval: boolean }>("/api/account/signup", { method: "POST", json: { ...v, accountType: type, terms } });
      await refresh();
      if (!r.needsVerification && !r.pendingApproval) navigate(next || "/account", { replace: true });
      else setDone(r);
    } catch (x) {
      if (x instanceof ApiError && x.data?.errors) setErrors(x.data.errors);
      setErr(errorMessage(x));
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <AuthShell title="Account created">
        <div className="space-y-4">
          {done.needsVerification && <Notice tone="success">We sent a confirmation link to <strong>{v.email}</strong>. Open it to confirm your email address.</Notice>}
          {done.pendingApproval && <Notice>Institution accounts are checked by our team before projects can be submitted. You'll receive an email when {v.institution} is approved; meanwhile you can complete your profile.</Notice>}
          <Link to="/account" className="btn btn-navy w-full">Go to my space</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create an account" intro={<>Already registered? <Link to={`/signin${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="link">Sign in</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-5">
        {err && <Notice tone="error">{err}</Notice>}
        <fieldset>
          <legend className="field-label">I'm registering as</legend>
          <div className="grid grid-cols-2 gap-2">
            {([["researcher", "A researcher", "To submit and publish papers", GraduationCap], ["institution", "An institution", "To request project reviews", Landmark]] as const).map(([k, t, d, Icon]) => (
              <label key={k} className={`border rounded-lg p-3 cursor-pointer ${type === k ? "border-navy bg-white ring-1 ring-navy" : "border-slate-300 bg-white"}`}>
                <input type="radio" name="acct" className="sr-only" checked={type === k} onChange={() => setType(k)} />
                <Icon className="w-5 h-5 text-navy" aria-hidden />
                <span className="block font-semibold text-navy-ink mt-1.5">{t}</span>
                <span className="block text-sm text-slate-600">{d}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {type === "institution" && (
          <Field id="su-inst" label="Institution name" error={errors.institution}><input id="su-inst" className="input" value={v.institution} onChange={set("institution")} placeholder="Ministry, bank, NGO, company…" aria-invalid={!!errors.institution} /></Field>
        )}
        <Field id="su-name" label={type === "institution" ? "Contact person (full name)" : "Full name"} error={errors.name}><input id="su-name" className="input" value={v.name} onChange={set("name")} autoComplete="name" aria-invalid={!!errors.name} /></Field>
        {type === "institution"
          ? <Field id="su-pos" label="Position (optional)"><input id="su-pos" className="input" value={v.position} onChange={set("position")} placeholder="e.g. Director of Planning" /></Field>
          : <Field id="su-aff" label="Institution (optional)"><input id="su-aff" className="input" value={v.institution} onChange={set("institution")} placeholder="University, central bank, ministry…" /></Field>}
        <Field id="su-country" label="Country (optional)"><input id="su-country" className="input" value={v.country} onChange={set("country")} autoComplete="country-name" /></Field>
        <Field id="su-email" label="Email" error={errors.email}><input id="su-email" type="email" className="input" value={v.email} onChange={set("email")} autoComplete="email" aria-invalid={!!errors.email} /></Field>
        <Field id="su-pw" label="Password" hint="At least 10 characters, with letters and numbers." error={errors.password}><input id="su-pw" type="password" className="input" value={v.password} onChange={set("password")} autoComplete="new-password" aria-invalid={!!errors.password} /></Field>
        <label className="flex gap-3 items-start text-[0.95rem] text-slate-700">
          <input type="checkbox" className="mt-1 w-4 h-4 accent-[#0a2463]" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          <span>I agree that {SITE.short} stores my details to manage my submissions and requests, in line with the <Link to="/policies" className="link">editorial policies</Link>.</span>
        </label>
        {errors.terms && <p className="field-error">{errors.terms}</p>}
        <button className="btn btn-navy w-full" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
      </form>
    </AuthShell>
  );
}

export function VerifyView({ search }: { search: string }) {
  usePageTitle(`Confirm email | ${SITE.short}`);
  const { refresh } = useAuth();
  const [state, setState] = useState<"working" | "ok" | "bad">("working");
  useEffect(() => {
    const token = new URLSearchParams(search).get("token") || "";
    api("/api/account/verify", { method: "POST", json: { token } }).then(() => { setState("ok"); refresh(); }).catch(() => setState("bad"));
  }, [search, refresh]);
  return (
    <AuthShell title={state === "ok" ? "Email confirmed" : state === "bad" ? "This link doesn't work" : "Confirming…"}>
      {state === "ok" && <Link to="/account" className="btn btn-navy w-full">Go to my space</Link>}
      {state === "bad" && <><Notice>The link has expired or was already used. Sign in and ask for a new confirmation email from your space.</Notice><Link to="/signin" className="btn btn-navy w-full mt-4">Sign in</Link></>}
    </AuthShell>
  );
}

export function ForgotView() {
  usePageTitle(`Reset password | ${SITE.short}`);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<null | boolean>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    try { const r = await api<{ emailEnabled: boolean }>("/api/account/forgot", { method: "POST", json: { email } }); setSent(r.emailEnabled); }
    catch (x) { setErr(errorMessage(x)); } finally { setBusy(false); }
  }
  return (
    <AuthShell title="Reset your password" intro="Enter the email address of your account. We'll send you a link to choose a new password.">
      {sent === null ? (
        <form onSubmit={submit} className="space-y-5">
          {err && <Notice tone="error">{err}</Notice>}
          <Field id="fp-email" label="Email"><input id="fp-email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
          <button className="btn btn-navy w-full" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
        </form>
      ) : sent ? (
        <Notice tone="success">If an account exists for {email}, a reset link is on its way. Check your inbox and spam folder.</Notice>
      ) : (
        <Notice>Password emails aren't switched on yet. Contact <a className="link" href={`mailto:${SITE.email.general}`}>{SITE.email.general}</a> and the team will send you a reset link.</Notice>
      )}
    </AuthShell>
  );
}

export function ResetView({ search }: { search: string }) {
  const params = new URLSearchParams(search);
  const welcome = params.get("welcome") === "1";
  usePageTitle(`${welcome ? "Set your password" : "Choose a new password"} | ${SITE.short}`);
  const { refresh } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setErr("The two passwords don't match.");
    setBusy(true); setErr("");
    try { await api("/api/account/reset", { method: "POST", json: { token: params.get("token"), password } }); await refresh(); navigate("/account", { replace: true }); }
    catch (x) { setErr(x instanceof ApiError && x.data?.error === "invalid_token" ? "This link has expired or was already used. Ask for a new one." : x instanceof ApiError && x.data?.errors?.password ? x.data.errors.password : errorMessage(x)); }
    finally { setBusy(false); }
  }
  return (
    <AuthShell title={welcome ? "Welcome. Set your password" : "Choose a new password"}>
      <form onSubmit={submit} className="space-y-5">
        {err && <Notice tone="error">{err} {err.includes("expired") && <Link to="/forgot-password" className="link">Request a new link</Link>}</Notice>}
        <Field id="rp-pw" label="New password" hint="At least 10 characters, with letters and numbers."><input id="rp-pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required /></Field>
        <Field id="rp-pw2" label="Repeat the password"><input id="rp-pw2" type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required /></Field>
        <button className="btn btn-navy w-full" disabled={busy}>{busy ? "Saving…" : "Save password and sign in"}</button>
      </form>
    </AuthShell>
  );
}

export { Logo };
