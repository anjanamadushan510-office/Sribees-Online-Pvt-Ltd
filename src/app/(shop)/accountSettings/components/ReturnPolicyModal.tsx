"use client";

import React, { useEffect } from "react";
import { X, PackageCheck, UserCheck, Check } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslations } from "next-intl";

interface ReturnPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PolicySection {
  title: string;
  points: string[];
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

  // Every section and point comes from locales/<lang>/account.json, so the
  // three languages always carry the same policy.
  const raw = t.raw("returnPolicy.sections");
  const sections: PolicySection[] = Array.isArray(raw) ? raw : [];

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

        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-[#D81B60] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 font-medium">
              {t("returnPolicy.banner")}
            </p>
          </div>

          {sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-[#D81B60] text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {section.title}
              </h3>
              <ul className="list-disc pl-12 space-y-1">
                {(section.points ?? []).map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
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
