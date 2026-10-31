"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, ShieldCheck, Lock, FileText, Check, ExternalLink } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslations } from "next-intl";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t("settings.privacyModalTitle")}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t("settings.privacyModalSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#D81B60] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 font-medium">
              {t("settings.privacyModalBanner")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D81B60]" />
              {t("settings.privacySection1Title")}
            </h3>
            <p>{t("settings.privacySection1Text")}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D81B60]" />
              {t("settings.privacySection2Title")}
            </h3>
            <p>{t("settings.privacySection2Text")}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D81B60]" />
              {t("settings.privacySection3Title")}
            </h3>
            <p>{t("settings.privacySection3Text")}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <Link
            href={ROUTES.PRIVACY_POLICY}
            onClick={onClose}
            className="text-xs font-bold text-[#D81B60] hover:text-[#C2185B] transition-colors flex items-center gap-1.5"
          >
            <span>{t("settings.viewFullPrivacyPage")}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#D81B60] hover:bg-[#C2185B] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{t("settings.agreeAndClose")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
