import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import authService from "../services/authService";
import { X, ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react";

function HexBrainLogo({ size = 52 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      filter: "drop-shadow(0 0 10px #6366F1) drop-shadow(0 0 24px #4F46E5)",
    }}>
      <svg width={size} height={size} viewBox="0 0 90 90" fill="none">
        <defs>
          <linearGradient id="lHexGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C026D3" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <polygon points="45,4 82,24 82,66 45,86 8,66 8,24" fill="rgba(79,70,229,0.1)" stroke="url(#lHexGrad)" strokeWidth="2.5" />
        <polygon points="45,12 74,28 74,62 45,78 16,62 16,28" fill="rgba(99,102,241,0.05)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
        <g stroke="url(#lHexGrad)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 38 C28 34 26 40 28 44 C24 46 24 52 28 53 C28 57 32 60 36 58 L36 38 Z" />
          <path d="M58 38 C62 34 64 40 62 44 C66 46 66 52 62 53 C62 57 58 60 54 58 L54 38 Z" />
          <line x1="36" y1="45" x2="54" y2="45" /><line x1="36" y1="50" x2="54" y2="50" />
          <circle cx="36" cy="38" r="2" fill="#C026D3" stroke="none" />
          <circle cx="54" cy="38" r="2" fill="#3B82F6" stroke="none" />
          <circle cx="45" cy="35" r="1.5" fill="#7C3AED" stroke="none" />
          <line x1="36" y1="38" x2="45" y2="35" /><line x1="54" y1="38" x2="45" y2="35" />
          <line x1="45" y1="35" x2="45" y2="30" />
          <circle cx="45" cy="29" r="1.5" fill="#EC4899" stroke="none" />
        </g>
      </svg>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, loginDemoSession, resetPassword: authResetPassword } = useAuth();
  const { success, error: showError } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  
  // Modals
  const [oauthModal, setOauthModal] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetDone, setResetDone] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const saved = authService.getSavedAccount();
    if (saved) {
      setEmail(saved);
    } else {
      // Default demo judge credentials
      setEmail("judge@prodexa.ai");
      setPassword("prodexa2024");
    }
  }, []);

  // Blue + Violet Background Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.5 + 0.15,
      color: Math.random() > 0.6 ? "59,130,246" : "99,102,241",
    }));

    let t = 0, frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const lg1 = ctx.createRadialGradient(0, canvas.height * 0.5, 0, 0, canvas.height * 0.5, canvas.width * 0.45);
      lg1.addColorStop(0, "rgba(99,102,241,0.18)");
      lg1.addColorStop(1, "transparent");
      ctx.fillStyle = lg1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const lg2 = ctx.createRadialGradient(canvas.width, canvas.height * 0.5, 0, canvas.width, canvas.height * 0.5, canvas.width * 0.4);
      lg2.addColorStop(0, "rgba(59,130,246,0.14)");
      lg2.addColorStop(1, "transparent");
      ctx.fillStyle = lg2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const waveConfigs = [
        { oy: 0.35, amp: 70, freq: 0.009, spd: 0.4, col: "rgba(59,130,246,0.09)" },
        { oy: 0.55, amp: 55, freq: 0.013, spd: 0.6, col: "rgba(99,102,241,0.08)" },
        { oy: 0.7, amp: 90, freq: 0.007, spd: 0.25, col: "rgba(79,70,229,0.07)" },
        { oy: 0.85, amp: 45, freq: 0.016, spd: 0.8, col: "rgba(139,92,246,0.06)" },
      ];
      waveConfigs.forEach(w => {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = canvas.height * w.oy + Math.sin(x * w.freq + t * w.spd) * w.amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = w.col;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
        if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });

      t += 0.012;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Work email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    await new Promise(r => setTimeout(r, 400));

    const err = login(email, password, remember);
    setLoading(false);

    if (err) {
      setErrors({ general: err });
      showError(err);
    } else {
      success("Welcome to PRODEXA AI! Logging in...");
      navigate("/dashboard");
    }
  };

  const handleSocialClick = (provider: string) => {
    setOauthModal(provider);
  };

  const handleContinueDemoOAuth = () => {
    if (!oauthModal) return;
    loginDemoSession(oauthModal);
    success(`Signed in via ${oauthModal} Demo Session!`);
    setOauthModal(null);
    navigate("/dashboard");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      showError("Please enter a valid work email.");
      return;
    }
    if (newPassword.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showError("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const err = authResetPassword(resetEmail, newPassword);
    setResetLoading(false);

    if (err) {
      showError(err);
    } else {
      setResetDone(true);
      success("Password successfully updated!");
      setTimeout(() => {
        setEmail(resetEmail);
        setPassword(newPassword);
        setForgotModal(false);
        setResetDone(false);
      }, 1200);
    }
  };

  const inputStyle = (hasErr?: boolean): React.CSSProperties => ({
    width: "100%", boxSizing: "border-box",
    padding: "12px 14px 12px 42px",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${hasErr ? "#EF4444" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 10, fontSize: 14,
    color: "#F8FAFC", fontFamily: "Inter, sans-serif",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  });

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #040B24 40%, #070D2E 70%, #020617 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden", position: "relative",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, padding: "0 20px" }}>
        {/* Logo & Branding */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <HexBrainLogo size={58} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginBottom: 4 }}>
            <span style={{ color: "#fff" }}>PRO</span><span style={{ color: "#A78BFA" }}>DEXA</span>{" "}
            <span style={{ background: "linear-gradient(90deg,#6366F1,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
          </div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Intelligent Product Data. Ready for Commerce.</div>
        </div>

        {/* Form Card */}
        <div style={{
          background: "rgba(10,15,40,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#6366F1", textAlign: "center", margin: "0 0 6px" }}>Welcome Back</h2>
          <p style={{ fontSize: 13, color: "#64748B", textAlign: "center", margin: "0 0 24px" }}>Login to your enterprise intelligence workspace</p>

          {errors.general && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#EF4444", display: "flex", alignItems: "center", gap: 8 }}>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 6 }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your work email address"
                  style={inputStyle(!!errors.email)}
                />
              </div>
              {errors.email && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>{errors.email}</div>}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8" }}>Password</label>
                <button
                  type="button"
                  onClick={() => { setForgotModal(true); setResetEmail(email); }}
                  style={{ background: "none", border: "none", color: "#818CF8", fontSize: 11, cursor: "pointer", padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748B", display: "flex", alignItems: "center" }}>
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
              {errors.password && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>{errors.password}</div>}
            </div>

            {/* Login Button */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%)",
              border: "none", borderRadius: 12,
              color: "#fff", fontSize: 16, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
              opacity: loading ? 0.8 : 1,
              transition: "all 0.25s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {loading ? "Signing in..." : "Login to Platform"}
            </button>
          </form>

          {/* Social divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 12, color: "#64748B" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { name: "Google" },
              { name: "Microsoft" },
            ].map(({ name }) => (
              <button key={name} type="button" onClick={() => handleSocialClick(name)} style={{
                padding: "10px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F8FAFC", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {name === "Google" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z" /><path fill="#00A4EF" d="M13 1h10v10H13z" /><path fill="#7FBA00" d="M1 13h10v10H1z" /><path fill="#FFB900" d="M13 13h10v10H13z" /></svg>
                )}
                {name}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748B" }}>
            Don't have an account?{" "}
            <span style={{ color: "#6366F1", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/signup")}>Sign up</span>
          </div>
        </div>
      </div>

      {/* OAuth Demo Mode Modal (Requirement 2) */}
      {oauthModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="glass-card" style={{ maxWidth: 460, width: "100%", padding: 26, border: "1px solid rgba(99,102,241,0.4)", boxShadow: "0 25px 60px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldAlert size={22} color="#F59E0B" />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", margin: 0 }}>OAuth Demo Mode</h3>
              </div>
              <button onClick={() => setOauthModal(null)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={18} /></button>
            </div>
            
            <p style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.6, marginBottom: 14 }}>
              <strong>{oauthModal} authentication is not configured for this environment.</strong>
            </p>
            
            <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5, marginBottom: 18 }}>
              To ensure judges can thoroughly evaluate all PRODEXA AI intelligence and catalog features without external SSO keys, you can launch an instant demo session.
            </p>

            <div style={{ background: "rgba(16,38,61,0.6)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20, fontSize: 12, color: "#A5B4FC" }}>
              • Environment: <code>DEVELOPMENT_PROTOTYPE</code><br />
              • SSO Tenant: <code>ENT-PRODEXA-DEMO</code><br />
              • Session Label: <code>DEMO SESSION</code>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className="btn-primary"
                onClick={handleContinueDemoOAuth}
                style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 14, fontWeight: 700 }}
              >
                CONTINUE IN DEMO MODE →
              </button>
              <button
                className="btn-secondary"
                onClick={() => setOauthModal(null)}
                style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: 13 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Demo Modal (Requirement 6) */}
      {forgotModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="glass-card" style={{ maxWidth: 440, width: "100%", padding: 26, border: "1px solid rgba(99,102,241,0.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <KeyRound size={20} color="#818CF8" />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", margin: 0 }}>Reset Password</h3>
              </div>
              <button onClick={() => setForgotModal(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#F59E0B" }}>
              Password reset email service is not configured in Demo Mode. Use the safe prototype reset flow below.
            </div>

            {resetDone ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle2 size={40} color="#22C55E" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC" }}>Password Updated!</div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Loading updated credentials...</div>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 4 }}>Work Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    style={inputStyle()}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 4 }}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    style={inputStyle()}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 4 }}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    style={inputStyle()}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={resetLoading}
                    style={{ flex: 1, justifyContent: "center", padding: "12px" }}
                  >
                    {resetLoading ? "Updating..." : "Reset Password"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setForgotModal(false)}
                    style={{ padding: "12px 18px" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

