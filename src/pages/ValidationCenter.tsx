import { useState, useCallback } from "react";
import { 
  UploadCloud, FileText, CheckCircle2, X, Cpu, Zap, Table2, Layers, Download, 
  AlertTriangle, AlertCircle, ArrowRight, Search, Check, RefreshCw, ChevronLeft, ShieldCheck, ChevronRight
} from "lucide-react";
import { ParserEngine } from "../services/parserEngine";
import { 
  validateInput, runHackathonPipeline, generateHackathonCSV, generateHackathonXLSX, parseXLSXToCSV, downloadBlob 
} from "../services/hackathonPipeline";
import type { InputValidationResult, ProcessingProgress } from "../services/hackathonPipeline";
import { EXPECTED_OUTPUT_HEADERS } from "../services/outputSchema";
import type { ExpectedOutputRow, SchemaValidationResult } from "../services/outputSchema";
import type { Product, Dataset, ProcessingJob } from "../types/prodexa";
import { catalogStore } from "../services/catalogStore";
import { useToast } from "../context/ToastContext";
import { PRODEXA_TEST_CATALOG_CSV } from "../data/testCatalog";

type Step = 1 | 2 | 3 | 4 | 5;

export default function ValidationCenter() {
  const { success, error: toastError, info } = useToast();
  
  // Pipeline State
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<{ name: string; size: string; content?: string; buffer?: ArrayBuffer; isXlsx: boolean } | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [dragging, setDragging] = useState(false);
  
  // Step 2 State (Validation)
  const [validationResult, setValidationResult] = useState<InputValidationResult | null>(null);
  
  // Step 3 State (Enrichment)
  const [enrichmentRunning, setEnrichmentRunning] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [enrichedProducts, setEnrichedProducts] = useState<Product[]>([]);
  const [outputRows, setOutputRows] = useState<ExpectedOutputRow[]>([]);
  const [schemaValidation, setSchemaValidation] = useState<SchemaValidationResult | null>(null);
  const [processingStats, setProcessingStats] = useState<any | null>(null);
  
  // Step 4 State (Preview)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // File parsing handlers
  const handleParse = (name: string, sizeStr: string, text: string) => {
    try {
      const { headers, rows } = ParserEngine.parseCSV(text);
      if (headers.length === 0) {
        toastError("Empty dataset parsed. Please select a valid file.");
        return;
      }
      setFile({ name, size: sizeStr, content: text, isXlsx: false });
      setHeaders(headers);
      setRows(rows);
      
      // Run validation immediately
      const validation = validateInput(headers, rows);
      setValidationResult(validation);
      setStep(2);
      success("CSV file loaded and validated successfully!");
    } catch (err: any) {
      toastError(`Failed to parse CSV file: ${err.message}`);
    }
  };

  const handleParseXlsx = (name: string, sizeStr: string, buffer: ArrayBuffer) => {
    try {
      const { headers, rows } = parseXLSXToCSV(buffer);
      if (headers.length === 0) {
        toastError("Empty Excel sheet parsed. Please check the file contents.");
        return;
      }
      setFile({ name, size: sizeStr, buffer, isXlsx: true });
      setHeaders(headers);
      setRows(rows);
      
      // Run validation immediately
      const validation = validateInput(headers, rows);
      setValidationResult(validation);
      setStep(2);
      success("XLSX file loaded and validated successfully!");
    } catch (err: any) {
      toastError(`Failed to parse Excel file: ${err.message}`);
    }
  };

  // Drag & drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      const isXlsx = f.name.endsWith(".xlsx");
      const reader = new FileReader();
      const sizeStr = `${(f.size / (1024 * 1024)).toFixed(2)} MB`;
      if (isXlsx) {
        reader.onload = (event) => {
          const buffer = (event.target?.result as ArrayBuffer) || new ArrayBuffer(0);
          handleParseXlsx(f.name, sizeStr, buffer);
        };
        reader.readAsArrayBuffer(f);
      } else {
        reader.onload = (event) => {
          const text = (event.target?.result as string) || "";
          handleParse(f.name, sizeStr, text);
        };
        reader.readAsText(f);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const isXlsx = f.name.endsWith(".xlsx");
      const reader = new FileReader();
      const sizeStr = `${(f.size / (1024 * 1024)).toFixed(2)} MB`;
      if (isXlsx) {
        reader.onload = (event) => {
          const buffer = (event.target?.result as ArrayBuffer) || new ArrayBuffer(0);
          handleParseXlsx(f.name, sizeStr, buffer);
        };
        reader.readAsArrayBuffer(f);
      } else {
        reader.onload = (event) => {
          const text = (event.target?.result as string) || "";
          handleParse(f.name, sizeStr, text);
        };
        reader.readAsText(f);
      }
    }
  };

  // Demo loader shortcut
  const loadDemoCatalog = () => {
    info("Loading 15-Product Industrial Test Catalog...");
    handleParse("prodexa_test_catalog.csv", "0.85 MB", PRODEXA_TEST_CATALOG_CSV);
  };

  // Ingestion enrichment trigger
  const handleStartEnrichment = async () => {
    if (!file) return;
    setEnrichmentRunning(true);
    try {
      const result = await runHackathonPipeline(
        file.name,
        headers,
        rows,
        (progressInfo) => {
          setProgress(progressInfo);
        }
      );
      
      setEnrichedProducts(result.products);
      setOutputRows(result.outputRows);
      setSchemaValidation(result.schemaValidation);
      setProcessingStats(result.processingStats);
      
      // Update global catalogStore
      const datasetId = `validation_${Date.now()}`;
      const dataset: Dataset = {
        id: datasetId,
        name: file.name,
        type: "uploaded",
        fileName: file.name,
        fileSize: file.size,
        fileType: file.isXlsx ? "XLSX" : "CSV",
        createdAt: new Date().toISOString(),
        productCount: result.products.length,
        rawRows: rows,
        headers,
      };
      
      const job: ProcessingJob = {
        id: `job_${Date.now()}`,
        datasetId,
        fileName: file.name,
        totalProducts: result.products.length,
        processedProducts: result.products.length,
        successful: result.products.filter(p => p.status === "ready").length,
        needsReview: result.products.filter(p => p.status === "review" || p.status === "conflict").length,
        failed: result.products.filter(p => p.status === "failed").length,
        status: "completed",
        currentStageIndex: 8,
        currentStageName: "COMPLETED",
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      catalogStore.addDatasetAndProducts(dataset, job, result.products, []);

      success("AI enrichment and schema mapping complete!");
      setStep(4);
    } catch (err: any) {
      toastError(`Enrichment failed: ${err.message}`);
    } finally {
      setEnrichmentRunning(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!schemaValidation?.valid) {
      toastError("Download blocked: Schema validation has failed.");
      return;
    }
    const csvContent = generateHackathonCSV(outputRows);
    const ts = new Date().toISOString().split("T")[0];
    downloadBlob(csvContent, `${file?.name.split(".")[0]}_compliant_${ts}.csv`, "text/csv");
    success("CSV export downloaded successfully!");
  };

  const handleDownloadXLSX = () => {
    if (!schemaValidation?.valid) {
      toastError("Download blocked: Schema validation has failed.");
      return;
    }
    const xlsxBuffer = generateHackathonXLSX(outputRows);
    const ts = new Date().toISOString().split("T")[0];
    downloadBlob(xlsxBuffer, `${file?.name.split(".")[0]}_compliant_${ts}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    success("Excel export downloaded successfully!");
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setHeaders([]);
    setRows([]);
    setValidationResult(null);
    setProgress(null);
    setEnrichedProducts([]);
    setOutputRows([]);
    setSchemaValidation(null);
    setProcessingStats(null);
    setCurrentPage(1);
    setSearchQuery("");
  };

  // Preview filtering & search logic
  const filteredOutputRows = outputRows.filter((r) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      String(r["Part Number"]).toLowerCase().includes(term) ||
      String(r["Product Name"]).toLowerCase().includes(term) ||
      String(r["Brand"]).toLowerCase().includes(term) ||
      String(r["Category"]).toLowerCase().includes(term);

    const matchesStatus = 
      statusFilter === "ALL" || 
      String(r["Status"]).toUpperCase() === statusFilter ||
      String(r["Commerce Readiness"]).toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Preview pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOutputRows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOutputRows.length / itemsPerPage);

  // Steps indicator configuration
  const steps = [
    { num: 1, label: "Upload" },
    { num: 2, label: "Validate Input" },
    { num: 3, label: "AI Enrichment" },
    { num: 4, label: "Output Preview" },
    { num: 5, label: "Download Output" }
  ];

  return (
    <div style={{ animation: "fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Compliance & Validation Center</h1>
          <p className="page-subtitle">Dynamic 5-step industrial catalog ingestion, AI data enrichment, and exact schema compliance</p>
        </div>
        {file && (
          <button className="btn-secondary" onClick={handleReset} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={14} /> Start Over
          </button>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", alignItems: "center" }}>
          {/* Connector Line */}
          <div style={{ 
            position: "absolute", 
            top: 20, 
            left: "5%", 
            right: "5%", 
            height: 2, 
            background: "rgba(255,255,255,0.06)", 
            zIndex: 1 
          }} />
          
          {/* Active Connector Line Glow */}
          <div style={{ 
            position: "absolute", 
            top: 20, 
            left: "5%", 
            width: `${((step - 1) / (steps.length - 1)) * 90}%`, 
            height: 2, 
            background: "linear-gradient(90deg, #22D3EE, #8B5CF6)", 
            zIndex: 2,
            transition: "width 0.4s ease"
          }} />

          {steps.map((s) => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;
            return (
              <div key={s.num} style={{ 
                zIndex: 3, 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                width: "16%",
                cursor: s.num <= step ? "pointer" : "not-allowed"
              }}
              onClick={() => s.num < step && setStep(s.num as Step)}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isCompleted ? "rgba(34,197,94,0.15)" : isActive ? "rgba(34,211,238,0.15)" : "rgba(16,38,61,0.8)",
                  border: isCompleted ? "2px solid #22C55E" : isActive ? "2px solid #22D3EE" : "2px solid rgba(255,255,255,0.08)",
                  boxShadow: isActive ? "0 0 15px rgba(34,211,238,0.4)" : isCompleted ? "0 0 10px rgba(34,197,94,0.2)" : "none",
                  color: isCompleted ? "#22C55E" : isActive ? "#22D3EE" : "#64748B",
                  fontWeight: 700,
                  fontSize: 14,
                  transition: "all 0.3s ease"
                }}>
                  {isCompleted ? <Check size={18} /> : s.num}
                </div>
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: isActive ? 700 : 500, 
                  color: isActive ? "#22D3EE" : isCompleted ? "#22C55E" : "#64748B",
                  marginTop: 8,
                  textAlign: "center",
                  whiteSpace: "nowrap"
                }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: UPLOAD INPUT */}
      {step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("filePicker")?.click()}
              style={{
                border: dragging ? "2px dashed #22D3EE" : "2px dashed rgba(59,130,246,0.3)",
                borderRadius: 16,
                padding: "60px 40px",
                textAlign: "center",
                background: dragging ? "rgba(34,211,238,0.04)" : "rgba(16,38,61,0.3)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: dragging ? "0 0 30px rgba(34,211,238,0.15)" : "none",
              }}
            >
              <input id="filePicker" type="file" style={{ display: "none" }} accept=".csv,.xlsx" onChange={handleFileChange} />
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyItems: "center", display: "flex", justifyContent: "center", margin: "0 auto 20px" }}>
                <UploadCloud size={32} color={dragging ? "#22D3EE" : "#3B82F6"} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>Drag & drop dataset file here</h2>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>Supports industrial inventory lists in CSV or Excel (.xlsx) formats</p>
              <button className="btn-primary" type="button" onClick={(e) => { e.stopPropagation(); document.getElementById("filePicker")?.click(); }}>
                Browse Files
              </button>
            </div>

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>OR USE DEMO DATASET</div>
              <button className="btn-secondary" onClick={loadDemoCatalog} style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.3)", color: "#C084FC" }}>
                <Zap size={14} /> Load 15-Product Industrial Test Catalog
              </button>
            </div>
          </div>

          <div>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#F8FAFC", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Layers size={16} color="#3B82F6" /> Compliance Instructions
              </h3>
              <ul style={{ paddingLeft: 16, margin: 0, fontSize: 13, color: "#94A3B8", display: "flex", flexDirection: "column", gap: 10 }}>
                <li>Upload raw CSV/XLSX lists of components.</li>
                <li>The system will dynamically detect structures and map columns using aliases.</li>
                <li>Enrichment extracts properties, checks standardizations, and runs quality scores.</li>
                <li>Output downloads will strictly conform to the 9 Expected Output headers required.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: VALIDATE INPUT */}
      {step === 2 && validationResult && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 className="section-title"><ShieldCheck size={18} color="#22D3EE" /> Input Ingestion Summary</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "rgba(16,38,61,0.4)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>FILE INFORMATION</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={file?.name}>{file?.name}</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{file?.size} · {file?.isXlsx ? "Excel Worksheet" : "CSV Document"}</div>
              </div>
              <div style={{ background: "rgba(16,38,61,0.4)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>DIMENSIONS</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", marginTop: 4 }}>{validationResult.totalRowsDetected} Rows × {validationResult.columnCount} Columns</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Detected {headers.length} valid headers</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#22C55E" }}>{validationResult.validRows}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 4 }}>VALID ROWS</div>
              </div>
              <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#F59E0B" }}>{validationResult.rowsWithWarnings}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 4 }}>WARNING ROWS</div>
              </div>
              <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#EF4444" }}>{validationResult.blockingErrors}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 4 }}>BLOCKING ERRORS</div>
              </div>
            </div>

            {/* Warnings or Errors Logs */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#F8FAFC", marginBottom: 12 }}>Validation Report</h3>
              {validationResult.errors.length === 0 && validationResult.warnings.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#22C55E", fontSize: 13, background: "rgba(34,197,94,0.08)", padding: 12, borderRadius: 8 }}>
                  <CheckCircle2 size={16} /> Structure conforms perfectly. Ready for ontological enrichment.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto", paddingRight: 8 }}>
                  {validationResult.errors.map((e, idx) => (
                    <div key={`err-${idx}`} style={{ display: "flex", gap: 8, color: "#EF4444", fontSize: 12, background: "rgba(239,68,68,0.06)", padding: 10, borderRadius: 8 }}>
                      <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{e.message}</span>
                    </div>
                  ))}
                  {validationResult.warnings.map((w, idx) => (
                    <div key={`warn-${idx}`} style={{ display: "flex", gap: 8, color: "#F59E0B", fontSize: 12, background: "rgba(245,158,11,0.06)", padding: 10, borderRadius: 8 }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{w.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 18 }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>
                <ChevronLeft size={16} /> Back to Upload
              </button>
              <button 
                className="btn-primary" 
                disabled={validationResult.blockingErrors > 0}
                onClick={() => setStep(3)}
              >
                Proceed to Enrichment <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div>
            <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", marginBottom: 12 }}>Ingested Columns ({headers.length})</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {headers.map(h => (
                  <span key={h} style={{ fontSize: 11, fontFamily: "monospace", padding: "4px 8px", background: "rgba(16,38,61,0.6)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6, color: "#94A3B8" }}>{h}</span>
                ))}
              </div>
            </div>
            
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", marginBottom: 10 }}>Validation Thresholds</h3>
              <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5, margin: 0 }}>
                Warnings do not block the pipeline. Empty cells, missing details, or mismatched formatting will be resolved automatically using ontological intelligence and standard values during Step 3.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PRODUCT/AI ENRICHMENT */}
      {step === 3 && (
        <div style={{ maxWidth: 640, margin: "20px auto 0" }} className="glass-card">
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Cpu size={32} color="#22D3EE" style={{ animation: enrichmentRunning ? "spin 3s linear infinite" : "none" }} />
            </div>
            
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>AI & Ontological Enrichment</h2>
            <p style={{ fontSize: 13, color: "#64748B", maxWidth: 460, margin: "0 auto 24px", lineHeight: 1.5 }}>
              Executes ISO/IEC standardization, catalog description mapping, and quality scoring row by row. All operations run deterministically on the client to preserve confidentiality.
            </p>

            {enrichmentRunning ? (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#94A3B8" }}>
                    {progress?.stage}: <strong style={{ color: "#F8FAFC" }}>{progress?.currentProduct}</strong>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#22D3EE", fontFamily: "monospace" }}>
                    {progress?.processed} / {progress?.total} ({Math.round(((progress?.processed || 0) / (progress?.total || 1)) * 100)}%)
                  </span>
                </div>
                
                {/* Progress Bar Track */}
                <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
                  <div style={{ 
                    height: "100%", 
                    background: "linear-gradient(90deg, #22D3EE, #8B5CF6)", 
                    width: `${((progress?.processed || 0) / (progress?.total || 1)) * 100}%`,
                    transition: "width 0.1s ease"
                  }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 18 }}>
                  <div style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 11, color: "#64748B" }}>Succeeded</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#22C55E", fontFamily: "monospace" }}>{progress?.succeeded}</div>
                  </div>
                  <div style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 11, color: "#64748B" }}>Warnings</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#F59E0B", fontFamily: "monospace" }}>{progress?.warnings}</div>
                  </div>
                  <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 11, color: "#64748B" }}>Failed</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#EF4444", fontFamily: "monospace" }}>{progress?.failed}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <button className="btn-primary" onClick={handleStartEnrichment} style={{ padding: "12px 28px", fontSize: 15 }}>
                  <Zap size={16} /> Run Ingest & AI Enrichment Pipeline
                </button>
                <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <button className="btn-secondary" onClick={() => setStep(2)}>
                    <ChevronLeft size={16} /> Back to Validation Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: OUTPUT PREVIEW */}
      {step === 4 && (
        <div>
          {/* Schema validation badge */}
          {schemaValidation && (
            <div style={{ 
              background: schemaValidation.valid ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
              border: schemaValidation.valid ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
              padding: "12px 20px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {schemaValidation.valid ? <CheckCircle2 size={18} color="#22C55E" /> : <AlertCircle size={18} color="#EF4444" />}
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: schemaValidation.valid ? "#22C55E" : "#EF4444" }}>
                    OUTPUT SCHEMA VALIDATION: {schemaValidation.valid ? "PASSED" : "FAILED"}
                  </span>
                  <span style={{ fontSize: 12, color: "#94A3B8", marginLeft: 12 }}>
                    {schemaValidation.valid ? "Rows conform exactly to the 9 required Expected Output headers." : schemaValidation.errors.join(", ")}
                  </span>
                </div>
              </div>
              <span className={`badge ${schemaValidation.valid ? "badge-verified" : "badge-conflict"}`}>
                {schemaValidation.valid ? "COMPLIANT" : "NON-COMPLIANT"}
              </span>
            </div>
          )}

          {/* Filtering and search row */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 280 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={15} color="#64748B" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: 34 }} 
                  placeholder="Search mapped output catalog..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <select 
                className="select-field" 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="ALL">All Statuses</option>
                <option value="READY">Ready</option>
                <option value="REVIEW">Needs Review</option>
                <option value="CONFLICT">Conflict</option>
                <option value="COMMERCE READY">Commerce Ready</option>
                <option value="INCOMPLETE">Incomplete</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-secondary" onClick={() => setStep(3)}>
                <ChevronLeft size={16} /> Back to Ingestion
              </button>
              <button className="btn-primary" onClick={() => setStep(5)}>
                Proceed to Export <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Output Preview Grid */}
          <div className="glass-card" style={{ overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", display: "flex", alignItems: "center", gap: 6 }}>
                <Table2 size={15} color="#3B82F6" /> Mapped Expected Schema Preview
              </span>
              <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                Showing {filteredOutputRows.length > 0 ? indexOfFirstItem + 1 : 0}–{Math.min(indexOfLastItem, filteredOutputRows.length)} of {filteredOutputRows.length} rows
              </span>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                    {EXPECTED_OUTPUT_HEADERS.map(h => (
                      <th key={h} style={{ padding: "12px 18px", textAlign: "left", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        {EXPECTED_OUTPUT_HEADERS.map(h => {
                          const val = row[h];
                          let color = "#F8FAFC";
                          if (h === "Part Number") color = "#38BDF8";
                          if (h === "Status" || h === "Commerce Readiness") {
                            const isOk = String(val).toUpperCase() === "READY" || String(val).toUpperCase() === "COMMERCE READY";
                            color = isOk ? "#4ADE80" : "#F59E0B";
                          }
                          return (
                            <td key={h} style={{ padding: "12px 18px", color, fontWeight: h === "Part Number" || h === "Quality Score" ? 600 : 400, fontFamily: h === "Part Number" || h === "Last Updated" ? "monospace" : "inherit", whiteSpace: "nowrap" }}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={EXPECTED_OUTPUT_HEADERS.length} style={{ padding: 40, textAlign: "center", color: "#64748B" }}>
                        No matching output rows found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                <button 
                  className="btn-secondary" 
                  style={{ padding: "5px 12px", fontSize: 12 }} 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
                <span style={{ fontSize: 12, color: "#64748B" }}>Page {currentPage} of {totalPages}</span>
                <button 
                  className="btn-secondary" 
                  style={{ padding: "5px 12px", fontSize: 12 }} 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 5: DOWNLOAD OUTPUT */}
      {step === 5 && (
        <div style={{ maxWidth: 640, margin: "20px auto 0" }}>
          <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <ShieldCheck size={32} color="#22C55E" />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>Export Catalog</h2>
            <p style={{ fontSize: 13, color: "#64748B", maxWidth: 440, margin: "0 auto 28px", lineHeight: 1.5 }}>
              The output files are generated matching the exact 9 Expected Output headers required. Choose between CSV and Microsoft Excel (.xlsx) formats.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              {/* CSV Download Card */}
              <div 
                className="glass-card" 
                style={{ 
                  padding: 24, 
                  textAlign: "left", 
                  border: "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
                onClick={handleDownloadCSV}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Table2 size={16} color="#22C55E" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>CSV File</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>RFC-4180 Format</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 16px", lineHeight: 1.4 }}>Comma-delimited format suitable for system integration and data loading.</p>
                <button className="btn-success" style={{ width: "100%", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); handleDownloadCSV(); }}>
                  <Download size={13} /> Download CSV
                </button>
              </div>

              {/* XLSX Download Card */}
              <div 
                className="glass-card" 
                style={{ 
                  padding: 24, 
                  textAlign: "left", 
                  border: "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
                onClick={handleDownloadXLSX}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={16} color="#C084FC" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>Excel Worksheet</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>SpreadsheetML Format</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 16px", lineHeight: 1.4 }}>Styled spreadsheet with formatted headers and auto-adjusted column widths.</p>
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); handleDownloadXLSX(); }}>
                  <Download size={13} /> Download Excel
                </button>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
              <button className="btn-secondary" onClick={() => setStep(4)}>
                <ChevronLeft size={16} /> Back to Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
