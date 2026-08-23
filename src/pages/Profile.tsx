import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import authService from "../services/authService";
import { Save, ArrowLeft, User, Mail, Building2, Briefcase, Shield } from "lucide-react";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName]   = useState(user?.fullName   || "");
  const [email, setEmail]         = useState(user?.email       || "");
  const [company, setCompany]     = useState(user?.company     || "");
  const [jobTitle, setJobTitle]   = useState(user?.jobTitle    || "");
  const [saving, setSaving]       = useState(false);

  const initials = user ? authService.getInitials(fullName || user.fullName) : "?";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { showError("Full name is required."); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError("Enter a valid email address."); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const result = updateProfile({ fullName, email, company, jobTitle });
    setSaving(false);
    if (typeof result === "string") {
      showError(result);
    } else {
      success("Profile updated successfully! ✓");
    }
  };

  const inputWrap: React.CSSProperties = { position: "relative", marginBottom: 16 };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 6 };
  const iconPos: React.CSSProperties = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" };
  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "12px 14px 12px 44px",
    background: "rgba(16,38,61,0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, fontSize: 14, color: "#F8FAFC",
    fontFamily: "Inter, sans-serif", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const focusIn = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "#6366F1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 13, padding: 0 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 className="page-title">Edit Profile</h1>
          <p className="page-subtitle">Update your account information and preferences</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, maxWidth: 860 }}>
        {/* Avatar Card */}
        <div>
          <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1 0%, #C026D3 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 800, color: "#fff",
              margin: "0 auto 14px",
              boxShadow: "0 0 24px rgba(99,102,241,0.35)",
              letterSpacing: "-1px",
            }}>{initials}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>{fullName || user?.fullName}</div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>{email || user?.email}</div>
            <div style={{ fontSize: 11, color: "#6366F1", fontWeight: 600 }}>{jobTitle || user?.jobTitle}</div>

            <div style={{ marginTop: 20, padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Account Details</div>
              {[
                { icon: Shield, label: "Account ID",  val: user?.id?.slice(0, 16) || "—" },
                { icon: Shield, label: "Member since", val: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—" },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", textAlign: "left" }}>
                  <Icon size={12} color="#64748B" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace", wordBreak: "break-all" }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "0 0 24px" }}>Personal Information</h2>
          <form onSubmit={handleSave}>
            {/* Full Name */}
            <div style={inputWrap}>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} color="#64748B" style={iconPos} />
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            {/* Email */}
            <div style={inputWrap}>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="#64748B" style={iconPos} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            {/* Company */}
            <div style={inputWrap}>
              <label style={labelStyle}>Company / Organization</label>
              <div style={{ position: "relative" }}>
                <Building2 size={16} color="#64748B" style={iconPos} />
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Your company" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            {/* Job Title */}
            <div style={inputWrap}>
              <label style={labelStyle}>Job Title</label>
              <div style={{ position: "relative" }}>
                <Briefcase size={16} color="#64748B" style={iconPos} />
                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Your job title" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn-primary" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: 14, opacity: saving ? 0.8 : 1 }}>
                {saving
                  ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Saving...</>
                  : <><Save size={15} /> Save Changes</>
                }
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setFullName(user?.fullName || ""); setEmail(user?.email || ""); setCompany(user?.company || ""); setJobTitle(user?.jobTitle || ""); }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Discard Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
