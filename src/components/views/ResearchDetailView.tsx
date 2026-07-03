import React, { useState, useMemo } from "react";
import { ArrowLeft, Download, Bookmark, Share2, Quote, Star, User, Landmark, Clock, Award, FileText, Send, CheckCircle } from "lucide-react";
import { researchPapers, getCategoryColor, ResearchPaper } from "../../lib/research-data";

interface ResearchDetailViewProps {
  paperId: string;
  onBack: () => void;
  onViewChange: (view: string, extraData?: any) => void;
  onIncrementDownload: (paperId: string) => void;
  onOpenCitation: (paper: any) => void;
}

export default function ResearchDetailView({
  paperId,
  onBack,
  onViewChange,
  onIncrementDownload,
  onOpenCitation
}: ResearchDetailViewProps) {
  // Find the current paper
  const paper = useMemo(() => {
    return researchPapers.find(p => p.id === paperId) || researchPapers[0];
  }, [paperId]);

  // Comments State
  const [comments, setComments] = useState<Array<{ name: string; institution: string; date: string; text: string }>>([
    {
      name: "Prof. Jean-Paul Kamdem",
      institution: "African Development Bank Institute",
      date: "2026-06-12",
      text: "This econometric framework offers pristine clarity on the sluggish pass-through rates. The credit channel pass-through coefficients seem to align perfectly with previous studies in Southern Africa."
    },
    {
      name: "Dr. Catherine Vance",
      institution: "World Bank Group",
      date: "2026-06-20",
      text: "The inclusion of dynamic panel variables addresses previous modeling inconsistencies. This is a very solid addition to the sub-regional monetary stabilization policy debate."
    }
  ]);
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentInst, setNewCommentInst] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Citation Tab State inside detail view
  const [activeCiteTab, setActiveCiteTab] = useState<string>("apa");
  const [copiedCite, setCopiedCite] = useState(false);

  const citations = useMemo(() => {
    const year = paper.publishedDate.split("-")[0];
    const initial = paper.authors.split(" ").pop()?.charAt(0) || "X";
    const lastName = paper.authors.split(" ").slice(-1)[0] || "Author";

    return {
      apa: `${lastName}, ${initial}. (${year}). ${paper.title}. TriefML Economic Review, 14(2), 15-32.`,
      mla: `${lastName}, ${paper.authors.split(" ")[1] || ""}. "${paper.title}." TriefML Economic Review, vol. 14, no. 2, ${year}, pp. 15-32.`,
      chicago: `${lastName}, ${paper.authors.split(" ")[1] || ""}. "${paper.title}." TriefML Economic Review 14, no. 2 (${year}): 15-32.`,
      harvard: `${lastName}, ${initial}., ${year}. ${paper.title}. TriefML Economic Review, 14(2), pp.15-32.`
    };
  }, [paper]);

  const handleCopyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCite(true);
    setTimeout(() => setCopiedCite(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentName.trim() && newCommentText.trim()) {
      const newComment = {
        name: newCommentName,
        institution: newCommentInst || "Independent Economist",
        date: new Date().toISOString().split("T")[0],
        text: newCommentText
      };
      setComments(prev => [...prev, newComment]);
      setNewCommentName("");
      setNewCommentInst("");
      setNewCommentText("");
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
    }
  };

  // Related Papers matchmaking
  const relatedPapers = useMemo(() => {
    return researchPapers
      .filter(p => p.category === paper.category && p.id !== paper.id)
      .slice(0, 3);
  }, [paper]);

  const catColor = getCategoryColor(paper.category);

  return (
    <div className="bg-[#f8fafc] py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb back button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0a2463] hover:text-[#c8960c] bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Research Directory
        </button>

        {/* 2 Column Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Full scholarly review */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Main scholarly paper view */}
            <div className="editorial-card border-l-[4px] border-l-[#0a2463] p-8 relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: catColor }}
              ></div>

              <div className="flex justify-between items-center mb-6">
                <span 
                  className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: `${catColor}15`, color: catColor }}
                >
                  {paper.category}
                </span>
                <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5" /> Published: {paper.publishedDate}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0a2463] tracking-tight leading-tight">
                {paper.title}
              </h1>

              <div className="mt-4 pb-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-800">{paper.authors}</h4>
                  <p className="text-xs text-slate-500 font-serif">{paper.institution}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-amber-50 text-[#c8960c] rounded-lg px-2.5 py-1 text-xs font-mono font-bold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" /> {paper.rating} Score
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ISSN 1984-2034
                  </div>
                </div>
              </div>

              {/* Research Abstract */}
              <div className="pt-6 space-y-4">
                <h3 className="text-xs font-bold text-[#0a2463] uppercase tracking-wider font-mono">Abstract</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/50 p-5 rounded-xl border border-slate-100 italic">
                  {paper.abstract}
                </p>
              </div>

              {/* Mock full text paragraphs for scholarly look */}
              <div className="pt-8 space-y-6 text-xs text-slate-600 leading-relaxed font-sans border-t border-slate-100 mt-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">1. Introduction and Literature Review</h3>
                <p>
                  Structural parameters of global currency allocations and local bank lending mechanisms are increasingly subject to regional credit volatility. Scholars have long argued that while central interest rates act as a primary steering tool, the direct pass-through coefficients depend fundamentally on commercial cash indices and non-governmental debt margins.
                </p>
                <p>
                  In this study, we provide a unified panel dataset tracking these transmissions. By simulating dynamic panel vector autoregressions (PVAR), we demonstrate that structural constraints inside local institutions introduce substantial friction. This paper outlines secondary recommendations to address structural liquidity bottlenecks.
                </p>

                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mt-6">2. Empirical Methodology and Modeling</h3>
                <p>
                  Our modeling parameters utilize standard vector error correction frameworks. We define subnational asset ratios under stochastic constraints, matching cross-border coordinates with localized agricultural corridor yields. The results are double-blind verified under strict COPE quality protocols.
                </p>
              </div>

              {/* Keywords and metadata details */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4 justify-between items-center text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {paper.tags.map((tag, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="text-slate-400 font-mono text-[10px] flex gap-3">
                  <span>Views: {paper.views}</span>
                  <span>•</span>
                  <span>Citations: {paper.citations}</span>
                </div>
              </div>

            </div>

            {/* Citation Generator section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Quote className="w-5 h-5 text-[#c8960c]" />
                <h3 className="text-sm font-bold text-[#0a2463] uppercase tracking-wide">Scholarly Citation Generator</h3>
              </div>

              {/* Citation tabs */}
              <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                {["apa", "mla", "chicago", "harvard"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveCiteTab(tab); setCopiedCite(false); }}
                    className={`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase rounded-md transition-all ${
                      activeCiteTab === tab 
                        ? "bg-white text-[#0a2463] shadow-sm" 
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Citation Content block */}
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-[11px] text-slate-600 break-words leading-relaxed relative group">
                {activeCiteTab === "apa" && citations.apa}
                {activeCiteTab === "mla" && citations.mla}
                {activeCiteTab === "chicago" && citations.chicago}
                {activeCiteTab === "harvard" && citations.harvard}
                
                <button
                  onClick={() => {
                    const citeText = citations[activeCiteTab as keyof typeof citations];
                    handleCopyCitation(citeText);
                  }}
                  className="absolute right-2 top-2 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-[10px] font-bold text-[#0a2463] shadow-sm transition-all"
                >
                  {copiedCite ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Peer Commentary and Peer Feedback Section */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-md font-bold text-[#0a2463]">Peer Commentary & Discussion</h3>
                <p className="text-xs text-slate-400 mt-0.5">Participate in open scientific dialogue. Standard double-blind ethics apply.</p>
              </div>

              {/* Comments List */}
              <div className="space-y-5">
                {comments.map((comm, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0a2463] text-[#c8960c] text-xs font-bold flex items-center justify-center shrink-0">
                      {comm.name.split(" ").pop()?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h4 className="text-xs font-bold text-[#0a2463]">{comm.name}</h4>
                        <span className="text-[9px] text-slate-400 font-serif">{comm.institution}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{comm.text}</p>
                      <span className="text-[9px] text-slate-400 font-mono block mt-2">{comm.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="border-t border-slate-100 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Write a Peer Comment</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name (e.g. Dr. John Doe)"
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                  />
                  <input
                    type="text"
                    placeholder="Institutional Affiliation"
                    value={newCommentInst}
                    onChange={(e) => setNewCommentInst(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                  />
                </div>

                <textarea
                  required
                  rows={3}
                  placeholder="Draft your scientific inquiry, counterarguments, or econometric validations here..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                ></textarea>

                <button
                  type="submit"
                  className="bg-[#0a2463] text-[#c8960c] hover:bg-slate-900 font-bold px-5 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  Post Peer Comment <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {commentSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle className="w-4 h-4 text-[#1e6f5c]" />
                  <span>Your commentary has been logged on this study bulletin board.</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Author sidebar & related articles */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Sidebar Author card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                Primary Author
              </h3>

              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-[#0a2463] text-[#c8960c] font-bold text-sm flex items-center justify-center shrink-0">
                  {paper.authors.split(" ").pop()?.charAt(0) || "U"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0a2463]">{paper.authors}</h4>
                  <p className="text-xs text-slate-500 font-serif leading-tight">{paper.institution}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-normal space-y-2">
                <p>
                  Senior research affiliate with extensive peer registries focusing on {paper.category.toLowerCase()} and localized stabilization structures.
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  ORCID identification: 0000-0002-1825-0097
                </div>
              </div>

              <button
                onClick={() => onIncrementDownload(paper.id)}
                className="w-full bg-[#1e6f5c] hover:bg-[#165244] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Full Paper PDF
              </button>
            </div>

            {/* Related Research articles */}
            {relatedPapers.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                  Related Research
                </h3>

                <div className="space-y-4">
                  {relatedPapers.map((rel) => (
                    <div 
                      key={rel.id} 
                      onClick={() => onViewChange("research-detail", { id: rel.id })}
                      className="group cursor-pointer space-y-1.5"
                    >
                      <h4 className="text-xs font-bold text-[#0a2463] group-hover:text-[#c8960c] transition-colors leading-snug line-clamp-2">
                        {rel.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {rel.authors} • {rel.publishedDate.split("-")[0]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
