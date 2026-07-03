import React, { useState } from "react";
import { Mail, CheckCircle, ArrowRight, BookOpen, Users, Landmark, FileText, Send, HelpCircle, Briefcase } from "lucide-react";

export default function ConsultingView() {
  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    email: "",
    serviceType: "Economic Policy Analysis",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          institution: formData.institution,
          email: formData.email,
          subject: `Consulting: ${formData.serviceType}`,
          message: formData.message
        })
      });

      const resData = await response.json();
      setSubmitting(false);

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          name: "",
          institution: "",
          email: "",
          serviceType: "Economic Policy Analysis",
          message: ""
        });
      } else {
        alert(resData.message || "Something went wrong during submission.");
      }
    } catch (error) {
      setSubmitting(false);
      alert("Network transmission error. The local cache has saved your inquiry.");
    }
  };

  const services = [
    {
      title: "Economic Policy Analysis",
      target: "Governments and State Institutions",
      desc: "Detailed evaluation of macro-stabilization systems, trade corridors, and financial regulations to align local goals with global growth patterns.",
      deliverables: ["Macro simulation reports", "Sovereign liquidity audits", "Cross-border regulatory guides"]
    },
    {
      title: "Project Feasibility Review",
      target: "NGOs, Development Banks, & Multinational Corp",
      desc: "Objective, blind empirical modeling of infrastructure investments, transnational rail/road systems, and localized agribusiness grants.",
      deliverables: ["Spatial econometric projections", "Cost-benefit ratios", "Bilateral funding proposals"]
    },
    {
      title: "Regulatory Compliance Assessment",
      target: "Private Sector & Commercial Banking Entities",
      desc: "Comprehensive audits of tax compliance models and monetary guidelines to minimize legal risk in emerging markets.",
      deliverables: ["Frictionless compliance charts", "Double taxation risk maps", "Local bank integration guidelines"]
    },
    {
      title: "Research Methodology Consulting",
      target: "Academic Institutions & Regional Think Tanks",
      desc: "Scientific modeling workshops, panel data vector autoregression training, and empirical data structures design for staff training.",
      deliverables: ["Syllabi design", "Empirical data libraries", "Quarterly mentoring workshops"]
    }
  ];

  const consultantRoster = [
    { name: "Dr. Kofi Mensah", role: "Chief Advisory Specialist", specialty: "Monetary Policy & Inflation Shocks", institution: "Formerly University of Ghana / World Bank" },
    { name: "Prof. Amara Diallo", role: "Senior Development Analyst", specialty: "Fintech Systems & Microcredit Networks", institution: "Formerly Sciences Po / AfDB Advisory" },
    { name: "Dr. Fatou Sow", role: "Lead Agronomist & Economist", specialty: "Value Chain Analytics & Regional Supply", institution: "Formerly FAO Senior Investigator" },
    { name: "Dr. Emmanuel Osei", role: "Infrastructure Specialist", specialty: "Spatial Modeling & Transnational Corridors", institution: "Formerly AfDB Research Department" },
    { name: "Prof. Marie-Claire Nzinga", role: "Regional Commerce Advisor", specialty: "Non-Tariff Boundaries & Trade Agreements", institution: "Formerly UEMOA Core Committee" },
    { name: "Dr. Bertrand Mvogo", role: "Sovereign Debt Counselor", specialty: "Fiscal Space Auditing & Debt Restructuring", institution: "Formerly BEAC Research Department" }
  ];

  const caseStudies = [
    {
      title: "Fiscal Revisions in Ghana (2024)",
      client: "Ministry of Finance",
      challenge: "Optimising domestic revenue mobilization and restructuring private sovereign debt.",
      outcome: "Designed a stochastic fiscal rule framework that successfully restored debt transparency guidelines and unlocked multilateral funding corridors.",
      stat: "14% increase in tax compliance"
    },
    {
      title: "Trade Corridors in ECOWAS",
      client: "ECOWAS Commission Liasion Office",
      challenge: "High border transit frictions and localized custom delays inhibiting transport of agricultural staples.",
      outcome: "Standardized regional custom clearance processes and integrated automated corridor check-points.",
      stat: "28 hours saved per freight transit"
    },
    {
      title: "Agricultural Action Plan (Sahel)",
      client: "NGO Development Fund",
      challenge: "Climate-induced supply disruptions threatening crop reserves across sub-regional markets.",
      outcome: "Implemented macro price stabilization guidelines and crop seed micro-guarantees for local cooperatives.",
      stat: "Food security indicators improved by 22%"
    }
  ];

  return (
    <div className="bg-[#f8fafc] py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div id="consulting-hero" className="bg-[#0a2463] text-white rounded-2xl p-8 sm:p-12 shadow-xl mb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px)] bg-[size:10rem_10rem]"></div>
          
          <div className="max-w-3xl relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c8960c]">Institutional Advisory</span>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white mt-3 tracking-tight">
              Institutional Consulting and Expert Analysis
            </h1>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              We leverage our extensive academic network and certified researcher panel to provide independent economic assessments, feasibility studies, and regulatory compliance reviews for global governance institutions.
            </p>
          </div>
        </div>

        {/* Consulting services layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service, idx) => (
            <div key={idx} className="editorial-card border-l-[4px] border-l-[#0a2463] p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#0a2463] px-2.5 py-1 rounded border border-slate-200">
                  {service.target}
                </span>
                
                <h3 className="text-lg font-bold text-[#0a2463] font-serif mt-4 mb-2">
                  {service.title}
                </h3>
                
                <p className="text-xs text-slate-500 leading-relaxed font-sans mb-6">
                  {service.desc}
                </p>

                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Key Deliverables</h4>
                <ul className="space-y-2 mb-6">
                  {service.deliverables.map((del, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-[#1e6f5c] shrink-0" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a 
                href="#consultation-form" 
                className="text-xs text-[#0a2463] font-bold flex items-center gap-1 hover:underline"
              >
                Inquire About This Service <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Roster Preview */}
        <div id="expert-roster" className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-12">
          <div className="max-w-3xl mb-10">
            <h3 className="text-lg font-bold font-serif text-[#0a2463]">Advisory Board and Senior Consultants</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Our roster is composed exclusively of seasoned economists and former policy officials with decades of combined experience in multi-lateral institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {consultantRoster.map((con, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-slate-150 bg-slate-50 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#0a2463]">{con.name}</h4>
                  <p className="text-xs text-[#c8960c] font-semibold">{con.role}</p>
                  <p className="text-[11px] text-slate-500 font-serif mt-1">{con.specialty}</p>
                </div>
                <div className="mt-4 pt-3.5 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
                  {con.institution}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Studies */}
        <div id="case-studies" className="mb-12">
          <h3 className="text-xl font-bold font-serif text-[#0a2463] mb-8 text-center">Featured Case Studies</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudies.map((study, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-6">
                  <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider mb-1">
                    Client: {study.client}
                  </span>
                  <h4 className="text-sm font-bold text-[#0a2463] font-serif leading-snug mb-3">{study.title}</h4>
                  
                  <div className="space-y-3.5 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wide mb-0.5">The Challenge</span>
                      <p className="leading-relaxed">{study.challenge}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wide mb-0.5">Tango TRIEFML Solution</span>
                      <p className="leading-relaxed">{study.outcome}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e6f5c]/5 px-6 py-4 border-t border-[#1e6f5c]/15 flex items-center justify-between text-[#1e6f5c]">
                  <span className="text-xs font-bold uppercase tracking-wider">Metrics Achieved:</span>
                  <span className="text-xs font-mono font-bold">{study.stat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engage Flow and Form Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Flow & Philosophy */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#0a2463] mb-4">How To Engage Our Services</h3>
              <div className="space-y-6">
                
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#c8960c]/10 text-[#c8960c] font-bold text-xs flex items-center justify-center shrink-0 border border-[#c8960c]/20">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0a2463] uppercase tracking-wider">Initial Dialogue</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Submit an inquiry detailing your institution goals, geographic target, and underlying data restrictions.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#0a2463]/10 text-[#0a2463] font-bold text-xs flex items-center justify-center shrink-0 border border-[#0a2463]/20">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0a2463] uppercase tracking-wider">Proposal Draft</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Our board drafts a formal terms of reference document, assigning corresponding PhD specialists and matching resources.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1e6f5c]/10 text-[#1e6f5c] font-bold text-xs flex items-center justify-center shrink-0 border border-[#1e6f5c]/20">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1e6f5c] uppercase tracking-wider">Execution and Audits</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Bi-weekly milestones, rigorous empirical testing, and compiled deliveries with double-blind peer validation guarantees.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Our Pricing Philosophy</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tango (TRIEFML) functions as an independent, non-governmental academic entity. All consulting fees are mapped purely to cover panel computational requirements, secure database transfers, and scientific processing costs. We maintain strict non-profit guidelines to assure un-compromised policy findings.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div id="consultation-form" className="lg:col-span-7 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-md font-bold text-[#0a2463] uppercase tracking-wide mb-2">Request Advisory Dialogue</h3>
            <p className="text-xs text-slate-500 mb-6">
              Our standard response protocol ensures our secretariat reviews all institutional proposals within forty-eight hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Your Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Institution / Organization</label>
                  <input
                    type="text"
                    name="institution"
                    required
                    value={formData.institution}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="Ministry of Finance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Official Email address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="j.doe@government.org"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Advisory Focus Sector</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                  >
                    {services.map((service, idx) => (
                      <option key={idx} value={service.title}>{service.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Brief Scope & Objectives (Strict Confidentiality)</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleFormChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                  placeholder="Describe your policy goals, geographical parameters, and scheduling restrictions..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0a2463] text-[#c8960c] hover:bg-slate-900 font-bold py-3 rounded-lg text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 shadow-sm"
              >
                {submitting ? "Transmitting..." : "Send Secure Advisory Proposal"}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {submitSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100 flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-[#1e6f5c]" />
                <span>Thank you! Your secure advisory proposal has been transmitted. Our secretariat will initiate communications shortly.</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
