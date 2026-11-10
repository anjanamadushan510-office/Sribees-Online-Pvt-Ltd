import React from "react";
import type { Metadata } from "next";
import { PackageCheck, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ReturnPolicySections } from "@/components/ReturnPolicy/ReturnPolicySections";

export const metadata: Metadata = {
  title: "Return & Refund Policy | SRIBEES Online",
  description:
    "When and how you can return a SRIBEES Online order, who approves it, and how refunds reach your Sribees Wallet.",
};

export default async function ReturnPolicyPage() {
  const t = await getTranslations("account");

  return (
    <main className="flex-1 max-w-[900px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-[#D81B60] flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {t("returnPolicy.title")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {t("returnPolicy.modalSubtitle")}
            </p>
          </div>
        </div>

        <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#D81B60] shrink-0" />
            <h2 className="text-sm font-bold text-slate-900">
              {t("returnPolicy.highlightTitle")}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t("returnPolicy.highlightText")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <ReturnPolicySections />
      </div>
    </main>
  );
}
