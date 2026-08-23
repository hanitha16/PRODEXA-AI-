import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { catalogStore } from "../services/catalogStore";
import type { Product } from "../types/prodexa";
import { Search, Eye, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const bClass: Record<string, string> = {
  ready: "badge-ready",
  review: "badge-review",
  conflict: "badge-conflict",
  processing: "badge-normalized",
};

export default function ProductCatalog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState(() => searchParams.get("q") || searchParams.get("search") || "");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    const update = () => {
      setProducts(catalogStore.getProducts());
    };
    update();
    return catalogStore.subscribe(update);
  }, []);

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.partNumber.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.attributes.some(a => a.value.toLowerCase().includes(q));

    const matchesCat = category === "all" || p.category === category;
    const matchesStatus = status === "all" || p.status === status;

    return matchesSearch && matchesCat && matchesStatus;
  });


  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">{products.length} total products in active dataset — {filtered.length} matching filters</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/analyze")}>
          <Plus size={15} /> Ingest Product Dataset
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
          <input
            className="input-field"
            style={{ paddingLeft: 34 }}
            placeholder="Search by part number (e.g. PS-100, MTR-750), name, brand..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="select-field" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} style={{ width: 180 }}>
          {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
        </select>
        <select className="select-field" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ width: 160 }}>
          <option value="all">All Statuses</option>
          <option value="ready">Ready (Commerce)</option>
          <option value="review">Needs Review</option>
          <option value="conflict">Has Conflict</option>
        </select>
      </div>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <span style={{ color: "#64748B", fontSize: 14 }}>No products matching "{search}".</span>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Product & Part Number", "Category", "Quality Score", "Status", "Commerce Readiness", "Last Updated", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr
                  key={p.id}
                  onClick={() => {
                    catalogStore.setActiveProduct(p.id);
                    navigate("/catalog/" + p.id);
                  }}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#22D3EE", fontFamily: "monospace", marginTop: 2 }}>
                      {p.partNumber} · <span style={{ color: "#64748B" }}>{p.brand}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#94A3B8" }}>{p.category}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar-track" style={{ width: 56, height: 5 }}>
                        <div className="progress-bar-fill" style={{ width: `${p.qualityScore}%`, background: p.qualityScore > 85 ? "#22C55E" : p.qualityScore > 70 ? "#3B82F6" : "#F59E0B" }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: p.qualityScore > 85 ? "#22C55E" : p.qualityScore > 70 ? "#3B82F6" : "#F59E0B" }}>{p.qualityScore}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span className={"badge " + (bClass[p.status] || "badge-normalized")}>{p.status.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span className={`badge ${p.commerceReadiness.status === "COMMERCE READY" ? "badge-verified" : "badge-uncertain"}`} style={{ fontSize: 10 }}>
                      {p.commerceReadiness.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 12, color: "#64748B" }}>
                    {new Date(p.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        catalogStore.setActiveProduct(p.id);
                        navigate("/catalog/" + p.id);
                      }}
                      style={{ padding: "5px 10px", borderRadius: 6, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#3B82F6" }}
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#64748B" }}>Showing {paginated.length} of {filtered.length} products</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "5px 10px", borderRadius: 6, background: "rgba(16,38,61,0.5)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", color: "#94A3B8", display: "flex" }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} style={{ width: 30, height: 30, borderRadius: 6, background: page === n ? "rgba(59,130,246,0.2)" : "rgba(16,38,61,0.5)", border: page === n ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer", fontSize: 13, fontWeight: 600, color: page === n ? "#3B82F6" : "#94A3B8" }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "5px 10px", borderRadius: 6, background: "rgba(16,38,61,0.5)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", color: "#94A3B8", display: "flex" }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
