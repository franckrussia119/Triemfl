export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  institution: string;
  category: "Macroeconomics" | "Development" | "Finance" | "Trade" | "Agricultural" | "Policy" | "Environmental" | "Labor" | "Monetary" | "Fiscal";
  abstract: string;
  publishedDate: string;
  downloads: number;
  citations: number;
  views: number;
  rating: number;
  tags: string[];
}

export const researchPapers: ResearchPaper[] = [
  {
    id: "1",
    title: "Monetary Policy Transmission in Sub-Saharan Africa: Evidence from Panel Data 2020-2024",
    authors: "Dr. Kofi Mensah",
    institution: "University of Ghana",
    category: "Macroeconomics",
    abstract: "This paper investigates the effectiveness of monetary policy transmission channels in selected Sub-Saharan African economies. Using a dynamic panel vector autoregression (PVAR) approach, we analyze how central bank policy rate adjustments impact inflation and real output across different financial market depths. Results indicate that while the credit channel has strengthened, interest rate pass-through remains sluggish due to structural liquidity challenges in commercial banks.",
    publishedDate: "2024-03-12",
    downloads: 1245,
    citations: 34,
    views: 4520,
    rating: 4.8,
    tags: ["Monetary Policy", "Sub-Saharan Africa", "Dynamic Panel"]
  },
  {
    id: "2",
    title: "Digital Financial Inclusion and Economic Growth in Emerging Markets",
    authors: "Prof. Amara Diallo",
    institution: "Sciences Po Paris",
    category: "Finance",
    abstract: "This study explores the empirical link between mobile money uptake, financial inclusion, and macroeconomic growth in emerging markets. Using structural equation modeling on data from 2015 to 2023, we show that digital transaction expansion reduces wealth disparities, lowers transaction overheads, and drives local entrepreneurship. The paper proposes a regulatory sandbox model to balance consumer protection with systemic innovation.",
    publishedDate: "2024-01-20",
    downloads: 1890,
    citations: 56,
    views: 6100,
    rating: 4.9,
    tags: ["Financial Inclusion", "Mobile Money", "Emerging Markets"]
  },
  {
    id: "3",
    title: "Agricultural Trade Policies and Food Security in the Sahel Region",
    authors: "Dr. Fatou Sow",
    institution: "World Food Programme",
    category: "Trade",
    abstract: "This research examines how cross-border agricultural tariff adjustments affect regional food security in Sahelian countries. Using a global trade analysis project (GTAP) model, we demonstrate that non-tariff barriers are the primary driver of regional food supply chain vulnerabilities. We advocate for a synchronized regional corridor system to facilitate seamless transit of staple crops and mitigate climate-induced shocks.",
    publishedDate: "2023-11-05",
    downloads: 870,
    citations: 22,
    views: 3120,
    rating: 4.7,
    tags: ["Trade Tariffs", "Food Security", "Sahel Region"]
  },
  {
    id: "4",
    title: "Infrastructure Investment and GDP Growth: Evidence from African Development Bank Projects",
    authors: "Dr. Emmanuel Osei",
    institution: "AfDB Research Division",
    category: "Development",
    abstract: "This paper evaluates the long-term multiplier effects of transport and energy infrastructure projects financed by the African Development Bank over the last decade. Applying spatial econometric models, we find that every dollar invested in transnational road corridors yields up to three dollars in regional trade expansion. The paper highlights key lessons in project design and financial risk management.",
    publishedDate: "2024-02-18",
    downloads: 1420,
    citations: 41,
    views: 4980,
    rating: 4.8,
    tags: ["Infrastructure", "Economic Growth", "Spatial Econometrics"]
  },
  {
    id: "5",
    title: "Currency Exchange Rate Volatility and Export Performance in ECOWAS",
    authors: "Dr. Chioma Nwosu",
    institution: "CBN Institute",
    category: "Finance",
    abstract: "This paper investigates the relationship between currency fluctuations and export performance in the Economic Community of West African States (ECOWAS). Utilizing a generalized autoregressive conditional heteroskedasticity (GARCH) model, we show that export diversification mitigates exchange rate shocks, while raw commodity exporters face severe terms-of-trade deteriorations during periods of high volatility.",
    publishedDate: "2023-09-15",
    downloads: 950,
    citations: 18,
    views: 3400,
    rating: 4.6,
    tags: ["Exchange Rates", "Export Growth", "ECOWAS"]
  },
  {
    id: "6",
    title: "Public Debt Sustainability Analysis for Post-COVID Recovery in CEMAC Zone",
    authors: "Dr. Bertrand Mvogo",
    institution: "BEAC Research Department",
    category: "Policy",
    abstract: "This policy brief presents a comprehensive assessment of public debt levels and fiscal space in the Central African Economic and Monetary Community (CEMAC) following post-pandemic adjustments. We utilize a stochastic debt sustainability framework to identify debt-restructuring pathways. The report stresses the importance of enhancing domestic resource mobilization to reduce dependence on external commercial borrowing.",
    publishedDate: "2024-04-02",
    downloads: 1120,
    citations: 29,
    views: 3890,
    rating: 4.7,
    tags: ["Debt Sustainability", "Fiscal Space", "CEMAC Zone"]
  },
  {
    id: "7",
    title: "Climate Change Adaptation Costs and Agricultural Productivity in East Africa",
    authors: "Prof. Marie-Claire Nzinga",
    institution: "UEMOA Research Center",
    category: "Environmental",
    abstract: "This empirical study quantifies the economic burden of climate adaptation in East African agricultural systems. Drawing on farm-level survey data from Kenya, Tanzania, and Uganda, we model the production impact of drought-resistant seed adoption. The paper estimates that a coordinated regional adaptation fund could prevent a ten percent drop in agricultural GDP by the end of the current decade.",
    publishedDate: "2024-05-10",
    downloads: 780,
    citations: 15,
    views: 2950,
    rating: 4.5,
    tags: ["Climate Adaptation", "Agricultural GDP", "East Africa"]
  },
  {
    id: "8",
    title: "Youth Labor Dynamics, Informality, and Skills Gap in North African Cities",
    authors: "Dr. Ibrahim Al-Rashid",
    institution: "Central Bank of Egypt Research",
    category: "Labor",
    abstract: "This paper analyzes the structural causes of persistent youth unemployment and high labor informality in North African urban hubs. By merging labor force surveys with corporate hiring indexes, we identify a profound misalignment between higher education curricula and private sector technical requirements. We outline a policy blueprint for vocational-technical apprenticeships.",
    publishedDate: "2023-12-14",
    downloads: 980,
    citations: 25,
    views: 3670,
    rating: 4.7,
    tags: ["Youth Unemployment", "Skills Gap", "North Africa"]
  },
  {
    id: "9",
    title: "Evaluating Central Bank Digital Currencies (CBDC) in Middle-Income Nations",
    authors: "Dr. Kofi Mensah",
    institution: "University of Ghana",
    category: "Monetary",
    abstract: "This research addresses the design trade-offs involved in implementing retail Central Bank Digital Currencies in financial markets characterized by moderate banking penetration. We contrast interest-bearing and non-interest-bearing models, evaluating their impact on commercial bank deposit disintermediation. Our simulations provide a security framework for cross-border settlement systems.",
    publishedDate: "2024-05-28",
    downloads: 1310,
    citations: 38,
    views: 4120,
    rating: 4.9,
    tags: ["CBDC", "Financial Stability", "Disintermediation"]
  },
  {
    id: "10",
    title: "Fiscal Decentralization and Regional Disparities: A Spatial Autoregressive Analysis",
    authors: "Dr. Bertrand Mvogo",
    institution: "BEAC Research Department",
    category: "Fiscal",
    abstract: "This study evaluates the impact of subnational tax autonomy on regional income convergence in developing nations. Utilizing spatial autoregressive models, we demonstrate that while fiscal decentralization promotes localized public service efficiency, it tends to exacerbate regional inequality unless supported by robust equalization transfer mechanisms.",
    publishedDate: "2023-08-25",
    downloads: 650,
    citations: 12,
    views: 2430,
    rating: 4.4,
    tags: ["Fiscal Decentralization", "Regional Inequality", "Equalization Transfer"]
  },
  {
    id: "11",
    title: "Cross-Border Infrastructure and Inter-Regional Trade: The African Continental Free Trade Area",
    authors: "Dr. Emmanuel Osei",
    institution: "AfDB Research Division",
    category: "Trade",
    abstract: "This paper models the trade-creation effects of the African Continental Free Trade Area (AfCFTA) when coupled with high-impact border corridor upgrades. Using computable general equilibrium (CGE) simulations, we project that addressing border delays yields double the trade growth compared to tariff eliminations alone, highlighting the priority of physical infrastructure.",
    publishedDate: "2024-06-15",
    downloads: 1670,
    citations: 45,
    views: 5200,
    rating: 4.8,
    tags: ["AfCFTA", "Border Corridors", "CGE Modeling"]
  },
  {
    id: "12",
    title: "Fintech Credit vs. Bank Loans: Risk and Lending Dynamics in East Africa",
    authors: "Prof. Amara Diallo",
    institution: "Sciences Po Paris",
    category: "Finance",
    abstract: "This research contrasts the risk-adjusted returns and default rates of fintech-enabled credit platforms with traditional commercial bank loans in East Africa. Analyzing a proprietary portfolio of small-firm loans, we highlight how machine learning credit scoring models outperform traditional collateral requirements while introducing novel consumer data privacy risks.",
    publishedDate: "2024-03-30",
    downloads: 1150,
    citations: 28,
    views: 3900,
    rating: 4.6,
    tags: ["Fintech", "Credit Scoring", "SME Lending"]
  },
  {
    id: "13",
    title: "Sustainable Agricultural Supply Chains in West Africa: Cocoa and Cashew Markets",
    authors: "Dr. Fatou Sow",
    institution: "World Food Programme",
    category: "Agricultural",
    abstract: "This paper analyzes the integration of sustainability certifications into West African agricultural supply chains, focusing on cocoa and cashew sectors. Utilizing value chain mapping and farmer cooperative surveys, we measure the net premium income received by smallholders under Fairtrade regulations. The findings suggest that premium redistribution remains highly uneven.",
    publishedDate: "2023-10-18",
    downloads: 820,
    citations: 19,
    views: 2980,
    rating: 4.5,
    tags: ["Agricultural Exports", "Fairtrade", "West Africa"]
  },
  {
    id: "14",
    title: "Carbon Pricing Pathways in Developing Asia: Feasibility and Fiscal Dividends",
    authors: "Dr. Ibrahim Al-Rashid",
    institution: "Central Bank of Egypt Research",
    category: "Environmental",
    abstract: "This paper models the macroeconomic impacts of carbon taxation and cap-and-trade systems in rapidly industrializing Asian economies. Utilizing dynamic stochastic general equilibrium (DSGE) frameworks, we quantify the trade-offs between emission reductions and output growth, demonstrating how recycling carbon revenues into labor-tax cuts can offset transitional economic friction.",
    publishedDate: "2024-02-27",
    downloads: 940,
    citations: 23,
    views: 3100,
    rating: 4.7,
    tags: ["Carbon Pricing", "Fiscal Dividends", "DSGE Modeling"]
  },
  {
    id: "15",
    title: "The Role of Sovereign Wealth Funds in Countercyclical Fiscal Management",
    authors: "Dr. Chioma Nwosu",
    institution: "CBN Institute",
    category: "Fiscal",
    abstract: "This research examines the governance rules and macroeconomic impacts of resource-backed Sovereign Wealth Funds (SWFs). By evaluating the performance of several major commodity exporters, we establish the parameters of optimal fiscal rules that successfully buffer domestic budgets against terms-of-trade volatility while avoiding domestic inflation pressure.",
    publishedDate: "2024-05-05",
    downloads: 1040,
    citations: 31,
    views: 3380,
    rating: 4.8,
    tags: ["Sovereign Wealth Funds", "Fiscal Rules", "Commodity Shocks"]
  },
  {
    id: "16",
    title: "Evaluating Special Economic Zones (SEZs) in Sub-Saharan Africa: Successes and Pitfalls",
    authors: "Prof. Marie-Claire Nzinga",
    institution: "UEMOA Research Center",
    category: "Development",
    abstract: "This comparative study evaluates the industrialization and employment outcomes of Special Economic Zones in selected Sub-Saharan African countries. Utilizing firm-level productivity data, we find that zone success is heavily contingent on local infrastructure quality and direct backward linkages with the domestic economy, rather than tax holidays alone.",
    publishedDate: "2023-07-12",
    downloads: 790,
    citations: 14,
    views: 2800,
    rating: 4.3,
    tags: ["SEZs", "Industrialization", "Backward Linkages"]
  },
  {
    id: "17",
    title: "Exchange Rate Regimes and Inflation Control: A Comparative Analysis of CFA Franc vs. Flexible Regimes",
    authors: "Dr. Kofi Mensah",
    institution: "University of Ghana",
    category: "Macroeconomics",
    abstract: "This paper conducts an empirical comparison of inflation dynamics and output growth between nations under the pegged CFA franc system and neighbor countries utilizing independent flexible currencies. Standard vector error correction models (VECM) suggest that while pegged regimes provide substantial price stability, they reduce fiscal resilience during terms-of-trade crises.",
    publishedDate: "2024-01-15",
    downloads: 1380,
    citations: 40,
    views: 4620,
    rating: 4.9,
    tags: ["Exchange Rate Regimes", "CFA Franc", "Inflation Control"]
  },
  {
    id: "18",
    title: "Labor Market Integration and Migrant Remittances in Regional Economic Blocks",
    authors: "Dr. Ibrahim Al-Rashid",
    institution: "Central Bank of Egypt Research",
    category: "Labor",
    abstract: "This paper analyzes the spatial-temporal dynamics of cross-border migrant remittances and their impact on regional development. We map cash flows within key regional trading agreements and demonstrate how mobile payment platforms have altered remittance frequencies, enabling micro-savings and agricultural investments in home communities.",
    publishedDate: "2023-11-20",
    downloads: 910,
    citations: 21,
    views: 3220,
    rating: 4.6,
    tags: ["Remittances", "Labor Migration", "Mobile Money"]
  },
  {
    id: "19",
    title: "Assessing the Impact of Public-Private Partnerships in Regional Water Infrastructure",
    authors: "Dr. Emmanuel Osei",
    institution: "AfDB Research Division",
    category: "Policy",
    abstract: "This evaluation study uses mixed-methods research to analyze the financial and social performance of public-private partnerships (PPPs) in municipal water projects. We present a risk-sharing framework that minimizes public-sector fiscal liabilities while ensuring water service affordability and operational efficiency for low-income communities.",
    publishedDate: "2024-04-10",
    downloads: 1180,
    citations: 27,
    views: 3500,
    rating: 4.7,
    tags: ["PPPs", "Infrastructure Finance", "Water Security"]
  },
  {
    id: "20",
    title: "An Empirical Analysis of Capital Flight and Tax Avoidance in Natural Resource Exporters",
    authors: "Prof. Marie-Claire Nzinga",
    institution: "UEMOA Research Center",
    category: "Fiscal",
    abstract: "This paper measures the scale of capital flight and trade misinvoicing among mineral-exporting countries in West and Central Africa. Applying the classic import-export discrepancy methodology, we quantify the corporate tax avoidance dividends and propose a multilateral policy agenda to enhance tax transparency and cross-border bank cooperation.",
    publishedDate: "2024-06-22",
    downloads: 1450,
    citations: 48,
    views: 5120,
    rating: 4.9,
    tags: ["Capital Flight", "Trade Misinvoicing", "Tax Transparency"]
  },
  {
    id: "21",
    title: "Basel IV Capitalization Guidelines and Systemic Banking Stability: Empirical Stress Testing of Regional Commercial Portfolios",
    authors: "Prof. Amara Diallo & Dr. Chioma Nwosu",
    institution: "Tango Banking & Capital Markets Institute",
    category: "Finance",
    abstract: "This study constructs an empirical stress-testing framework to assess the impact of Basel IV capitalization guidelines on credit provision in emerging economies. Using loan-level microdata from 48 regional commercial banking portfolios, we model how higher Tier-1 capital requirements influence liquidity coverage ratios (LCR), interest rate risk pass-through, and default risk tolerances under extreme external shocks. The paper suggests dynamic, counter-cyclical capital buffers to prevent private credit contraction.",
    publishedDate: "2025-01-15",
    downloads: 2410,
    citations: 12,
    views: 7420,
    rating: 4.9,
    tags: ["Basel IV", "Banking Stability", "Capital Buffers", "Liquidity Shocks"]
  },
  {
    id: "22",
    title: "The Harmonization of Transnational Trade Treaties: Standardizing Antitrust, Intellectual Property, and Contract Codification in ECOWAS",
    authors: "Prof. Sarah Jenkins",
    institution: "Tango Jurisprudence, Codification & Public Law Institute",
    category: "Policy",
    abstract: "This treatise evaluates current legal frictions within cross-border commercial contracts inside the ECOWAS trading bloc. We argue that divergent subnational antitrust guidelines and unaligned intellectual property protections inhibit foreign direct investment (FDI) inflows. We present a standardized, draft legal code for treaty harmonization, incorporating modern arbitration clauses and unified anti-monopolistic parameters designed to mitigate cross-border contract vulnerability.",
    publishedDate: "2025-02-04",
    downloads: 1890,
    citations: 8,
    views: 5310,
    rating: 4.8,
    tags: ["Antitrust Law", "Trade Treaties", "Contract Codification", "Arbitration"]
  },
  {
    id: "23",
    title: "Corporate Governance Standards and Board Accountability: A Strategic Blueprint for Sovereign Wealth and State Enterprises",
    authors: "Dr. Catherine Vance",
    institution: "Tango Strategic Management & Corporate Governance Board",
    category: "Fiscal",
    abstract: "This paper addresses state-owned enterprise (SOE) reform and sovereign wealth fund governance through the lens of institutional management. We establish the Board Accountability Scorecard (BAS) to quantify corporate leakage, board transparency, and compliance with anti-corruption treaties. Empirical analysis across 14 sovereign funds suggests a direct correlation between high audit Independence and infrastructure project multiplier effects.",
    publishedDate: "2025-02-28",
    downloads: 1620,
    citations: 9,
    views: 4890,
    rating: 4.9,
    tags: ["Corporate Governance", "SOE Reform", "Board Accountability", "Audit Independence"]
  },
  {
    id: "24",
    title: "Commercial Banking Disintermediation and Central Bank Digital Currencies: Modeling CBDC Coexistence with Private Banking Structures",
    authors: "Dr. Kofi Mensah",
    institution: "Tango Banking & Capital Markets Institute",
    category: "Monetary",
    abstract: "This paper simulates the macroeconomic equilibrium under a dual-currency regime of retail Central Bank Digital Currency (CBDC) and traditional commercial bank deposits. Utilizing a dynamic stochastic general equilibrium (DSGE) model, we quantify the disintermediation threat where savers run to risk-free central bank liabilities during fiscal stress. We propose an optimal policy rule comprising interest-bearing caps and tiering deposit limits to safeguard commercial bank credit capabilities.",
    publishedDate: "2025-03-02",
    downloads: 2150,
    citations: 14,
    views: 6120,
    rating: 4.9,
    tags: ["CBDC", "Disintermediation", "Private Credit", "DSGE Modeling"]
  }
];

export const getCategoryColor = (category: string) => {
  switch (category) {
    case "Macroeconomics": return "#0a2463"; // navy
    case "Development": return "#1e6f5c"; // green
    case "Finance": return "#8b1a1a"; // dark red
    case "Trade": return "#e8a020"; // gold
    case "Agricultural": return "#5d4037"; // brown
    case "Policy": return "#4a148c"; // purple
    case "Environmental": return "#2e7d32"; // forest green
    case "Labor": return "#0277bd"; // blue
    case "Monetary": return "#ad1457"; // pink
    case "Fiscal": return "#e65100"; // orange
    default: return "#0a2463";
  }
};
