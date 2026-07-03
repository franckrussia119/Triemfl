import React from "react";
import { GraduationCap, ShieldCheck, Landmark, Award, BookOpen, Globe2, Sparkles, Building2, CheckCircle, FileText, ArrowDownToLine } from "lucide-react";

export default function AboutView() {
  const editorialBoard = [
    { name: "Dr. Kofi Mensah", role: "Chairperson & Editor-in-Chief", institution: "University of Ghana" },
    { name: "Prof. Amara Diallo", role: "Associate Editor - Development Finance", institution: "Sciences Po Paris" },
    { name: "Dr. Fatou Sow", role: "Associate Editor - Agricultural Systems", institution: "FAO Division" },
    { name: "Dr. Emmanuel Osei", role: "Editorial Board Member - Infrastructure", institution: "AfDB Research Division" },
    { name: "Prof. Marie-Claire Nzinga", role: "Editorial Board Member - Trade Economics", institution: "UEMOA Research Center" },
    { name: "Dr. Bertrand Mvogo", role: "Editorial Board Member - Fiscal Rules", institution: "BEAC Research Department" },
    { name: "Dr. Ibrahim Al-Rashid", role: "Associate Editor - Monetary Policy", institution: "Central Bank of Egypt" },
    { name: "Prof. Sarah Jenkins", role: "Editorial Board Member - Econometric Methods", institution: "University of Oxford" }
  ];

  const advisoryCouncil = [
    { name: "Dr. Mahmoud Shaker", role: "Former Senior Director", institution: "International Monetary Fund" },
    { name: "Dame Elizabeth Koomson", role: "Governor of Policy", institution: "West African Economic Union" },
    { name: "Prof. Nikolai Ivanov", role: "Dean of Macroeconomics", institution: "Moscow School of Economics" },
    { name: "Dr. Salim Al-Mansoor", role: "Advisory Director", institution: "Arab Bank for Economic Development" }
  ];

  const partnerships = [
    { name: "African Development Bank", role: "Research Funding & Policy Frameworks" },
    { name: "ECOWAS Commission", role: "Regional Trade Alignment Standards" },
    { name: "World Bank Group", role: "Infrastructure Data Sharing & Projections" },
    { name: "International Monetary Fund", role: "Debt Sustainability Training Cycles" },
    { name: "African Union", role: "Agenda 2063 Economic Coordination" }
  ];

  return (
    <div className="bg-[#f8fafc] py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div id="about-hero" className="bg-[#0a2463] text-white rounded-2xl p-8 sm:p-12 shadow-xl mb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px)] bg-[size:10rem_10rem]"></div>
          
          <div className="max-w-3xl relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c8960c]">A Legacy of Leadership</span>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white mt-3 tracking-tight">
              About the Tango Institute (TRIEFML)
            </h1>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Standardizing excellence in economics, banking finance, corporate management, and public jurisprudence across regional and international public institutions.
            </p>
          </div>
        </div>

        {/* Mission and Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Mission */}
          <div className="editorial-card border-l-[4px] border-l-[#0a2463] p-8">
            <div className="w-10 h-10 rounded-lg bg-[#0a2463]/10 text-[#0a2463] flex items-center justify-center mb-5">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0a2463] font-serif mb-3">Our Core Mission</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              To build a reliable academic bridge between microeconomic discovery and macroeconomic policy governance. We serve as a trusted, non-partisan authority dedicated to double-blind peer review, rigorous statistical verification, and standardization of regional investment proposals.
            </p>
          </div>

          {/* Vision */}
          <div className="editorial-card border-l-[4px] border-l-[#1e6f5c] p-8">
            <div className="w-10 h-10 rounded-lg bg-[#1e6f5c]/10 text-[#1e6f5c] flex items-center justify-center mb-5">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1e6f5c] font-serif mb-3">Our Long-term Vision</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              To establish a standardized sovereign project certification index recognized by every major global development bank. We envision a world where public development plans are evaluated objectively by independent certified scholars prior to capital commitment.
            </p>
          </div>

        </div>

        {/* Founding Story & History */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-[#c8960c] uppercase tracking-wider block">Founding and History</span>
              <h3 className="text-xl font-bold font-serif text-[#0a2463]">Standardising Global Governance</h3>
              
              <div className="text-xs text-slate-600 space-y-3.5 leading-relaxed">
                <p>
                  Established as an independent academic collective, the Tango Research Institute of Economics, Finance, Management and Law (TRIEFML) arose from a critical need: the standardization of financial infrastructure, banking guidelines, enterprise risk systems, and public law in emerging economic corridors.
                </p>
                <p>
                  Historically, development grants and structural policy transformations suffered from severe calculation and compliance disparities across regional boundaries. TRIEFML was organized to bring unified, rigorous econometric testing and judicial peer reviews to policy proposals, building a peer registry modeled on pure double-blind standards.
                </p>
                <p>
                  Today, our network represents more than eighty-five countries, uniting university chairs, central bank research divisions, strategic management advisory panels, and multi-lateral institutions under a singular standard of structural excellence.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#051130] p-6 rounded-xl border border-slate-800 text-white space-y-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 text-slate-900 pointer-events-none">
                <Building2 className="w-48 h-48 translate-x-12 translate-y-12" />
              </div>
              <div className="relative z-10">
                <span className="text-[10px] font-bold text-[#c8960c] uppercase tracking-widest">Moscow Headquarters</span>
                <h4 className="text-sm font-bold font-serif mt-1">Research Administration</h4>
                <p className="text-[11px] text-slate-400 mt-2">
                  Bolshaya Dmitrovka, 12, Moscow, Russian Federation. Our administrative headquarters houses the scientific computation unit and editorial board.
                </p>
              </div>
              <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Accredited Academic NGO</span>
              </div>
            </div>

          </div>
        </div>

        {/* Editorial Board (8 members) */}
        <div id="editorial-board" className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-lg font-bold font-serif text-[#0a2463]">The TriefML Editorial Board</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Our active board members are responsible for evaluating research validity, overseeing double-blind reviews, and coordinating regional project inspections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {editorialBoard.map((ed, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#0a2463]">{ed.name}</h4>
                  <p className="text-[10px] text-[#c8960c] font-semibold mt-0.5">{ed.role}</p>
                </div>
                <div className="text-[9px] text-slate-400 font-serif mt-4 border-t border-slate-200/50 pt-2 text-right">
                  {ed.institution}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advisory Council */}
        <div id="advisory-council" className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-lg font-bold font-serif text-[#0a2463]">Global Advisory Council</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Providing long-term strategic guidance, cross-border liaison operations, and institutional oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advisoryCouncil.map((adv, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{adv.name}</h4>
                  <p className="text-[9px] text-slate-400 font-medium">{adv.role}</p>
                </div>
                <p className="text-[10px] text-slate-500 font-serif mt-3 border-t border-slate-100 pt-2 font-semibold">
                  {adv.institution}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Partnerships */}
        <div id="partnerships-section" className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-lg font-bold font-serif text-[#0a2463]">Institutional Alliances</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              We work in direct alignment with multi-lateral banks and regional community commissions to distribute peer findings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {partnerships.map((part, idx) => (
              <div key={idx} className="bg-slate-50/60 p-5 rounded-xl border border-slate-150 text-center flex flex-col justify-between">
                <span className="text-xs font-bold text-[#0a2463] block font-serif leading-snug">{part.name}</span>
                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed border-t border-slate-200/50 pt-2">{part.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accreditation, Certifications & Impact Report Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Accreditation & Certifications */}
          <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#1e6f5c] uppercase tracking-wider block mb-2">Accreditation</span>
              <h3 className="text-lg font-bold font-serif text-[#0a2463] mb-4">Scientific Registration Seals</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3.5 items-start">
                  <div className="bg-[#1e6f5c]/10 text-[#1e6f5c] p-2 rounded-lg mt-1 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">COPE Compliance certified</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Our peer-review systems conform strictly to the guidelines and standards set by the Committee on Publication Ethics.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="bg-[#1e6f5c]/10 text-[#1e6f5c] p-2 rounded-lg mt-1 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">ISO 9001:2015 Governance standard</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      All government project review workflows and panel selection protocols are certified under independent quality management systems.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono mt-6 border-t border-slate-100 pt-4">
              Registered academic charity identification key: RU-NGO-104938
            </div>
          </div>

          {/* Annual Impact Report Preview */}
          <div className="lg:col-span-5 bg-[#0a2463] text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:1rem_1rem]"></div>
            
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-[#c8960c] uppercase tracking-widest block mb-2">Annual Publication</span>
              <h3 className="text-md font-bold font-serif mb-3 leading-tight">Institutional Impact & Annual Report 2024</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Review our comprehensive summary of audited research metrics, certificated sovereign projects, and computational resource distribution keys.
              </p>
            </div>

            <button
              onClick={() => alert("Downloading TriefML Institutional Annual Impact Report 2024 (PDF format, 48MB).")}
              className="relative z-10 bg-[#c8960c] hover:bg-[#b0830a] text-[#0a2463] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors mt-8 cursor-pointer shadow-md"
            >
              <ArrowDownToLine className="w-4 h-4" /> Download Annual Report (PDF)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
