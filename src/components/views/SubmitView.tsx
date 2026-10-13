import React, { useRef, useState } from "react";
import { Plus, Trash2, UploadCloud, CheckCircle2, FileText } from "lucide-react";
import { Link, navigate, usePageTitle } from "../../lib/router";
import { ApiError, errorMessage, type Author } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { SITE, CATEGORIES, PUBLICATION_TYPES } from "../../lib/site";
import { PageHero, Field, Notice } from "../ui";

const STEPS = ["Type", "Authors", "Details", "Manuscript", "Declarations"];
const FIELD_STEP: Record<string, number> = { type: 0, category: 0, authors: 1, title: 2, abstract: 2, manuscript: 3, declarations: 4 };
const MAX_MB = 25;
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export default function SubmitView({ embedded = false }: { embedded?: boolean }) {
  usePageTitle(`Submit a manuscript | ${SITE.short}`);
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[50vh]" />;
  if (!user) return <SubmitGate />;
  return <SubmitForm embedded={embedded} />;
}

function SubmitGate() {
  return (
    <>
      <PageHero eyebrow="Manuscript submission" title="Submit your research"
        intro={<>Submissions are considered for {SITE.publishing.reviewModel.toLowerCase()} and open-access publication. {SITE.publishing.processingCharges}.</>} />
      <section className="py-14 bg-paper">
        <div className="container-x grid md:grid-cols-2 gap-6 max-w-4xl">
          <div className="card p-8">
            <h2 className="text-2xl font-semibold text-navy-ink">New to {SITE.short}?</h2>
            <p className="mt-2 text-slate-600 leading-relaxed">Create a free researcher account. You'll submit manuscripts, follow peer review, correspond with the editors and upload revisions from one place.</p>
            <Link to="/signup?next=/account/manuscripts/new" className="btn btn-navy mt-6">Create an account</Link>
          </div>
          <div className="card p-8">
            <h2 className="text-2xl font-semibold text-navy-ink">Already registered?</h2>
            <p className="mt-2 text-slate-600 leading-relaxed">Sign in to submit a new manuscript or check the ones you've already sent.</p>
            <Link to="/signin?next=/account/manuscripts/new" className="btn btn-outline mt-6">Sign in</Link>
          </div>
          <p className="md:col-span-2 text-slate-600">Before submitting, read the <Link to="/policies" className="link">editorial policies and author guidelines</Link>.</p>
        </div>
      </section>
    </>
  );
}

