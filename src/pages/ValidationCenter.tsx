import { useState, useEffect } from "react";
import { catalogStore } from "../services/catalogStore";
import { resolveConflict } from "../services/api";
import type { Product } from "../types/prodexa";
import { AlertTriangle, AlertCircle, CheckCircle2, Shuffle, Check, Loader2 } from "lucide-react";

type Tab = "all" | "missing" | "conflicts" | "standardized";

export default function ValidationCenter() {
  const [tab, setTab] = useState<Tab>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setProducts(catalogStore.getProducts());
    };
    update();
    return catalogStore.subscribe(update);
  }, []);

  // Compute validation issues from real products
  const missingItems = products.flatMap(p =>
    (p.missingAttributes || []).map((attr, idx) => ({
      id: `miss_${p.id}_${idx}`,
      productId: p.id,
      product: p.name,
      partNumber: p.partNumber,
      attribute: attr,
      severity: attr.toLowerCase().includes("voltage") || attr.toLowerCase().includes("pressure") ? "high" : "medium",
    }))
  );

  const conflicts = products.flatMap(p => p.conflicts || []);

  const standardizedAttributes = products.flatMap(p =>
    p.attributes
      .filter(a => a.status === "NORMALIZED" && a.originalValue && a.originalValue !== a.value)
      .map(a => ({
        id: a.id,
        productId: p.id,
        product: p.name,
        partNumber: p.partNumber,
        attribute: a.name,
        original: a.originalValue || a.rawValue || "",
        normalized: a.value,
        standard: a.rationale?.standardApplied || "ISO/IEC Industrial Standard",
      }))
  );

  const handleResolve = async (conflictId: string, value: string) => {
    setLoading(conflictId);
    await resolveConflict(conflictId, value);
    setLoading(null);
    setResolved(prev => new Set([...prev, conflictId]));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Validation Center</h1>
        <p className="page-subtitle">AI-detected issues and standardizations requiring verification before publication</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card" style={{ borderTop: "2px solid #EF4444" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <AlertCircle size={18} color="#EF4444" />
            <span className="stat-label" style={{ margin: 0 }}>MISSING INFO</span>
          </div>
          <div className="stat-number" style={{ color: "#EF4444" }}>{missingItems.length}</div>
        </div>
        <div className="stat-card" style={{ borderTop: "2px solid #F59E0B" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Shuffle size={18} color="#F59E0B" />
            <span className="stat-label" style={{ margin: 0 }}>CONFLICTS</span>
          </div>
          <div className="stat-number" style={{ color: "#F59E0B" }}>{conflicts.length}</div>
        </div>
        <div className="stat-card" style={{ borderTop: "2px solid #22C55E" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <CheckCircle2 size={18} color="#22C55E" />
            <span className="stat-label" style={{ margin: 0 }}>STANDARDIZED</span>
          </div>
          <div className="stat-number" style={{ color: "#22C55E" }}>{standardizedAttributes.length}</div>
        </div>
      </div>

      <div className="tab-nav">
        {([
          ["all", `All Issues (${missingItems.length + conflicts.length + standardizedAttributes.length})`],
          ["missing", `Missing Info (${missingItems.length})`],
          ["conflicts", `Conflicts (${conflicts.length})`],
          ["standardized", `Standardized (${standardizedAttributes.length})`],
        ] as [Tab, string][]).map(([t, l]) => (
          <button key={t} className={"tab-btn" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {/* Missing Information Section */}
      {(tab === "all" || tab === "missing") && (
        <div style={{ marginBottom: 28 }}>
          <h2 className="section-title"><AlertCircle size={16} color="#EF4444" /> Missing Information Across Ingested Products</h2>
          {missingItems.length === 0 ? (
            <div className="glass-card" style={{ padding: 20, color: "#22C55E", display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} /> All mandatory category attributes are fully populated!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {missingItems.map(item => (
                <div key={item.id} className="glass-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.severity === "high" ? "#EF4444" : "#F59E0B", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", fontFamily: "monospace", marginRight: 8 }}>[{item.partNumber}]</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8" }}>{item.product} — </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>{item.attribute}</span>
                    <span style={{ fontSize: 11, color: "#64748B", marginLeft: 8, textTransform: "capitalize" }}>({item.severity} severity)</span>
                  </div>
                  <span className={"badge " + (item.severity === "high" ? "badge-conflict" : "badge-uncertain")}>{item.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conflicts Section */}
      {(tab === "all" || tab === "conflicts") && (
        <div style={{ marginBottom: 28 }}>
          <h2 className="section-title"><AlertTriangle size={16} color="#F59E0B" /> Cross-Source Discrepancies & Conflicts</h2>
          {conflicts.length === 0 ? (
            <div className="glass-card" style={{ padding: 20, color: "#22C55E", display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} /> No cross-source discrepancies detected in current dataset.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {conflicts.map(conflict => {
                const isResolved = resolved.has(conflict.id) || conflict.status === "RESOLVED";
                return (
                  <div key={conflict.id} className="glass-card" style={{ padding: 20, border: isResolved ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.25)", opacity: isResolved ? 0.8 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>
                          [{conflict.partNumber}] {conflict.productName}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>
                          Conflicting Attribute: <strong style={{ color: "#94A3B8" }}>{conflict.attributeName}</strong>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {isResolved ? (
                          <span className="badge badge-verified"><Check size={10} /> Resolved: {conflict.resolvedValue || conflict.valueA}</span>
                        ) : (
                          <span className="badge badge-conflict">Human Action Required</span>
                        )}
                        <span style={{ fontSize: 12, color: conflict.confidence < 70 ? "#EF4444" : "#F59E0B" }}>Confidence: {conflict.confidence}%</span>
                      </div>
                    </div>
                    {!isResolved && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
                        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "14px 16px" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", marginBottom: 6 }}>Source A: {conflict.sourceA.source} ({conflict.sourceA.reliability}%)</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", fontFamily: "monospace", marginBottom: 10 }}>{conflict.sourceA.value}</div>
                          <button className="btn-success" style={{ width: "100%", justifyContent: "center" }} disabled={loading === conflict.id}
                            onClick={() => handleResolve(conflict.id, conflict.sourceA.value)}>
                            {loading === conflict.id ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Check size={13} />} Accept Source A
                          </button>
                        </div>
                        <div style={{ textAlign: "center", fontSize: 11, color: "#64748B", fontWeight: 700 }}>VS</div>
                        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "14px 16px" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", marginBottom: 6 }}>Source B: {conflict.sourceB.source} ({conflict.sourceB.reliability}%)</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", fontFamily: "monospace", marginBottom: 10 }}>{conflict.sourceB.value}</div>
                          <button className="btn-success" style={{ width: "100%", justifyContent: "center" }} disabled={loading === conflict.id}
                            onClick={() => handleResolve(conflict.id, conflict.sourceB.value)}>
                            {loading === conflict.id ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Check size={13} />} Accept Source B
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Applied Standardization Section */}
      {(tab === "all" || tab === "standardized") && (
        <div>
          <h2 className="section-title"><CheckCircle2 size={16} color="#22C55E" /> Applied Normalizations & Standards</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {standardizedAttributes.map(item => (
              <div key={item.id} className="glass-card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <CheckCircle2 size={15} color="#22C55E" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#F8FAFC", fontFamily: "monospace" }}>[{item.partNumber}]</span>
                <span style={{ fontSize: 12, color: "#64748B" }}>{item.attribute}:</span>
                <span style={{ fontSize: 13, color: "#F59E0B", fontFamily: "monospace" }}>{item.original}</span>
                <span style={{ fontSize: 12, color: "#64748B" }}>{"→"}</span>
                <span style={{ fontSize: 13, color: "#22C55E", fontFamily: "monospace", fontWeight: 600 }}>{item.normalized}</span>
                <span className="badge badge-normalized" style={{ marginLeft: "auto", fontSize: 10 }}>{item.standard}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
