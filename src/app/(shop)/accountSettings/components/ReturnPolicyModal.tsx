"use client";

import React, { useEffect } from "react";
import { X, PackageCheck, Check } from "lucide-react";
import { ReturnPolicySections } from "@/components/ReturnPolicy/ReturnPolicySections";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslations } from "next-intl";

interface ReturnPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReturnPolicyModal: React.FC<ReturnPolicyModalProps> = ({
  isOpen,
  onClose,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-policy-title"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-[#D81B60] flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="return-policy-title"
                className="text-base sm:text-lg font-bold text-slate-900"
              >
                {t("returnPolicy.title")}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t("returnPolicy.modalSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("returnPolicy.close")}
            className="w-9 h-9 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <ReturnPolicySections />
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#D81B60] hover:bg-[#C2185B] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{t("returnPolicy.close")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