function SubmitForm({ embedded }: { embedded: boolean }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string>("Working Paper");
  const [category, setCategory] = useState("");
  const [authors, setAuthors] = useState<Author[]>([{ name: user!.name, affiliation: user!.institution, orcid: user!.orcid }]);
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [jel, setJel] = useState("");
  const [cover, setCover] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [decl, setDecl] = useState({ original: false, license: false, review: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");

  const [drag, setDrag] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function validate(s: number) {
    const e: Record<string, string> = {};
    if (s === 0 && !category) e.category = "Choose the research area closest to your paper.";
    if (s === 1) {
      if (!authors[0].name.trim()) e.authors = "Enter the name of the corresponding author.";
      authors.forEach((a, i) => { if (a.orcid && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(a.orcid)) e[`orcid${i}`] = "ORCID iDs look like 0000-0002-1825-0097."; });
    }
    if (s === 2) {
      if (title.trim().length < 5) e.title = "Enter the full title of the paper.";
      if (abstract.trim().length < 50) e.abstract = "The abstract must be at least 50 characters.";
      else if (words(abstract) > 300) e.abstract = `The abstract is ${words(abstract)} words. Shorten it to 300 words or fewer.`;
    }
    if (s === 3 && !file) e.manuscript = "Attach the manuscript as a PDF or Word file.";
    if (s === 4 && !(decl.original && decl.license && decl.review)) e.declarations = "Confirm all three statements to submit.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const next = () => { if (validate(step)) { setStep(step + 1); window.scrollTo(0, 0); } };
  const back = () => { setErrors({}); setStep(step - 1); window.scrollTo(0, 0); };

  function pickFile(f: File | undefined) {
    if (!f) return;
    const ok = /\.(pdf|docx?|DOCX?|PDF)$/.test(f.name);
    if (!ok) return setErrors({ manuscript: "Use a PDF (.pdf) or Word (.doc, .docx) file." });
    if (f.size > MAX_MB * 1024 * 1024) return setErrors({ manuscript: `The file is ${(f.size / 1048576).toFixed(1)} MB. The limit is ${MAX_MB} MB.` });
    setErrors({});
    setFile(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(4)) return;
    setSending(true); setFormError("");
    const fd = new FormData();
    fd.append("type", type); fd.append("category", category);
    fd.append("authors", JSON.stringify(authors.filter((a) => a.name.trim())));
    fd.append("title", title); fd.append("abstract", abstract);
    fd.append("keywords", keywords); fd.append("jelCodes", jel); fd.append("coverLetter", cover);
    fd.append("declarations", "accepted");
    fd.append("manuscript", file!);
    try {
      const res = await fetch("/api/account/submissions", { method: "POST", body: fd, credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      navigate(`/account/manuscripts/${data.id}?new=1`);
    } catch (err) {
      if (err instanceof ApiError && err.data?.errors) {
        setErrors(err.data.errors);
        const first = Math.min(...Object.keys(err.data.errors).map((k) => FIELD_STEP[k] ?? 4));
        setStep(first);
      }
      setFormError(errorMessage(err, "Your manuscript couldn't be sent. Nothing has been lost; try again in a moment."));
    } finally { setSending(false); }
  }

  const setAuthor = (i: number, k: keyof Author, v: string) => setAuthors(authors.map((a, j) => (j === i ? { ...a, [k]: v } : a)));

  const hero = embedded ? (
    <div className="mb-6"><h1 className="text-2xl sm:text-3xl font-semibold text-navy-ink">Submit a manuscript</h1><p className="mt-1.5 text-slate-600">{SITE.publishing.reviewModel}, open access, {SITE.publishing.processingCharges.toLowerCase()}. Read the <Link to="/policies" className="link">author guidelines</Link> first.</p></div>
  ) : null;

  return (
    <>
      {hero}
      {!embedded && <PageHero eyebrow="Manuscript submission" title="Submit your research"
        intro={<>Submissions are considered for {SITE.publishing.reviewModel.toLowerCase()} and open-access publication. {SITE.publishing.processingCharges}. Read the <Link to="/policies" className="underline underline-offset-2 text-white">editorial policies</Link> before submitting.</>} />}

      <section className={embedded ? "" : "py-12 bg-paper"}>
        <div className={embedded ? "max-w-3xl" : "container-x max-w-3xl"}>
          <ol className="flex gap-1.5 mb-8" aria-label="Steps">
            {STEPS.map((s, i) => (
              <li key={s} className="flex-1" aria-current={i === step ? "step" : undefined}>
                <div className={`h-1.5 rounded-full ${i <= step ? "bg-navy" : "bg-slate-200"}`} />
                <p className={`mt-2 text-xs sm:text-sm ${i === step ? "text-navy-ink font-semibold" : "text-slate-500"}`}><span className="sm:hidden">{i + 1}</span><span className="hidden sm:inline">{i + 1}. {s}</span></p>
              </li>
            ))}
          </ol>

          <form onSubmit={submit} noValidate className="card p-6 sm:p-8 space-y-6">
            {formError && <Notice tone="error">{formError}</Notice>}

            {step === 0 && (
              <>
                <h2 className="text-2xl font-semibold text-navy-ink">What are you submitting?</h2>
                <fieldset>
                  <legend className="field-label">Document type</legend>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {PUBLICATION_TYPES.filter((t) => t !== "Book").map((t) => (
                      <label key={t} className={`flex items-center gap-3 border rounded-lg p-3.5 cursor-pointer ${type === t ? "border-navy bg-paper" : "border-slate-200"}`}>
                        <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="accent-[#0a2463] w-4 h-4" />
                        <span className="font-medium">{t}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field id="category" label="Research area" error={errors.category}>
                  <select id="category" className="input" value={category} onChange={(e) => setCategory(e.target.value)} aria-invalid={!!errors.category}>
                    <option value="">Choose an area</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="text-2xl font-semibold text-navy-ink">Authors</h2>
                <p className="text-slate-600 -mt-3">List authors in the order they should appear. The first author is the corresponding author.</p>
                {errors.authors && <Notice tone="error">{errors.authors}</Notice>}
                {authors.map((a, i) => (
                  <fieldset key={i} className="border border-slate-200 rounded-lg p-4 space-y-4">
                    <legend className="px-1 font-semibold text-navy-ink">{i === 0 ? "Corresponding author" : `Co-author ${i}`}</legend>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field id={`a-name-${i}`} label="Full name"><input id={`a-name-${i}`} className="input" value={a.name} onChange={(e) => setAuthor(i, "name", e.target.value)} autoComplete={i === 0 ? "name" : "off"} /></Field>
                      <Field id={`a-aff-${i}`} label="Institution"><input id={`a-aff-${i}`} className="input" value={a.affiliation} onChange={(e) => setAuthor(i, "affiliation", e.target.value)} placeholder="University, central bank, ministry…" /></Field>
                    </div>
                    <Field id={`a-orcid-${i}`} label="ORCID iD (optional)" hint="Format 0000-0000-0000-0000" error={errors[`orcid${i}`]}>
                      <input id={`a-orcid-${i}`} className="input sm:max-w-xs" value={a.orcid} onChange={(e) => setAuthor(i, "orcid", e.target.value.trim())} aria-invalid={!!errors[`orcid${i}`]} />
                    </Field>
                    {i > 0 && <button type="button" className="btn btn-danger btn-sm" onClick={() => setAuthors(authors.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" aria-hidden /> Remove co-author</button>}
                  </fieldset>
                ))}
                {authors.length < 12 && <button type="button" className="btn btn-outline btn-sm" onClick={() => setAuthors([...authors, { name: "", affiliation: "", orcid: "" }])}><Plus className="w-4 h-4" aria-hidden /> Add a co-author</button>}
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-semibold text-navy-ink">Paper details</h2>
                <Field id="title" label="Title" error={errors.title}>
                  <input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!errors.title} />
                </Field>
                <Field id="abstract" label="Abstract" hint={`${words(abstract)} of 300 words`} error={errors.abstract}>
                  <textarea id="abstract" className="input !min-h-[200px]" value={abstract} onChange={(e) => setAbstract(e.target.value)} aria-invalid={!!errors.abstract} />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field id="keywords" label="Keywords (optional)" hint="Up to 6, separated by commas"><input id="keywords" className="input" value={keywords} onChange={(e) => setKeywords(e.target.value)} /></Field>
                  <Field id="jel" label="JEL codes (optional)" hint="For example: E52, F31"><input id="jel" className="input" value={jel} onChange={(e) => setJel(e.target.value.toUpperCase())} /></Field>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-2xl font-semibold text-navy-ink">Manuscript</h2>
                <p className="text-slate-600 -mt-3">For double-blind review, remove author names and acknowledgements from the manuscript file.</p>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files[0]); }}
                  className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${drag ? "border-navy bg-paper" : errors.manuscript ? "border-red-300" : "border-slate-300"}`}>
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 text-navy" aria-hidden />
                      <p className="font-semibold text-navy-ink break-all">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / 1048576).toFixed(2)} MB</p>
                      <button type="button" className="link text-sm mt-1" onClick={() => fileInput.current?.click()}>Choose a different file</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud className="w-10 h-10 text-slate-400" aria-hidden />
                      <p className="font-semibold text-navy-ink">Drag the file here, or</p>
                      <button type="button" className="btn btn-navy btn-sm" onClick={() => fileInput.current?.click()}>Choose a file</button>
                      <p className="text-sm text-slate-500 mt-1">PDF or Word, up to {MAX_MB} MB</p>
                    </div>
                  )}
                  <input ref={fileInput} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" aria-label="Manuscript file" onChange={(e) => pickFile(e.target.files?.[0])} />
                </div>
                {errors.manuscript && <p className="field-error" role="alert">{errors.manuscript}</p>}
                <Field id="cover" label="Cover letter (optional)" hint="Why the paper matters, and any conflicts of interest.">
                  <textarea id="cover" className="input" value={cover} onChange={(e) => setCover(e.target.value)} />
                </Field>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-2xl font-semibold text-navy-ink">Declarations</h2>
                <dl className="bg-paper rounded-lg p-4 text-[0.95rem] space-y-1.5">
                  <div><dt className="inline text-slate-500">Title: </dt><dd className="inline font-medium">{title}</dd></div>
                  <div><dt className="inline text-slate-500">Authors: </dt><dd className="inline">{authors.filter((a) => a.name).map((a) => a.name).join(", ")}</dd></div>
                  <div><dt className="inline text-slate-500">Type: </dt><dd className="inline">{type}, {category}</dd></div>
                  <div><dt className="inline text-slate-500">File: </dt><dd className="inline break-all">{file?.name}</dd></div>
                </dl>
                <fieldset className="space-y-3">
                  <legend className="sr-only">Declarations</legend>
                  {[
                    ["original", "The manuscript is original, is not under consideration elsewhere, and does not infringe anyone's copyright."],
                    ["license", `If accepted, the paper may be published open access under the ${SITE.publishing.license} licence.`],
                    ["review", "I agree to double-blind peer review, and confirm that all listed authors have approved this submission."],
                  ].map(([k, t]) => (
                    <label key={k} className="flex gap-3 items-start border border-slate-200 rounded-lg p-4 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-[#0a2463]" checked={(decl as any)[k]} onChange={(e) => setDecl({ ...decl, [k]: e.target.checked })} />
                      <span className="text-slate-700 leading-relaxed">{t}</span>
                    </label>
                  ))}
                </fieldset>
                {errors.declarations && <p className="field-error" role="alert">{errors.declarations}</p>}
              </>
            )}

            <div className="flex justify-between gap-3 pt-2 border-t border-slate-100">
              {step > 0 ? <button type="button" className="btn btn-outline" onClick={back}>Back</button> : <span />}
              {step < 4
                ? <button type="button" className="btn btn-navy" onClick={next}>Continue</button>
                : <button type="submit" className="btn btn-gold" disabled={sending}>{sending ? "Uploading…" : "Submit manuscript"}</button>}
            </div>
          </form>
          <p className="text-sm text-slate-500 mt-4">Signed in as {user!.email}. Editorial correspondence goes to this address. Questions? Write to <a className="link" href={`mailto:${SITE.email.editorial}`}>{SITE.email.editorial}</a>.</p>
        </div>
      </section>
    </>
  );
}
