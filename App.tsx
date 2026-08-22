import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import AuthenticatedLayout from "./components/AuthenticatedLayout";

// Public pages
import Splash   from "./pages/Splash";
import Login    from "./pages/Login";
import SignUp   from "./pages/SignUp";

// Authenticated pages
import Dashboard         from "./pages/Dashboard";
import AnalyzeProduct    from "./pages/AnalyzeProduct";
import ProcessingPipeline from "./pages/ProcessingPipeline";
import ExtractionResults from "./pages/ExtractionResults";
import ValidationCenter  from "./pages/ValidationCenter";
import AIEnrichment      from "./pages/AIEnrichment";
import DataQualityScore  from "./pages/DataQualityScore";
import ReviewCenter      from "./pages/ReviewCenter";
import ProductCatalog    from "./pages/ProductCatalog";
import ProductDetails    from "./pages/ProductDetails";
import Analytics         from "./pages/Analytics";
import ExportData        from "./pages/ExportData";
import Settings          from "./pages/Settings";
import Profile           from "./pages/Profile";

/** Redirect to /login if not logged in */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Redirect to /dashboard if already logged in */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<PublicOnlyRoute><Splash /></PublicOnlyRoute>} />
      <Route path="/login"  element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />

      {/* Protected authenticated shell */}
      <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/analyze"    element={<AnalyzeProduct />} />
        <Route path="/processing" element={<ProcessingPipeline />} />
        <Route path="/extraction" element={<ExtractionResults />} />
        <Route path="/validation" element={<ValidationCenter />} />
        <Route path="/enrichment" element={<AIEnrichment />} />
        <Route path="/quality"    element={<DataQualityScore />} />
        <Route path="/review"     element={<ReviewCenter />} />
        <Route path="/catalog"    element={<ProductCatalog />} />
        <Route path="/catalog/:id" element={<ProductDetails />} />
        <Route path="/analytics"  element={<Analytics />} />
        <Route path="/exports"    element={<ExportData />} />
        <Route path="/settings"   element={<Settings />} />
        <Route path="/profile"    element={<Profile />} />
        <Route path="*"           element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}
