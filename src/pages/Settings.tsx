import { useState, useEffect } from "react";
import { Save, Bell, Cpu, Shield } from "lucide-react";

interface ToggleProps { value: boolean; onChange: (v: boolean) => void; }
function Toggle({ value, onChange }: ToggleProps) {
  const bg = value ? "linear-gradient(135deg,#2563EB,#8B5CF6)" : "rgba(16,38,61,0.8)";
  const bd = value ? "none" : "1px solid rgba(255,255,255,0.12)";
  return (
    <button onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: bg, border: bd, cursor: "pointer", position: "relative", transition: "all 0.25s ease", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: value ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.25s ease", display: "block" }} />
    </button>
  );
}

interface SliderProps { value: number; min: number; max: number; onChange: (v: number) => void; }
function Slider({ value, min, max, onChange }: SliderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} style={{ flex: 1, accentColor: "#3B82F6", cursor: "pointer" }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", fontFamily: "monospace", minWidth: 36 }}>{value}%</span>
    </div>
  );
}

interface SectionCardProps { title: string; icon: React.ElementType; color: string; children: React.ReactNode; }
function SectionCard({ title, icon: Icon, color, children }: SectionCardProps) {
  const bg = color + "18";
  const bd = "1px solid " + color + "33";
  return (
    <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: bg, border: bd, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color} />
        </div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

interface RowProps { label: string; desc?: string; control: React.ReactNode; }
function Row({ label, desc, control }: RowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#F8FAFC" }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 24 }}>{control}</div>
    </div>
  );
}

export default function Settings() {
  const [aiProvider, setAiProvider] = useState("local");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiThreshold, setAiThreshold] = useState(85);
  const [autoEnrich, setAutoEnrich] = useState(true);
  const [autoValidate, setAutoValidate] = useState(true);
  const [conflictAlert, setConflictAlert] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProv = localStorage.getItem("prodexa_ai_provider") || "local";
    const savedKey = localStorage.getItem("prodexa_ai_key") || "";
    setAiProvider(savedProv);
    setAiApiKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem("prodexa_ai_provider", aiProvider);
    localStorage.setItem("prodexa_ai_key", aiApiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Enterprise Settings & Intelligence Config</h1>
          <p className="page-subtitle">Configure AI model providers, confidence thresholds, and catalog governance</p>
        </div>
        <button className="btn-primary" onClick={handleSave} style={{ minWidth: 130, justifyContent: "center" }}>
          {saved ? <>&#10003; Saved!</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      <SectionCard title="AI Intelligence Engine Configuration" icon={Cpu} color="#3B82F6">
        <Row
          label="AI Engine Mode"
          desc="Select between Local Deterministic Engine (Offline & Fast) or Cloud LLM Provider"
          control={
            <select
              className="select-field"
              value={aiProvider}
              onChange={e => setAiProvider(e.target.value)}
              style={{ width: 260 }}
            >
              <option value="local">Local Deterministic Engine (Active)</option>
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
              <option value="gemini">Google (Gemini 2.0 Flash)</option>
            </select>
          }
        />
        {aiProvider !== "local" && (
          <Row
            label="API Key"
            desc={`Enter API key for ${aiProvider.toUpperCase()} or configure in .env file`}
            control={
              <input
                type="password"
                className="input-field"
                placeholder="sk-..."
                value={aiApiKey}
                onChange={e => setAiApiKey(e.target.value)}
                style={{ width: 260 }}
              />
            }
          />
        )}
        <Row
          label="Minimum Confidence Threshold"
          desc="Attributes below this threshold are automatically routed to the Review Center"
          control={<div style={{ width: 220 }}><Slider value={aiThreshold} min={50} max={99} onChange={setAiThreshold} /></div>}
        />
        <Row
          label="Deterministic Normalization"
          desc="Automatically apply ISO/IEC standardization to materials, units, and threads"
          control={<Toggle value={autoEnrich} onChange={setAutoEnrich} />}
        />
        <Row
          label="Autonomous Cross-Validation"
          desc="Execute multi-source agreement checks upon ingestion"
          control={<Toggle value={autoValidate} onChange={setAutoValidate} />}
        />
      </SectionCard>

      <SectionCard title="Catalog Governance & Quality Gate" icon={Shield} color="#22D3EE">
        <Row
          label="Conflict Auto-Flagging"
          desc="Detect discrepancies between manufacturer datasheet and distributor specifications"
          control={<Toggle value={conflictAlert} onChange={setConflictAlert} />}
        />
        <Row
          label="Duplicate Part Number Normalizer"
          desc="Identify variant part numbers (hyphen vs space vs punctuation variations)"
          control={<Toggle value={true} onChange={() => {}} />}
        />
        <Row
          label="Enterprise Tenant ID"
          desc="Active organization workspace context"
          control={<code style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace" }}>ENT-PRODEXA-HACK2SKILL-2024</code>}
        />
      </SectionCard>

      <SectionCard title="Notification & Integration Channels" icon={Bell} color="#8B5CF6">
        <Row
          label="Email Alert Notifications"
          desc="Send immediate alerts when high-severity conflicts are detected"
          control={<Toggle value={emailNotifs} onChange={setEmailNotifs} />}
        />
        <Row
          label="Slack Webhook Integration"
          desc="Post pipeline completion summaries to designated channel"
          control={<Toggle value={slackNotifs} onChange={setSlackNotifs} />}
        />
      </SectionCard>
    </div>
  );
}
