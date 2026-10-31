'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X, ArrowRight } from 'lucide-react';
import { useToastStore, Toast } from '@/state/toast.store';
import { useCartStore } from '@/state/cart.store';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();
  const { openCart } = useCartStore();

  if (toasts.length === 0) return null;

  const getTypeStyles = (type: Toast['type'] = 'success') => {
    switch (type) {
      case 'error':
        return {
          border: 'border-rose-200/80 shadow-rose-900/10',
          iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
          titleColor: 'text-rose-600',
          Icon: AlertCircle,
          defaultTitle: 'Error',
        };
      case 'warning':
        return {
          border: 'border-amber-200/80 shadow-amber-900/10',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
          titleColor: 'text-amber-600',
          Icon: AlertTriangle,
          defaultTitle: 'Warning',
        };
      case 'info':
        return {
          border: 'border-sky-200/80 shadow-sky-900/10',
          iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
          titleColor: 'text-sky-600',
          Icon: Info,
          defaultTitle: 'Notification',
        };
      case 'success':
      default:
        return {
          border: 'border-emerald-200/80 shadow-emerald-900/10',
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          titleColor: 'text-emerald-600',
          Icon: CheckCircle,
          defaultTitle: 'Success',
        };
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const { border, iconBg, titleColor, Icon, defaultTitle } = getTypeStyles(toast.type);
        const hasAction = Boolean(toast.actionLabel || toast.onAction);

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border ${border} flex items-center gap-3 animate-slideInRight transition-all duration-300 transform hover:scale-[1.02]`}
          >
            {/* Left Icon or Product Thumbnail */}
            {toast.image ? (
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 p-1">
                <img
                  src={toast.image}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 border`}>
                <Icon className="w-5 h-5" />
              </div>
            )}

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <div className={`flex items-center gap-1.5 text-xs font-black ${titleColor} uppercase tracking-wider mb-0.5`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{toast.title || defaultTitle}</span>
              </div>
              <p className="text-xs font-bold text-slate-800 leading-snug">
                {toast.message}
              </p>

              {hasAction && (
                <div className="mt-1.5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (toast.onAction) {
                        toast.onAction();
                      } else {
                        openCart();
                      }
                      removeToast(toast.id);
                    }}
                    className="text-[11px] font-extrabold text-[#D81B60] hover:text-[#C2185B] flex items-center gap-1 transition-colors cursor-pointer group"
                  >
                    <span>{toast.actionLabel}</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
