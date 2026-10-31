"use client";

import React from "react";
import { Breadcrumb } from "@/components/Breadcumb";
import { useTranslations } from "next-intl";

interface AccountHeaderProps {
  branchName?: string;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  branchName = "Colombo Central (Bambalapitiya)",
}) => {
  const t = useTranslations("account.header");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      {/* Left: Breadcrumbs */}
      <Breadcrumb items={[{ label: t("breadcrumb"), isCurrent: true }]} />

      {/* Right: Connected Branch Pill */}
      <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 bg-slate-100/90 border border-slate-200/80 rounded-full text-xs font-semibold text-slate-700 shadow-2xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>
          {t("connectedBranch")}:{" "}
          <strong className="text-slate-900 font-bold">{branchName}</strong>
        </span>
      </div>
    </div>
  );
};
