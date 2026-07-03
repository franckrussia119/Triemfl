export interface Publication {
  id: string;
  title: string;
  author: string;
  type: "Book" | "Report" | "Journal" | "Working Paper" | "Policy Brief";
  year: number;
  pages: number;
  color: string;
  price: string;
  downloadCount: number;
  description: string;
}

export const publications: Publication[] = [
  {
    id: "pub-1",
    title: "Economic Governance in Africa 2024",
    author: "TriefML Editorial Board",
    type: "Report",
    year: 2024,
    pages: 312,
    color: "#0a2463", // navy
    price: "Free / Open Access",
    downloadCount: 4520,
    description: "Our comprehensive flagship annual report mapping macroeconomic trends, debt profiles, and public sector governance indices across fifty-four African nations."
  },
  {
    id: "pub-2",
    title: "Digital Economy Policy Framework",
    author: "TriefML Technology Initiative",
    type: "Book",
    year: 2023,
    pages: 245,
    color: "#1e6f5c", // forest green
    price: "$45.00",
    downloadCount: 1250,
    description: "A detailed guide and policy blueprint for central banks and ministries of communication to establish inclusive, high-security digital payments and identity infrastructure."
  },
  {
    id: "pub-3",
    title: "Sustainable Development Finance",
    author: "Dr. Emmanuel Osei & Prof. Amara Diallo",
    type: "Book",
    year: 2024,
    pages: 280,
    color: "#c8960c", // academic gold
    price: "$55.00",
    downloadCount: 1840,
    description: "An academic monograph exploring the integration of green bonds, social impact investments, and multi-lateral project guarantees to close the infrastructure gap."
  },
  {
    id: "pub-4",
    title: "Trade Integration and Regional Development",
    author: "Prof. Marie-Claire Nzinga",
    type: "Working Paper",
    year: 2024,
    pages: 88,
    color: "#8b1a1a", // dark red
    price: "Free / Open Access",
    downloadCount: 3100,
    description: "A targeted analysis focusing on the elimination of non-tariff corridors and the coordination of transport logistics in sub-regional trading blocks."
  },
  {
    id: "pub-5",
    title: "African Economic Review: Special Edition Q2 2025",
    author: "TriefML Peer Panel",
    type: "Journal",
    year: 2025,
    pages: 420,
    color: "#4a148c", // purple
    price: "Subscription",
    downloadCount: 920,
    description: "The primary quarterly scientific publication containing twelve peer-reviewed research papers and empirical analyses focusing on post-crisis recovery."
  },
  {
    id: "pub-6",
    title: "Monetary Policy in Times of Global Shocks",
    author: "Dr. Kofi Mensah & Dr. Ibrahim Al-Rashid",
    type: "Book",
    year: 2024,
    pages: 310,
    color: "#ad1457", // pink
    price: "$60.00",
    downloadCount: 1540,
    description: "A rigorous textbook exploring countercyclical banking interest models and liquidity management systems in commodities-dependent economies."
  },
  {
    id: "pub-7",
    title: "Carbon Markets and Green Dividends in Emerging Economies",
    author: "TriefML Environmental Unit",
    type: "Policy Brief",
    year: 2024,
    pages: 45,
    color: "#2e7d32", // green
    price: "Free / Open Access",
    downloadCount: 2240,
    description: "A brief designed for policymakers detailing tax regimes, emission caps, and clean technology reinvestment strategies."
  },
  {
    id: "pub-8",
    title: "Public Debt Restructuring: Principles and Guidelines",
    author: "Dr. Bertrand Mvogo",
    type: "Policy Brief",
    year: 2023,
    pages: 64,
    color: "#e65100", // orange
    price: "Free / Open Access",
    downloadCount: 2890,
    description: "This structural policy brief presents five gold standards for bilateral and commercial sovereign debt workouts under systemic financial crises."
  },
  {
    id: "pub-9",
    title: "Vocational Education and Labor Markets in North Africa",
    author: "Dr. Ibrahim Al-Rashid",
    type: "Report",
    year: 2024,
    pages: 185,
    color: "#0277bd", // blue
    price: "Free / Open Access",
    downloadCount: 1120,
    description: "A joint report with regional employment organizations analyzing training mismatches and apprentice-based policy solutions."
  },
  {
    id: "pub-10",
    title: "Agricultural Price Stabilization Programs: A Case Study",
    author: "Dr. Fatou Sow",
    type: "Working Paper",
    year: 2023,
    pages: 72,
    color: "#5d4037", // brown
    price: "Free / Open Access",
    downloadCount: 1750,
    description: "An empirical investigation tracking government-subsidized grain reserves and price guarantee mechanisms across West Africa."
  }
];
