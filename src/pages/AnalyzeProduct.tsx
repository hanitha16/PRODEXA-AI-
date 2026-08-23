import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, CheckCircle2, X, Cpu, Zap, Database, ChevronRight, Table2, Layers, Sparkles } from "lucide-react";
import { ParserEngine } from "../services/parserEngine";
import { PRODEXA_TEST_CATALOG_CSV } from "../data/testCatalog";
import { uploadDocument } from "../services/api";
import type { ColumnMapping } from "../types/prodexa";

const demoDatasets = [
  { name: "prodexa_test_catalog.csv", size: "0.85 MB", category: "Multi-Category Industrial (15 Items)", desc: "Full test suite with duplicates (PS-100), missing attributes & variations", icon: "📊", is15: true },
  { name: "industrial_pump_catalog.pdf", size: "2.45 MB", category: "Industrial Pumps", desc: "High-confidence pump catalog with multi-source evidence", icon: "⚙️" },
  { name: "hydraulic_valve_specs.csv", size: "0.42 MB", category: "Hydraulic Valves", desc: "Valve specifications with pressure conflict", icon: "🔧" },
  { name: "electric_motor_datasheet.txt", size: "0.31 MB", category: "Electric Motors", desc: "Three-phase motor ratings with efficiency standards", icon: "⚡" },
];

