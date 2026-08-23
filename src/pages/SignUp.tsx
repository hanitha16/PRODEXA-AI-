import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ShieldAlert, X, Building2 } from "lucide-react";

function HexBrainLogo({ size = 52 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, filter: "drop-shadow(0 0 10px #C026D3) drop-shadow(0 0 24px #7C3AED)" }}>
      <svg width={size} height={size} viewBox="0 0 90 90" fill="none">
        <defs>
          <linearGradient id="suHexGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EC4899" /><stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <polygon points="45,4 82,24 82,66 45,86 8,66 8,24" fill="rgba(192,38,211,0.08)" stroke="url(#suHexGrad)" strokeWidth="2.5" />
        <polygon points="45,12 74,28 74,62 45,78 16,62 16,28" fill="rgba(124,58,237,0.05)" stroke="rgba(192,38,211,0.3)" strokeWidth="1" />
        <g stroke="url(#suHexGrad)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 38 C28 34 26 40 28 44 C24 46 24 52 28 53 C28 57 32 60 36 58 L36 38 Z" />
          <path d="M58 38 C62 34 64 40 62 44 C66 46 66 52 62 53 C62 57 58 60 54 58 L54 38 Z" />
          <line x1="36" y1="45" x2="54" y2="45" /><line x1="36" y1="50" x2="54" y2="50" />
          <circle cx="36" cy="38" r="2" fill="#EC4899" stroke="none" />
          <circle cx="54" cy="38" r="2" fill="#7C3AED" stroke="none" />
          <circle cx="45" cy="35" r="1.5" fill="#C026D3" stroke="none" />
          <line x1="36" y1="38" x2="45" y2="35" /><line x1="54" y1="38" x2="45" y2="35" />
          <line x1="45" y1="35" x2="45" y2="30" />
          <circle cx="45" cy="29" r="1.5" fill="#EC4899" stroke="none" />
        </g>
      </svg>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [len >= 8, hasUpper, hasLower, hasNum, hasSpecial].filter(Boolean).length;
  const label = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"][score];
  const colors = ["", "#EF4444", "#F59E0B", "#F59E0B", "#22C55E", "#22C55E"];
  if (!password) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? colors[score] : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: colors[score], fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, loginDemoSession } = useAuth();
  const { success, error: showError } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [oauthModal, setOauthModal] = useState<string | null>(null);

  // Magenta + Purple Orbital Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.5 ? "192,38,211" : Math.random() > 0.5 ? "124,58,237" : "236,72,153",
    }));

    const orbs = Array.from({ length: 4 }, (_, i) => ({
      cx: window.innerWidth * (i % 2 === 0 ? 0.1 : 0.9),
      cy: window.innerHeight * (i < 2 ? 0.3 : 0.7),
      rx: 180 + i * 40,
      ry: 100 + i * 25,
      speed: (0.2 + i * 0.08) * (i % 2 === 0 ? 1 : -1),
      color: i % 2 === 0 ? "rgba(192,38,211," : "rgba(124,58,237,",
    }));

    let t = 0, frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const lg1 = ctx.createRadialGradient(0, 0, 0, 0, 0, canvas.width * 0.55);
      lg1.addColorStop(0, "rgba(124,58,237,0.16)");
      lg1.addColorStop(1, "transparent");
      ctx.fillStyle = lg1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const lg2 = ctx.createRadialGradient(canvas.width, canvas.height, 0, canvas.width, canvas.height, canvas.width * 0.45);
      lg2.addColorStop(0, "rgba(192,38,211,0.14)");
      lg2.addColorStop(1, "transparent");
      ctx.fillStyle = lg2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      orbs.forEach(orb => {
        ctx.beginPath();
        ctx.ellipse(orb.cx, orb.cy, orb.rx, orb.ry, t * orb.speed * 0.1, 0, Math.PI * 2);
        ctx.strokeStyle = orb.color + "0.07)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx = -n.vx;
        if (n.y < 0 || n.y > canvas.height) n.vy = -n.vy;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color},${n.alpha})`;
        ctx.fill();
      });

      t += 0.015;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid work email address.";
    if (!company.trim()) e.company = "Company / Organization is required.";
    if (password.length < 6) e.password = "Password must be at least 6 characters.";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const err = signUp(fullName, email, password, company);
    setLoading(false);
    if (err) {
      if (err.includes("already exists")) setErrors({ email: err });
      else setErrors({ general: err });
      showError(err);
    } else {
      success("Account created! Welcome to PRODEXA AI 🚀");
      navigate("/dashboard");
    }
  };

  const handleContinueDemoOAuth = () => {
    if (!oauthModal) return;
    loginDemoSession(oauthModal);
    success(`Signed in via ${oauthModal} Demo Session!`);
    setOauthModal(null);
    navigate("/dashboard");
  };

  const inputStyle = (hasErr?: boolean): React.CSSProperties => ({
    width: "100%", boxSizing: "border-box",
    padding: "11px 14px 11px 42px",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${hasErr ? "#EF4444" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 10, fontSize: 13,
    color: "#F8FAFC", fontFamily: "Inter, sans-serif",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  });

  const iconStyle: React.CSSProperties = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" };

  return (
    <div style={{
      width: "100vw", minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #08041E 40%, #0C0528 70%, #020617 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden",
      position: "relative", padding: "20px 0",
    }}>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, padding: "0 20px" }}>
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <HexBrainLogo size={54} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginBottom: 4 }}>
            <span style={{ color: "#fff" }}>PRO</span><span style={{ color: "#C084FC" }}>DEXA</span>{" "}
            <span style={{ background: "linear-gradient(90deg,#C026D3,#7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
          </div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Intelligent Product Data. Ready for Commerce.</div>
        </div>

        {/* Form Card */}
        <div style={{
          background: "rgba(10,5,30,0.88)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(192,38,211,0.22)",
          borderRadius: 20, padding: "28px 28px 24px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(192,38,211,0.08)",
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#C084FC", textAlign: "center", margin: "0 0 4px" }}>Create Account</h2>
          <p style={{ fontSize: 13, color: "#64748B", textAlign: "center", margin: "0 0 20px" }}>Get started with PRODEXA AI</p>

          {errors.general && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#EF4444" }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {/* Full Name */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 4 }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" style={iconStyle}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" style={inputStyle(!!errors.fullName)} />
              </div>
              {errors.fullName && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 2 }}>{errors.fullName}</div>}
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 4 }}>Work Email</label>
              <div style={{ position: "relative" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" style={iconStyle}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" style={inputStyle(!!errors.email)} />
              </div>
              {errors.email && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 2 }}>{errors.email}</div>}
            </div>

            {/* Company / Organization */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 4 }}>Company / Organization</label>
              <div style={{ position: "relative" }}>
                <Building2 size={15} color="#64748B" style={iconStyle} />
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Acme Industrial Automation" style={inputStyle(!!errors.company)} />
              </div>
              {errors.company && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 2 }}>{errors.company}</div>}
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 4 }}>Password</label>
              <div style={{ position: "relative" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" style={iconStyle}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" style={{ ...inputStyle(!!errors.password), paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748B", display: "flex" }}>
                  {showPw ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                </button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 2 }}>{errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 4 }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" style={iconStyle}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <input type={showPw ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: 44 }} />
              </div>
              {errors.confirmPassword && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 2 }}>{errors.confirmPassword}</div>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px",
              background: "linear-gradient(135deg, #EC4899 0%, #7C3AED 60%, #6366F1 100%)",
              border: "none", borderRadius: 12,
              color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif", opacity: loading ? 0.8 : 1,
              transition: "all 0.25s ease", marginTop: 4,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Social */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 12px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 12, color: "#64748B" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {["Google", "Microsoft"].map(name => (
              <button key={name} type="button" onClick={() => setOauthModal(name)} style={{ padding: "9px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F8FAFC", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {name === "Google" ? <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z" /><path fill="#00A4EF" d="M13 1h10v10H13z" /><path fill="#7FBA00" d="M1 13h10v10H1z" /><path fill="#FFB900" d="M13 13h10v10H13z" /></svg>}
                {name}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", fontSize: 13, color: "#64748B" }}>
            Already have an account?{" "}
            <span style={{ color: "#A855F7", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/login")}>Login</span>
          </div>
        </div>
      </div>

      {oauthModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="glass-card" style={{ maxWidth: 460, width: "100%", padding: 26, border: "1px solid rgba(192,38,211,0.4)", boxShadow: "0 25px 60px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldAlert size={22} color="#C084FC" />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", margin: 0 }}>OAuth Demo Mode</h3>
              </div>
              <button onClick={() => setOauthModal(null)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.6, marginBottom: 12 }}>
              <strong>{oauthModal} authentication is not configured for this environment.</strong>
            </p>
            <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5, marginBottom: 18 }}>
              Click continue below to enter the platform instantly in Demo Mode and evaluate all enterprise product intelligence features.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="btn-primary" onClick={handleContinueDemoOAuth} style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14, fontWeight: 700 }}>
                CONTINUE IN DEMO MODE →
              </button>
              <button className="btn-secondary" onClick={() => setOauthModal(null)} style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

