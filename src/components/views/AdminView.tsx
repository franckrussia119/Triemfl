import React, { useState } from "react";
import {
  Lock, LogOut, FileText, BookOpen, Newspaper,
  Plus, Edit2, Trash2, Eye, Check, X, Upload,
  BarChart2, Users, Download, Star, ChevronDown
} from "lucide-react";

// ── Simple hardcoded credentials (change these!) ──────────────────────────
const ADMIN_USER = "triefml";
const ADMIN_PASS = "TriefML@2025!";

// ── Types ─────────────────────────────────────────────────────────────────
interface Article {
  id: string;
  type: "article" | "book" | "blog";
  title: string;
  author: string;
  institution: string;
  category: string;
  abstract: string;
  tags: string;
  status: "draft" | "published" | "review";
  date: string;
}

const CATEGORIES = [
  "Macroeconomics", "Development Economics", "Finance", "Trade",
  "Agricultural Economics", "Public Policy", "Environmental Economics",
  "Labor Economics", "Monetary Policy", "Fiscal Policy"
];

const SAMPLE_ARTICLES: Article[] = [
  { id: "a1", type: "article", title: "Monetary Policy Transmission in Sub-Saharan Africa", author: "Dr. Kofi Mensah", institution: "University of Ghana", category: "Macroeconomics", abstract: "This paper examines monetary policy transmission mechanisms across Sub-Saharan Africa using panel data from 2020-2024.", tags: "monetary policy, Africa, panel data", status: "published", date: "2025-03-15" },
  { id: "a2", type: "book", title: "Economic Governance in Africa 2024", author: "TriefML Editorial Board", institution: "TriefML Institute", category: "Public Policy", abstract: "Annual comprehensive review of economic governance frameworks across African nations.", tags: "governance, Africa, policy", status: "published", date: "2025-01-10" },
  { id: "a3", type: "blog", title: "Digital Financial Inclusion: Opportunities and Challenges", author: "Prof. Amara Diallo", institution: "Sciences Po Paris", category: "Finance", abstract: "An analysis of digital finance adoption in emerging markets with focus on mobile banking penetration.", tags: "fintech, inclusion, emerging markets", status: "review", date: "2025-06-20" },
  { id: "a4", type: "article", title: "Infrastructure Investment and GDP Growth in ECOWAS", author: "Dr. Emmanuel Osei", institution: "AfDB Research Division", category: "Development Economics", abstract: "Empirical evidence on the relationship between infrastructure spending and GDP growth rates in West Africa.", tags: "infrastructure, GDP, ECOWAS", status: "draft", date: "2025-07-01" },
];

