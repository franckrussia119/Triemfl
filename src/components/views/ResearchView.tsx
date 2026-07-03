import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, HelpCircle, Download, FileText, Bookmark, Star, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { researchPapers, getCategoryColor, ResearchPaper } from "../../lib/research-data";

interface ResearchViewProps {
  onViewChange: (view: string, extraData?: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  initialCategoryFilter?: string;
  onOpenCitation: (paper: any) => void;
  onIncrementDownload: (paperId: string) => void;
}

export default function ResearchView({
  onViewChange,
  searchQuery,
  setSearchQuery,
  initialCategoryFilter,
  onOpenCitation,
  onIncrementDownload
}: ResearchViewProps) {
  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategoryFilter ? [initialCategoryFilter] : []
  );
  const [maxYear, setMaxYear] = useState<number>(2025);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAccess, setSelectedAccess] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("relevance");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter Categories list
  const categoryOptions = [
    { key: "Macroeconomics", label: "Macroeconomics" },
    { key: "Development", label: "Development Economics" },
    { key: "Finance", label: "Finance & Banking" },
    { key: "Trade", label: "Trade & Commerce" },
    { key: "Agricultural", label: "Agricultural Economics" },
    { key: "Policy", label: "Public Policy" },
    { key: "Environmental", label: "Environmental" },
    { key: "Labor", label: "Labor Economics" },
    { key: "Monetary", label: "Monetary Policy" },
    { key: "Fiscal", label: "Fiscal Policy" }
  ];

  const regions = ["Africa", "Global", "ECOWAS", "CEMAC", "East Africa", "North Africa"];
  const docTypes = ["Working Paper", "Journal Article", "Book Chapter", "Policy Brief", "Research Report"];
  const accessModes = ["Open Access", "Subscription"];

  // Toggle helpers
  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };

  const handleRegionToggle = (reg: string) => {
    setSelectedRegions(prev => 
      prev.includes(reg) ? prev.filter(r => r !== reg) : [...prev, reg]
    );
    setCurrentPage(1);
  };

  const handleTypeToggle = (t: string) => {
    setSelectedTypes(prev => 
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
    setCurrentPage(1);
  };

  const handleAccessToggle = (acc: string) => {
    setSelectedAccess(prev => 
      prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setMaxYear(2025);
    setSelectedRegions([]);
    setSelectedTypes([]);
    setSelectedAccess([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Filter & Search Logic
  const processedPapers = useMemo(() => {
    return researchPapers.filter(paper => {
      // 1. Search Query text check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = paper.title.toLowerCase().includes(query);
        const inAuthors = paper.authors.toLowerCase().includes(query);
        const inAbstract = paper.abstract.toLowerCase().includes(query);
        const inTags = paper.tags.some(tag => tag.toLowerCase().includes(query));
        const inInstitution = paper.institution.toLowerCase().includes(query);
        if (!inTitle && !inAuthors && !inAbstract && !inTags && !inInstitution) {
          return false;
        }
      }

      // 2. Category checks
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(paper.category)) {
          return false;
        }
      }

      // 3. Year check
      const pubYear = parseInt(paper.publishedDate.split("-")[0]);
      if (pubYear > maxYear) {
        return false;
      }

      // 4. Region check (Simulated matching based on tags and abstract)
      if (selectedRegions.length > 0) {
        const matchedRegion = selectedRegions.some(reg => {
          const rLower = reg.toLowerCase();
          return paper.abstract.toLowerCase().includes(rLower) || 
                 paper.tags.some(tag => tag.toLowerCase().includes(rLower));
        });
        if (!matchedRegion) return false;
      }

      // 5. Doc Type check (Simulated based on tags or ID odd/even)
      if (selectedTypes.length > 0) {
        const paperType = parseInt(paper.id) % 2 === 0 ? "Working Paper" : "Journal Article";
        if (!selectedTypes.includes(paperType)) return false;
      }

      // 6. Access check (All open access except subscription for ID%4 === 0)
      if (selectedAccess.length > 0) {
        const paperAccess = parseInt(paper.id) % 4 === 0 ? "Subscription" : "Open Access";
        if (!selectedAccess.includes(paperAccess)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === "downloads") {
        return b.downloads - a.downloads;
      } else if (sortOption === "citations") {
        return b.citations - a.citations;
      } else if (sortOption === "recent") {
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      } else {
        // default relevance or high rating
        return b.rating - a.rating;
      }
    });
  }, [searchQuery, selectedCategories, maxYear, selectedRegions, selectedTypes, selectedAccess, sortOption]);

  // Pagination Variables
  const itemsPerPage = 6;
  const totalPages = Math.ceil(processedPapers.length / itemsPerPage);
  const paginatedPapers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPapers.slice(startIndex, startIndex + itemsPerPage);
  }, [processedPapers, currentPage]);

  return (
    <div className="bg-[#f8fafc] py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Search */}
        <div id="research-header" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold font-serif text-[#0a2463]">Research Repository</h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Access the complete collection of peer-reviewed economic research publications, policy briefs, and monographs indexed by the Triefml Institute. Filter by structural focus, region, or academic period.
            </p>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by title, author keywords, institution, or JEL codes..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#c8960c] rounded-xl px-4 py-3.5 pl-12 text-sm focus:outline-none"
              />
              <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
            </div>

            <div className="flex gap-3">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#c8960c]"
              >
                <option value="relevance">Relevance (Rating)</option>
                <option value="recent">Latest Publications</option>
                <option value="downloads">Most Downloaded</option>
                <option value="citations">Most Cited</option>
              </select>

              <button
                onClick={clearAllFilters}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3.5 rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-fit space-y-8 sticky top-28">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-[#0a2463] uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#c8960c]" /> Filter Results
              </span>
              <button onClick={clearAllFilters} className="text-[10px] text-slate-400 hover:text-[#0a2463] font-semibold underline">
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Economic Sector</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categoryOptions.map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(opt.key)}
                      onChange={() => handleCategoryToggle(opt.key)}
                      className="rounded text-[#c8960c] focus:ring-[#c8960c] w-3.5 h-3.5 border-slate-300"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Range Slider for Year */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Published Until</h4>
                <span className="text-xs font-mono font-bold text-[#c8960c]">{maxYear}</span>
              </div>
              <input
                type="range"
                min="2020"
                max="2025"
                value={maxYear}
                onChange={(e) => { setMaxYear(parseInt(e.target.value)); setCurrentPage(1); }}
                className="w-full accent-[#c8960c] bg-slate-100 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>2020</span>
                <span>2025</span>
              </div>
            </div>

            {/* Regions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Region / Economic Bloc</h4>
              <div className="space-y-2">
                {regions.map((reg) => (
                  <label key={reg} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes(reg)}
                      onChange={() => handleRegionToggle(reg)}
                      className="rounded text-[#c8960c] focus:ring-[#c8960c] w-3.5 h-3.5 border-slate-300"
                    />
                    <span>{reg}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Document Type */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Document Type</h4>
              <div className="space-y-2">
                {docTypes.map((t) => (
                  <label key={t} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(t)}
                      onChange={() => handleTypeToggle(t)}
                      className="rounded text-[#c8960c] focus:ring-[#c8960c] w-3.5 h-3.5 border-slate-300"
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Access Type */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Access Mode</h4>
              <div className="space-y-2">
                {accessModes.map((acc) => (
                  <label key={acc} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={selectedAccess.includes(acc)}
                      onChange={() => handleAccessToggle(acc)}
                      className="rounded text-[#c8960c] focus:ring-[#c8960c] w-3.5 h-3.5 border-slate-300"
                    />
                    <span>{acc}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Research Results Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Metadata and Quick info */}
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Showing {processedPapers.length} matching studies and reviews</span>
              {selectedCategories.length > 0 && (
                <span className="text-[#c8960c] font-semibold">Active Sector Filter Enabled</span>
              )}
            </div>

            {processedPapers.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-md font-bold text-[#0a2463]">No studies found</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                  We could not find any research matching those particular filters. Try adjusting search queries, resetting checkboxes, or sliding dates.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 bg-[#0a2463] text-[#c8960c] hover:bg-[#071b4a] px-5 py-2.5 rounded-lg text-xs font-bold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedPapers.map((paper) => {
                  const catColor = getCategoryColor(paper.category);
                  const isSub = parseInt(paper.id) % 4 === 0;

                  return (
                    <div
                      key={paper.id}
                      className="editorial-card border-l-[4px] border-l-[#0a2463] overflow-hidden flex flex-col justify-between group"
                    >
                      {/* Left category accent */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span 
                              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                              style={{ backgroundColor: `${catColor}15`, color: catColor }}
                            >
                              {paper.category}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isSub ? (
                                <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 font-semibold px-1.5 py-0.5 rounded">
                                  Subscription
                                </span>
                              ) : (
                                <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold px-1.5 py-0.5 rounded">
                                  Open Access
                                </span>
                              )}
                              <div className="flex items-center gap-0.5 text-[#c8960c]">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-xs font-mono font-semibold">{paper.rating}</span>
                              </div>
                            </div>
                          </div>

                          <h3 
                            onClick={() => onViewChange("research-detail", { id: paper.id })}
                            className="text-sm font-bold text-[#0a2463] font-serif hover:text-[#c8960c] cursor-pointer line-clamp-2 leading-snug group-hover:underline"
                          >
                            {paper.title}
                          </h3>

                          <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                            {paper.authors} — <span className="font-normal italic">{paper.institution}</span>
                          </p>

                          <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed font-sans">
                            {paper.abstract}
                          </p>

                          {/* Keyword Pills */}
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {paper.tags.map((t, idx) => (
                              <span key={idx} className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Numeric Metrics row */}
                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{paper.publishedDate}</span>
                          <div className="flex items-center gap-3">
                            <span>{paper.views} Views</span>
                            <span>•</span>
                            <span>{paper.citations} Citations</span>
                          </div>
                        </div>
                      </div>

                      {/* Action block bottom */}
                      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex gap-2 justify-between items-center text-xs">
                        <button
                          onClick={() => onOpenCitation(paper)}
                          className="text-slate-500 hover:text-[#0a2463] font-semibold"
                        >
                          Cite Paper
                        </button>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => onIncrementDownload(paper.id)}
                            className="text-[#1e6f5c] hover:underline font-semibold flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> PDF ({paper.downloads})
                          </button>
                          
                          <button
                            onClick={() => onViewChange("research-detail", { id: paper.id })}
                            className="text-[#0a2463] hover:text-[#c8960c] font-bold"
                          >
                            Read Study
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center bg-white border border-slate-200 px-6 py-4 rounded-xl mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-1.5 text-xs font-mono">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center ${
                        currentPage === pNum
                          ? "bg-[#0a2463] text-[#c8960c]"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
