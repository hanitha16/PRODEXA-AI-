import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Search, ShieldCheck, ClipboardList, BookOpen, BarChart3, Download, Settings, ChevronRight, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import authService from "../services/authService";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",        path: "/dashboard" },
  { icon: Search,          label: "Analyze Product",  path: "/analyze" },
  { icon: ShieldCheck,     label: "Validation Center", path: "/validation" },
  { icon: ClipboardList,   label: "Review Center",    path: "/review" },
  { icon: BookOpen,        label: "Product Catalog",   path: "/catalog" },
  { icon: BarChart3,       label: "Analytics",         path: "/analytics" },
  { icon: Download,        label: "Exports",           path: "/exports" },
  { icon: Settings,        label: "Settings",          path: "/settings" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { success } = useToast();

  const initials = user ? authService.getInitials(user.fullName) : "?";

  const handleLogout = () => {
    logout();
    success("Signed out successfully.");
    navigate("/login");
  };

  return (
    <aside 
      className={`app-sidebar ${isOpen ? "is-open" : ""}`}
      style={{
        background: "#06101F",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Hex logo mini */}
          <div style={{ width: 36, height: 36, flexShrink: 0 }}>
            <svg width="36" height="36" viewBox="0 0 90 90" fill="none">
              <defs>
                <linearGradient id="sbLogoGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#C026D3"/>
                  <stop offset="100%" stopColor="#3B82F6"/>
                </linearGradient>
              </defs>
              <polygon points="45,4 82,24 82,66 45,86 8,66 8,24" fill="rgba(79,70,229,0.15)" stroke="url(#sbLogoGrad)" strokeWidth="3"/>
              <g stroke="url(#sbLogoGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <path d="M32 38 C28 34 26 40 28 44 C24 46 24 52 28 53 C28 57 32 60 36 58 L36 38 Z"/>
                <path d="M58 38 C62 34 64 40 62 44 C66 46 66 52 62 53 C62 57 58 60 54 58 L54 38 Z"/>
                <line x1="36" y1="45" x2="54" y2="45"/>
                <line x1="36" y1="50" x2="54" y2="50"/>
              </g>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.2px" }}>PRODEXA AI</div>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Enterprise Platform</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "pulseGlow 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 10, color: "#22C55E", fontWeight: 600 }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 8px 8px" }}>Navigation</div>
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 10px",
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: "none",
              fontSize: 14, fontWeight: 500,
              color: isActive ? "#F8FAFC" : "#64748B",
              background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
              borderLeft: isActive ? "2px solid #6366F1" : "2px solid transparent",
              transition: "all 0.2s ease",
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} color={isActive ? "#6366F1" : "#64748B"} />
                <span>{label}</span>
                {isActive && <ChevronRight size={13} style={{ marginLeft: "auto", color: "#6366F1" }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px", borderRadius: 8,
          background: "rgba(16,38,61,0.5)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366F1 0%, #C026D3 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0,
            letterSpacing: "-0.5px",
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.fullName || "Guest"}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.jobTitle || "User"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => navigate("/profile")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#64748B", borderRadius: 4, display: "flex", alignItems: "center" }}
              title="Edit Profile"
            >
              <User size={14} />
            </button>
            <button
              onClick={handleLogout}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#64748B", borderRadius: 4, display: "flex", alignItems: "center" }}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
