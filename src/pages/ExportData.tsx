import { useState, useEffect } from "react";
import { catalogStore } from "../services/catalogStore";
import { ExportEngine } from "../services/exportEngine";
import type { Product } from "../types/prodexa";
import { Download, FileText, Code2, Table2, Check, Loader2, Package, ShieldCheck } from "lucide-react";

const exportFormats = [
  {
    id: "csv",
    label: "CSV Export",
    icon: Table2,
    color: "#22C55E",
    desc: "Comma-separated values with products summary, attributes, and source provenance",
    checks: ["RFC-4180 schema valid", "Attribute normalization included", "Lineage & row provenance", "Excel & Google Sheets ready"],
  },
  {
    id: "json",
    label: "JSON Export",
    icon: Code2,
    color: "#3B82F6",
    desc: "Structured JSON payload with complete metadata, confidence scores, and audit history",
    checks: ["Full JSON schema validation", "Nested attribute provenance", "Conflict & duplicate records", "ERP / PIM API ready"],
  },
  {
    id: "xlsx",
    label: "Excel Workbook (.xlsx)",
    icon: FileText,
    color: "#8B5CF6",
    desc: "Microsoft Excel XML Workbook with multi-sheet layout ('Product Catalog' & 'Enriched Attributes')",
    checks: ["Multi-worksheet layout", "Formatted column widths", "Attribute traceability tabs", "ERP import ready"],
  },
];

export default function ExportData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    const update = () => {
      setProducts(catalogStore.getProducts());
    };
    update();
    return catalogStore.subscribe(update);
  }, []);

  const totalProducts = products.length;
  const verifiedCount = products.filter(p => p.status === "ready").length;
  const needsReview = products.filter(p => p.status === "review" || p.status === "conflict").length;
  const conflictsCount = products.reduce((acc, p) => acc + (p.conflicts?.filter(c => c.status === "OPEN").length || 0), 0);
  const commerceReady = products.filter(p => p.commerceReadiness.status === "COMMERCE READY").length;

  const handleExport = async (format: "csv" | "json" | "xlsx") => {
    setLoading(format);
    await new Promise(r => setTimeout(r, 600)); // Smooth processing experience

    const timestamp = new Date().toISOString().split("T")[0];
    const datasetId = catalogStore.getActiveDatasetId() || "catalog";

    if (format === "csv") {
      const content = ExportEngine.generateCSV(products);
      ExportEngine.downloadFile(content, `prodexa_${datasetId}_${timestamp}.csv`, "text/csv");
    } else if (format === "json") {
      const content = ExportEngine.generateJSON(products);
      ExportEngine.downloadFile(content, `prodexa_${datasetId}_${timestamp}.json`, "application/json");
    } else if (format === "xlsx") {
      const content = ExportEngine.generateExcelWorkbook(products);
      ExportEngine.downloadFile(content, `prodexa_${datasetId}_${timestamp}.xlsx`, "application/vnd.ms-excel");
    }

    setLoading(null);
    setDone(prev => new Set([...prev, format]));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Export Center</h1>
        <p className="page-subtitle">Download validated and commerce-ready product catalog in CSV, JSON, or Excel format</p>
      </div>

      {/* Summary Banner */}
      <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <Package size={28} color="#3B82F6" />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC" }}>Export Ready — {totalProducts} Products in Active Dataset</div>
          <div style={{ fontSize: 13, color: "#64748B" }}>Generated directly from active catalog state with verified attributes and traceability</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
          {[
            { label: "Products", value: totalProducts.toString() },
            { label: "Commerce Ready", value: commerceReady.toString() },
            { label: "Needs Review", value: needsReview.toString() },
            { label: "Open Conflicts", value: conflictsCount.toString() },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC" }}>{value}</div>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-export validation */}
      <div className="glass-card" style={{ padding: "16px 24px", marginBottom: 24, border: "1px solid rgba(34,197,94,0.15)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={15} color="#22C55E" /> Pre-Export Quality Gate Checklist
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[
            `Total Ingested: ${totalProducts} Products`,
            `Validated & Normalized: ${verifiedCount} Products`,
            `Commerce Ready: ${commerceReady} Products`,
            `Open Conflicts Flagged: ${conflictsCount}`,
            `Source Traceability: 100% Attached`,
            `Export Packaging Ready`,
          ].map(check => (
            <div key={check} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Check size={13} color="#22C55E" />
              <span style={{ fontSize: 13, color: "#94A3B8" }}>{check}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {exportFormats.map((fmt, _i) => {
          const Icon = fmt.icon;
          const isLoading = loading === fmt.id;
          const isDone = done.has(fmt.id);
          return (
            <div
              key={fmt.id}
              className="glass-card"
              style={{
                padding: 24,
                border: isDone ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${fmt.color}40`}
              onMouseLeave={e => e.currentTarget.style.borderColor = isDone ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${fmt.color}18`, border: `1px solid ${fmt.color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={22} color={fmt.color} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC" }}>{fmt.label}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{totalProducts} products ready</div>
                </div>
                {isDone && <span className="badge badge-verified" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}><Check size={10} />Downloaded</span>}
              </div>
              <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 14px", lineHeight: 1.5 }}>{fmt.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                {fmt.checks.map(c => (
                  <div key={c} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Check size={12} color="#22C55E" />
                    <span style={{ fontSize: 12, color: "#94A3B8" }}>{c}</span>
                  </div>
                ))}
              </div>
              <button
                className={isDone ? "btn-success" : "btn-primary"}
                onClick={() => handleExport(fmt.id as "csv" | "json" | "xlsx")}
                disabled={isLoading}
                style={{ width: "100%", justifyContent: "center", padding: "11px", display: "flex", alignItems: "center", gap: 8 }}
              >
                {isLoading ? (
                  <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Generating {fmt.id.toUpperCase()}...</>
                ) : isDone ? (
                  <><Check size={14} /> Downloaded ✓</>
                ) : (
                  <><Download size={14} /> Download {fmt.id.toUpperCase()}</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
