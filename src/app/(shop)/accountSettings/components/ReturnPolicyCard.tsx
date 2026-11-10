"use client";

import React, { useState } from "react";
import { PackageCheck, Clock, ArrowRight } from "lucide-react";
import { ReturnPolicyModal } from "./ReturnPolicyModal";
import { useTranslations } from "next-intl";

export const ReturnPolicyCard: React.FC = () => {
  const t = useTranslations("account");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start gap-3.5 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-[#D81B60] flex items-center justify-center shrink-0 shadow-2xs">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {t("returnPolicy.title")}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t("returnPolicy.cardDesc")}
              </p>
            </div>
          </div>

          <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 my-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#D81B60] shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                {t("returnPolicy.highlightTitle")}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {t("returnPolicy.highlightText")}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-xs sm:text-sm font-bold text-[#D81B60] hover:text-[#C2185B] transition-colors flex items-center gap-1.5 cursor-pointer group"
          >
            <span>{t("returnPolicy.readLink")}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <ReturnPolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
