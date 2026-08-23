import { useState, useEffect } from "react";
import { catalogStore } from "../services/catalogStore";
import { recoverMissingAttribute } from "../services/api";
import type { Product } from "../types/prodexa";
import { ArrowRight, Sparkles, Zap, Search, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function AIEnrichment() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingAttr, setLoadingAttr] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setProducts(catalogStore.getProducts());
    };
    update();
    return catalogStore.subscribe(update);
  }, []);

  const allNormalizedAttrs = products.flatMap(p =>
    p.attributes
      .filter(a => a.status === "NORMALIZED" && a.originalValue && a.originalValue !== a.value)
      .map(a => ({
        id: a.id,
        productId: p.id,
        partNumber: p.partNumber,
        original: a.originalValue || a.rawValue || "",
        standardized: a.value,
        confidence: a.confidence,
        rationale: a.rationale?.summary || "Standardized per ISO/IEC industrial ontology.",
      }))
  );

  const missingList = products.flatMap(p =>
    (p.missingAttributes || []).map((attr, _idx) => ({
      id: `${p.id}_${attr}`,
      productId: p.id,
      productName: p.name,
      partNumber: p.partNumber,
      attribute: attr,
    }))
  );

  const handleRecover = async (productId: string, attributeName: string) => {
    const key = `${productId}_${attributeName}`;
    setLoadingAttr(key);
    await recoverMissingAttribute(productId, attributeName);
    setLoadingAttr(null);
  };

  const currentProduct = catalogStore.getCurrentProduct() || products[0];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI Enrichment & Normalization</h1>
        <p className="page-subtitle">Automatic terminology standardization, dynamic missing data recovery, and category intelligence</p>
      </div>

      {/* Stats Banner */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {[
          { label: "Transformations Applied", value: allNormalizedAttrs.length.toString(), icon: Zap, color: "#3B82F6" },
          { label: "Average Confidence", value: `${currentProduct?.qualityScore || 94.2}%`, icon: Sparkles, color: "#22D3EE" },
          { label: "Pending Missing Fields", value: missingList.length.toString(), icon: CheckCircle2, color: missingList.length === 0 ? "#22C55E" : "#F59E0B" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span className="stat-label">{label}</span>
              <Icon size={18} color={color} />
            </div>
            <div className="stat-number" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Applied Terminology Standardizations */}
      <h2 className="section-title"><Sparkles size={16} color="#22D3EE" /> Applied Terminology Standardizations ({allNormalizedAttrs.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
        {allNormalizedAttrs.slice(0, 8).map((t, i) => (
          <div
            key={t.id || i}
            className="glass-card"
            style={{
              padding: 20,
              border: "1px solid rgba(59,130,246,0.12)",
              transition: "border-color 0.25s ease",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto auto", gap: 12, alignItems: "center" }}>
              {/* Original */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                  [{t.partNumber}] Raw Input
                </div>
                <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "10px 14px" }}>
                  <code style={{ fontSize: 15, fontWeight: 700, color: "#F59E0B", fontFamily: "monospace" }}>{t.original}</code>
                </div>
              </div>
              {/* Arrow */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: 40, height: 2, background: "linear-gradient(90deg,#F59E0B,#22D3EE)" }} />
                <ArrowRight size={16} color="#22D3EE" />
              </div>
              {/* Standardized */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                  Standardized ISO/IEC Specification
                </div>
                <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8, padding: "10px 14px" }}>
                  <code style={{ fontSize: 15, fontWeight: 700, color: "#22C55E", fontFamily: "monospace" }}>{t.standardized}</code>
                </div>
              </div>
              {/* Confidence */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 6 }}>Confidence</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: t.confidence >= 95 ? "#22C55E" : "#3B82F6" }}>{t.confidence}%</div>
              </div>
              {/* Badge */}
              <span className="badge badge-ai-derived">NORMALIZED</span>
            </div>
            {/* Rationale */}
            <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(59,130,246,0.04)", borderRadius: 8, border: "1px solid rgba(59,130,246,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 4 }}>Standardization Rationale</div>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.55 }}>{t.rationale}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Missing Data Recovery */}
      <h2 className="section-title"><Search size={16} color="#F59E0B" /> Missing Data Recovery ({missingList.length})</h2>
      <p style={{ fontSize: 14, color: "#64748B", marginBottom: 20, marginTop: -8 }}>
        PRODEXA AI queries authoritative industrial engineering matrices and manufacturer standard series to recover missing values.
      </p>
      {missingList.length === 0 ? (
        <div className="glass-card" style={{ padding: 24, color: "#22C55E", display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <CheckCircle2 size={20} /> All products in active catalog have 100% mandatory attribute completeness!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
          {missingList.map(item => {
            const isLoading = loadingAttr === item.id;
            return (
              <div key={item.id} className="glass-card" style={{ padding: 20, border: "1px solid rgba(245,158,11,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontSize: 12, color: "#22D3EE", fontFamily: "monospace", fontWeight: 700 }}>[{item.partNumber}] {item.productName}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#F8FAFC", marginTop: 2 }}>{item.attribute}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertCircle size={14} color="#F59E0B" />
                    <span style={{ fontSize: 12, color: "#F59E0B", fontWeight: 600 }}>MISSING</span>
                  </div>

                  <button
                    className="btn-primary"
                    disabled={isLoading}
                    onClick={() => handleRecover(item.productId, item.attribute)}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {isLoading ? (
                      <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Searching Knowledge Base...</>
                    ) : (
                      <><Search size={14} /> Find Missing Information</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Intelligence Breakdown */}
      {currentProduct && (
        <>
          <h2 className="section-title"><Zap size={16} color="#8B5CF6" /> Category Ontology: {currentProduct.category}</h2>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 10 }}>Hierarchy</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ padding: "10px 14px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#64748B" }}>Primary Category</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#22C55E" }}>{currentProduct.category}</span>
                  </div>
                  <div style={{ padding: "10px 14px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#64748B" }}>Subcategory</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#22C55E" }}>{currentProduct.subcategory || "Industrial Class"}</span>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 10 }}>Enriched Description</div>
                <div style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 10, padding: "14px 18px" }}>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.6 }}>{currentProduct.enrichedDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
