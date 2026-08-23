import { useState, useEffect } from "react";
import { catalogStore } from "../services/catalogStore";
import { resolveConflict, handleDuplicateGroup, recoverMissingAttribute } from "../services/api";
import type { Product, DuplicateGroup } from "../types/prodexa";
import { Check, AlertTriangle, Filter, Loader2, GitMerge, Copy, Trash2, Sparkles } from "lucide-react";

type Tab = "all" | "review" | "conflicts" | "missing" | "duplicates";

export default function ReviewCenter() {
  const [tab, setTab] = useState<Tab>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setProducts(catalogStore.getProducts());
      setDuplicateGroups(catalogStore.getDuplicateGroups());
    };
    update();
    return catalogStore.subscribe(update);
  }, []);

  const needsReviewProducts = products.filter(p => p.status === "review" || p.status === "conflict");
  const conflictsCount = products.reduce((acc, p) => acc + (p.conflicts?.filter(c => c.status === "OPEN").length || 0), 0);
  const missingCount = products.reduce((acc, p) => acc + (p.missingAttributes?.length || 0), 0);
  const flaggedDups = duplicateGroups.filter(g => g.status === "flagged");

  const handleResolveConflict = async (conflictId: string, value: string) => {
    setLoading(conflictId);
    await resolveConflict(conflictId, value);
    setLoading(null);
  };

  const handleDupAction = async (dupId: string, action: "merge" | "keep" | "dismiss") => {
    setLoading(dupId);
    await handleDuplicateGroup(dupId, action);
    setLoading(null);
  };

  const handleFillMissing = async (productId: string, attributeName: string) => {
    setLoading(`${productId}_${attributeName}`);
    await recoverMissingAttribute(productId, attributeName);
    setLoading(null);
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Review Center</h1>
          <p className="page-subtitle">Human-in-the-loop validation queue — {needsReviewProducts.length} product(s) flagged for attention</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}><Filter size={14} /> Filter Queue</button>
          <button className="btn-primary" onClick={() => {
            // Auto approve high-confidence ready items
            needsReviewProducts.forEach(p => {
              if (p.conflicts.length === 0) {
                p.status = "ready";
              }
            });
          }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={14} /> Approve All Safe
          </button>
        </div>
      </div>

      <div className="tab-nav">
        {([
          ["all", `All Items (${needsReviewProducts.length + flaggedDups.length})`],
          ["review", `Needs Review (${needsReviewProducts.length})`],
          ["conflicts", `Conflicts (${conflictsCount})`],
          ["missing", `Missing Data (${missingCount})`],
          ["duplicates", `Duplicate Groups (${flaggedDups.length})`],
        ] as [Tab, string][]).map(([t, l]) => (
          <button key={t} className={"tab-btn" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Conflict / Review Products */}
        {(tab === "all" || tab === "review" || tab === "conflicts") && needsReviewProducts.map(product => (
          <div key={product.id} className="glass-card" style={{ padding: 20, border: product.status === "conflict" ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(245,158,11,0.15)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>{product.name}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  Part: <code style={{ color: "#94A3B8" }}>{product.partNumber}</code>
                  {" · "}
                  Category: <span>{product.category}</span>
                  {" · "}
                  Quality: <strong style={{ color: product.qualityScore > 85 ? "#22C55E" : product.qualityScore > 70 ? "#F59E0B" : "#EF4444" }}>{product.qualityScore}%</strong>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className={"badge " + (product.status === "conflict" ? "badge-conflict" : "badge-review")}>
                  {product.status === "conflict" ? "Conflict" : "Needs Review"}
                </span>
                <span style={{ fontSize: 12, color: "#64748B" }}>{product.completeness}% complete</span>
              </div>
            </div>

            {/* Conflicts on this product */}
            {product.conflicts.map(conf => (
              <div key={conf.id} style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <AlertTriangle size={14} color="#EF4444" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>{conf.attributeName}</span>
                  <span className="badge badge-conflict" style={{ fontSize: 10 }}>CONFLICT</span>
                  <span style={{ fontSize: 12, color: "#64748B", marginLeft: "auto" }}>Confidence: {conf.confidence}%</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button
                    onClick={() => handleResolveConflict(conf.id, conf.valueA)}
                    disabled={conf.status === "RESOLVED" || loading === conf.id}
                    style={{ background: "rgba(16,38,61,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 10, textAlign: "left", cursor: "pointer", color: "#F8FAFC" }}
                  >
                    <div style={{ fontSize: 10, color: "#64748B" }}>Source A ({conf.sourceA.source})</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#22C55E", fontFamily: "monospace", marginTop: 2 }}>{conf.valueA}</div>
                  </button>
                  <button
                    onClick={() => handleResolveConflict(conf.id, conf.valueB)}
                    disabled={conf.status === "RESOLVED" || loading === conf.id}
                    style={{ background: "rgba(16,38,61,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 10, textAlign: "left", cursor: "pointer", color: "#F8FAFC" }}
                  >
                    <div style={{ fontSize: 10, color: "#64748B" }}>Source B ({conf.sourceB.source})</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B", fontFamily: "monospace", marginTop: 2 }}>{conf.valueB}</div>
                  </button>
                </div>
              </div>
            ))}

            {/* Missing attributes on this product */}
            {product.missingAttributes && product.missingAttributes.length > 0 && (
              <div style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", marginBottom: 8 }}>Missing Mandatory Specifications:</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.missingAttributes.map(attr => (
                    <button
                      key={attr}
                      onClick={() => handleFillMissing(product.id, attr)}
                      disabled={loading === `${product.id}_${attr}`}
                      style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#F59E0B", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {loading === `${product.id}_${attr}` ? <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : <Sparkles size={12} />}
                      Recover {attr}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Duplicate Groups Section */}
        {(tab === "all" || tab === "duplicates") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 10 }}>
              <Copy size={16} color="#A78BFA" />
              <span style={{ fontSize: 13, color: "#94A3B8" }}>
                PRODEXA AI detected <strong style={{ color: "#A78BFA" }}>{duplicateGroups.length} possible duplicate group(s)</strong> based on normalized part number heuristics (e.g. PS-100 variants).
              </span>
            </div>
            {duplicateGroups.map(group => (
              <div key={group.id} className="glass-card" style={{ padding: 20, border: group.status === "merged" ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(167,139,250,0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Copy size={14} color="#A78BFA" />
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>Duplicate Group: {group.products[0]?.partNumber}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#A78BFA", background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", padding: "2px 8px", borderRadius: 12 }}>
                        {group.similarity}% similarity
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>{group.reason}</p>
                  </div>
                  {group.status && group.status !== "flagged" && (
                    <span className="badge badge-verified">
                      {group.status === "merged" ? "Merged" : group.status === "kept" ? "Kept Separate" : "Dismissed"}
                    </span>
                  )}
                </div>

                {/* Variants Cards */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                  {group.products.map((p, i) => (
                    <div key={p.id} style={{ flex: 1, minWidth: 160, background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 10, padding: "12px 16px" }}>
                      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Catalog Entry {i + 1}</div>
                      <code style={{ fontSize: 14, fontWeight: 700, color: "#A78BFA" }}>{p.partNumber}</code>
                      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{p.brand}</div>
                    </div>
                  ))}
                </div>

                {(!group.status || group.status === "flagged") && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleDupAction(group.id, "merge")}
                      disabled={loading === group.id}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 16px", background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#A78BFA" }}
                    >
                      {loading === group.id ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <GitMerge size={13} />} Merge into Single Record
                    </button>
                    <button
                      onClick={() => handleDupAction(group.id, "keep")}
                      disabled={loading === group.id}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 16px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#3B82F6" }}
                    >
                      <Copy size={13} /> Keep Separate
                    </button>
                    <button
                      onClick={() => handleDupAction(group.id, "dismiss")}
                      disabled={loading === group.id}
                      style={{ padding: "9px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#EF4444" }}
                    >
                      <Trash2 size={13} /> Dismiss Flag
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
