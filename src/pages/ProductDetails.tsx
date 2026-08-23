import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { catalogStore } from "../services/catalogStore";
import type { Product, Attribute } from "../types/prodexa";
import EvidencePanel from "./EvidencePanel";
import { ArrowLeft, Download, Clock, CheckCircle2, ShieldCheck, AlertTriangle, Cpu } from "lucide-react";
import { ExportEngine } from "../services/exportEngine";

type Tab = "overview" | "specifications" | "ai-analysis" | "validation" | "history";
const bClass: Record<string, string> = {
  VERIFIED: "badge-verified",
  NORMALIZED: "badge-normalized",
  "AI DERIVED": "badge-ai-derived",
  UNCERTAIN: "badge-uncertain",
  CONFLICT: "badge-conflict",
  UNSUPPORTED: "badge-uncertain",
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedAttr, setSelectedAttr] = useState<Attribute | null>(null);

  useEffect(() => {
    const update = () => {
      const p = id ? catalogStore.getProductById(id) : catalogStore.getCurrentProduct();
      setProduct(p || null);
    };
    update();
    return catalogStore.subscribe(update);
  }, [id]);

  if (!product) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #3B82F6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <span style={{ color: "#64748B" }}>Loading product specifications...</span>
        </div>
      </div>
    );
  }

  const qc = product.qualityScore > 85 ? "#22C55E" : product.qualityScore > 70 ? "#F59E0B" : "#EF4444";
  const verifiedCount = product.attributes.filter(a => a.status === "VERIFIED" || a.status === "NORMALIZED").length;
  const conflictCount = (product.conflicts || []).filter(c => c.status === "OPEN").length;
  const aiDerivedCount = product.attributes.filter(a => a.status === "AI DERIVED" || a.status === "NORMALIZED").length;
  const avgConf = product.attributes.length > 0
    ? Math.round(product.attributes.reduce((s, a) => s + a.confidence, 0) / product.attributes.length)
    : 92;

  const handleExportThisProduct = () => {
    const csv = ExportEngine.generateCSV([product]);
    ExportEngine.downloadFile(csv, `prodexa_${product.partNumber}.csv`, "text/csv");
  };

  return (
    <div>
      <button onClick={() => navigate("/catalog")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 13, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={14} /> Back to Catalog
      </button>

      {/* Header Card */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#F8FAFC", margin: 0 }}>{product.name}</h1>
              <span className={"badge " + (product.status === "ready" ? "badge-ready" : product.status === "conflict" ? "badge-conflict" : "badge-review")}>
                {product.status.toUpperCase()}
              </span>
              <span className="badge badge-verified" style={{ fontSize: 11 }}>
                {product.commerceReadiness.status}
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#64748B", flexWrap: "wrap" }}>
              <span>Part Number: <code style={{ color: "#22D3EE", fontWeight: 700 }}>{product.partNumber}</code></span>
              <span>Manufacturer: <strong style={{ color: "#94A3B8" }}>{product.brand}</strong></span>
              <span>Category: <strong style={{ color: "#94A3B8" }}>{product.category}</strong></span>
              <span>Updated: {new Date(product.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ textAlign: "center", marginRight: 8 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: qc }}>{product.qualityScore}%</div>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>QUALITY</div>
            </div>
            <button className="btn-primary" onClick={handleExportThisProduct} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Download size={14} /> Export Product
            </button>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#64748B" }}>Specification Completeness</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#22C55E" }}>{product.completeness}%</span>
          </div>
          <div className="progress-bar-track" style={{ height: 6 }}>
            <div className="progress-bar-fill" style={{ width: `${product.completeness}%`, background: "linear-gradient(90deg,#22C55E80,#22C55E)" }} />
          </div>
        </div>
      </div>

      <div className="tab-nav">
        {([
          ["overview", "Overview"],
          ["specifications", `Specifications (${product.attributes.length})`],
          ["ai-analysis", "AI Analysis Report"],
          ["validation", `Validation (${verifiedCount} Verified)`],
          ["history", `Audit Trail (${product.history.length})`],
        ] as [Tab, string][]).map(([t, l]) => (
          <button key={t} className={"tab-btn" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid-2">
          <div className="glass-card" style={{ padding: 20 }}>
            <h2 className="section-title">Core Specifications</h2>
            {product.attributes.slice(0, 6).map(attr => (
              <div
                key={attr.id}
                onClick={() => setSelectedAttr(attr)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", borderRadius: 4 }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(59,130,246,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 13, color: "#94A3B8" }}>{attr.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC", fontFamily: "monospace" }}>
                    {attr.value}{attr.unit && !attr.value.includes(attr.unit) ? " " + attr.unit : ""}
                  </span>
                  <span className={"badge " + (bClass[attr.status] || "badge-normalized")} style={{ fontSize: 9 }}>{attr.status}</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 12, color: "#64748B" }}>Click any attribute to view evidence sources & rationale</div>
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <h2 className="section-title">Traceable Data Sources</h2>
            {product.sources.map(src => (
              <div key={src.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#F8FAFC" }}>{src.name}</div>
                  <div style={{ fontSize: 11, color: "#64748B", textTransform: "capitalize" }}>
                    {src.type} {src.rowNumber ? `· Row #${src.rowNumber}` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#22C55E" }}>{src.reliability}%</div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>reliability</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "specifications" && (
        <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Attribute", "Normalized Value", "Raw Value", "Status", "Confidence", "Evidence"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {product.attributes.map(attr => (
                <tr
                  key={attr.id}
                  onClick={() => setSelectedAttr(attr)}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(59,130,246,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#94A3B8" }}>{attr.name}</td>
                  <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "#F8FAFC", fontFamily: "monospace" }}>
                    {attr.value}{attr.unit && !attr.value.includes(attr.unit) ? " " + attr.unit : ""}
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>
                    {attr.originalValue || attr.rawValue || "—"}
                  </td>
                  <td style={{ padding: "14px 20px" }}><span className={"badge " + (bClass[attr.status] || "badge-normalized")}>{attr.status}</span></td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar-track" style={{ width: 60 }}>
                        <div className="progress-bar-fill" style={{ width: `${attr.confidence}%`, background: attr.confidence > 90 ? "#22C55E" : attr.confidence > 70 ? "#3B82F6" : "#EF4444" }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>{attr.confidence}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <button style={{ fontSize: 11, color: "#3B82F6", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
                      Why?
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "10px 20px", fontSize: 12, color: "#64748B", borderTop: "1px solid rgba(255,255,255,0.04)" }}>Click any row to view evidence sources and AI rationale</div>
        </div>
      )}

      {tab === "ai-analysis" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* AI Intelligence Summary */}
          <div className="glass-card" style={{ padding: 24, border: "1px solid rgba(59,130,246,0.15)" }}>
            <h2 className="section-title"><Cpu size={16} color="#3B82F6" /> AI Intelligence Assessment</h2>
            <div className="grid-4" style={{ marginBottom: 20 }}>
              {[
                { label: "Verified Attributes", value: verifiedCount, color: "#22C55E" },
                { label: "AI Normalized / Derived", value: aiDerivedCount, color: "#8B5CF6" },
                { label: "Open Conflicts", value: conflictCount, color: "#EF4444" },
                { label: "Average Confidence", value: `${avgConf}%`, color: "#3B82F6" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: "16px", background: "rgba(16,38,61,0.5)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 8 }}>AI Enriched Overview</div>
              <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7, margin: 0 }}>
                {product.enrichedDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "validation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 className="section-title"><ShieldCheck size={16} color="#22C55E" /> Validation Summary</h2>
            <div className="grid-3" style={{ marginBottom: 20 }}>
              {[
                { label: "Verified", count: verifiedCount, color: "#22C55E", icon: "✅" },
                { label: "Conflicts", count: conflictCount, color: "#EF4444", icon: "⚠️" },
                { label: "Missing", count: product.missingAttributes?.length || 0, color: "#F59E0B", icon: "❓" },
              ].map(({ label, count, color, icon }) => (
                <div key={label} style={{ padding: "16px", background: `${color}08`, border: `${color}25`, borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{count}</div>
                  <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
            {product.attributes.map(attr => (
              <div key={attr.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", marginBottom: 8, borderRadius: 10, background: attr.status === "CONFLICT" ? "rgba(239,68,68,0.04)" : attr.status === "UNCERTAIN" ? "rgba(245,158,11,0.04)" : "rgba(34,197,94,0.04)", border: `1px solid ${attr.status === "CONFLICT" ? "rgba(239,68,68,0.2)" : attr.status === "UNCERTAIN" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.15)"}` }}>
                {attr.status === "CONFLICT" ? <AlertTriangle size={14} color="#EF4444" /> : <CheckCircle2 size={14} color={attr.status === "UNCERTAIN" ? "#F59E0B" : "#22C55E"} />}
                <span style={{ fontSize: 13, color: "#94A3B8", flex: 1 }}>{attr.name}</span>
                <code style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>{attr.value}{attr.unit && !attr.value.includes(attr.unit) ? " " + attr.unit : ""}</code>
                <span className={"badge " + (bClass[attr.status] || "badge-normalized")} style={{ fontSize: 9 }}>{attr.status}</span>
                <button onClick={() => setSelectedAttr(attr)} style={{ fontSize: 11, color: "#3B82F6", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>Evidence</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="glass-card" style={{ padding: 20 }}>
          <h2 className="section-title"><Clock size={16} color="#3B82F6" /> Audit Trail & History</h2>
          {product.history.map(entry => (
            <div key={entry.id} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CheckCircle2 size={13} color="#3B82F6" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>{entry.action}</div>
                {entry.field && (
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                    {entry.field}: <code style={{ color: "#F59E0B" }}>{entry.oldValue}</code>{" → "}<code style={{ color: "#22C55E" }}>{entry.newValue}</code>
                  </div>
                )}
                {entry.reason && (
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, fontStyle: "italic" }}>
                    Rationale: {entry.reason}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{entry.user}</div>
                <div style={{ fontSize: 10, color: "#64748B" }}>{new Date(entry.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAttr && <EvidencePanel attribute={selectedAttr} onClose={() => setSelectedAttr(null)} />}
    </div>
  );
}
