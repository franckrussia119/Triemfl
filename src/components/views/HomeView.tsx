import React, { useState, useEffect } from "react";
import { Search, ArrowRight, Download, Star, CheckCircle, FileText, Send, Landmark, GraduationCap, Award, BarChart3, Users, Globe2, Sparkles, AlertCircle, ChevronLeft, ChevronRight, Shield, Scale, Library, HelpCircle } from "lucide-react";
import { researchPapers, getCategoryColor } from "../../lib/research-data";
import { publications } from "../../lib/publications-data";

interface HomeViewProps {
  onViewChange: (view: string, extraData?: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCitation: (paper: any) => void;
  onIncrementDownload: (paperId: string) => void;
}

export default function HomeView({ onViewChange, searchQuery, setSearchQuery, onOpenCitation, onIncrementDownload }: HomeViewProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [emailInput, setEmailInput] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const subInstitutes = [
    {
      title: "Tango Banking & Capital Markets Institute",
      acronym: "TRIEFML-BCM",
      specification: "Commercial Banking Stability, Basel IV Compliance & Liquidity stress testing.",
      details: "Monitors systemic risk coefficients, debt coverage formulas, and deposit disintermediation variables under high interest rate shocks. Serves as the key standards committee for regional bank capitalization requirements.",
      metric: "Stress tested 120+ regional bank portfolios",
      director: "Dr. Amara Diallo (Former Lead, Fintech & Banking Reforms)",
      type: "Finance & Banking",
      colorClass: "border-l-blue-600 bg-blue-50/50",
      accentColor: "#0052cc",
      badgeBg: "bg-blue-100 text-blue-800"
    },
    {
      title: "Tango Sovereign Debt & Macro-Fiscal Center",
      acronym: "TRIEFML-SDM",
      specification: "Sovereign Debt Sustainability Modeling, Fiscal Space Expansion & Treasury rules.",
      details: "Publishes the Stochastic Fiscal Rule Index (SFRI). Expert evaluations on infrastructure bond issuances, debt-to-GDP elasticity boundaries, and regional currency reserves management guidelines.",
      metric: "Active policy guidelines integrated in 14 countries",
      director: "Dr. Bertrand Mvogo (Former Director, Fiscal Space Division)",
      type: "Macro-Fiscal",
      colorClass: "border-l-emerald-600 bg-emerald-50/50",
      accentColor: "#1e6f5c",
      badgeBg: "bg-emerald-100 text-emerald-800"
    },
    {
      title: "Tango Jurisprudence, Codification & Public Law Institute",
      acronym: "TRIEFML-LAW",
      specification: "Treaty Audits, Antitrust Regulations & Transnational Trade Harmonization.",
      details: "Evaluates international economic agreements and regional regulatory alignment. Sets standard legal frameworks to resolve cross-border contract friction and eliminate double-taxation ambiguities.",
      metric: "22 multinational trade agreements standardized",
      director: "Prof. Sarah Jenkins (Senior Fellow, Public Law & Policy)",
      type: "Jurisprudence & Law",
      colorClass: "border-l-red-600 bg-red-50/50",
      accentColor: "#8b1a1a",
      badgeBg: "bg-red-100 text-red-800"
    },
    {
      title: "Tango Strategic Management & Corporate Governance Board",
      acronym: "TRIEFML-MGT",
      specification: "Enterprise Risk Management, Board Accountability Scales & Institutional design.",
      details: "Maintains the Board Accountability Scorecard (BAS) utilized by state enterprises and sovereign wealth funds to prevent corporate leakage, standardize audits, and optimize supply-chain resilience.",
      metric: "Over 340+ state enterprise audits certified",
      director: "Dr. Catherine Vance (Senior Strategic Advisor, Governance Division)",
      type: "Management & Governance",
      colorClass: "border-l-purple-600 bg-purple-50/50",
      accentColor: "#581c87",
      badgeBg: "bg-purple-100 text-purple-800"
    },
    {
      title: "Tango Project Evaluation & Economic Feasibility Council",
      acronym: "TRIEFML-PEAC",
      specification: "Independent Project Examination, Cost-Benefit Auditing & Corridor modeling.",
      details: "Conducts strict empirical examinations of proposed public-works and industrial initiatives. Coordinates multi-lateral bank criteria to ensure capital alignment with real productivity outcomes.",
      metric: "$45B in regional infrastructure project reviews",
      director: "Dr. Emmanuel Osei (Chairperson, Technical Advisory Council)",
      type: "Project Examination",
      colorClass: "border-l-amber-600 bg-amber-50/50",
      accentColor: "#b45309",
      badgeBg: "bg-amber-100 text-amber-800"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % subInstitutes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [subInstitutes.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % subInstitutes.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + subInstitutes.length) % subInstitutes.length);
  };

  // Filter categories
  const categories = ["All", "Macroeconomics", "Development", "Finance", "Trade", "Policy", "Agricultural"];

  const filteredPapers = researchPapers
    .filter(p => activeCategory === "All" || p.category === activeCategory)
    .slice(0, 6);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setNewsletterSubscribed(true);
      setEmailInput("");
    }
  };

  const authors = [
    { name: "Dr. Kofi Mensah", specialty: "Macroeconomics", institution: "University of Ghana", count: 24, initials: "KM" },
    { name: "Prof. Amara Diallo", specialty: "Development Finance", institution: "Sciences Po", count: 18, initials: "AD" },
    { name: "Dr. Fatou Sow", specialty: "Agricultural Economics", institution: "FAO", count: 31, initials: "FS" },
    { name: "Dr. Emmanuel Osei", specialty: "Infrastructure", institution: "AfDB", count: 15, initials: "EO" },
    { name: "Prof. Marie-Claire Nzinga", specialty: "Trade Policy", institution: "UEMOA", count: 22, initials: "MN" },
    { name: "Dr. Ibrahim Al-Rashid", specialty: "Monetary Policy", institution: "Central Bank", count: 19, initials: "IA" }
  ];

  const testimonials = [
    {
      quote: "The compliance review provided by the TriefML panel was instrumental in standardizing our sovereign debt restructuring program. The depth of analysis is world class.",
      author: "Hon. Samuel Ofori",
      role: "Director of Fiscal Policy, Ministry of Finance",
      initials: "SO"
    },
    {
      quote: "TriefML bridges the gap between raw economic theory and pragmatic public governance. Their peer evaluations of development corridors ensure policy viability.",
      author: "Dr. Catherine Vance",
      role: "Lead Economist, World Bank Group",
      initials: "CV"
    },
    {
      quote: "As a research publisher, TriefML sets an exceptionally high standard. The peer review mechanism is rigorous, fast, and highly respected in our field.",
      author: "Prof. Jean-Paul Kamdem",
      role: "Dean of Research, African Development Bank Institute",
      initials: "JK"
    }
  ];

  return (
    <div className="animate-fade-in">
      
      {/* Hero Section */}
      <section id="hero-section" className="relative bg-[#081b47] text-white overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#c8960c_1px,transparent_1px),linear-gradient(to_bottom,#c8960c_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-8">
              <span className="inline-flex items-center gap-2 bg-[#c8960c]/15 text-[#c8960c] px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-[#c8960c]/30">
                <Award className="w-3.5 h-3.5" />
                Peer-Reviewed | Open Access | Expert Evaluation
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif leading-tight text-white tracking-tight">
                Where Economic Knowledge <span className="text-[#c8960c] italic">Shapes</span> Policy
              </h1>
              
              <p className="text-lg text-slate-300 leading-relaxed font-sans max-w-2xl">
                A premier platform for publishing economic research, examining government projects, and standardizing economic governance across institutions globally.
              </p>

              {/* Homepage Search Bar */}
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/60 max-w-xl shadow-xl flex items-center">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search 5,000+ research papers, books and economic studies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-slate-400 text-sm px-4 py-3 pl-10 focus:outline-none focus:ring-0"
                  />
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                </div>
                <button
                  onClick={() => onViewChange("research")}
                  className="bg-[#c8960c] text-[#0a2463] hover:bg-[#b0830a] px-6 py-3 rounded-lg text-sm font-bold tracking-wide transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Two CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onViewChange("research")}
                  className="bg-[#c8960c] text-[#0a2463] hover:bg-[#b0830a] font-bold px-7 py-3.5 rounded-lg text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  Explore Research <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewChange("submit")}
                  className="border-2 border-slate-500 hover:border-white text-white font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors active:scale-95 cursor-pointer"
                >
                  Submit Your Work
                </button>
              </div>

              {/* Trust Badges Row */}
              <div className="pt-8 border-t border-slate-700/50 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold font-mono text-[#c8960c]">500+</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Researchers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-[#c8960c]">1,200+</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Publications</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-[#c8960c]">85</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Countries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-[#c8960c]">200+</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Projects Certified</div>
                </div>
              </div>

            </div>

            {/* Right Interactive Card Stack */}
            <div className="lg:col-span-5 relative mt-10 lg:mt-0 flex justify-center">
              
              {/* Outer Decorative Glow */}
              <div className="absolute w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -top-10 -right-10 pointer-events-none"></div>
              
              {/* Floating Cards Stack */}
              <div className="w-full max-w-md space-y-6 relative">
                
                {/* Card 1: Featured Research floating card */}
                <div className="bg-[#0c255e] rounded-xl p-5 border border-slate-700/80 shadow-2xl relative z-10 transform -rotate-2 hover:rotate-0 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900/60 text-[#c8960c] border border-blue-800">
                      Featured Paper
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Q2 Bulletin</span>
                  </div>
                  
                  <h3 className="text-md font-bold font-serif text-white hover:text-[#c8960c] cursor-pointer mb-2 line-clamp-2" onClick={() => onViewChange("research-detail", { id: "1" })}>
                    Monetary Policy Transmission in Sub-Saharan Africa: Evidence from Panel Data 2020-2024
                  </h3>
                  
                  <p className="text-xs text-slate-400 mb-4">
                    Dr. Kofi Mensah • University of Ghana
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <Download className="w-3.5 h-3.5 text-[#c8960c]" />
                      <span>1,245 Downloads</span>
                    </div>
                    <button 
                      onClick={() => onViewChange("research-detail", { id: "1" })}
                      className="text-xs text-[#c8960c] font-semibold flex items-center gap-1 hover:underline"
                    >
                      Read Abstract <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card 2: Floating Stats */}
                <div className="bg-[#1e6f5c]/95 text-white rounded-xl p-5 shadow-2xl absolute -bottom-8 -right-4 w-60 z-20 border border-teal-500/30 transform rotate-3 hover:rotate-0 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/10 p-1.5 rounded-lg text-white">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-100">Standardization Registry</h4>
                      <p className="text-[10px] text-teal-200">Certified Governance Projects</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono">98.4%</div>
                  <p className="text-[10px] text-teal-100 mt-1">Acceptance and integration rate across certified local authorities.</p>
                </div>

                {/* Background shadow layer */}
                <div className="absolute inset-0 bg-blue-950 rounded-xl transform translate-x-3 translate-y-3 -z-10 opacity-60"></div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sub-Institutes Specifications Sliding Carousel */}
      <section id="institutes-specification-slider" className="bg-[#fcfcfd] border-b border-slate-200/80 py-16 relative overflow-hidden">
        {/* Background Decorative Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c8960c]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0a2463]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#c8960c] font-bold block mb-2">Our Specialized Divisions</span>
            <h2 className="text-3xl font-bold font-serif text-[#0a2463] tracking-tight">
              Tango Specialized Institutes & Specifications
            </h2>
            <p className="text-slate-600 mt-2 text-sm">
              Explore the five core specialized divisions of the Tango Research Institute of Economics, Finance, Management and Law (TRIEFML) standardizing compliance globally.
            </p>
          </div>

          {/* Slider Outer Container */}
          <div className="relative bg-white rounded-2xl border border-slate-200/80 shadow-lg p-6 sm:p-10 md:p-12 overflow-hidden transition-all duration-500">
            
            {/* Top Bar showing progress */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
              <div 
                className="h-full bg-[#c8960c] transition-all duration-500" 
                style={{ width: `${((currentSlide + 1) / subInstitutes.length) * 100}%` }}
              ></div>
            </div>

            {/* Active Slide Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[320px]">
              
              {/* Left Column: Acronym and High-Level Focus */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold bg-[#0a2463]/10 text-[#0a2463] px-3 py-1 rounded">
                    {subInstitutes[currentSlide].acronym}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c8960c] font-mono">
                    {subInstitutes[currentSlide].type}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#0a2463] leading-tight">
                  {subInstitutes[currentSlide].title}
                </h3>

                <p className="text-sm font-semibold text-slate-700 leading-snug border-l-4 border-l-[#c8960c] pl-4 italic">
                  "{subInstitutes[currentSlide].specification}"
                </p>

                <div className="pt-4 flex flex-col gap-2 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 font-sans">
                    <span className="font-bold text-[#1e6f5c]">Impact Benchmark:</span>
                    <span className="font-mono bg-emerald-50 text-[#1e6f5c] px-2 py-0.5 rounded font-semibold">
                      {subInstitutes[currentSlide].metric}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 font-sans mt-1">
                    <span className="font-bold text-slate-800">Director:</span>
                    <span>{subInstitutes[currentSlide].director}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Deep Specifications & Narrative Card */}
              <div className="lg:col-span-7 bg-slate-50 rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-inner flex flex-col justify-between h-full relative">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0a2463] font-mono">
                    <Shield className="w-4 h-4 text-[#c8960c]" />
                    <span>Operational Scope & Specifications</span>
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {subInstitutes[currentSlide].details}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-150 shadow-xs flex items-start gap-2.5">
                      <div className="bg-[#0a2463]/5 p-1.5 rounded text-[#0a2463] mt-0.5">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-800">Governance Alignment</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Certified under strict TRIEFML international parameters.</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-150 shadow-xs flex items-start gap-2.5">
                      <div className="bg-[#1e6f5c]/5 p-1.5 rounded text-[#1e6f5c] mt-0.5">
                        <Library className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-800">Open-Access Indexing</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Working papers and legal codices are fully cataloged.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/50 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Specification Registry Key: {subInstitutes[currentSlide].acronym}-2026/V2
                  </span>
                  <button
                    onClick={() => onViewChange("about")}
                    className="text-xs font-bold text-[#0a2463] hover:text-[#c8960c] flex items-center gap-1 group"
                  >
                    View Board Members <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

            {/* Slider Navigation Controls */}
            <div className="absolute right-6 bottom-6 flex items-center gap-2 z-20">
              <button 
                onClick={prevSlide}
                aria-label="Previous Slide"
                className="bg-slate-100 hover:bg-[#0a2463] hover:text-white text-slate-700 p-2.5 rounded-lg border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextSlide}
                aria-label="Next Slide"
                className="bg-slate-100 hover:bg-[#0a2463] hover:text-white text-slate-700 p-2.5 rounded-lg border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dot Selectors */}
            <div className="absolute left-6 bottom-6 flex gap-1.5 z-20">
              {subInstitutes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx 
                      ? "bg-[#c8960c] w-6" 
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                ></button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Featured Research Section */}
      <section id="featured-research" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold font-serif text-[#0a2463]">Latest Economic Research</h2>
          <p className="text-slate-600 mt-2">
            Explore newly published open-access studies and peer-reviewed working papers standardizing modern economics and global governance.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 pb-2 border-b border-slate-200">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all border-b-2 ${
                activeCategory === cat
                  ? "border-[#c8960c] text-[#0a2463] bg-[#0a2463]/5 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {cat === "All" ? "All Research" : cat}
            </button>
          ))}
        </div>

        {/* 6 research cards in 2 rows of 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPapers.map((paper) => {
            const catColor = getCategoryColor(paper.category);
            return (
              <div
                key={paper.id}
                className="editorial-card border-l-[4px] border-l-[#0a2463] overflow-hidden flex flex-col group relative"
              >
                {/* Colored Category Indicator Bar */}
                <div className="h-1" style={{ backgroundColor: catColor }}></div>
                
                {/* Card Header Padding */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span 
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${catColor}15`, color: catColor }}
                      >
                        {paper.category}
                      </span>
                      <div className="flex items-center gap-0.5 text-[#c8960c]">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-mono font-bold">{paper.rating}</span>
                      </div>
                    </div>

                    <h3 
                      onClick={() => onViewChange("research-detail", { id: paper.id })}
                      className="text-md font-bold text-[#0a2463] font-serif hover:text-[#c8960c] cursor-pointer line-clamp-2 leading-snug group-hover:underline"
                    >
                      {paper.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 mt-1 font-sans">
                      By {paper.authors} — <span className="italic">{paper.institution}</span>
                    </p>

                    <p className="text-xs text-slate-600 mt-4 line-clamp-2 leading-relaxed">
                      {paper.abstract}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {paper.tags.map((t, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{paper.publishedDate}</span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3 text-[#c8960c]" /> {paper.downloads} downloads
                    </span>
                  </div>
                </div>

                {/* Bottom Action strip */}
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex gap-2 justify-end">
                  <button 
                    onClick={() => onOpenCitation(paper)}
                    className="text-[11px] text-slate-500 hover:text-[#0a2463] font-medium transition-colors px-2 py-1"
                  >
                    Cite
                  </button>
                  <button 
                    onClick={() => onIncrementDownload(paper.id)}
                    className="text-[11px] text-[#1e6f5c] hover:underline font-medium flex items-center gap-1 px-2 py-1"
                  >
                    Download PDF
                  </button>
                  <button 
                    onClick={() => onViewChange("research-detail", { id: paper.id })}
                    className="text-[11px] text-[#0a2463] hover:text-[#c8960c] font-semibold flex items-center gap-0.5"
                  >
                    Read Paper <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => onViewChange("research")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-[#0a2463] border border-[#0a2463] hover:bg-[#0a2463]/5 transition-all cursor-pointer"
          >
            Browse All Academic Research <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Project Review Portal Preview */}
      <section id="project-portal-preview" className="bg-[#061435] text-white py-20 relative">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px)] bg-[size:10rem_10rem]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#c8960c] font-bold">Economic Project Examination & Standardization</span>
            <h2 className="text-3xl font-bold font-serif text-white mt-2">Expert Compliance and Project Certification</h2>
            <p className="text-slate-300 mt-4 text-sm leading-relaxed">
              We provide formal evaluation services to examine, review, and standardize policy frameworks, regional investments, and sovereign development plans under an independent, certified expert economist panel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-900/40 p-8 rounded-xl border border-slate-800 flex flex-col items-center text-center">
              <div className="bg-[#c8960c]/10 text-[#c8960c] p-4 rounded-xl border border-[#c8960c]/20 mb-6">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Submit Documentation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organizations submit comprehensive project data, economic targets, and localized plans through our secure portal.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/40 p-8 rounded-xl border border-slate-800 flex flex-col items-center text-center">
              <div className="bg-[#1e6f5c]/10 text-[#1e6f5c] p-4 rounded-xl border border-[#1e6f5c]/20 mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Expert Panel Review</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A customized panel of certified PhD economists examines policy implications, risk tolerances, and feasibility benchmarks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/40 p-8 rounded-xl border border-slate-800 flex flex-col items-center text-center">
              <div className="bg-blue-900/10 text-blue-400 p-4 rounded-xl border border-blue-800/20 mb-6">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Receive Certification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive an institutional standardization report, structured policy revisions, and an official compliance seal.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onViewChange("project-review")}
              className="bg-[#c8960c] text-[#0a2463] hover:bg-[#b0830a] font-bold px-8 py-3.5 rounded-lg text-sm tracking-wide transition-colors cursor-pointer shadow-lg active:scale-95"
            >
              Submit a Project for Review
            </button>
          </div>
        </div>
      </section>

      {/* Publications Showcase */}
      <section id="publications-showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Colored Covers Grid */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">Tango (TRIEFML) Knowledge Library</span>
            <h2 className="text-3xl font-bold font-serif text-[#0a2463]">Browse Handbooks and Monographs</h2>
            <p className="text-slate-600 text-sm leading-relaxed max-w-lg">
              We publish independent handbooks, regional indices, and annual reference materials. Standard versions of academic studies are fully accessible to our global community.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              {publications.slice(0, 4).map((pub) => (
                <div 
                  key={pub.id}
                  onClick={() => onViewChange("publications")}
                  className="bg-white rounded-lg p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-center group"
                >
                  <div 
                    className="w-12 h-16 rounded shadow flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold text-center p-1"
                    style={{ backgroundColor: pub.color }}
                  >
                    {pub.type}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0a2463] group-hover:text-[#c8960c] transition-colors line-clamp-2">
                      {pub.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {pub.year} • {pub.pages} Pages
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Key Stats with Big numbers */}
          <div className="lg:col-span-6 bg-slate-50 p-8 sm:p-12 rounded-2xl border border-slate-100 grid grid-cols-2 gap-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 text-slate-200/40 pointer-events-none">
              <Landmark className="w-64 h-64 translate-x-12 -translate-y-12" />
            </div>
            
            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl font-bold font-mono text-[#0a2463]">5,000+</div>
              <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Research Papers</h4>
              <p className="text-xs text-slate-400 mt-2">Indexed in major educational and macro networks.</p>
            </div>

            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl font-bold font-mono text-[#0a2463]">1,200+</div>
              <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Books & Reports</h4>
              <p className="text-xs text-slate-400 mt-2">Published directly by the institute press.</p>
            </div>

            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl font-bold font-mono text-[#0a2463]">500+</div>
              <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Authors</h4>
              <p className="text-xs text-slate-400 mt-2">Eminent scholars and state research departments.</p>
            </div>

            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl font-bold font-mono text-[#0a2463]">15+</div>
              <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Years</h4>
              <p className="text-xs text-slate-400 mt-2">Of structural academic evaluation and prestige.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Consulting Services Preview */}
      <section id="consulting-preview" className="bg-[#f1f5f9] py-20 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#0a2463] font-bold">Institutional Consulting & Expert Analysis</span>
            <h2 className="text-3xl font-bold font-serif text-[#0a2463] mt-2">Economic Advisory Solutions</h2>
            <p className="text-slate-600 mt-4 text-sm">
              The Tango Research Institute of Economics, Finance, Management and Law (TRIEFML) offers specialized consulting panels for public offices, non-governmental funds, and financial entities to evaluate local regulatory policies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[#0a2463]/10 text-[#0a2463] flex items-center justify-center mb-4">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0a2463] mb-2">Policy Analysis</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Detailed reviews of macro-stabilization systems, trade corridors, and financial regulations for regional authorities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[#1e6f5c]/10 text-[#1e6f5c] flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1e6f5c] mb-2">Feasibility Review</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Objective evaluations of large-scale infrastructure corridors, clean energy networks, and public financing systems.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[#8b1a1a]/10 text-[#8b1a1a] flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#8b1a1a] mb-2">Compliance Review</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Comprehensive audits of fiscal models to align local development priorities with global banking standards.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-purple-900/10 text-purple-900 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-purple-950 mb-2">Methodology Consulting</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Academic training workshops, analytical modeling guidance, and data processing systems for institutional think tanks.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onViewChange("consulting")}
              className="text-sm font-bold text-[#0a2463] hover:text-[#c8960c] flex items-center gap-2 mx-auto"
            >
              Consult Our Advisory Services <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Authors Section */}
      <section id="featured-authors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold font-serif text-[#0a2463]">Distinguished Contributors</h2>
          <p className="text-slate-600 mt-2 text-sm">
            Meet the leading academic economists, development bankers, and policy advisors spearheading our current review cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors.map((author, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-[#0a2463] text-[#c8960c] font-bold text-md flex items-center justify-center shrink-0">
                {author.initials}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0a2463]">{author.name}</h3>
                <p className="text-xs text-[#c8960c] font-medium">{author.specialty}</p>
                <p className="text-[11px] text-slate-400 font-serif mt-0.5">{author.institution}</p>
                
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] text-slate-400">{author.count} publications</span>
                  <button 
                    onClick={() => alert(`Subscribed to new studies and review reports published by ${author.name}.`)}
                    className="text-[10px] text-[#0a2463] hover:text-[#c8960c] font-semibold"
                  >
                    Follow
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials-section" className="bg-[#0a2463] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#c8960c] font-bold">Trusted by Leading Institutions</span>
            <h2 className="text-3xl font-bold font-serif text-white mt-1">Impact & Global Credibility</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-[#0b2259] p-8 rounded-xl border border-blue-900 flex flex-col justify-between">
                <p className="text-sm text-slate-300 italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#c8960c] text-[#0a2463] font-bold text-xs flex items-center justify-center">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.author}</h4>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Events */}
      <section id="news-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold font-serif text-[#0a2463]">Latest News and Events</h2>
          <p className="text-slate-600 mt-2 text-sm">
            Keep informed of international academic symposia, policy calls, and structural partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c8960c]">Annual Symposium</span>
              <h3 className="text-md font-bold text-[#0a2463] font-serif mt-2 mb-3">Tango Annual Economic Forum 2025</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The flagship conference will assemble forty global experts in Moscow and virtual platforms to discuss sovereign liquidity systems.
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-mono">August 12, 2025</span>
              <button onClick={() => alert("Symposium details will be sent to your email profile. Registration opens soon.")} className="text-xs text-[#0a2463] font-semibold hover:underline">Register</button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e6f5c]">Call for Papers</span>
              <h3 className="text-md font-bold text-[#0a2463] font-serif mt-2 mb-3">African Economic Review Q3 2025</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We are actively inviting peer submissions focusing on agricultural trade integration and subnational fiscal management corridors.
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-mono">Deadline: Jul 30, 2025</span>
              <button onClick={() => onViewChange("submit")} className="text-xs text-[#0a2463] font-semibold hover:underline">Submit Now</button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a2463]">Partnership Bulletin</span>
              <h3 className="text-md font-bold text-[#0a2463] font-serif mt-2 mb-3">New Partnership with ECOWAS Research Division</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                A formal research and compliance evaluation contract was signed to establish unified regional monetary indicators.
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-mono">June 24, 2025</span>
              <button onClick={() => alert("Read the full press release detailing the joint policy goals on monetary integration.")} className="text-xs text-[#0a2463] font-semibold hover:underline">Read Press</button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter-section" className="bg-[#051130] py-16 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c8960c_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">Stay Current with Economic Research</h2>
          <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
            Subscribe to our weekly brief containing new research notifications, project compliance reports, and symposium invitations.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="mt-8 max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your institutional email..."
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-[#c8960c]"
            />
            <button
              type="submit"
              className="bg-[#c8960c] text-[#0a2463] hover:bg-[#b0830a] px-6 py-3 rounded-lg text-sm font-bold tracking-wide transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              Subscribe <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {newsletterSubscribed && (
            <div className="mt-4 text-xs text-emerald-400 font-medium flex items-center justify-center gap-1.5 animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>Thank you! You have successfully subscribed to the TRIEFML research brief series.</span>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
