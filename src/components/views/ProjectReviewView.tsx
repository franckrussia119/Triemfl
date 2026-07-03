import React, { useState, useMemo } from "react";
import { ShieldCheck, HelpCircle, FileSpreadsheet, Layers, Briefcase, Calculator, Clock, DollarSign, Award, ChevronRight, FileText, CheckCircle2 } from "lucide-react";

export default function ProjectReviewView() {
  // Calculator States
  const [pagesCount, setPagesCount] = useState<number>(120);
  const [reviewType, setReviewType] = useState<string>("standard");

  // Pre-Evaluation Simulator States
  const [projectType, setProjectType] = useState("infrastructure");
  const [fundingCapacity, setFundingCapacity] = useState<number>(150); // $M
  const [expectedIrr, setExpectedIrr] = useState<number>(14); // %
  const [debtEquityRatio, setDebtEquityRatio] = useState<number>(60); // %
  const [complianceScore, setComplianceScore] = useState<number>(75); // score 0-100
  const [regulatoryRiskBuffer, setRegulatoryRiskBuffer] = useState<boolean>(true);

  const simulationResult = useMemo(() => {
    // Basic calculation model
    let score = 50;
    
    // Impact of IRR
    if (expectedIrr >= 12) {
      score += (expectedIrr - 12) * 1.5;
    } else {
      score -= (12 - expectedIrr) * 2.5;
    }
    
    // Impact of Debt-Equity
    if (debtEquityRatio > 70) {
      score -= (debtEquityRatio - 70) * 1.2; // high leverage is risky
    } else if (debtEquityRatio < 40) {
      score += (40 - debtEquityRatio) * 0.5; // safe leverage
    } else {
      score += 5; // moderate leverage
    }
    
    // Impact of Compliance
    score += (complianceScore - 60) * 0.8;
    
    // Buffer
    if (regulatoryRiskBuffer) {
      score += 8;
    } else {
      score -= 5;
    }
    
    // Project type specific adjustments
    if (projectType === "banking") {
      // banking needs high compliance and lower leverage
      if (debtEquityRatio > 65) score -= 15;
      if (complianceScore > 80) score += 10;
    } else if (projectType === "sovereign") {
      // sovereign needs large funding but safe leverage
      if (fundingCapacity > 300 && debtEquityRatio > 55) score -= 12;
    }
    
    // Bound score
    score = Math.max(10, Math.min(100, Math.floor(score)));
    
    // Determine tier & recommendations
    let seal = "Seal C (Critical Risk)";
    let sealColor = "text-red-700 bg-red-50 border-red-200";
    let recommendation = "Unfeasible under current fiscal guidelines. High systemic exposure. We recommend restructuring debt portfolios and reducing leverage.";
    
    if (score >= 80) {
      seal = "Seal A (Highly Feasible)";
      sealColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
      recommendation = "Excellent structural design. Ready for immediate full peer-review and certification pipeline. Strong alignment with Basel IV and sovereign debt thresholds.";
    } else if (score >= 60) {
      seal = "Seal B (Moderate Feasibility)";
      sealColor = "text-amber-700 bg-amber-50 border-amber-200";
      recommendation = "Generally robust, but requires structural alignment. We recommend adjusting credit buffers, optimizing leverage, and submitting to the advisory board for minor tuning.";
    }
    
    // Dynamic indicators
    const debtExposure = debtEquityRatio > 70 ? "High Risk" : debtEquityRatio > 50 ? "Moderate" : "Low Risk";
    const fiscalMultiplier = ((expectedIrr / 100) * (fundingCapacity * (1 - debtEquityRatio / 100)) * 1.8).toFixed(1);

    return {
      score,
      seal,
      sealColor,
      recommendation,
      debtExposure,
      fiscalMultiplier
    };
  }, [projectType, fundingCapacity, expectedIrr, debtEquityRatio, complianceScore, regulatoryRiskBuffer]);

  const calculatorOutput = useMemo(() => {
    let basePrice = 2500;
    let reviewerCount = 2;
    let baseWeeks = 4;
    
    if (reviewType === "basic") {
      basePrice = 2500;
      reviewerCount = 2;
      baseWeeks = 4;
    } else if (reviewType === "standard") {
      basePrice = 5000;
      reviewerCount = 4;
      baseWeeks = 6;
    } else if (reviewType === "comprehensive") {
      basePrice = 10000;
      reviewerCount = 6;
      baseWeeks = 8;
    } else {
      // institutional
      basePrice = 15000;
      reviewerCount = 8;
      baseWeeks = 10;
    }

    // Page count adjustments
    const pageMultiplier = pagesCount > 250 ? 1.5 : pagesCount > 100 ? 1.2 : 1.0;
    const finalPrice = Math.floor(basePrice * pageMultiplier);
    const finalWeeks = baseWeeks + (pagesCount > 300 ? 3 : pagesCount > 150 ? 1.5 : 0);

    return {
      price: finalPrice,
      reviewers: reviewerCount,
      weeks: finalWeeks
    };
  }, [pagesCount, reviewType]);

  const pricingTiers = [
    {
      name: "Basic Review",
      price: "$2,500",
      pages: "Up to 50 pages",
      reviewers: "2 Reviewers",
      output: "Summary Report",
      color: "border-slate-200",
      bgBtn: "bg-slate-100 text-slate-700 hover:bg-slate-200"
    },
    {
      name: "Standard Review",
      price: "$5,000",
      pages: "Up to 150 pages",
      reviewers: "4 Reviewers",
      output: "Detailed Report + Recommendations",
      color: "border-[#c8960c] ring-2 ring-[#c8960c]/20",
      bgBtn: "bg-[#0a2463] text-[#c8960c] hover:bg-[#071b4a]",
      featured: true
    },
    {
      name: "Comprehensive Review",
      price: "$10,000",
      pages: "Unlimited pages",
      reviewers: "6 Reviewers",
      output: "Full Certification + Advisory",
      color: "border-slate-200",
      bgBtn: "bg-slate-900 text-white hover:bg-slate-800"
    },
    {
      name: "Institutional Package",
      price: "Custom",
      pages: "Multi-year alignment",
      reviewers: "Dedicated Board",
      output: "Continuous Standardisation Support",
      color: "border-[#1e6f5c] border-2",
      bgBtn: "bg-[#1e6f5c] text-white hover:bg-[#165244]"
    }
  ];

  const reviewedProjects = [
    { institution: "Ministry of Finance Ghana", title: "Fiscal Policy Reform 2024", status: "Approved with recommendations", color: "text-[#1e6f5c] bg-[#1e6f5c]/10" },
    { institution: "ECOWAS Commission", title: "Trade Integration Corridor Framework", status: "Certified", color: "text-[#1e6f5c] bg-[#1e6f5c]/10" },
    { institution: "Central Bank CEMAC", title: "Sub-regional Monetary Policy Framework", status: "Under Review", color: "text-amber-700 bg-amber-50" },
    { institution: "NGO Development Fund", title: "Agricultural Investment Action Plan", status: "Approved", color: "text-[#1e6f5c] bg-[#1e6f5c]/10" }
  ];

  return (
    <div className="bg-[#f8fafc] py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Institutional Header */}
        <div id="review-hero" className="bg-[#0a2463] text-white rounded-2xl p-8 sm:p-12 shadow-xl border border-blue-900 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px)] bg-[size:8rem_8rem]"></div>
          
          <div className="max-w-3xl relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c8960c]">Independent Peer Inspection</span>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white mt-3 tracking-tight">
              Submit Your Economic Project for Expert Review
            </h1>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Ensure credibility, transparency, and operational compliance. The Tango Research Institute of Economics, Finance, Management and Law (TRIEFML) provides independent, structural evaluation of regional development designs, monetary policies, legal audits, and fiscal frameworks.
            </p>
          </div>
        </div>

        {/* Process Flow timeline */}
        <div id="timeline-section" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-12">
          <h2 className="text-xl font-bold font-serif text-[#0a2463] mb-8 text-center">Our Project Examination Timeline</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            
            {/* Horizontal Line connector (desktop) */}
            <div className="hidden md:block absolute top-12 left-12 right-12 h-1 bg-slate-100 -z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0a2463] text-[#c8960c] font-bold text-sm flex items-center justify-center mx-auto border-4 border-white shadow-md">
                1
              </div>
              <h4 className="text-xs font-bold text-[#0a2463]">Submit Project</h4>
              <p className="text-[10px] text-slate-400 font-mono">Week 1</p>
              <p className="text-[11px] text-slate-500 leading-normal max-w-[150px] mx-auto">
                Organizations submit comprehensive project plans and documentation.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0a2463] text-[#c8960c] font-bold text-sm flex items-center justify-center mx-auto border-4 border-white shadow-md">
                2
              </div>
              <h4 className="text-xs font-bold text-[#0a2463]">Screening</h4>
              <p className="text-[10px] text-slate-400 font-mono">Week 1-2</p>
              <p className="text-[11px] text-slate-500 leading-normal max-w-[150px] mx-auto">
                Initial document screening and selection of corresponding expert board.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0a2463] text-[#c8960c] font-bold text-sm flex items-center justify-center mx-auto border-4 border-white shadow-md">
                3
              </div>
              <h4 className="text-xs font-bold text-[#0a2463]">Panel Review</h4>
              <p className="text-[10px] text-slate-400 font-mono">Week 2-5</p>
              <p className="text-[11px] text-slate-500 leading-normal max-w-[150px] mx-auto">
                A customized panel of certified PhD economists conducts blind evaluations.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0a2463] text-[#c8960c] font-bold text-sm flex items-center justify-center mx-auto border-4 border-white shadow-md">
                4
              </div>
              <h4 className="text-xs font-bold text-[#0a2463]">Compilation</h4>
              <p className="text-[10px] text-slate-400 font-mono">Week 5-7</p>
              <p className="text-[11px] text-slate-500 leading-normal max-w-[150px] mx-auto">
                Synthesis of review parameters into a detailed governance audit report.
              </p>
            </div>

            {/* Step 5 */}
            <div className="relative z-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#1e6f5c] text-white font-bold text-sm flex items-center justify-center mx-auto border-4 border-white shadow-md">
                5
              </div>
              <h4 className="text-xs font-bold text-[#1e6f5c]">Certification</h4>
              <p className="text-[10px] text-teal-600 font-mono">Week 7-8</p>
              <p className="text-[11px] text-slate-500 leading-normal max-w-[150px] mx-auto">
                Official delivery of the standardization report and compliance certification seal.
              </p>
            </div>

          </div>
        </div>

        {/* Pricing & Calculator Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-12">
          
          {/* Left Column: Interactive Calculator */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <Calculator className="w-5 h-5 text-[#c8960c]" />
              <h3 className="text-sm font-bold text-[#0a2463] uppercase tracking-wide">Review Cost Calculator</h3>
            </div>

            {/* Page Count Slider */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Manuscript Length</span>
                <span className="font-bold text-[#c8960c] font-mono">{pagesCount} pages</span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={pagesCount}
                onChange={(e) => setPagesCount(parseInt(e.target.value))}
                className="w-full accent-[#c8960c] bg-slate-100 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>1 page</span>
                <span>500 pages</span>
              </div>
            </div>

            {/* Review Type Dropdown */}
            <div className="space-y-2 mb-6">
              <label className="block text-xs font-semibold text-slate-700">Examination Service Level</label>
              <select
                value={reviewType}
                onChange={(e) => setReviewType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
              >
                <option value="basic">Basic Evaluation ($2,500 base)</option>
                <option value="standard">Standard Evaluation ($5,000 base)</option>
                <option value="comprehensive">Comprehensive Certification ($10,000 base)</option>
                <option value="institutional">Institutional Partnership ($15,000 base)</option>
              </select>
            </div>

            {/* Calculator Output */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Assigned Specialists:</span>
                <span className="font-bold text-[#0a2463] font-mono">{calculatorOutput.reviewers} Economists</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Timeline Estimate:</span>
                <span className="font-bold text-slate-700 font-mono">~ {calculatorOutput.weeks} Weeks</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 font-semibold">Estimated Charge:</span>
                <span className="text-lg font-bold text-[#1e6f5c] font-mono">${calculatorOutput.price.toLocaleString()} USD</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Starting submission process based on ${reviewType} evaluation for a ${pagesCount}-page proposal. Estimated fee is $${calculatorOutput.price.toLocaleString()}.`)}
              className="w-full bg-[#c8960c] text-[#0a2463] hover:bg-[#b0830a] font-bold py-3 rounded-xl text-xs tracking-wide transition-colors mt-6 shadow-sm cursor-pointer"
            >
              Order Initial Evaluation
            </button>
          </div>

          {/* Right Column: Pricing Tiers Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`editorial-card border-l-[4px] border-l-[#0a2463] p-6 flex flex-col justify-between ${tier.color}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{tier.name}</h3>
                    {tier.featured && (
                      <span className="bg-[#c8960c]/10 text-[#c8960c] text-[9px] font-bold px-2 py-0.5 rounded border border-[#c8960c]/20">
                        Popular Tier
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0a2463] mb-4">
                    {tier.price} <span className="text-[10px] text-slate-400 font-sans font-normal">/ flat fee</span>
                  </div>
                  
                  <ul className="space-y-2.5 text-xs text-slate-600 mb-6 border-t border-slate-100 pt-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1e6f5c] shrink-0" />
                      <span>{tier.pages}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1e6f5c] shrink-0" />
                      <span>{tier.reviewers}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1e6f5c] shrink-0" />
                      <span>{tier.output}</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => alert(`Review application submitted under the ${tier.name} tier ($${tier.price}). Our liaison office will initiate communications.`)}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${tier.bgBtn}`}
                >
                  Apply Under This Tier
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Systemic Feasibility & Stress-Testing Simulator */}
        <div id="feasibility-stress-simulator" className="bg-[#fcfcfd] rounded-2xl border border-slate-200 p-6 sm:p-10 mb-12 shadow-sm">
          <div className="border-b border-slate-200 pb-6 mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-[#c8960c] font-bold">Interactive Pre-Evaluation Portal</span>
            <h2 className="text-2xl font-bold font-serif text-[#0a2463] mt-1">
              Systemic Policy & Feasibility Stress-Testing Simulator
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Before submitting formal briefs, evaluate your sovereign investment, commercial banking policy, or legal reform against TRIEFML criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Row 1: Project Type select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Division Focus</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#0a2463]"
                  >
                    <option value="infrastructure">Infrastructure & Logistics Corridors (TRIEFML-PEAC)</option>
                    <option value="banking">Commercial Banking Stability (TRIEFML-BCM)</option>
                    <option value="sovereign">Sovereign Debt & Fiscal Expansion (TRIEFML-SDM)</option>
                    <option value="law">Transnational Treaty Harmonization (TRIEFML-LAW)</option>
                    <option value="governance">State Enterprise Strategic Design (TRIEFML-MGT)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Total Investment / Asset Base</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={fundingCapacity}
                      onChange={(e) => setFundingCapacity(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs pl-7 pr-12 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0a2463]"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-mono">Million</span>
                  </div>
                </div>
              </div>

              {/* Sliders Block */}
              <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200/80">
                
                {/* Expected IRR Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Expected IRR / Systemic Return</span>
                    <span className="font-bold text-[#0a2463] font-mono">{expectedIrr}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="35"
                    value={expectedIrr}
                    onChange={(e) => setExpectedIrr(Number(e.target.value))}
                    className="w-full accent-[#0a2463] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <p className="text-[9px] text-slate-400">Higher ROI drives fiscal surplus but carries systemic volatility.</p>
                </div>

                {/* Debt to Equity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Debt-to-Equity Leverage Ratio</span>
                    <span className="font-bold text-[#c8960c] font-mono">{debtEquityRatio}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={debtEquityRatio}
                    onChange={(e) => setDebtEquityRatio(Number(e.target.value))}
                    className="w-full accent-[#c8960c] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <p className="text-[9px] text-slate-400">Leverage above 70% prompts automatic risk flags in TRIEFML debt models.</p>
                </div>

                {/* Compliance / Governance Score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Governance & Compliance Index</span>
                    <span className="font-bold text-emerald-700 font-mono">{complianceScore} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={complianceScore}
                    onChange={(e) => setComplianceScore(Number(e.target.value))}
                    className="w-full accent-[#1e6f5c] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <p className="text-[9px] text-slate-400">Measures anti-corruption transparency and legal alignment scores.</p>
                </div>

              </div>

              {/* Switch options */}
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800">Basel IV / Capital Adequacy Buffer</h4>
                  <p className="text-[10px] text-slate-400">Implement active counter-cyclical safety buffers to absorb liquidity shocks.</p>
                </div>
                <button
                  onClick={() => setRegulatoryRiskBuffer(!regulatoryRiskBuffer)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    regulatoryRiskBuffer ? "bg-[#1e6f5c]" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      regulatoryRiskBuffer ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

            </div>

            {/* Simulation Scoreboard Panel */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between shadow-inner">
              <div className="space-y-6">
                
                {/* Score Dial */}
                <div className="text-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-2">Estimated Feasibility Index</span>
                  <div className="inline-flex items-center justify-center relative">
                    {/* Visual Score Ring */}
                    <div className="w-28 h-28 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50 relative">
                      <span className="text-3xl font-extrabold font-mono text-[#0a2463]">{simulationResult.score}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Score</span>
                    </div>
                  </div>
                </div>

                {/* Seal Certificate Badge */}
                <div className={`border p-3 rounded-lg text-center font-mono text-xs font-bold ${simulationResult.sealColor}`}>
                  {simulationResult.seal}
                </div>

                {/* Mini Indicators Bento */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <span className="text-[9px] text-slate-400 block uppercase">Debt Exposure</span>
                    <span className="text-xs font-bold text-slate-700 mt-1 block">{simulationResult.debtExposure}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <span className="text-[9px] text-slate-400 block uppercase">Estimated Impact</span>
                    <span className="text-xs font-bold text-emerald-700 mt-1 block">x{simulationResult.fiscalMultiplier} GDP Multiplier</span>
                  </div>
                </div>

                {/* Consultative Recommendation narrative */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-800 font-sans uppercase">Advisory Board Guideline</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded border border-slate-100 italic">
                    "{simulationResult.recommendation}"
                  </p>
                </div>

              </div>

              <div className="pt-6 border-t border-slate-100">
                <button
                  onClick={() => alert(`Advisory consultation scheduled. We have prepared an automatic stress-report for your project (Feasibility Score: ${simulationResult.score}%, Code: ${projectType.toUpperCase()}-STRESS). Dr. Diallo and Dr. Vance will connect with you.`)}
                  className="w-full bg-[#0a2463] hover:bg-[#c8960c] hover:text-[#0a2463] text-white py-3 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Request Board Review & Consultation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Anonymised Case Studies */}
        <div id="past-reviews" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="max-w-xl mb-6">
            <h3 className="text-md font-bold text-[#0a2463] uppercase tracking-wide">Historical Registries & Indexing</h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Anonymised record of public development designs, multi-lateral corridors, and institutional models evaluated by the TRIEFML board.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviewedProjects.map((proj, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-200/60 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 block mb-1">{proj.institution}</span>
                  <h4 className="text-xs font-bold text-[#0a2463] leading-snug">{proj.title}</h4>
                </div>
                <div className="mt-4 pt-3.5 border-t border-slate-200/50 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Status:</span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${proj.color}`}>{proj.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
