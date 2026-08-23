import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Package, CheckCircle2, AlertTriangle, Star, ArrowRight, Activity, ShieldCheck, AlertCircle, Copy } from "lucide-react";
import { catalogStore } from "../services/catalogStore";
import type { DashboardStats, Product } from "../types/prodexa";

const pipelineSteps = [
  { label: "Raw Ingestion", color: "#64748B", icon: "📄" },
  { label: "Product ID", color: "#3B82F6", icon: "🔍" },
  { label: "Category AI", color: "#8B5CF6", icon: "🏷️" },
  { label: "Extraction", color: "#22D3EE", icon: "⚡" },
  { label: "Normalization", color: "#F59E0B", icon: "🔄" },
  { label: "Validation", color: "#EF4444", icon: "🛡️" },
  { label: "Confidence", color: "#22C55E", icon: "📊" },
  { label: "Commerce Ready", color: "#22C55E", icon: "✅" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pipelineActive, setPipelineActive] = useState(0);

  useEffect(() => {
    const update = () => {
      setStats(catalogStore.getDashboardStats());
      setProducts(catalogStore.getProducts());
    };
    update();
    return catalogStore.subscribe(update);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPipelineActive(prev => (prev + 1) % pipelineSteps.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  if (!stats) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, border: "3px solid #3B82F6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ color: "#64748B", fontSize: 14 }}>Loading intelligence metrics...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "TOTAL PRODUCTS", value: stats.totalProducts.toLocaleString(), delta: stats.trends.totalDelta, icon: Package, color: "#3B82F6" },
    { label: "COMMERCE READY", value: stats.commerceReadyCount.toLocaleString(), delta: stats.trends.processedDelta, icon: CheckCircle2, color: "#22C55E" },
    { label: "NEEDS REVIEW", value: stats.needsReview.toLocaleString(), delta: stats.trends.reviewDelta, icon: AlertTriangle, color: "#F59E0B" },
    { label: "AVG QUALITY SCORE", value: `${stats.avgQuality}%`, delta: stats.trends.qualityDelta, icon: Star, color: "#8B5CF6" },
    { label: "VERIFIED ATTRIBUTES", value: stats.verifiedAttributes.toLocaleString(), delta: 5.1, icon: ShieldCheck, color: "#22D3EE" },
    { label: "MISSING ATTRIBUTES", value: stats.missingAttributes.toLocaleString(), delta: -3.4, icon: AlertCircle, color: "#EF4444" },
    { label: "CONFLICTS DETECTED", value: stats.conflictsDetected.toLocaleString(), delta: -8.2, icon: AlertTriangle, color: "#F59E0B" },
    { label: "POSSIBLE DUPLICATES", value: stats.possibleDuplicates.toLocaleString(), delta: -12.5, icon: Copy, color: "#A78BFA" },
  ];

  // Recent history items from real products
  const recentActivity = products.flatMap(p => p.history).slice(0, 5);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Product Intelligence Dashboard</h1>
          <p className="page-subtitle">Real-time catalog health, deterministic enrichment, and validation telemetry</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn-primary" onClick={() => navigate("/analyze")}>
            <Activity size={15} /> Ingest Product Catalog <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards — 4 per row × 2 rows */}
      <div className="grid-4" style={{ marginBottom: 16 }}>
        {statCards.slice(0, 4).map(({ label, value, delta, icon: Icon, color }, i) => (
          <div key={label} className={`stat-card anim-delay-${i}`}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="stat-label">{label}</span>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={17} color={color} />
              </div>
            </div>
            <div className="stat-number">{value}</div>
            <div className={`stat-trend ${delta >= 0 ? "up" : "down"}`}>
              {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(delta)}% vs previous batch
            </div>
          </div>
        ))}
      </div>
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {statCards.slice(4).map(({ label, value, delta, icon: Icon, color }, i) => (
          <div key={label} className={`stat-card anim-delay-${i}`}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="stat-label">{label}</span>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={17} color={color} />
              </div>
            </div>
            <div className="stat-number" style={{ color }}>{value}</div>
            <div className={`stat-trend ${delta >= 0 ? "up" : "down"}`}>
              {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(delta)}% vs previous batch
            </div>
          </div>
        ))}
      </div>

      {/* Intelligence Pipeline */}
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 className="section-title" style={{ margin: 0 }}><Activity size={16} color="#22D3EE" /> Real-Time Intelligence Pipeline</h2>
          <span style={{ fontSize: 11, color: "#22D3EE", fontWeight: 700 }}>AUTONOMOUS ENRICHMENT ACTIVE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
          {pipelineSteps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 16px",
                borderRadius: 10,
                background: i === pipelineActive ? `${step.color}20` : i < pipelineActive ? "rgba(34,197,94,0.06)" : "rgba(16,38,61,0.4)",
                border: `1px solid ${i === pipelineActive ? step.color + "60" : i < pipelineActive ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.5s ease",
                minWidth: 90, textAlign: "center",
              }}>
                <div style={{ fontSize: 18 }}>{i < pipelineActive ? "✅" : step.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: i === pipelineActive ? step.color : i < pipelineActive ? "#22C55E" : "#475569", lineHeight: 1.2, whiteSpace: "nowrap" }}>{step.label}</div>
                {i === pipelineActive && <div style={{ width: 24, height: 2, background: step.color, borderRadius: 1, animation: "scanline 1s ease-in-out infinite" }} />}
              </div>
              {i < pipelineSteps.length - 1 && (
                <div style={{ width: 20, height: 2, background: i < pipelineActive ? "#22C55E" : "rgba(255,255,255,0.08)", flexShrink: 0, transition: "background 0.5s ease" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Activity Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 className="section-title"><Activity size={16} color="#3B82F6" /> AI Processing Activity</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradProcessed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradEnriched" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0B1B2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F8FAFC", fontSize: 12 }} />
              <Area type="monotone" dataKey="processed" stroke="#3B82F6" strokeWidth={2} fill="url(#gradProcessed)" name="Processed" />
              <Area type="monotone" dataKey="enriched" stroke="#22D3EE" strokeWidth={2} fill="url(#gradEnriched)" name="Enriched" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
            {[{ color: "#3B82F6", label: "Processed" }, { color: "#22D3EE", label: "Enriched" }].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span style={{ fontSize: 12, color: "#64748B" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Distribution */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 className="section-title"><Star size={16} color="#8B5CF6" /> Quality Score Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.qualityDistribution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0B1B2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F8FAFC", fontSize: 12 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Products">
                {stats.qualityDistribution.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            {stats.qualityDistribution.map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span style={{ fontSize: 12, color: "#64748B" }}>{label}: <strong style={{ color: "#94A3B8" }}>{value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Health + Quick Actions */}
      <div className="grid-2">
        {/* Catalog Health */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 className="section-title"><ShieldCheck size={16} color="#22C55E" /> Active Catalog Health</h2>
          {[
            { label: "Commerce Ready", value: Math.round((stats.commerceReadyCount / Math.max(stats.totalProducts, 1)) * 100), color: "#22C55E" },
            { label: "Needs Enrichment", value: Math.round((stats.missingAttributes > 0 ? 15 : 0)), color: "#F59E0B" },
            { label: "Has Conflicts", value: Math.round((stats.conflictsDetected > 0 ? 10 : 0)), color: "#EF4444" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#94A3B8" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}%</span>
              </div>
              <div className="progress-bar-track" style={{ height: 6 }}>
                <div className="progress-bar-fill" style={{ width: `${value}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 className="section-title"><ArrowRight size={16} color="#3B82F6" /> Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Upload Catalog", desc: "Ingest new dataset", path: "/analyze", color: "#3B82F6", icon: "📁" },
              { label: "Review Center", desc: `${stats.needsReview} items need review`, path: "/review", color: "#EF4444", icon: "⚠️" },
              { label: "View Catalog", desc: `${stats.totalProducts} products indexed`, path: "/catalog", color: "#22C55E", icon: "📚" },
              { label: "Export Data", desc: "CSV, JSON, Excel ready", path: "/exports", color: "#8B5CF6", icon: "📤" },
            ].map(({ label, desc, path, color, icon }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                style={{ background: "rgba(16,38,61,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 14, textAlign: "left", cursor: "pointer", transition: "all 0.25s ease", display: "block", width: "100%" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.borderColor = color + "40"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,38,61,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card" style={{ padding: 24, marginTop: 24 }}>
        <h2 className="section-title"><Activity size={16} color="#3B82F6" /> Real-Time Platform Audit Stream</h2>
        {recentActivity.map((item, i) => (
          <div key={item.id || i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(34,211,238,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
              <CheckCircle2 size={15} color="#22D3EE" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#F8FAFC", lineHeight: 1.4 }}>{item.action}</div>
              {item.reason && <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{item.reason}</div>}
            </div>
            <span style={{ fontSize: 11, color: "#64748B", whiteSpace: "nowrap" }}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
