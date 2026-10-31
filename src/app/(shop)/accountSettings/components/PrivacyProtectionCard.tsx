"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { PrivacyPolicyModal } from "./PrivacyPolicyModal";
import { useTranslations } from "next-intl";

export const PrivacyProtectionCard: React.FC = () => {
  const t = useTranslations("account");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
        <div>
          {/* Card Header */}
          <div className="flex items-start gap-3.5 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {t("settings.privacyTitle")}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t("settings.privacyDesc")}
              </p>
            </div>
          </div>

          {/* SRIBEES Data Safeguard Charter Box */}
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 my-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                {t("settings.charterTitle")}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {t("settings.charterDesc")}
            </p>
          </div>
        </div>

        {/* Read Full Policy Link */}
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-xs sm:text-sm font-bold text-[#D81B60] hover:text-[#C2185B] transition-colors flex items-center gap-1.5 cursor-pointer group"
          >
            <span>{t("settings.readPolicyLink")}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
