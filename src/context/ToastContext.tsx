import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, X, AlertTriangle, Info, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastColors: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",  icon: "#22C55E" },
  error:   { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",  icon: "#EF4444" },
  warning: { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)", icon: "#F59E0B" },
  info:    { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.3)", icon: "#3B82F6" },
};

const toastIcons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const c = toastColors[toast.type];
  const Icon = toastIcons[toast.type];
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 16px",
      background: "rgba(11,27,46,0.97)",
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${c.border}`,
      backdropFilter: "blur(12px)",
      minWidth: 300, maxWidth: 420,
      animation: "slideInRight 0.3s ease",
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1 }}>
        <Icon size={18} color={c.icon} />
      </div>
      <span style={{ fontSize: 13, color: "#F8FAFC", flex: 1, lineHeight: 1.5 }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#64748B", display: "flex", alignItems: "center" }}>
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (m) => addToast(m, "success"),
    error:   (m) => addToast(m, "error"),
    warning: (m) => addToast(m, "warning"),
    info:    (m) => addToast(m, "info"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, right: 24,
        display: "flex", flexDirection: "column", gap: 10,
        zIndex: 9999,
        pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: "all" }}>
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
