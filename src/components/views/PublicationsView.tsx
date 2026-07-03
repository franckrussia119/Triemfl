import React, { useState } from "react";
import { publications, Publication } from "../../lib/publications-data";
import { Book, Bookmark, Download, ShoppingBag, Check, ListFilter, Search, Info } from "lucide-react";

export default function PublicationsView() {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [downloadedPubIds, setDownloadedPubIds] = useState<string[]>([]);
  const [purchaseSuccessId, setPurchaseSuccessId] = useState<string | null>(null);

  const types = ["All", "Book", "Report", "Journal", "Working Paper", "Policy Brief"];

  const filteredPubs = publications.filter(
    pub => selectedType === "All" || pub.type === selectedType
  );

  const handleDownload = (id: string, title: string) => {
    if (!downloadedPubIds.includes(id)) {
      setDownloadedPubIds(prev => [...prev, id]);
    }
    alert(`Downloading ${title} in High-Resolution PDF format. This document is provided under open-access terms.`);
  };

  const handlePurchase = (id: string, title: string) => {
    setPurchaseSuccessId(id);
    setTimeout(() => setPurchaseSuccessId(null), 4000);
    alert(`Initiating institutional payment gate for ${title}. A digital access key will be transmitted to your email.`);
  };

  const journalArticles = [
    { num: "01", title: "A Stochastic Model of Global Debt Restructuring in Commoditised Markets", author: "Dr. Bertrand Mvogo" },
    { num: "02", title: "Fintech Credit Infrastructure and Growth Metrics in Emerging Cities", author: "Prof. Amara Diallo" },
    { num: "03", title: "The Effectiveness of Central Bank Digital Currencies in Low Liquidity Environments", author: "Dr. Kofi Mensah" },
    { num: "04", title: "Non-Tariff Borders and Food Trade Bottlenecks in the Sahel Corridor", author: "Dr. Fatou Sow" }
  ];

  return (
    <div className="bg-[#f8fafc] py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Flagship Journal Showcase */}
        <div id="featured-journal" className="bg-[#0a2463] text-white rounded-2xl overflow-hidden border border-blue-900/60 shadow-xl mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Journal Title & Metadata */}
            <div className="p-8 sm:p-12 lg:col-span-7 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold bg-[#c8960c]/20 text-[#c8960c] px-3 py-1 rounded-full uppercase tracking-widest border border-[#c8960c]/40">
                  Flagship Academic Journal
                </span>
                
                <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white mt-4 tracking-tight">
                  TriefML Economic Review
                </h1>
                
                <p className="text-slate-300 text-sm mt-3 leading-relaxed max-w-xl">
                  The primary quarterly scientific publication of the institute. Featuring rigorous empirical research, macro models, and sovereign policy designs.
                </p>

                <div className="flex gap-4 mt-6 text-xs text-slate-300 font-mono">
                  <span>Volume 14, Issue 2</span>
                  <span>•</span>
                  <span>Published June 2025</span>
                  <span>•</span>
                  <span>ISSN 1984-2034</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-900 flex flex-wrap gap-4">
                <button 
                  onClick={() => alert("Downloading entire Volume 14 Issue 2 bundle (PDF).")}
                  className="bg-[#c8960c] text-[#0a2463] hover:bg-[#b0830a] px-6 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download Latest Issue (PDF)
                </button>
                <button 
                  onClick={() => alert("Subscription options: Standard Individual $150/yr, Institutional $850/yr. Contact subscriptions@triefml.org")}
                  className="bg-blue-950 hover:bg-slate-900 text-slate-100 border border-slate-700 px-6 py-3 rounded-lg text-xs font-semibold transition-all"
                >
                  Manage Subscription
                </button>
              </div>
            </div>

            {/* Right Column: Table of Contents */}
            <div className="bg-[#051130] p-8 sm:p-12 lg:col-span-5 border-t lg:border-t-0 lg:border-l border-blue-900/40 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Table of Contents</h3>
                <div className="space-y-4">
                  {journalArticles.map((art) => (
                    <div key={art.num} className="flex gap-4 items-start group">
                      <span className="text-sm font-bold font-mono text-[#c8960c]">{art.num}</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-[#c8960c] transition-colors line-clamp-2 leading-relaxed cursor-pointer">
                          {art.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{art.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-6 border-t border-slate-800 pt-4">
                <Info className="w-3.5 h-3.5 text-[#c8960c]" />
                <span>Peer review double-blind standards certified by COPE regulations.</span>
              </div>
            </div>

          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl p-6 shadow-sm border border-slate-200 gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === t
                    ? "bg-[#0a2463] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t === "All" ? "All Documents" : `${t}s`}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            TriefML Monograph Series
          </div>
        </div>

        {/* 3 Column Publications Grid */}
        <div id="publications-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPubs.map((pub) => {
            const isFree = pub.price.toLowerCase().includes("free") || pub.price.toLowerCase().includes("open access");
            const hasDownloaded = downloadedPubIds.includes(pub.id);

            return (
              <div 
                key={pub.id}
                className="editorial-card border-l-[4px] border-l-[#0a2463] overflow-hidden flex flex-col justify-between"
              >
                {/* Visual Top block */}
                <div className="p-6">
                  
                  {/* Category + price badges */}
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#0a2463] border border-slate-200 px-2 py-0.5 rounded">
                      {pub.type}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                      isFree ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {pub.price}
                    </span>
                  </div>

                  {/* Rectangle Cover Placeholder */}
                  <div className="flex gap-4">
                    <div 
                      className="w-20 h-28 rounded shadow flex-shrink-0 flex flex-col justify-between p-2 text-white relative overflow-hidden"
                      style={{ backgroundColor: pub.color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                      <span className="text-[8px] font-mono font-bold text-slate-300 tracking-wider">TRIEFML</span>
                      <span className="text-[10px] font-serif font-bold leading-tight line-clamp-3">
                        {pub.title}
                      </span>
                      <span className="text-[7px] text-slate-300 font-sans text-right">Vol. {pub.year}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#0a2463] font-serif line-clamp-2 leading-snug">
                        {pub.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        By {pub.author}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">
                        Published: {pub.year} • {pub.pages} Pages
                      </p>
                    </div>
                  </div>

                  {/* Description text */}
                  <p className="text-xs text-slate-600 mt-5 leading-relaxed font-sans line-clamp-3">
                    {pub.description}
                  </p>

                </div>

                {/* Bottom Action Area */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">
                    {pub.downloadCount + (hasDownloaded ? 1 : 0)} readers
                  </span>

                  {isFree ? (
                    <button
                      onClick={() => handleDownload(pub.id, pub.title)}
                      className="bg-[#1e6f5c] hover:bg-[#165244] text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {hasDownloaded ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Download className="w-3.5 h-3.5" />}
                      {hasDownloaded ? "Downloaded" : "Download PDF"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(pub.id, pub.title)}
                      className="bg-[#c8960c] hover:bg-[#b0830a] text-[#0a2463] font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      {purchaseSuccessId === pub.id ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                      {purchaseSuccessId === pub.id ? "Key Transmitted" : `Purchase ${pub.price}`}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