export default function AnalyzeProduct() {
  const navigate = useNavigate();
  const [file, setFile] = useState<{ name: string; size: string; content: string } | null>(null);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [detectedRows, setDetectedRows] = useState<Record<string, string>[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showDemos, setShowDemos] = useState(false);

  const processFileContent = (name: string, sizeStr: string, text: string) => {
    setFile({ name, size: sizeStr, content: text });

    // Parse CSV / Text
    const { headers, rows } = ParserEngine.parseCSV(text);
    if (headers.length > 0) {
      setDetectedHeaders(headers);
      setDetectedRows(rows);
      const mappings = ParserEngine.inferColumnMappings(headers, rows);
      setColumnMappings(mappings);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || "";
        processFileContent(f.name, `${(f.size / (1024 * 1024)).toFixed(2)} MB`, text);
      };
      reader.readAsText(f);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || "";
        processFileContent(f.name, `${(f.size / (1024 * 1024)).toFixed(2)} MB`, text);
      };
      reader.readAsText(f);
    }
  };

  // Quick-load the 15-product industrial judge test catalog
  const loadJudgeTestCatalog = () => {
    processFileContent("prodexa_test_catalog.csv", "0.85 MB", PRODEXA_TEST_CATALOG_CSV);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);

    const blob = new Blob([file.content], { type: "text/csv" });
    const fileObj = new File([blob], file.name, { type: "text/csv" });

    // Upload & Ingest
    await uploadDocument(fileObj, file.content, columnMappings);

    navigate("/processing");
  };

  const formats = ["CSV", "PDF", "TXT", "DOCX", "XLSX", "JSON"];

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Upload & Ingest Product Data</h1>
          <p className="page-subtitle">Multi-product catalog ingestion, automatic column mapping, and deterministic intelligence</p>
        </div>
        {/* Quick Judge Demo Trigger */}
        <button
          onClick={loadJudgeTestCatalog}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.15))",
            border: "1px solid rgba(99,102,241,0.4)",
            borderRadius: 10,
            color: "#A5B4FC",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(99,102,241,0.2)",
          }}
        >
          <Sparkles size={15} color="#22D3EE" />
          Load 15-Product Industrial Test Catalog
        </button>
      </div>

      {/* DEMO MODE Banner */}
      <div style={{ background: "rgba(34,211,238,0.04)", border: "1px solid rgba(34,211,238,0.15)", borderRadius: 10, padding: "10px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22D3EE", animation: "pulseGlow 2s ease-in-out infinite" }} />
        <span style={{ fontSize: 13, color: "#22D3EE", fontWeight: 600 }}>ISOLATED INGESTION PIPELINE</span>
        <span style={{ fontSize: 13, color: "#64748B" }}>— Upload custom catalog data or load the 15-product industrial test dataset. Every uploaded dataset is strictly isolated.</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
        <div>
          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragging ? "rgba(34,211,238,0.5)" : file ? "rgba(34,197,94,0.4)" : "rgba(59,130,246,0.3)"}`,
              borderRadius: 16,
              padding: "45px 30px",
              textAlign: "center",
              background: dragging ? "rgba(34,211,238,0.04)" : file ? "rgba(34,197,94,0.04)" : "rgba(59,130,246,0.03)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              marginBottom: 16,
              boxShadow: dragging ? "0 0 30px rgba(34,211,238,0.15)" : "none",
            }}
            onClick={() => !file && document.getElementById("fileInput")?.click()}
          >
            <input id="fileInput" type="file" style={{ display: "none" }} onChange={handleFileChange} accept=".csv,.tsv,.json,.txt,.pdf,.docx,.xlsx" />
            {file ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle2 size={30} color="#22C55E" />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", marginBottom: 6, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <FileText size={18} color="#22C55E" />
                    {file.name}
                    <button onClick={e => { e.stopPropagation(); setFile(null); setDetectedRows([]); setDetectedHeaders([]); }} style={{ background: "rgba(239,68,68,0.12)", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <X size={12} color="#EF4444" />
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                    <span style={{ fontSize: 13, color: "#94A3B8" }}>{file.size}</span>
                    <span className="badge badge-verified" style={{ fontSize: 11 }}>
                      {detectedRows.length > 0 ? `${detectedRows.length} Products Detected` : "Ready for Ingestion"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ width: 68, height: 68, borderRadius: 18, background: "rgba(59,130,246,0.08)", border: `1px solid ${dragging ? "rgba(34,211,238,0.4)" : "rgba(59,130,246,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <UploadCloud size={32} color={dragging ? "#22D3EE" : "#3B82F6"} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 6 }}>
                  {dragging ? "Drop your file here" : "Drag & drop product catalog or document"}
                </div>
                <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Supports multi-row CSV, JSON, TXT, PDF or Word documents</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {formats.map(f => (
                    <span key={f} style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(16,38,61,0.8)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em" }}>{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column Mapping Preview Card (if multi-column CSV loaded) */}
          {file && detectedHeaders.length > 0 && (
            <div className="glass-card" style={{ padding: 18, marginBottom: 16, border: "1px solid rgba(59,130,246,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Table2 size={16} color="#3B82F6" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>Detected Schema ({detectedHeaders.length} Columns · {detectedRows.length} Rows)</span>
                </div>
                <button
                  onClick={() => setShowMappingModal(!showMappingModal)}
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#3B82F6", cursor: "pointer", fontWeight: 600 }}
                >
                  {showMappingModal ? "Hide Mappings" : "Customize Column Mapping"}
                </button>
              </div>

              {/* Sample preview rows */}
              <div style={{ overflowX: "auto", marginBottom: 12 }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      {detectedHeaders.slice(0, 5).map(h => (
                        <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: "#64748B", fontWeight: 700, textTransform: "uppercase", fontSize: 10 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detectedRows.slice(0, 3).map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        {detectedHeaders.slice(0, 5).map(h => (
                          <td key={h} style={{ padding: "6px 10px", color: "#94A3B8", fontFamily: "monospace" }}>{r[h] || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Editable Column Mapping Drawer */}
              {showMappingModal && (
                <div style={{ background: "rgba(11,27,46,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 14, marginTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#F8FAFC", marginBottom: 10 }}>Column Target Field Mapping</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "center" }}>
                    {columnMappings.map((cm, idx) => (
                      <div key={cm.rawHeader} style={{ display: "contents" }}>
                        <div style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace" }}>{cm.rawHeader}</div>
                        <select
                          className="select-field"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          value={cm.mappedField}
                          onChange={e => {
                            const newMap = [...columnMappings];
                            newMap[idx].mappedField = e.target.value as any;
                            newMap[idx].status = "manual";
                            setColumnMappings(newMap);
                          }}
                        >
                          <option value="partNumber">Part Number</option>
                          <option value="brand">Brand / Manufacturer</option>
                          <option value="description">Description</option>
                          <option value="category">Category</option>
                          <option value="voltage">Voltage Specification</option>
                          <option value="pressureRange">Pressure Range</option>
                          <option value="material">Material</option>
                          <option value="outputOrActuation">Output / Actuation</option>
                          <option value="current">Current / Flow</option>
                          <option value="temperatureRange">Temperature</option>
                          <option value="custom">Standard Specification</option>
                          <option value="ignore">Ignore Column</option>
                        </select>
                        <span className="badge badge-verified" style={{ fontSize: 10 }}>{cm.confidence}% match</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Demo Dataset Picker */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setShowDemos(!showDemos)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.06)"}
            >
              <Database size={18} color="#3B82F6" />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#3B82F6", flex: 1, textAlign: "left" }}>Try Prepared Demo Datasets</span>
              <span style={{ fontSize: 12, color: "#64748B" }}>4 datasets available</span>
              <ChevronRight size={16} color="#3B82F6" style={{ transform: showDemos ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {showDemos && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {demoDatasets.map(demo => (
                  <div
                    key={demo.name}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(11,27,46,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.06)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(11,27,46,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                    onClick={() => {
                      if (demo.is15) {
                        loadJudgeTestCatalog();
                      } else {
                        processFileContent(demo.name, demo.size, `Part Number: ${demo.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6)}\nBrand: Industrial Corp\nDescription: ${demo.category}\nVoltage: 24V\nPressure: 10 bar\nMaterial: SS`);
                      }
                      setShowDemos(false);
                    }}
                  >
                    <div style={{ fontSize: 24, flexShrink: 0 }}>{demo.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>{demo.name}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{demo.size} · {demo.category}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{demo.desc}</div>
                    </div>
                    <span className="badge badge-normalized">Load</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analyze Button */}
          {file && (
            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{ width: "100%", padding: "16px", fontSize: 16, justifyContent: "center", marginTop: 8, opacity: analyzing ? 0.8 : 1 }}
            >
              {analyzing ? (
                <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Ingesting & Analyzing {detectedRows.length || 1} Product(s)...</>
              ) : (
                <><Cpu size={18} /> Ingest & Analyze with PRODEXA AI <Zap size={15} /></>
              )}
            </button>
          )}
        </div>

        {/* Info Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#F8FAFC", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <Layers size={16} color="#3B82F6" /> Real Processing Stages
            </h3>
            {[
              "Document parsing & CSV header detection",
              "Multi-product row isolation & schema mapping",
              "Product identification & category ontology",
              "Attribute extraction & raw value preservation",
              "Deterministic terminology standardization",
              "Cross-source validation & conflict flagging",
              "Dynamic weighted confidence scoring",
              "Near-duplicate detection & grouping",
              "Commerce readiness quality gate",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#3B82F6", flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 13, color: "#94A3B8" }}>{step}</span>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#F8FAFC", margin: "0 0 12px" }}>Supported Industrial Ontologies</h3>
            {["Pressure Sensors", "Circuit Breakers", "PLC Modules", "Electric Motors", "Hydraulic Valves", "Industrial Pumps", "Industrial Filters", "Temperature Sensors"].map(cat => (
              <div key={cat} style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13, color: "#94A3B8", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#3B82F6" }} />{cat}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
