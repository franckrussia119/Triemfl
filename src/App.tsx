import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./components/views/HomeView";
import ResearchView from "./components/views/ResearchView";
import PublicationsView from "./components/views/PublicationsView";
import ProjectReviewView from "./components/views/ProjectReviewView";
import ConsultingView from "./components/views/ConsultingView";
import AboutView from "./components/views/AboutView";
import SubmitView from "./components/views/SubmitView";
import ContactView from "./components/views/ContactView";
import ResearchDetailView from "./components/views/ResearchDetailView";
import { researchPapers, ResearchPaper } from "./lib/research-data";
import { Copy, X, Check, Award, ShieldAlert, BookOpen } from "lucide-react";

export default function App() {
  // Navigation tabs state
  const [currentView, setCurrentView] = useState<string>("home");
  const [selectedPaperId, setSelectedPaperId] = useState<string>("1");
  const [initialCategoryFilter, setInitialCategoryFilter] = useState<string>("");

  // Search input state shared between navbar and pages
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Download tracker state
  const [paperStats, setPaperStats] = useState<Record<string, number>>({});

  // Citation Modal State
  const [activeCitePaper, setActiveCitePaper] = useState<ResearchPaper | null>(null);
  const [activeCiteTab, setActiveCiteTab] = useState<string>("apa");
  const [copiedCite, setCopiedCite] = useState<boolean>(false);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, selectedPaperId]);

  // View transition orchestrator
  const handleViewChange = (view: string, extraData?: any) => {
    if (view === "research-detail") {
      if (extraData?.id) {
        setSelectedPaperId(extraData.id);
      }
      setCurrentView("research-detail");
    } else {
      if (view === "research") {
        if (extraData?.selectedCategory) {
          setInitialCategoryFilter(extraData.selectedCategory);
        } else {
          setInitialCategoryFilter("");
        }
      }
      setCurrentView(view);
    }
  };

  // Download count incrementer (local state tracker)
  const handleIncrementDownload = (paperId: string) => {
    setPaperStats(prev => ({
      ...prev,
      [paperId]: (prev[paperId] || 0) + 1
    }));
    
    // Find the paper title to alert
    const target = researchPapers.find(p => p.id === paperId);
    alert(`Initiating download of high-resolution PDF for paper: "${target?.title}". Under open-access licenses, this publication has no processing charges.`);
  };

  // Open global Citation modal
  const handleOpenCitation = (paper: ResearchPaper) => {
    setActiveCitePaper(paper);
    setActiveCiteTab("apa");
    setCopiedCite(false);
  };

  // Modal citation strings
  const activeCitations = activeCitePaper ? {
    apa: `${activeCitePaper.authors.split(" ").slice(-1)[0] || "Author"}, ${activeCitePaper.authors.split(" ").pop()?.charAt(0) || "X"}. (${activeCitePaper.publishedDate.split("-")[0]}). ${activeCitePaper.title}. TriefML Economic Review, 14(2), 15-32.`,
    mla: `${activeCitePaper.authors.split(" ").slice(-1)[0] || "Author"}, ${activeCitePaper.authors.split(" ")[1] || ""}. "${activeCitePaper.title}." TriefML Economic Review, vol. 14, no. 2, ${activeCitePaper.publishedDate.split("-")[0]}, pp. 15-32.`,
    chicago: `${activeCitePaper.authors.split(" ").slice(-1)[0] || "Author"}, ${activeCitePaper.authors.split(" ")[1] || ""}. "${activeCitePaper.title}." TriefML Economic Review 14, no. 2 (${activeCitePaper.publishedDate.split("-")[0]}): 15-32.`,
    harvard: `${activeCitePaper.authors.split(" ").slice(-1)[0] || "Author"}, ${activeCitePaper.authors.split(" ").pop()?.charAt(0) || "X"}., ${activeCitePaper.publishedDate.split("-")[0]}. ${activeCitePaper.title}. TriefML Economic Review, 14(2), pp.15-32.`
  } : null;

  const handleCopyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCite(true);
    setTimeout(() => setCopiedCite(false), 2000);
  };

  return (
    <div id="triefml-platform" className="min-h-screen flex flex-col justify-between bg-[#f8fafc]">
      
      {/* Navbar section */}
      <Navbar 
        currentView={currentView} 
        onViewChange={handleViewChange} 
        onSearchSubmit={setSearchQuery} 
      />

      {/* Main View Area Routing Container */}
      <main id="view-stage" className="flex-1">
        {currentView === "home" && (
          <HomeView 
            onViewChange={handleViewChange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenCitation={handleOpenCitation}
            onIncrementDownload={handleIncrementDownload}
          />
        )}

        {currentView === "research" && (
          <ResearchView 
            onViewChange={handleViewChange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            initialCategoryFilter={initialCategoryFilter}
            onOpenCitation={handleOpenCitation}
            onIncrementDownload={handleIncrementDownload}
          />
        )}

        {currentView === "publications" && (
          <PublicationsView />
        )}

        {currentView === "project-review" && (
          <ProjectReviewView />
        )}

        {currentView === "consulting" && (
          <ConsultingView />
        )}

        {currentView === "about" && (
          <AboutView />
        )}

        {currentView === "submit" && (
          <SubmitView />
        )}

        {currentView === "contact" && (
          <ContactView />
        )}

        {currentView === "research-detail" && (
          <ResearchDetailView 
            paperId={selectedPaperId}
            onBack={() => setCurrentView("research")}
            onViewChange={handleViewChange}
            onIncrementDownload={handleIncrementDownload}
            onOpenCitation={handleOpenCitation}
          />
        )}
      </main>

      {/* Footer section */}
      <Footer onViewChange={handleViewChange} />

      {/* Shared Citation Modal Component */}
      {activeCitePaper && activeCitations && (
        <div id="citation-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#c8960c]" />
                <h3 className="text-sm font-bold text-[#0a2463] uppercase tracking-wide">Academic Citation</h3>
              </div>
              <button 
                onClick={() => setActiveCitePaper(null)}
                className="text-slate-400 hover:text-slate-700 focus:outline-none p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Paper Title preview */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#c8960c] bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                {activeCitePaper.category}
              </span>
              <h4 className="text-xs font-bold text-slate-800 leading-tight pt-1.5">
                {activeCitePaper.title}
              </h4>
              <p className="text-[10px] text-slate-400">By {activeCitePaper.authors}</p>
            </div>

            {/* Citations style toggle tabs */}
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
              {["apa", "mla", "chicago", "harvard"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveCiteTab(tab); setCopiedCite(false); }}
                  className={`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase rounded transition-all ${
                    activeCiteTab === tab 
                      ? "bg-white text-[#0a2463] shadow-sm" 
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Selected Citation display and copy */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-[11px] text-slate-600 break-words leading-relaxed relative min-h-[70px]">
              {activeCiteTab === "apa" && activeCitations.apa}
              {activeCiteTab === "mla" && activeCitations.mla}
              {activeCiteTab === "chicago" && activeCitations.chicago}
              {activeCiteTab === "harvard" && activeCitations.harvard}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveCitePaper(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = activeCitations[activeCiteTab as keyof typeof activeCitations];
                  handleCopyCitation(val);
                }}
                className="bg-[#0a2463] text-[#c8960c] hover:bg-slate-900 font-bold px-5 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                {copiedCite ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCite ? "Copied to Clipboard" : "Copy to Clipboard"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
