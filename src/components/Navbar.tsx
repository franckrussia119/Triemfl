import React, { useState, useEffect } from "react";
import { BookOpen, Search, Menu, X, ChevronDown, GraduationCap, ArrowRight, ShieldCheck, Globe, HelpCircle } from "lucide-react";

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string, extraData?: any) => void;
  onSearchSubmit?: (query: string) => void;
}

export default function Navbar({ currentView, onViewChange, onSearchSubmit }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
    onViewChange("research");
    setMobileMenuOpen(false);
  };

  const categories = [
    { name: "Macroeconomics", desc: "Monetary policy, fiscal policy, inflation, and growth models." },
    { name: "Development Economics", desc: "Infrastructure, inclusion, structural reform, and aid evaluation." },
    { name: "Finance", desc: "Financial markets, asset pricing, fintech, and banking systems." },
    { name: "Trade", desc: "Global commerce, agricultural trade policies, and economic blocks." },
    { name: "Agricultural Economics", desc: "Food security, supply chains, and rural development frameworks." },
    { name: "Public Policy", desc: "Economic governance, sovereign debt restructuring, and regulations." }
  ];

  const isActive = (view: string) => {
    return currentView === view 
      ? "text-[#c8960c] font-semibold border-b-2 border-[#c8960c] tracking-wide" 
      : "text-slate-300 hover:text-white transition-colors duration-200 tracking-wide hover:border-b-2 hover:border-slate-400";
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div id="announcement-bar" className="bg-[#051130] text-[#f5f7fa] py-2 px-6 text-[10px] font-mono tracking-widest text-center border-b border-white/5 flex items-center justify-center gap-4 uppercase">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c8960c] animate-pulse"></span>
          Peer-Reviewed Economic Research
        </span>
        <span className="text-slate-500">|</span>
        <span>Open Access Publications</span>
        <span className="text-slate-500">|</span>
        <span>Expert Project Evaluation</span>
      </div>

      {/* Main Navbar */}
      <nav
        id="main-navbar"
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#0a2463]/95 backdrop-blur-md shadow-lg py-3"
            : "bg-[#0a2463] py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div 
              id="navbar-logo"
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => { onViewChange("home"); setMobileMenuOpen(false); }}
            >
              <div className="bg-[#c8960c] p-2 rounded text-[#0a2463] shadow-md transition-all duration-300 group-hover:bg-[#b0840a] group-hover:rotate-1">
                <GraduationCap className="w-6.5 h-6.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold font-serif text-white tracking-tight flex items-center gap-1.5 leading-none">
                  Tango <span className="text-[9px] bg-[#c8960c] text-[#0a2463] px-1 py-0.5 rounded font-mono font-bold">TRIEFML</span>
                </span>
                <span className="text-[7.5px] font-mono uppercase tracking-wider text-slate-300 mt-0.5 max-w-[260px] truncate sm:max-w-none">
                  Research Institute of Economics, Finance, Management and Law
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div id="desktop-nav-links" className="hidden lg:flex items-center gap-6">
              <button 
                id="nav-home"
                onClick={() => onViewChange("home")}
                className={`py-2 text-sm font-medium ${isActive("home")}`}
              >
                Home
              </button>

              {/* Research Tab with Mega Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button 
                  id="nav-research-dropdown"
                  onClick={() => { onViewChange("research"); setMegaMenuOpen(false); }}
                  className={`py-2 text-sm font-medium flex items-center gap-1 ${isActive("research")}`}
                >
                  Research <ChevronDown className="w-4 h-4" />
                </button>

                {/* Mega Dropdown Panel */}
                {megaMenuOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-0 w-[480px] bg-white rounded-xl shadow-2xl border border-slate-100 p-5 grid grid-cols-1 gap-4 text-slate-800 transition-all duration-300 ease-out z-50">
                    <div className="border-b border-slate-100 pb-2 mb-1 flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Research Categories</span>
                      <button 
                        onClick={() => { onViewChange("research"); setMegaMenuOpen(false); }}
                        className="text-xs text-[#0a2463] hover:text-[#c8960c] font-medium flex items-center gap-1"
                      >
                        View All <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {categories.map((cat, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            onViewChange("research", { selectedCategory: cat.name });
                            setMegaMenuOpen(false);
                          }}
                          className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors duration-150 flex items-start gap-3 group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#c8960c] mt-1.5 group-hover:scale-125 transition-transform"></div>
                          <div>
                            <h4 className="text-sm font-semibold text-[#0a2463] group-hover:text-[#c8960c] transition-colors">{cat.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{cat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                id="nav-publications"
                onClick={() => onViewChange("publications")}
                className={`py-2 text-sm font-medium ${isActive("publications")}`}
              >
                Publications
              </button>

              <button 
                id="nav-project-review"
                onClick={() => onViewChange("project-review")}
                className={`py-2 text-sm font-medium ${isActive("project-review")}`}
              >
                Project Review
              </button>

              <button 
                id="nav-consulting"
                onClick={() => onViewChange("consulting")}
                className={`py-2 text-sm font-medium ${isActive("consulting")}`}
              >
                Consulting
              </button>

              <button 
                id="nav-about"
                onClick={() => onViewChange("about")}
                className={`py-2 text-sm font-medium ${isActive("about")}`}
              >
                About
              </button>

              <button 
                id="nav-contact"
                onClick={() => onViewChange("contact")}
                className={`py-2 text-sm font-medium ${isActive("contact")}`}
              >
                Contact
              </button>
            </div>

            {/* Right Buttons */}
            <div id="desktop-nav-buttons" className="hidden lg:flex items-center gap-4">
              {/* Mini Search Form */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800/80 text-white placeholder-slate-400 text-xs px-3 py-1.5 pl-8 rounded border border-slate-700/60 focus:outline-none focus:border-[#c8960c] focus:ring-1 focus:ring-[#c8960c] w-44 transition-all duration-300"
                />
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              </form>

              <button 
                id="nav-btn-submit"
                onClick={() => onViewChange("submit")}
                className="bg-[#c8960c] text-[#0a2463] hover:bg-[#b0830a] px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-md"
              >
                Submit Research
              </button>

              <span className="text-slate-400 text-sm">|</span>

              <button 
                id="nav-btn-login"
                onClick={() => onViewChange("admin")}
                className="text-slate-300 hover:text-[#c8960c] text-sm font-medium cursor-pointer flex items-center gap-1"
              >
                🔒 Admin
              </button>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="lg:hidden flex items-center gap-3">
              <button 
                id="nav-mobile-submit"
                onClick={() => onViewChange("submit")}
                className="bg-[#c8960c] text-[#0a2463] px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer"
              >
                Submit
              </button>
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-[#c8960c] p-2 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div id="mobile-nav-panel" className="lg:hidden bg-[#0a2463] border-t border-slate-800 px-4 py-6 space-y-4 animate-fade-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search research, studies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm px-4 py-2 pl-10 rounded-lg border border-slate-700 focus:outline-none focus:border-[#c8960c]"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            </form>

            <div className="flex flex-col gap-3 font-medium">
              <button
                onClick={() => { onViewChange("home"); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded-lg hover:bg-slate-800 ${currentView === "home" ? "bg-slate-800 text-[#c8960c]" : "text-white"}`}
              >
                Home
              </button>
              <button
                onClick={() => { onViewChange("research"); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded-lg hover:bg-slate-800 ${currentView === "research" ? "bg-slate-800 text-[#c8960c]" : "text-white"}`}
              >
                Research Directory
              </button>
              <button
                onClick={() => { onViewChange("publications"); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded-lg hover:bg-slate-800 ${currentView === "publications" ? "bg-slate-800 text-[#c8960c]" : "text-white"}`}
              >
                Publications & Library
              </button>
              <button
                onClick={() => { onViewChange("project-review"); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded-lg hover:bg-slate-800 ${currentView === "project-review" ? "bg-slate-800 text-[#c8960c]" : "text-white"}`}
              >
                Project Review Portal
              </button>
              <button
                onClick={() => { onViewChange("consulting"); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded-lg hover:bg-slate-800 ${currentView === "consulting" ? "bg-slate-800 text-[#c8960c]" : "text-white"}`}
              >
                Expert Consulting
              </button>
              <button
                onClick={() => { onViewChange("about"); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded-lg hover:bg-slate-800 ${currentView === "about" ? "bg-slate-800 text-[#c8960c]" : "text-white"}`}
              >
                About TriefML
              </button>
              <button
                onClick={() => { onViewChange("contact"); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded-lg hover:bg-slate-800 ${currentView === "contact" ? "bg-slate-800 text-[#c8960c]" : "text-white"}`}
              >
                Contact & Inquiries
              </button>
            </div>

            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <button
                onClick={() => { alert("Institutional authentication is restricted to registered partner organization keys."); }}
                className="text-slate-300 hover:text-white text-sm"
              >
                Institutional Sign In
              </button>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400">ISSN 1984-2034</span>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
