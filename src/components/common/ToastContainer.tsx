import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-crimson-600 flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-bottle-700 flex-shrink-0" />
        };

        const borders = {
          success: 'border-emerald-200 bg-white shadow-premium',
          error: 'border-crimson-200 bg-white shadow-premium',
          warning: 'border-amber-200 bg-white shadow-premium',
          info: 'border-bottle-200 bg-white shadow-premium'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-bottle-950">{toast.title}</h4>
              <p className="text-xs text-bottle-800/80 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-bottle-800/40 hover:text-bottle-950 p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
