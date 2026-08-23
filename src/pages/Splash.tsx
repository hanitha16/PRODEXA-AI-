import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Hex Brain Logo ────────────────────────────────────────────────────────────
function HexBrainLogo({ size = 90, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <div style={{
      width: size, height: size, position: "relative",
      filter: glow ? "drop-shadow(0 0 18px #7C3AED) drop-shadow(0 0 40px #4F46E5)" : undefined,
    }}>
      <svg width={size} height={size} viewBox="0 0 90 90" fill="none">
        <defs>
          <linearGradient id="hexGradSplash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#C026D3" />
            <stop offset="50%"  stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="brainGradSplash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#EC4899" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        <polygon points="45,4 82,24 82,66 45,86 8,66 8,24"
          fill="rgba(79,70,229,0.08)" stroke="url(#hexGradSplash)" strokeWidth="2"/>
        <polygon points="45,12 74,28 74,62 45,78 16,62 16,28"
          fill="rgba(79,70,229,0.06)" stroke="rgba(139,92,246,0.4)" strokeWidth="1"/>
        <g stroke="url(#brainGradSplash)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 38 C28 34 26 40 28 44 C24 46 24 52 28 53 C28 57 32 60 36 58 L36 38 Z"/>
          <path d="M58 38 C62 34 64 40 62 44 C66 46 66 52 62 53 C62 57 58 60 54 58 L54 38 Z"/>
          <line x1="36" y1="45" x2="54" y2="45"/>
          <line x1="36" y1="50" x2="54" y2="50"/>
          <circle cx="36" cy="38" r="2" fill="#C026D3" stroke="none"/>
          <circle cx="54" cy="38" r="2" fill="#3B82F6" stroke="none"/>
          <circle cx="45" cy="35" r="1.5" fill="#7C3AED" stroke="none"/>
          <line x1="36" y1="38" x2="45" y2="35"/>
          <line x1="54" y1="38" x2="45" y2="35"/>
          <line x1="45" y1="35" x2="45" y2="30"/>
          <circle cx="45" cy="29" r="1.5" fill="#EC4899" stroke="none"/>
        </g>
      </svg>
      {/* Orbit rings */}
      <div style={{
        position: "absolute", inset: -10, borderRadius: "50%",
        border: "1px solid rgba(124,58,237,0.5)",
        animation: "orbitSpin 8s linear infinite",
        pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", inset: -4, borderRadius: "50%",
        border: "1px dashed rgba(192,38,211,0.3)",
        animation: "orbitSpin 12s linear infinite reverse",
        pointerEvents: "none",
      }}/>
    </div>
  );
}

// ── Feature icons ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="M12 18v-6M9 15l3 3 3-3"/>
      </svg>
    ),
    label: "Upload",
    desc: "Upload product documents\nin any format",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    label: "AI Analyze",
    desc: "AI extracts and understands\nintelligent data",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    label: "Validate",
    desc: "Smart validation for\naccuracy and quality",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
        <polyline points="18 10 22 6 16 2 10 6"/>
      </svg>
    ),
    label: "Enrich & Structure",
    desc: "Enrich, standardize and\nstructure the data",
  },
];

// ── Glow config ─────────────────────────────────────────────────────────────
const GLOWS = [
  { ox: 0.15, oy: 0.5, or: 0.35, rgb: "124,58,237",  alpha: 0.12 },
  { ox: 0.85, oy: 0.5, or: 0.35, rgb: "59,130,246",  alpha: 0.10 },
  { ox: 0.5,  oy: 0.0, or: 0.30, rgb: "192,38,211",  alpha: 0.08 },
];

const WAVES = [
  { amp: 80, freq: 0.008, speed: 0.3, oy: 0.6, rgba: "rgba(124,58,237,0.08)",  lw: 3 },
  { amp: 60, freq: 0.012, speed: 0.5, oy: 0.7, rgba: "rgba(192,38,211,0.07)",  lw: 2 },
  { amp: 100,freq: 0.006, speed: 0.2, oy: 0.4, rgba: "rgba(59,130,246,0.06)",  lw: 2.5 },
  { amp: 50, freq: 0.015, speed: 0.7, oy: 0.8, rgba: "rgba(99,102,241,0.05)", lw: 1.5 },
];

