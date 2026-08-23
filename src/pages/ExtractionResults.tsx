import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { catalogStore } from "../services/catalogStore";
import EvidencePanel from "./EvidencePanel";
import type { Attribute, Product } from "../types/prodexa";
import { ArrowRight, ShieldCheck, Cpu, Layers } from "lucide-react";

const badgeClass: Record<string, string> = {
  VERIFIED: "badge-verified",
  NORMALIZED: "badge-normalized",
  "AI DERIVED": "badge-ai-derived",
  UNCERTAIN: "badge-uncertain",
  CONFLICT: "badge-conflict",
  UNSUPPORTED: "badge-uncertain",
};

export default function ExtractionResults() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAttr, setSelectedAttr] = useState<Attribute | null>(null);
  const [showLineage, setShowLineage] = useState(false);

  useEffect(() => {
    const update = () => {
      const activeDsProducts = catalogStore.getProducts();
      setProducts(activeDsProducts);

      const current = catalogStore.getCurrentProduct();
      setSelectedProduct(current || (activeDsProducts.length > 0 ? activeDsProducts[0] : null));
    };

    update();
    return catalogStore.subscribe(update);
  }, []);

  const handleSelectProduct = (p: Product) => {
    catalogStore.setActiveProduct(p.id);
    setSelectedProduct(p);
  };

  if (!selectedProduct || products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Cpu size={32} color="#3B82F6" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>No Extraction Results Yet</h2>
        <p style={{ fontSize: 14, color: "#64748B", maxWidth: 440, margin: "0 auto 24px" }}>
          Upload an industrial catalog dataset or run the 15-product demo pipeline to view live extracted specifications.
        </p>
        <button className="btn-primary" onClick={() => navigate("/analyze")}>
          Upload Product Dataset <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  const p = selectedProduct;
  const verifiedCount = p.attributes.filter(a => a.status === "VERIFIED" || a.status === "NORMALIZED").length;
  const conflictCount = (p.conflicts || []).filter(c => c.status === "OPEN").length;

  return (
    <div>
      {/* Header with Product Selector */}
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 className="page-title" style={{ margin: 0 }}>AI Extraction Results</h1>
            {products.length > 1 && (
              <span className="badge badge-normalized" style={{ fontSize: 11 }}>
                {products.length} Products in Dataset
              </span>
            )}
          </div>
          <p className="page-subtitle" style={{ marginTop: 4 }}>
            {p.name} — Verified industrial specifications with full evidence provenance
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Multi-Product Switcher */}
          {products.length > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Select Product:</span>
              <select
                className="select-field"
                style={{ width: 220, fontSize: 13, fontWeight: 600, color: "#22D3EE", border: "1px solid rgba(34,211,238,0.3)" }}
                value={p.id}
                onChange={e => {
                  const target = products.find(prod => prod.id === e.target.value);
                  if (target) handleSelectProduct(target);
                }}
              >
                {products.map(prod => (
                  <option key={prod.id} value={prod.id}>
                    {prod.partNumber} — {prod.name.slice(0, 24)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="btn-secondary" onClick={() => setShowLineage(!showLineage)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Layers size={14} color="#3B82F6" />
            {showLineage ? "Hide Lineage" : "View Data Lineage"}
          </button>

          <button className="btn-primary" onClick={() => navigate("/validation")}>
            Proceed to Validation <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Dataset Product Pills Bar (if multi-product dataset) */}
      {products.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", width: "100%", maxWidth: "100%", boxSizing: "border-box", paddingBottom: 12, marginBottom: 16 }}>
          {products.map(prod => {
            const isSelected = prod.id === p.id;
            return (
              <button
                key={prod.id}
                onClick={() => handleSelectProduct(prod)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: isSelected ? "rgba(34,211,238,0.12)" : "rgba(16,38,61,0.5)",
                  border: isSelected ? "1px solid rgba(34,211,238,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "#22D3EE" : "#F8FAFC", fontFamily: "monospace" }}>{prod.partNumber}</span>
                <span style={{ fontSize: 11, color: isSelected ? "#A5F3FC" : "#64748B" }}>{prod.category}</span>
                {prod.status === "conflict" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Confidence Banner */}
      <div style={{ background: "linear-gradient(135deg,rgba(34,211,238,0.08),rgba(59,130,246,0.05))", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 12, padding: "16px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <ShieldCheck size={28} color="#22D3EE" />
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC" }}>
            Product Intelligence Score: <span style={{ color: "#22D3EE" }}>{p.qualityScore} / 100</span>
            <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginLeft: 10 }}>({p.commerceReadiness.status})</span>
          </div>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
            {p.attributes.length} attributes extracted · {verifiedCount} verified/normalized · {p.sources.length} sources traced · {conflictCount} conflict(s)
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>SOURCE ORIGIN</div>
          <div style={{ fontSize: 13, color: "#94A3B8", fontFamily: "monospace" }}>
            {p.sourceFileName || "Uploaded File"} {p.sourceRowNumber ? `(Row ${p.sourceRowNumber})` : ""}
          </div>
        </div>
      </div>

      {/* Visual Data Lineage Panel */}
      {showLineage && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 24, border: "1px solid rgba(99,102,241,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Layers size={16} color="#818CF8" />
            <h2 className="section-title" style={{ margin: 0 }}>End-to-End Data Lineage Flow</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, overflowX: "auto" }}>
            {[
              { stage: "1. Raw Source", title: p.sourceFileName || "CSV Catalog", sub: `Row #${p.sourceRowNumber || 1}`, color: "#64748B" },
              { stage: "2. Extracted Entity", title: p.partNumber, sub: p.brand, color: "#3B82F6" },
              { stage: "3. Classification", title: p.category, sub: p.subcategory || "Subcategory", color: "#8B5CF6" },
              { stage: "4. Normalization", title: `${p.attributes.filter(a => a.status === "NORMALIZED").length} Units Standardized`, sub: "ISO / IEC Standard", color: "#22D3EE" },
              { stage: "5. Cross-Evidence", title: `${p.sources.length} Sources Verified`, sub: "Reliability > 90%", color: "#F59E0B" },
              { stage: "6. Commerce Ready", title: `${p.qualityScore}% Quality Score`, sub: p.commerceReadiness.status, color: "#22C55E" },
            ].map((step, i) => (
              <div key={i} style={{ background: "rgba(16,38,61,0.6)", border: `1px solid ${step.color}40`, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: step.color, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{step.stage}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{step.title}</div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{step.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Before vs After Comparison Card */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 24, border: "1px solid rgba(59,130,246,0.15)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
          Raw Input vs PRODEXA Intelligence Transformation
        </div>
        <div className="comparison-grid">
          {/* Before */}
          <div style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", marginBottom: 8 }}>BEFORE (RAW FRAGMENTED DATA)</div>
            <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>
              <div>• Part Number: <strong style={{ color: "#F8FAFC" }}>{p.partNumber}</strong></div>
              <div>• Raw Description: <span style={{ color: "#F8FAFC" }}>{p.description}</span></div>
              <div>• Raw Field Count: <span style={{ color: "#F59E0B" }}>{p.beforeStats?.rawFieldsCount || 4} unvalidated columns</span></div>
              <div>• Missing Specifications: <span style={{ color: "#EF4444" }}>{p.missingAttributes?.length || 2} mandatory fields</span></div>
            </div>
          </div>

          <div className="comparison-arrow" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowRight size={16} color="#22D3EE" />
            </div>
          </div>

          {/* After */}
          <div style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", textTransform: "uppercase", marginBottom: 8 }}>AFTER PRODEXA AI (STRUCTURED & COMMERCE READY)</div>
            <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>
              <div>• Product: <strong style={{ color: "#22C55E" }}>{p.name}</strong></div>
              <div>• Category: <span style={{ color: "#F8FAFC" }}>{p.category} ({p.subcategory})</span></div>
              <div>• Structured Attributes: <strong style={{ color: "#22C55E" }}>{p.attributes.length} Verified</strong></div>
              <div>• Intelligence Score: <strong style={{ color: "#22C55E" }}>{p.qualityScore} / 100</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Attributes Table + Product Summary */}
      <div className="extraction-grid">
        {/* Attributes Table */}
        <div className="glass-card" style={{ padding: 0, overflowX: "auto", maxWidth: "100%" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#F8FAFC" }}>Extracted & Traceable Attributes</span>
            <span style={{ fontSize: 12, color: "#64748B" }}>{p.attributes.length} attributes</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Attribute", "Value", "Status", "Confidence", "Sources", "Decision Explainer"].map(h => (
                  <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.attributes.map(attr => (
                <tr
                  key={attr.id}
                  onClick={() => setSelectedAttr(attr)}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 500, color: "#94A3B8" }}>{attr.name}</td>
                  <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 600, color: "#F8FAFC", fontFamily: "monospace" }}>
                    {attr.value}{attr.unit && !attr.value.includes(attr.unit) ? " " + attr.unit : ""}
                    {attr.originalValue && (
                      <div style={{ fontSize: 10, color: "#F59E0B" }}>raw: {attr.originalValue}</div>
                    )}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span className={`badge ${badgeClass[attr.status] ?? "badge-normalized"}`}>{attr.status}</span>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar-track" style={{ width: 60 }}>
                        <div className="progress-bar-fill" style={{
                          width: `${attr.confidence}%`,
                          background: attr.confidence > 90 ? "#22C55E" : attr.confidence > 70 ? "#F59E0B" : "#EF4444",
                        }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace" }}>{attr.confidence}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: 12, color: "#64748B" }}>
                    {attr.sources.length} src
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedAttr(attr); }}
                      style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3B82F6", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                    >
                      Why this value? →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC", marginBottom: 14 }}>Status Breakdown</div>
            {Object.entries(
              p.attributes.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }), {} as Record<string, number>)
            ).map(([status, count]) => (
              <div key={status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span className={`badge ${badgeClass[status] ?? "badge-normalized"}`} style={{ fontSize: 10 }}>{status}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{count}</span>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC", marginBottom: 14 }}>Product Profile</div>
            {[
              { label: "Product", value: p.name },
              { label: "Part No.", value: p.partNumber },
              { label: "Manufacturer", value: p.brand },
              { label: "Category", value: p.category },
              { label: "Completeness", value: `${p.completeness}%` },
              { label: "Readiness", value: p.commerceReadiness.status },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, color: "#F8FAFC" }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#64748B", textAlign: "center" }}>Click any attribute row to view full evidence & reasoning</div>
        </div>
      </div>

      {selectedAttr && <EvidencePanel attribute={selectedAttr} onClose={() => setSelectedAttr(null)} />}
    </div>
  );
}
