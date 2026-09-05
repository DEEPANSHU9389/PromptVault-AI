import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-slide-up ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-800/60 text-rose-100 shadow-rose-950/40'
              : toast.type === 'info'
              ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-950/50'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 border-amber-800/60 text-amber-100 shadow-amber-950/40'
              : 'bg-emerald-950/90 border-emerald-800/60 text-emerald-100 shadow-emerald-950/40'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-blue-400" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
            {toast.description && (
              <p className="text-xs opacity-80 mt-1 line-clamp-2">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors shrink-0"
            aria-label="Close toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
