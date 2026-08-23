import type { ElementType } from "react";
import type { Attribute, Source } from "../types/prodexa";
import { X, FileText, Globe, Package, BookOpen, CheckCircle2, Info, Database } from "lucide-react";

const srcIcons: Record<string, ElementType> = {
  datasheet: FileText,
  website: Globe,
  distributor: Package,
  manual: BookOpen,
  csv_upload: Database,
  spec_sheet: FileText,
};

interface EvidencePanelProps {
  attribute: Attribute;
  onClose: () => void;
}

export default function EvidencePanel({ attribute, onClose }: EvidencePanelProps) {
  const rationale = attribute.rationale?.summary || (
    attribute.status === "VERIFIED"
      ? "This value was confirmed across multiple authoritative independent sources with high cross-agreement. No discrepancies detected."
      : attribute.status === "NORMALIZED"
      ? "This value was normalized to follow ISO/IEC industrial terminology standards while preserving original engineering specification intent."
      : attribute.status === "CONFLICT"
      ? "A data discrepancy was detected between source documents. Different sources report differing values for this attribute."
      : "This specification was extracted from source documents with high confidence."
  );

  const breakdown = attribute.rationale?.confidenceBreakdown || {
    sourceQuality: Math.round(attribute.confidence * 0.3),
    crossAgreement: Math.round(attribute.confidence * 0.3),
    extractionCertainty: Math.round(attribute.confidence * 0.2),
    completeness: Math.round(attribute.confidence * 0.1),
    normalization: Math.round(attribute.confidence * 0.1),
  };

  return (
    <>
      <div className="evidence-overlay" onClick={onClose} />
      <div className="evidence-drawer" style={{ width: "440px", maxWidth: "100%", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: "#22D3EE", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
              Evidence & Decision Explainer
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC" }}>Why this value?</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={14} color="#94A3B8" />
          </button>
        </div>

        {/* Attribute Info */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>{attribute.name}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#F8FAFC", fontFamily: "monospace" }}>
                {attribute.value}{attribute.unit && !attribute.value.includes(attribute.unit) ? " " + attribute.unit : ""}
              </div>
              {(attribute.originalValue || attribute.rawValue) && (attribute.originalValue !== attribute.value || attribute.rawValue !== attribute.value) && (
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                  Standardized from: <span style={{ fontFamily: "monospace", color: "#F59E0B" }}>{attribute.originalValue || attribute.rawValue}</span>
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Confidence Score</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: attribute.confidence > 90 ? "#22C55E" : attribute.confidence > 70 ? "#F59E0B" : "#EF4444" }}>
                {attribute.confidence}%
              </div>
            </div>
          </div>

          {/* Confidence Bar */}
          <div style={{ marginBottom: 14 }}>
            <div className="progress-bar-track" style={{ height: 6 }}>
              <div className="progress-bar-fill" style={{
                width: `${attribute.confidence}%`,
                background: attribute.confidence > 90 ? "#22C55E" : attribute.confidence > 70 ? "#F59E0B" : "#EF4444",
              }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <CheckCircle2 size={14} color="#22C55E" />
              <span style={{ fontSize: 13, color: "#94A3B8" }}>
                <strong style={{ color: "#22C55E" }}>{attribute.sources.length}</strong> Source(s) Corroborated
              </span>
            </div>
            <div style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${attribute.status === "VERIFIED" ? "rgba(34,197,94,0.3)" : attribute.status === "CONFLICT" ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)"}`, fontSize: 10, fontWeight: 700, color: attribute.status === "VERIFIED" ? "#22C55E" : attribute.status === "CONFLICT" ? "#EF4444" : "#3B82F6" }}>
              {attribute.status}
            </div>
          </div>
        </div>

        {/* Confidence Weighted Breakdown (Formula Factors) */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(11,27,46,0.4)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Dynamic Confidence Factors Formula
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Source Quality (30%)", pts: `${breakdown.sourceQuality} pts` },
              { label: "Cross Agreement (30%)", pts: `${breakdown.crossAgreement} pts` },
              { label: "Extraction Certainty (20%)", pts: `${breakdown.extractionCertainty} pts` },
              { label: "Completeness (10%)", pts: `${breakdown.completeness} pts` },
              { label: "Standardization (10%)", pts: `${breakdown.normalization} pts` },
            ].map(({ label, pts }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", background: "rgba(16,38,61,0.5)", borderRadius: 6, fontSize: 11 }}>
                <span style={{ color: "#94A3B8" }}>{label}</span>
                <span style={{ color: "#22D3EE", fontWeight: 700 }}>{pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting Evidence Sources */}
        <div style={{ padding: "20px 24px", flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
            Supporting Sources & Traceability
          </div>
          {attribute.sources.map((src: Source, i: number) => {
            const Icon = srcIcons[src.type] || FileText;
            return (
              <div
                key={src.id || i}
                style={{ background: "rgba(16,38,61,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", marginBottom: 10, transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={14} color="#3B82F6" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>{src.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B", textTransform: "capitalize" }}>
                      {src.type} {src.rowNumber ? `· Row #${src.rowNumber}` : ""}
                    </div>
                  </div>
                </div>

                {src.rawText && (
                  <div style={{ fontSize: 11, color: "#94A3B8", background: "rgba(2,8,23,0.6)", padding: "6px 8px", borderRadius: 6, marginBottom: 8, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Snippet: {src.rawText}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="progress-bar-track" style={{ flex: 1, height: 4 }}>
                    <div className="progress-bar-fill" style={{
                      width: `${src.reliability}%`,
                      background: src.reliability >= 95 ? "#22C55E" : src.reliability >= 85 ? "#3B82F6" : "#F59E0B",
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace" }}>{src.reliability}% reliability</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Rationale */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(59,130,246,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Info size={13} color="#22D3EE" />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#22D3EE", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Validation & Standardization Rationale</div>
          </div>
          <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>
            {rationale}
          </p>
        </div>
      </div>
    </>
  );
}
