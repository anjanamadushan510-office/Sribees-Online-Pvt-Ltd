"use client";

import React, { useEffect } from "react";
import { X, LogOut, ShieldAlert, Loader2 } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslations } from "next-intl";

interface LogoutSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sessionCount: number;
  isPending?: boolean;
}

export const LogoutSessionsModal: React.FC<LogoutSessionsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sessionCount,
  isPending = false,
}) => {
  const t = useTranslations("account");
  useBodyScrollLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#D81B60] flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          {t("settings.logoutModalTitle", {
            sessionCount,
            plural: sessionCount > 1 ? "s" : "",
          })}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
          {t("settings.logoutModalDesc")}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            {t("settings.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl bg-[#D81B60] hover:bg-[#C2185B] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("settings.loggingOut")}</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>{t("settings.confirmLogout")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