// ── Main Splash Component ─────────────────────────────────────────────────────
export default function Splash() {
  const navigate = useNavigate();
  const { loginDemoSession } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const ids = [0, 300, 500, 800, 1000, 1200, 1600].map((delay, i) =>
      window.setTimeout(() => setPhase(i), delay)
    );
    return () => ids.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = canvas.getContext("2d"); } catch { return; }
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 120 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      rgb: (["99,102,241", "192,38,211", "59,130,246"] as const)[Math.floor(Math.random() * 3)],
    }));

    let t = 0;
    let frame: number;

    const draw = () => {
      try {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        GLOWS.forEach(({ ox, oy, or: r, rgb, alpha }) => {
          const cx = canvas.width * ox;
          const cy = canvas.height * oy;
          const grd = ctx!.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * r);
          grd.addColorStop(0, `rgba(${rgb},${alpha})`);
          grd.addColorStop(1, "transparent");
          ctx!.fillStyle = grd;
          ctx!.fillRect(0, 0, canvas.width, canvas.height);
        });

        WAVES.forEach(w => {
          ctx!.beginPath();
          for (let x = 0; x <= canvas.width; x += 3) {
            const y = canvas.height * w.oy + Math.sin(x * w.freq + t * w.speed) * w.amp;
            x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
          }
          ctx!.strokeStyle = w.rgba;
          ctx!.lineWidth = w.lw;
          ctx!.stroke();
        });

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width)  p.vx = -p.vx;
          if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${p.rgb},${p.alpha})`;
          ctx!.fill();
        });

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              ctx!.beginPath();
              ctx!.moveTo(particles[i].x, particles[i].y);
              ctx!.lineTo(particles[j].x, particles[j].y);
              ctx!.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 80)})`;
              ctx!.lineWidth = 0.5;
              ctx!.stroke();
            }
          }
        }

        t += 0.015;
        frame = requestAnimationFrame(draw);
      } catch {
        // Fallback safety
      }
    };

    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const vis = (minPhase: number): React.CSSProperties => ({
    opacity:   phase >= minPhase ? 1 : 0,
    transform: phase >= minPhase ? "translateY(0)" : "translateY(20px)",
    transition: "opacity 0.65s ease, transform 0.65s ease",
  });

  const handleJudgeQuickTour = () => {
    loginDemoSession("Demo");
    navigate("/dashboard");
  };

  return (
    <div style={{
      position: "relative", width: "100vw", height: "100vh",
      background: "linear-gradient(135deg,#020617 0%,#030827 40%,#080B2D 70%,#020617 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden", fontFamily: "Inter,system-ui,sans-serif",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px", maxWidth: 840 }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32, ...vis(2) }}>
          <HexBrainLogo size={100} glow />
        </div>

        {/* Title */}
        <div style={{ ...vis(3) }}>
          <h1 style={{
            fontSize: "clamp(36px,6vw,64px)", fontWeight: 900, color: "#FFFFFF",
            margin: "0 0 10px", letterSpacing: "-1px",
            textShadow: "0 0 40px rgba(124,58,237,0.5),0 0 80px rgba(99,102,241,0.3)",
          }}>
            <span style={{ color: "#FFFFFF" }}>PRO</span>
            <span style={{ color: "#A78BFA" }}>DEXA</span>{" "}
            <span style={{
              background: "linear-gradient(90deg,#6366F1,#06B6D4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>AI</span>
          </h1>
          <p style={{ fontSize: 18, color: "#94A3B8", margin: "0 0 6px", fontWeight: 400 }}>
            Intelligent Product Data. Ready for Commerce.
          </p>
        </div>

        {/* Tagline */}
        <div style={{ marginBottom: 52, ...vis(4) }}>
          <p style={{
            fontSize: 16, fontWeight: 700, letterSpacing: "0.05em",
            background: "linear-gradient(90deg,#EC4899,#A855F7,#06B6D4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0,
          }}>
            Extract. Validate. Enrich. Structure.
          </p>
        </div>

        {/* Feature icons */}
        <div style={{
          display: "flex", gap: 24, justifyContent: "center",
          marginBottom: 52, flexWrap: "wrap", ...vis(5),
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 10, width: 130,
              animation: phase >= 5 ? `fadeInUp 0.5s ease ${i * 0.1}s both` : undefined,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: "rgba(79,70,229,0.12)",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#818CF8",
                boxShadow: "0 0 20px rgba(99,102,241,0.12)",
              }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>{f.label}</div>
              <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.5, whiteSpace: "pre-line" }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", ...vis(6) }}>
          <button
            id="splash-get-started"
            onClick={() => navigate("/login")}
            style={{
              padding: "16px 44px",
              background: "linear-gradient(135deg,#EC4899 0%,#8B5CF6 50%,#3B82F6 100%)",
              border: "none", borderRadius: 50,
              color: "#fff", fontSize: 17, fontWeight: 700,
              cursor: "pointer", fontFamily: "Inter,sans-serif",
              display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 8px 32px rgba(139,92,246,0.4),0 0 0 1px rgba(255,255,255,0.08)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(139,92,246,0.6),0 0 0 1px rgba(255,255,255,0.15)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(139,92,246,0.4),0 0 0 1px rgba(255,255,255,0.08)";
            }}
          >
            Get Started
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>

          <button
            id="splash-judge-demo"
            onClick={handleJudgeQuickTour}
            style={{
              padding: "16px 36px",
              background: "rgba(16,38,61,0.7)",
              border: "1px solid rgba(34,211,238,0.4)",
              borderRadius: 50,
              color: "#22D3EE", fontSize: 16, fontWeight: 700,
              cursor: "pointer", fontFamily: "Inter,sans-serif",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 20px rgba(34,211,238,0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "rgba(34,211,238,0.12)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.background = "rgba(16,38,61,0.7)";
            }}
          >
            Judge Quick Tour →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes orbitSpin  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);   } }
        @keyframes fadeInUp   { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

