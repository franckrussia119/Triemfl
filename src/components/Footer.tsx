import React from "react";
import { GraduationCap, ArrowUpRight, HelpCircle, Mail, MapPin, Shield } from "lucide-react";

interface FooterProps {
  onViewChange: (view: string, extraData?: any) => void;
}

export default function Footer({ onViewChange }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer-section" className="bg-[#051130] text-slate-300 border-t border-blue-900/60 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: About TriefML */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5 cursor-pointer" onClick={() => onViewChange("home")}>
              <div className="bg-[#c8960c] p-1.5 rounded text-[#0a2463]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-wide">Tango <span className="text-[9px] bg-[#c8960c] text-[#0a2463] px-1.5 py-0.5 rounded font-mono font-bold">TRIEFML</span></span>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-sm">
              The Tango Research Institute of Economics, Finance, Management and Law (TRIEFML) is a premium independent economic, financial and legal intelligence platform standardizing global economic governance, policy analysis, legal audits, and project evaluation across institutions globally.
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c8960c]" />
                <span>Registered Academic NGO & Certified Research Publisher</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">ISSN:</span>
                <span>1984-2034 (Online) | 1984-2026 (Print)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">DOI Crossref prefix:</span>
                <span>10.5033/tango-triefml</span>
              </div>
            </div>
          </div>

          {/* Col 2: Research & Publications */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Research Hub</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button onClick={() => onViewChange("research", { selectedCategory: "Macroeconomics" })} className="hover:text-white hover:underline transition-all text-left">
                  Macroeconomics
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange("research", { selectedCategory: "Development" })} className="hover:text-white hover:underline transition-all text-left">
                  Development Economics
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange("research", { selectedCategory: "Finance" })} className="hover:text-white hover:underline transition-all text-left">
                  Finance & Fintech
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange("research", { selectedCategory: "Trade" })} className="hover:text-white hover:underline transition-all text-left">
                  Trade & Tariffs
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange("publications")} className="hover:text-white hover:underline transition-all text-left flex items-center gap-1">
                  Books & Library <ArrowUpRight className="w-3 h-3 text-[#c8960c]" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Institutional Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Core Services</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button onClick={() => onViewChange("project-review")} className="hover:text-white hover:underline transition-all text-left">
                  Project Standardization
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange("project-review")} className="hover:text-white hover:underline transition-all text-left">
                  Review Pricing & Cost
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange("consulting")} className="hover:text-white hover:underline transition-all text-left">
                  Economic Policy Analysis
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange("consulting")} className="hover:text-white hover:underline transition-all text-left">
                  Regulatory Compliance
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange("submit")} className="hover:text-white hover:underline transition-all text-left text-[#c8960c] font-medium">
                  Submit Research Paper
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Locations */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Global Offices</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-[#c8960c] shrink-0 mt-0.5" />
                <span className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 block">Moscow Headquarters</span>
                  Bolshaya Dmitrovka, 12<br />Moscow, 103009, Russian Federation
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 block">Accra Research Liaison</span>
                  Ring Road Central, Accra, Republic of Ghana
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c8960c]" />
                <button onClick={() => onViewChange("contact")} className="hover:text-white text-xs hover:underline text-left">
                  inquiries@triefml.org
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Partner Logos Row */}
        <div className="py-8 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institutional Partners & Indexing Networks</span>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 font-serif tracking-widest">
            <span className="hover:text-white transition-colors">WORLD BANK GROUP</span>
            <span className="text-slate-700">•</span>
            <span className="hover:text-white transition-colors">AFRICAN DEVELOPMENT BANK</span>
            <span className="text-slate-700">•</span>
            <span className="hover:text-white transition-colors">ECOWAS COMMISSION</span>
            <span className="text-slate-700">•</span>
            <span className="hover:text-white transition-colors">SSRN NETWORK</span>
            <span className="text-slate-700">•</span>
            <span className="hover:text-white transition-colors">JSTOR INDEX</span>
          </div>
        </div>

        {/* Bottom copyright & open access badge */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {currentYear} Triefml Institute for Economic and Financial Market Leadership. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-[#1e6f5c]/20 text-[#1e6f5c] border border-[#1e6f5c]/40 font-semibold tracking-wide uppercase text-[10px]">
              Open Access Policy
            </span>
            <span className="px-2.5 py-1 rounded bg-blue-900/30 text-slate-400 border border-blue-900/50 font-mono text-[10px]">
              CC BY-NC-ND 4.0
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
