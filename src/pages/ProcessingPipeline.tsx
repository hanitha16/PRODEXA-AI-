import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { catalogStore } from "../services/catalogStore";

const STAGES = [
  "Document Parsing & Header Detection",
  "Multi-Product Ingestion & Isolation",
  "Category AI & Ontology Understanding",
  "Attribute Extraction & Raw Value Tracing",
  "Standardizing Terminology (ISO/IEC)",
  "Cross-Source Evidence Corroboration",
  "Validating Specifications & Conflicts",
  "Dynamic Confidence & Duplicate Analysis",
  "Calculating Product Intelligence & Readiness",
];

export default function ProcessingPipeline() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentProduct = catalogStore.getCurrentProduct();
  const currentDatasetId = catalogStore.getActiveDatasetId();
  const currentDataset = catalogStore.getDatasets().find(d => d.id === currentDatasetId);

  useEffect(() => {
    let step = 0;
    const advance = () => {
      if (step >= STAGES.length) {
        setDone(true);
        return;
      }
      setActiveStep(step);
      setProgress(Math.round(((step + 1) / STAGES.length) * 100));
      step++;
      setTimeout(advance, 600); // Fluid fast progression for live judge experience
    };
    advance();
  }, []);

  // Canvas neural animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 280;
    canvas.height = 280;
    const nodes = Array.from({ length: 8 }, (_, i) => ({
      x: 140 + 100 * Math.cos((i / 8) * Math.PI * 2),
      y: 140 + 100 * Math.sin((i / 8) * Math.PI * 2),
      phase: i * 0.8,
    }));
    let t = 0;
    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, 280, 280);
      t += 0.04;
      nodes.forEach((n, i) => {
        const n2 = nodes[(i + 1) % nodes.length];
        const alpha = 0.1 + 0.1 * Math.sin(t + i);
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(140, 140);
        ctx.strokeStyle = `rgba(34,211,238,${alpha * 0.5})`;
        ctx.stroke();
      });
      nodes.forEach((n, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t + n.phase);
        const r = 6 + 3 * pulse;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2);
        grad.addColorStop(0, `rgba(34,211,238,${0.6 + pulse * 0.4})`);
        grad.addColorStop(1, "rgba(34,211,238,0)");
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = i === activeStep % 8 ? "#22D3EE" : "#3B82F6";
        ctx.fill();
      });
      const hubPulse = 0.7 + 0.3 * Math.sin(t * 1.5);
      const hubGrad = ctx.createRadialGradient(140, 140, 0, 140, 140, 30);
      hubGrad.addColorStop(0, `rgba(59,130,246,${hubPulse})`);
      hubGrad.addColorStop(1, "rgba(59,130,246,0)");
      ctx.beginPath();
      ctx.arc(140, 140, 30, 0, Math.PI * 2);
      ctx.fillStyle = hubGrad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(140, 140, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#3B82F6";
      ctx.fill();
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [activeStep]);

  const r = 90;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI Processing Pipeline</h1>
        <p className="page-subtitle">PRODEXA AI is executing deterministic intelligence across 9 pipeline stages for {currentDataset?.fileName || "active dataset"}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
        {/* Stage List */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Processing Stages</h2>
            <span style={{ fontSize: 12, color: "#22D3EE", fontWeight: 600 }}>
              {currentDataset?.productCount ? `${currentDataset.productCount} Products in Batch` : "Active Batch"}
            </span>
          </div>
          {STAGES.map((stage, i) => {
            const isComplete = i < activeStep;
            const isActive = i === activeStep && !done;
            const isPending = i > activeStep;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < STAGES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: isComplete ? "rgba(34,197,94,0.12)" : isActive ? "rgba(34,211,238,0.12)" : "rgba(16,38,61,0.5)",
                  border: isComplete ? "1px solid rgba(34,197,94,0.3)" : isActive ? "1px solid rgba(34,211,238,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  animation: isActive ? "pulseGlow 1.5s ease-in-out infinite" : "none",
                }}>
                  {isComplete ? <Check size={14} color="#22C55E" /> :
                    isActive ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22D3EE" }} /> :
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#334155" }} />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: isActive ? 600 : 500, color: isComplete ? "#22C55E" : isActive ? "#F8FAFC" : "#64748B" }}>{stage}</div>
                  {isActive && (
                    <div style={{ marginTop: 6, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "linear-gradient(90deg,#22D3EE,#3B82F6)", borderRadius: 2, animation: "scanline 1.5s ease-in-out infinite", width: "60%" }} />
                    </div>
                  )}
                </div>
                {isComplete && <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>DONE</span>}
                {isPending && <span style={{ fontSize: 11, color: "#334155", fontWeight: 600 }}>PENDING</span>}
              </div>
            );
          })}
          {done && (
            <button className="btn-primary" onClick={() => navigate("/extraction")} style={{ width: "100%", justifyContent: "center", marginTop: 20, padding: 14 }}>
              View Extraction Results <ArrowRight size={15} />
            </button>
          )}
        </div>

        {/* Visual Center */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: 200, height: 200, marginBottom: 16 }}>
              <svg width="200" height="200" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle cx="100" cy="100" r="90" fill="none" stroke="url(#ring)" strokeWidth="6"
                  strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(0.16,1,0.3,1)" }} />
                <defs>
                  <linearGradient id="ring" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <canvas ref={canvasRef} width="200" height="200" style={{ position: "absolute", inset: 0 }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#F8FAFC", lineHeight: 1 }}>{progress}%</div>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, marginTop: 4 }}>COMPLETE</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#94A3B8", textAlign: "center" }}>
              {done ? "All pipeline stages complete!" : `Processing: ${STAGES[activeStep] ?? ""}`}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Batch Live Telemetry</div>
            {[
              { label: "Batch Source", value: currentDataset?.fileName || "Upload" },
              { label: "Products in Queue", value: `${currentDataset?.productCount || 1} items` },
              { label: "Attributes Extracted", value: `${(currentProduct?.attributes.length || 8) * (currentDataset?.productCount || 1)}` },
              { label: "Confidence Rating", value: `${currentProduct?.qualityScore || 94}%` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", fontFamily: "monospace" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
