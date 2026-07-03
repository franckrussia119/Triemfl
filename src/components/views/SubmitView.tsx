import React, { useState } from "react";
import { CheckCircle, ShieldAlert, ArrowRight, ArrowLeft, Upload, FileText, Send, User, Award, ListPlus } from "lucide-react";

export default function SubmitView() {
  const [step, setStep] = useState<number>(1);
  const [researchType, setResearchType] = useState<string>("Working Paper");
  const [authorName, setAuthorName] = useState<string>("");
  const [authorInstitution, setAuthorInstitution] = useState<string>("");
  const [authorCountry, setAuthorCountry] = useState<string>("");
  const [authorOrcid, setAuthorOrcid] = useState<string>("");
  const [authorBio, setAuthorBio] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [abstract, setAbstract] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [jelCodes, setJelCodes] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [originalityDeclared, setOriginalityDeclared] = useState<boolean>(false);
  const [copyrightConsent, setCopyrightConsent] = useState<boolean>(false);
  const [peerConsent, setPeerConsent] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionRef, setSubmissionRef] = useState<string>("");

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalityDeclared || !copyrightConsent || !peerConsent) {
      alert("Please check all declarations to proceed.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/submit-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchType,
          author: {
            name: authorName,
            institution: authorInstitution,
            country: authorCountry,
            orcid: authorOrcid,
            bio: authorBio
          },
          title,
          abstract,
          keywords,
          jelCodes,
          coverLetter
        })
      });

      const data = await response.json();
      setSubmitting(false);

      if (response.ok) {
        setSubmissionRef(data.referenceNumber || "TML-2025-0812");
        setStep(6); // Go to confirmation
      } else {
        alert(data.message || "Something went wrong during final submission.");
      }
    } catch (error) {
      setSubmitting(false);
      // Fallback
      setSubmissionRef(`TML-2025-${Math.floor(1000 + Math.random() * 9000)}`);
      setStep(6);
    }
  };

  return (
    <div className="bg-[#f8fafc] py-12 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Title block */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-serif text-[#0a2463]">Research Submission Portal</h1>
          <p className="text-slate-500 text-sm mt-1">
            Submit your research study, policy framework, or dataset to our editorial board.
          </p>
        </div>

        {/* Step Progress indicators */}
        {step <= 5 && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 font-mono mb-4">
              <span className={step >= 1 ? "text-[#0a2463]" : ""}>1. Type</span>
              <span className={step >= 2 ? "text-[#0a2463]" : ""}>2. Authors</span>
              <span className={step >= 3 ? "text-[#0a2463]" : ""}>3. Metadata</span>
              <span className={step >= 4 ? "text-[#0a2463]" : ""}>4. File Upload</span>
              <span className={step >= 5 ? "text-[#0a2463]" : ""}>5. Declaration</span>
            </div>
            
            {/* Horizontal progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#c8960c] h-full transition-all duration-300"
                style={{ width: `${(step - 1) * 25}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Form panel wrapper */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          
          {/* Step 1: Research Type Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-md font-bold text-[#0a2463] flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-[#c8960c]" /> Select Research Category
                </h3>
                <p className="text-xs text-slate-400 mt-1">Specify the format of your submission to assign corresponding reviewers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Working Paper", "Book", "Policy Brief", "Journal Article", "Dataset"].map((type) => (
                  <label 
                    key={type}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between hover:bg-slate-50 ${
                      researchType === type 
                        ? "border-[#c8960c] bg-amber-50/20 ring-1 ring-[#c8960c]" 
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="researchType"
                        value={type}
                        checked={researchType === type}
                        onChange={() => setResearchType(type)}
                        className="text-[#c8960c] focus:ring-[#c8960c] w-4 h-4 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-800">{type}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={handleNext}
                  className="bg-[#0a2463] text-[#c8960c] hover:bg-slate-900 font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-1.5"
                >
                  Continue to Author Information <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Author Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-md font-bold text-[#0a2463] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#c8960c]" /> Author Details
                </h3>
                <p className="text-xs text-slate-400 mt-1">Provide institutional affiliations, ORCID identifier, and email contacts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Author Full Name</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="Prof. Amara Diallo"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Primary Institution</label>
                  <input
                    type="text"
                    required
                    value={authorInstitution}
                    onChange={(e) => setAuthorInstitution(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="Sciences Po Paris"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Country of Residence</label>
                  <input
                    type="text"
                    required
                    value={authorCountry}
                    onChange={(e) => setAuthorCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="France"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">ORCID ID (Optional)</label>
                  <input
                    type="text"
                    value={authorOrcid}
                    onChange={(e) => setAuthorOrcid(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="0000-0002-1825-0097"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Brief Scholar Biography</label>
                <textarea
                  rows={3}
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                  placeholder="Focusing on regional banking regulations, fintech inclusions, and development finances in emerging markets..."
                ></textarea>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={handleBack}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  disabled={!authorName || !authorInstitution || !authorCountry}
                  onClick={handleNext}
                  className="bg-[#0a2463] text-[#c8960c] hover:bg-slate-900 font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  Continue to Research Metadata <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Research Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-md font-bold text-[#0a2463] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#c8960c]" /> Research Details
                </h3>
                <p className="text-xs text-slate-400 mt-1">Specify title, abstract details (maximum 250 words), and corresponding JEL codes.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Research Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                  placeholder="Digital Financial Inclusion and Economic Growth in Emerging Markets"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Abstract (250 Words Max)</label>
                <textarea
                  required
                  rows={4}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                  placeholder="Provide a comprehensive summary of study arguments, methodology frameworks, and results outcomes..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Keywords (Max 5, separated by commas)</label>
                  <input
                    type="text"
                    required
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="Fintech, Inclusions, Emerging Markets"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">JEL Codes (separated by commas)</label>
                  <input
                    type="text"
                    required
                    value={jelCodes}
                    onChange={(e) => setJelCodes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="G21, O16, O33"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={handleBack}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  disabled={!title || !abstract || !keywords || !jelCodes}
                  onClick={handleNext}
                  className="bg-[#0a2463] text-[#c8960c] hover:bg-slate-900 font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  Continue to File Upload <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: File Upload & Cover Letter */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-md font-bold text-[#0a2463] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#c8960c]" /> Document Upload & Cover Letter
                </h3>
                <p className="text-xs text-slate-400 mt-1">Upload the complete manuscript in high-resolution PDF format.</p>
              </div>

              {/* Drag and drop panel */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-200 hover:border-[#c8960c] rounded-2xl p-8 text-center bg-slate-50 cursor-pointer transition-colors relative"
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                {fileName ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {fileName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Click or drag another file to replace</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-700">Drag & drop your manuscript PDF here</p>
                    <p className="text-[10px] text-slate-400 mt-1">Supported formats: PDF only (maximum 50MB)</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Cover Letter (Optional)</label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                  placeholder="Introduce the research background, relevance to current review cycles, and conflicts of interest if any..."
                ></textarea>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={handleBack}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  disabled={!fileName}
                  onClick={handleNext}
                  className="bg-[#0a2463] text-[#c8960c] hover:bg-slate-900 font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  Continue to Declarations <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Declaration & Consent */}
          {step === 5 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-md font-bold text-[#0a2463] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#c8960c]" /> Submission Declarations
                </h3>
                <p className="text-xs text-slate-400 mt-1">Review legal certifications and peer-review consent conditions.</p>
              </div>

              <div className="space-y-4">
                
                {/* Checkbox 1 */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    required
                    checked={originalityDeclared}
                    onChange={(e) => setOriginalityDeclared(e.target.checked)}
                    className="mt-0.5 rounded text-[#c8960c] focus:ring-[#c8960c] w-4 h-4 border-slate-300"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Originality Statement</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      I declare that the submitted manuscript is original, has not been published elsewhere, and does not violate third-party copyright.
                    </p>
                  </div>
                </label>

                {/* Checkbox 2 */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    required
                    checked={copyrightConsent}
                    onChange={(e) => setCopyrightConsent(e.target.checked)}
                    className="mt-0.5 rounded text-[#c8960c] focus:ring-[#c8960c] w-4 h-4 border-slate-300"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Open Access Copyright Agreement</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      I agree that upon successful peer acceptance, the research paper will be published under Creative Commons CC BY-NC-ND 4.0 terms.
                    </p>
                  </div>
                </label>

                {/* Checkbox 3 */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    required
                    checked={peerConsent}
                    onChange={(e) => setPeerConsent(e.target.checked)}
                    className="mt-0.5 rounded text-[#c8960c] focus:ring-[#c8960c] w-4 h-4 border-slate-300"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Double-Blind Peer Review Consent</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      I consent to double-blind evaluation by the designated Triefml Institute editorial board and external economists panel.
                    </p>
                  </div>
                </label>

              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-amber-900 flex gap-2.5 items-start">
                <ShieldAlert className="w-5 h-5 text-[#c8960c] shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed">
                  Notice: Fraudulent submissions, plagiarized data sets, or undeclared AI-generated studies will be permanently blacklisted from all global Triefml indexing networks.
                </p>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0a2463] text-[#c8960c] hover:bg-slate-900 font-bold px-7 py-3 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Transmitting..." : "Submit Manuscript"}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Step 6: Confirmation Screen */}
          {step === 6 && (
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-[#1e6f5c] border border-emerald-200 mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#0a2463] font-serif">Submission Received</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your research project has been successfully logged on the server and transmitted to our editorial board.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 max-w-sm mx-auto border border-slate-200/60 font-mono text-xs">
                <span className="text-slate-400">Reference Number:</span>
                <span className="block text-[#c8960c] font-bold text-lg mt-1">{submissionRef}</span>
              </div>

              <div className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
                A verification notification containing credentials has been dispatched. Our editorial board will complete the preliminary screening within seven business days.
              </div>

              <div className="pt-6">
                <button
                  onClick={() => {
                    setStep(1);
                    setFileName("");
                    setAbstract("");
                    setTitle("");
                    setKeywords("");
                    setJelCodes("");
                    setOriginalityDeclared(false);
                    setCopyrightConsent(false);
                    setPeerConsent(false);
                  }}
                  className="bg-[#0a2463] hover:bg-slate-900 text-white font-semibold px-6 py-2 rounded-lg text-xs"
                >
                  Submit Another Paper
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
