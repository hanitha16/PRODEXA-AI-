import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "../styles/theme.css";

const pageTitles: Record<string, string> = {
  "/dashboard":  "Product Intelligence Overview",
  "/analyze":    "Upload & Analyze",
  "/processing": "AI Processing Pipeline",
  "/extraction": "Extraction Results",
  "/validation": "Validation Center",
  "/enrichment": "AI Enrichment",
  "/quality":    "Data Quality Score",
  "/review":     "Review Center",
  "/catalog":    "Product Catalog",
  "/analytics":  "Catalog Analytics",
  "/exports":    "Export Center",
  "/settings":   "Enterprise Configuration",
  "/profile":    "Edit Profile",
};

export default function AuthenticatedLayout() {
  const location = useLocation();
  const pathKey = Object.keys(pageTitles).find(k => location.pathname.startsWith(k)) || "/dashboard";
  const title = pageTitles[pathKey] || "PRODEXA AI";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="authenticated-app">
      <div className="app-layout">
        {sidebarOpen && (
          <div 
            className="sidebar-mobile-overlay" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-content">
          <TopBar title={title} onMenuClick={() => setSidebarOpen(true)} />
          <main className="page-wrapper">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

