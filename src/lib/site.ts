// ---------------------------------------------------------------------------
// INSTITUTE SETTINGS — the single place to edit facts shown across the site.
//
// Rule of thumb: only put things here that are true and can be verified.
// Any list left empty hides its section automatically.
// ---------------------------------------------------------------------------

export type Person = { name: string; role: string; affiliation?: string; orcid?: string; photo?: string };

export const SITE = {
  name: "Tango Research Institute of Economics, Finance, Management and Law",
  short: "TRIEFML",
  brand: "Tango",
  tagline: "Peer-reviewed research and independent project evaluation in economics, finance, management and law.",
  url: "https://triefml.org",

  address: {
    lines: ["Bolshaya Dmitrovka, 12", "Moscow, 103009, Russian Federation"],
    city: "Moscow",
  },

  email: {
    general: "inquiries@triefml.org",
    editorial: "editorial@triefml.org",
    reviews: "reviews@triefml.org",
  },

  // Publishing identifiers. Leave empty until officially assigned:
  //   ISSN from the national ISSN centre, DOI prefix from Crossref.
  publishing: {
    seriesName: "TRIEFML Working Paper Series",
    journalName: "",
    issnOnline: "",
    issnPrint: "",
    doiPrefix: "",
    license: "CC BY-NC-ND 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    processingCharges: "No article processing charges",
    reviewModel: "Double-blind peer review",
    firstDecisionWeeks: "6–8 weeks",
  },

  // Editorial board and advisory council. Add real members only, with their
  // consent. Each section appears on the site once it has at least one person.
  editorialBoard: [] as Person[],
  advisoryCouncil: [] as Person[],

  // Institutions with a signed agreement. Shown in the footer and About page
  // only when filled in.
  partners: [] as { name: string; url?: string }[],

  // Indexing services the series is actually listed in (e.g. "Google Scholar",
  // "RePEc", "SSRN"). Leave empty until listing is confirmed.
  indexedIn: [] as string[],

  // Project review fees. Empty string shows "Quoted after screening".
  reviewFees: { basic: "", standard: "", comprehensive: "", institutional: "" },
};

export const CATEGORIES = [
  "Macroeconomics",
  "Development Economics",
  "Finance & Banking",
  "Public Finance & Debt",
  "Trade & Integration",
  "Agricultural Economics",
  "Law & Regulation",
  "Management & Governance",
] as const;

export const PUBLICATION_TYPES = ["Working Paper", "Journal Article", "Policy Brief", "Report", "Book"] as const;
export const LIBRARY_TYPES = ["Report", "Book"]; // shown on the Publications page

export const DIVISIONS = [
  {
    code: "BCM",
    name: "Banking & Capital Markets Institute",
    focus: "Commercial banking stability, capital adequacy and liquidity stress testing.",
    body: "Studies systemic risk, debt coverage and deposit behaviour under interest-rate shocks, and develops guidance on bank capitalisation for regional regulators.",
  },
  {
    code: "SDM",
    name: "Sovereign Debt & Macro-Fiscal Center",
    focus: "Debt sustainability, fiscal space and treasury rules.",
    body: "Evaluates infrastructure bond issuance, debt-to-GDP thresholds and reserve management, and models fiscal rules for emerging economies.",
  },
  {
    code: "LAW",
    name: "Jurisprudence, Codification & Public Law Institute",
    focus: "Treaty analysis, competition law and cross-border trade harmonisation.",
    body: "Examines international economic agreements and regulatory alignment, with a focus on reducing cross-border contract friction and double taxation.",
  },
  {
    code: "MGT",
    name: "Strategic Management & Corporate Governance Board",
    focus: "Enterprise risk, board accountability and institutional design.",
    body: "Develops governance and audit frameworks for state enterprises and public funds, and researches supply-chain resilience.",
  },
  {
    code: "PEF",
    name: "Project Evaluation & Economic Feasibility Council",
    focus: "Independent project examination, cost-benefit analysis and corridor modelling.",
    body: "Conducts empirical examinations of proposed public works and industrial initiatives, testing whether capital commitments match realistic productivity outcomes.",
  },
];
