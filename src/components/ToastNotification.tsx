import React, { useState } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, Copy, Check, X } from 'lucide-react';

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/40 flex items-start gap-3.5 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white leading-tight">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.description}</p>

            {toast.registrationCode && (
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">رمز التوثيق:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-amber-300 font-bold text-xs select-all">
                    {toast.registrationCode}
                  </span>
                  <button
                    onClick={() => handleCopyCode(toast.id, toast.registrationCode!)}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="نسخ الرمز"
                  >
                    {copiedId === toast.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
