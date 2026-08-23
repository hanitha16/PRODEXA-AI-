import { useEffect, useRef, useState } from "react";
import { catalogStore } from "../services/catalogStore";
import type { Product } from "../types/prodexa";

export default function DataQualityScore() {
  const [product, setProduct] = useState<Product | null>(null);
  const [animated, setAnimated] = useState(false);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const update = () => {
      setProduct(catalogStore.getCurrentProduct() || null);
    };
    update();
    setTimeout(() => setAnimated(true), 200);
    return catalogStore.subscribe(update);
  }, []);

  const p = product;
  const score = p?.qualityScore || 92;
  const completeness = p?.completeness || 94;
  const consistency = p?.conflicts && p.conflicts.filter(c => c.status === "OPEN").length === 0 ? 98 : 72;
  const normalizationRate = p?.attributes ? Math.min(100, Math.round((p.attributes.filter(a => a.status === "VERIFIED" || a.status === "NORMALIZED").length / Math.max(p.attributes.length, 1)) * 100)) : 95;
  const avgConfidence = p?.attributes && p.attributes.length > 0 ? Math.round(p.attributes.reduce((acc, a) => acc + a.confidence, 0) / p.attributes.length) : 94;

  const metrics = [
    { label: "Completeness", value: completeness, color: "#22C55E" },
    { label: "Accuracy", value: 96, color: "#3B82F6" },
    { label: "Consistency", value: consistency, color: "#22D3EE" },
    { label: "Standardization", value: normalizationRate, color: "#8B5CF6" },
    { label: "AI Confidence", value: avgConfidence, color: "#F59E0B" },
  ];

  const r = 100;
  const circ = 2 * Math.PI * r;
  const offset = animated ? circ - (score / 100) * circ : circ;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Product Intelligence Quality Score</h1>
        <p className="page-subtitle">Multi-dimensional quality evaluation for {p?.name || "Active Product"} ({p?.partNumber || "PS-100"})</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 28 }}>
        {/* Score Ring */}
        <div className="glass-card" style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ position: "relative", width: 240, height: 240, marginBottom: 24 }}>
            <svg width="240" height="240" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="120" cy="120" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                ref={circleRef}
                cx="120" cy="120" r={r} fill="none"
                stroke="url(#scoreGrad)" strokeWidth="10"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)" }}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 52, fontWeight: 800, color: "#F8FAFC", lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 18, color: "#64748B" }}>/ 100</div>
              <div style={{ marginTop: 8, padding: "4px 14px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#22C55E", letterSpacing: "0.06em" }}>
                {p?.commerceReadiness.status || "EXCELLENT"}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.5 }}>
            {p?.commerceReadiness.details || "This product data meets enterprise publication standards with high confidence across all quality dimensions."}
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 className="section-title">Dimensional Score Breakdown</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {metrics.map((m, i) => (
                <div key={m.label} style={{ animation: `fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s both` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#94A3B8" }}>{m.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}%</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: 8 }}>
                    <div className="progress-bar-fill" style={{
                      width: animated ? `${m.value}%` : "0%",
                      background: `linear-gradient(90deg,${m.color}99,${m.color})`,
                      transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-2">
            {[
              { label: "Attributes Scored", value: `${p?.attributes.length || 8} Verified`, color: "#22C55E" },
              { label: "Sources Referenced", value: `${p?.sources.length || 3} Sources`, color: "#3B82F6" },
              { label: "Open Conflicts", value: `${p?.conflicts?.filter(c => c.status === "OPEN").length || 0} Issues`, color: p?.conflicts?.some(c => c.status === "OPEN") ? "#EF4444" : "#22C55E" },
              { label: "Missing Required", value: `${p?.missingAttributes?.length || 0} Fields`, color: p?.missingAttributes?.length ? "#F59E0B" : "#22C55E" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card" style={{ padding: "16px 20px" }}>
                <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.07em", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
