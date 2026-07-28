"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

const colors = {
  success: { bg: "bg-green-500/15", border: "border-green-500/30", text: "text-green-400", icon: CheckCircle2 },
  error:   { bg: "bg-red-500/15",   border: "border-red-500/30",   text: "text-red-400",   icon: AlertTriangle },
  warning: { bg: "bg-yellow-500/15",border: "border-yellow-500/30",text: "text-yellow-400", icon: AlertTriangle },
  info:    { bg: "bg-blue-500/15",  border: "border-blue-500/30",  text: "text-blue-400",  icon: ShieldCheck  },
};

export function Toast({ message, type, onClose }: ToastProps) {
  const c = colors[type];
  const Icon = c.icon;
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${c.bg} ${c.border} shadow-xl max-w-sm`}
    >
      <Icon size={18} className={c.text} />
      <p className="text-sm text-white flex-1">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={14}/></button>
    </motion.div>
  );
}

// ─── Toast Container (render at bottom-right) ─────────────────────────────────
let _setToasts: any = null;
export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{id:string; message:string; type:any}>>([]);
  _setToasts = setToasts;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type}
            onClose={() => setToasts(prev => prev.filter(p => p.id !== t.id))} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function showToast(message: string, type: "success"|"error"|"warning"|"info" = "info") {
  const id = Date.now().toString();
  _setToasts?.((prev: any[]) => [...prev, { id, message, type }]);
}
