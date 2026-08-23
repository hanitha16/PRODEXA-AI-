import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, Shield, ExternalLink, LogOut, Settings, Edit3, Check, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import authService from "../services/authService";
import { catalogStore } from "../services/catalogStore";

interface TopBarProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function TopBar({ title = "Dashboard", onMenuClick }: TopBarProps) {
  const navigate   = useNavigate();
  const { user, logout, isDemoSession } = useAuth();
  const { success } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Open conflict flagged in CB-220 Circuit Breaker (10kA vs 6kA)", time: "2m ago", dot: "#EF4444", read: false },
    { id: 2, text: "AI enrichment completed for 15 industrial products", time: "12m ago", dot: "#22C55E", read: false },
    { id: 3, text: "Duplicate group flagged for PS-100 variants", time: "25m ago", dot: "#A78BFA", read: false },
    { id: 4, text: "Export ready: Multi-sheet Excel and RFC-4180 CSV", time: "1h ago", dot: "#3B82F6", read: false },
  ]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user ? authService.getInitials(user.fullName) : "P";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    success("Signed out successfully.");
    navigate("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      setSearchQuery("");
      // Set active product if direct match found
      const match = catalogStore.getProducts().find(
        p => p.partNumber.toLowerCase() === q.toLowerCase() || p.name.toLowerCase().includes(q.toLowerCase())
      );
      if (match) {
        catalogStore.setActiveProduct(match.id);
        navigate(`/catalog/${match.id}`);
      } else {
        navigate(`/catalog?q=${encodeURIComponent(q)}`);
      }
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    success("All notifications marked as read.");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header style={{
      position: "relative",
      width: "100%",
      boxSizing: "border-box",
      height: "64px",
      background: "rgba(6,16,31,0.92)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      display: "flex", alignItems: "center",
      padding: "0 24px",
      gap: 16,
      zIndex: 99,
    }}>
      {/* Mobile Menu Toggle */}
      <button
        className="sidebar-toggle-btn"
        onClick={onMenuClick}
        style={{
          background: "none",
          border: "none",
          color: "#94A3B8",
          cursor: "pointer",
          padding: 8,
          marginRight: -4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <div className="topbar-title" style={{ fontSize: 15, fontWeight: 600, color: "#94A3B8", whiteSpace: "nowrap" }}>{title}</div>
      <div className="topbar-divider" style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />

      {/* Global Search */}
      <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: 480, position: "relative" }}>
        <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
        <input
          className="input-field"
          style={{ paddingLeft: 34, paddingRight: 72, height: 36, fontSize: 13 }}
          placeholder="Search products, part numbers (e.g. PS-100), brands..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {!searchFocused && !searchQuery && (
          <span style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            fontSize: 10, color: "#64748B", fontWeight: 600,
            background: "rgba(16,38,61,0.8)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4, padding: "2px 5px",
          }}>Enter ↵</span>
        )}
      </form>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }} ref={dropdownRef}>
        {/* DEMO SESSION Badge */}
        <div className="topbar-badge" style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 12px",
          borderRadius: 20,
          border: isDemoSession ? "1px solid rgba(34,211,238,0.4)" : "1px solid rgba(99,102,241,0.4)",
          background: isDemoSession ? "rgba(34,211,238,0.08)" : "rgba(99,102,241,0.08)",
          fontSize: 11,
          fontWeight: 700,
          color: isDemoSession ? "#22D3EE" : "#818CF8",
          letterSpacing: "0.05em",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: isDemoSession ? "#22D3EE" : "#818CF8", animation: "pulseGlow 2s ease-in-out infinite" }} />
          {isDemoSession ? "DEMO SESSION" : "PRODEXA WORKSPACE"}
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            style={{
              position: "relative", width: 36, height: 36, borderRadius: 8,
              background: notifOpen ? "rgba(99,102,241,0.12)" : "rgba(16,38,61,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            <Bell size={16} color="#94A3B8" />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: 5, right: 5, width: 8, height: 8,
                background: "#EF4444", borderRadius: "50%",
                border: "2px solid #06101F",
                animation: "pulseGlow 2s ease-in-out infinite",
              }} />
            )}
          </button>
          {notifOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 340, background: "#0B1B2E",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              padding: "12px 0", zIndex: 200,
            }}>
              <div style={{ padding: "4px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>Platform Notifications ({unreadCount} new)</span>
                <span onClick={markAllRead} style={{ fontSize: 11, color: "#6366F1", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                  <Check size={11} /> Mark all read
                </span>
              </div>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: "10px 16px", display: "flex", gap: 10, cursor: "pointer", opacity: n.read ? 0.6 : 1, transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  onClick={() => {
                    if (n.text.includes("conflict")) navigate("/review");
                    else if (n.text.includes("Export")) navigate("/exports");
                    else navigate("/catalog");
                    setNotifOpen(false);
                  }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: n.dot, flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.4 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 10px 5px 5px",
              borderRadius: 8,
              background: profileOpen ? "rgba(99,102,241,0.12)" : "rgba(16,38,61,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
            }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1 0%, #C026D3 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px",
            }}>{initials}</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#F8FAFC", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.fullName?.split(" ")[0] || "Judge"}
            </span>
            <ChevronDown size={13} color="#64748B" style={{ transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {profileOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 290, background: "#0B1B2E",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              padding: "16px", zIndex: 200,
            }}>
              {/* User info */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366F1, #C026D3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px",
                }}>{initials}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>{user?.fullName || "Product Architect"}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>{user?.email || "judge@prodexa.ai"}</div>
                  <div style={{ fontSize: 11, color: "#6366F1", marginTop: 2 }}>{user?.company || "Industrial Enterprise"}</div>
                </div>
              </div>

              {/* Account info */}
              <div style={{ marginBottom: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { icon: Shield,  label: "Tenant",      value: "ENT-PRODEXA-DEMO" },
                  { icon: Shield,  label: "Role",        value: user?.jobTitle || "Data Architect" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: "flex", gap: 8, padding: "5px 0" }}>
                    <Icon size={13} color="#64748B" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                      <div style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace" }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button style={{ width: "100%", textAlign: "left", padding: "9px 10px", display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#94A3B8" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  onClick={() => { setProfileOpen(false); navigate("/profile"); }}>
                  <Edit3 size={14} color="#64748B" /> Edit Profile <ExternalLink size={11} color="#64748B" style={{ marginLeft: "auto" }} />
                </button>
                <button style={{ width: "100%", textAlign: "left", padding: "9px 10px", display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#94A3B8" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  onClick={() => { setProfileOpen(false); navigate("/settings"); }}>
                  <Settings size={14} color="#64748B" /> Account Settings <ExternalLink size={11} color="#64748B" style={{ marginLeft: "auto" }} />
                </button>
                <button style={{ width: "100%", textAlign: "left", padding: "9px 10px", display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#EF4444" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  onClick={handleLogout}>
                  <LogOut size={14} color="#EF4444" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

