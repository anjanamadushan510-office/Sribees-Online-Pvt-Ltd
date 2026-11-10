"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";

interface PolicySection {
  title: string;
  points: string[];
}

/**
 * The Return & Refund Policy body: the branch-manager banner and every
 * numbered section, in the visitor's language. Shared by the account
 * settings modal and the public /returnPolicy page so they never drift.
 * Text lives in locales/<lang>/account.json under `returnPolicy`.
 */
export const ReturnPolicySections: React.FC = () => {
  const t = useTranslations("account");
  const raw = t.raw("returnPolicy.sections");
  const sections: PolicySection[] = Array.isArray(raw) ? raw : [];

  return (
    <div className="space-y-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
      <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3">
        <UserCheck className="w-5 h-5 text-[#D81B60] shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-slate-700 font-medium">
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
  );
};