// ── Login Screen ──────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        onLogin();
      } else {
        setError("Invalid credentials. Please try again.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a2463 0%, #1e3a8a 50%, #0a2463 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "3rem", width: "100%", maxWidth: "420px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 64, height: 64, background: "#0a2463", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <Lock size={28} color="#c8960c" />
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "#0a2463", marginBottom: "0.25rem" }}>Admin Portal</h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem" }}>TriefML Institute — Restricted Access</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#0a2463", marginBottom: "0.4rem" }}>Username</label>
            <input type="text" value={user} onChange={e => setUser(e.target.value)} required placeholder="Enter username"
              style={{ width: "100%", padding: "0.875rem 1rem", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", outline: "none", fontFamily: "Inter, sans-serif" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#0a2463", marginBottom: "0.4rem" }}>Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} required placeholder="Enter password"
              style={{ width: "100%", padding: "0.875rem 1rem", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", outline: "none", fontFamily: "Inter, sans-serif" }} />
          </div>
          {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", background: "#fef2f2", padding: "0.75rem", borderRadius: "6px", border: "1px solid #fecaca" }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ background: "#0a2463", color: "#c8960c", padding: "0.875rem", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.05em", marginTop: "0.5rem" }}>
            {loading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.78rem", marginTop: "1.5rem" }}>
          TriefML Institute Admin Portal v2.0
        </p>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e8f0fe" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: 48, height: 48, background: color + "15", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
        <div>
          <p style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0a2463", fontFamily: "Georgia, serif", lineHeight: 1 }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

// ── Article Form Modal ────────────────────────────────────────────────────
function ArticleFormModal({ article, onSave, onClose }: {
  article: Partial<Article> | null;
  onSave: (a: Article) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Article>>(article || { type: "article", status: "draft", date: new Date().toISOString().split("T")[0] });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newArticle: Article = {
      id: form.id || `a${Date.now()}`,
      type: form.type || "article",
      title: form.title || "",
      author: form.author || "",
      institution: form.institution || "",
      category: form.category || CATEGORIES[0],
      abstract: form.abstract || "",
      tags: form.tags || "",
      status: form.status || "draft",
      date: form.date || new Date().toISOString().split("T")[0],
    };
    onSave(newArticle);
    setSaved(true);
    setTimeout(onClose, 1000);
  };

  const inputStyle = { width: "100%", padding: "0.75rem 1rem", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.9rem", fontFamily: "Inter, sans-serif", outline: "none" };
  const labelStyle = { display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#0a2463", marginBottom: "0.35rem" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "16px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", color: "#0a2463", fontWeight: 700 }}>
            {form.id ? "Edit Publication" : "New Publication"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSave} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Type + Status row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} style={inputStyle}>
                <option value="article">Research Article</option>
                <option value="book">Book / Report</option>
                <option value="blog">Blog Post</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} style={inputStyle}>
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Title *</label>
            <input required value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Full title of the publication" style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Author(s) *</label>
              <input required value={form.author || ""} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Dr. Name Surname" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Institution *</label>
              <input required value={form.institution || ""} onChange={e => setForm({ ...form, institution: e.target.value })} placeholder="University or Organization" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select required value={form.category || ""} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Publication Date</label>
              <input type="date" value={form.date || ""} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Abstract *</label>
            <textarea required rows={5} value={form.abstract || ""} onChange={e => setForm({ ...form, abstract: e.target.value })} placeholder="Write the abstract or summary (minimum 100 words recommended)..." style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>Tags / Keywords</label>
            <input value={form.tags || ""} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="e.g. monetary policy, Africa, panel data" style={inputStyle} />
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.3rem" }}>Separate keywords with commas</p>
          </div>

          <div style={{ display: "flex", gap: "1rem", paddingTop: "0.5rem", borderTop: "1px solid #f0f0f0" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.875rem", background: "#f4f7fa", color: "#64748b", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button type="submit" style={{ flex: 2, padding: "0.875rem", background: saved ? "#1e6f5c" : "#0a2463", color: saved ? "white" : "#c8960c", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              {saved ? <><Check size={16} /> Saved!</> : "Save Publication"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────
export default function AdminView() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "articles" | "books" | "blogs">("dashboard");
  const [articles, setArticles] = useState<Article[]>(SAMPLE_ARTICLES);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  // Stats
  const published = articles.filter(a => a.status === "published").length;
  const inReview = articles.filter(a => a.status === "review").length;
  const drafts = articles.filter(a => a.status === "draft").length;

  // Filtered list
  const filtered = articles.filter(a => {
    const matchType = filterType === "all" || a.type === filterType;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchSearch = !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const handleSave = (a: Article) => {
    setArticles(prev => prev.find(p => p.id === a.id) ? prev.map(p => p.id === a.id ? a : p) : [...prev, a]);
    setShowForm(false);
    setEditingArticle(null);
  };

  const handleDelete = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  const statusColor: Record<string, string> = { published: "#1e6f5c", review: "#c8960c", draft: "#64748b" };
  const typeIcon: Record<string, React.ReactNode> = { article: <FileText size={14} />, book: <BookOpen size={14} />, blog: <Newspaper size={14} /> };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", paddingTop: "80px" }}>
      {/* Admin Header */}
      <div style={{ background: "#0a2463", padding: "1rem 5%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 36, height: 36, background: "#c8960c", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={16} color="white" />
          </div>
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: "1rem", fontFamily: "Georgia, serif" }}>TriefML Admin Portal</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Content Management System</p>
          </div>
        </div>
        <button onClick={() => setIsLoggedIn(false)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 5%" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", background: "white", padding: "0.4rem", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", width: "fit-content" }}>
          {(["dashboard", "articles", "books", "blogs"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "0.6rem 1.25rem", borderRadius: "7px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", textTransform: "capitalize", background: activeTab === tab ? "#0a2463" : "transparent", color: activeTab === tab ? "#c8960c" : "#64748b", transition: "all 0.2s" }}>
              {tab === "dashboard" ? "Dashboard" : tab === "articles" ? "Articles" : tab === "books" ? "Books" : "Blog Posts"}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", color: "#0a2463", marginBottom: "1.5rem" }}>Overview Dashboard</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
              <StatCard icon={<FileText size={22} />} label="Total Publications" value={String(articles.length)} color="#0a2463" />
              <StatCard icon={<Check size={22} />} label="Published" value={String(published)} color="#1e6f5c" />
              <StatCard icon={<Eye size={22} />} label="Under Review" value={String(inReview)} color="#c8960c" />
              <StatCard icon={<Edit2 size={22} />} label="Drafts" value={String(drafts)} color="#64748b" />
            </div>

            {/* Quick add buttons */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "Georgia, serif", color: "#0a2463", fontSize: "1rem", marginBottom: "1rem" }}>Quick Actions</h3>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {[
                  { label: "New Research Article", type: "article", color: "#0a2463" },
                  { label: "New Book / Report", type: "book", color: "#1e6f5c" },
                  { label: "New Blog Post", type: "blog", color: "#c8960c" },
                ].map(btn => (
                  <button key={btn.type} onClick={() => { setEditingArticle({ type: btn.type as any, status: "draft" }); setShowForm(true); }}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: btn.color, color: "white", padding: "0.75rem 1.5rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                    <Plus size={16} /> {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent publications table */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontFamily: "Georgia, serif", color: "#0a2463", fontSize: "1rem", marginBottom: "1rem" }}>Recent Publications</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f7fa" }}>
                    {["Type", "Title", "Author", "Category", "Status", "Date", "Actions"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {articles.slice(0, 5).map((a, i) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "white" : "#fafbfc" }}>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b", fontSize: "0.82rem", fontWeight: 600 }}>{typeIcon[a.type]} {a.type}</span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", maxWidth: "280px" }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0a2463", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.82rem", color: "#64748b", whiteSpace: "nowrap" }}>{a.author}</td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ background: "#e8f0fe", color: "#0a2463", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600 }}>{a.category}</span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ background: statusColor[a.status] + "20", color: statusColor[a.status], padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>{a.status}</span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.82rem", color: "#64748b", whiteSpace: "nowrap" }}>{a.date}</td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => { setEditingArticle(a); setShowForm(true); }} style={{ background: "#e8f0fe", color: "#0a2463", border: "none", borderRadius: "6px", padding: "0.35rem 0.6rem", cursor: "pointer" }}><Edit2 size={13} /></button>
                          <button onClick={() => setDeleteConfirm(a.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "6px", padding: "0.35rem 0.6rem", cursor: "pointer" }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENT TABS (articles / books / blogs) */}
        {activeTab !== "dashboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", color: "#0a2463", textTransform: "capitalize" }}>
                Manage {activeTab === "articles" ? "Research Articles" : activeTab === "books" ? "Books and Reports" : "Blog Posts"}
              </h2>
              <button onClick={() => { setEditingArticle({ type: activeTab === "articles" ? "article" : activeTab === "books" ? "book" : "blog", status: "draft" }); setShowForm(true); }}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#0a2463", color: "#c8960c", padding: "0.75rem 1.5rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                <Plus size={16} /> Add New
              </button>
            </div>

            {/* Filters */}
            <div style={{ background: "white", borderRadius: "10px", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by title or author..." style={{ flex: 1, minWidth: "200px", padding: "0.625rem 1rem", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.88rem", outline: "none" }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "0.625rem 1rem", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.88rem", outline: "none", background: "white" }}>
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="review">Under Review</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Table */}
            <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0a2463" }}>
                    {["Title", "Author", "Institution", "Category", "Status", "Date", "Actions"].map(h => (
                      <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.filter(a => {
                    if (activeTab === "articles") return a.type === "article";
                    if (activeTab === "books") return a.type === "book";
                    if (activeTab === "blogs") return a.type === "blog";
                    return true;
                  }).map((a, i) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "white" : "#fafbfc" }}>
                      <td style={{ padding: "1rem", maxWidth: "300px" }}>
                        <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0a2463", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                        <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.tags}</p>
                      </td>
                      <td style={{ padding: "1rem", fontSize: "0.85rem", color: "#1a1a2e", whiteSpace: "nowrap" }}>{a.author}</td>
                      <td style={{ padding: "1rem", fontSize: "0.82rem", color: "#64748b", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.institution}</td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ background: "#e8f0fe", color: "#0a2463", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap" }}>{a.category}</span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ background: statusColor[a.status] + "20", color: statusColor[a.status], padding: "0.25rem 0.7rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize", whiteSpace: "nowrap" }}>{a.status}</span>
                      </td>
                      <td style={{ padding: "1rem", fontSize: "0.82rem", color: "#64748b", whiteSpace: "nowrap" }}>{a.date}</td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => { setEditingArticle(a); setShowForm(true); }} title="Edit" style={{ background: "#e8f0fe", color: "#0a2463", border: "none", borderRadius: "6px", padding: "0.4rem 0.65rem", cursor: "pointer" }}><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteConfirm(a.id)} title="Delete" style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "6px", padding: "0.4rem 0.65rem", cursor: "pointer" }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                  <FileText size={40} style={{ margin: "0 auto 1rem", display: "block", opacity: 0.3 }} />
                  <p style={{ fontWeight: 600 }}>No publications found</p>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>Try adjusting your filters or add a new publication</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ArticleFormModal
          article={editingArticle}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingArticle(null); }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "2rem", maxWidth: "380px", width: "90%", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontFamily: "Georgia, serif", color: "#0a2463", marginBottom: "0.5rem" }}>Delete Publication</h3>
            <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: "1.5rem" }}>Are you sure you want to delete this publication? This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "0.75rem", background: "#f4f7fa", color: "#64748b", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "0.75rem", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
