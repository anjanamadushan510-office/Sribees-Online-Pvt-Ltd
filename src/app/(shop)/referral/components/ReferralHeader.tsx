"use client";

import React from "react";
import { Gift } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Breadcrumb } from "@/components/Breadcumb";
import { useTranslations } from "next-intl";

export const ReferralHeader: React.FC = () => {
  const t = useTranslations("referral");

  return (
    <div className="mb-6 space-y-3">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "My Account", href: ROUTES.MY_ACCOUNT },
          { label: "Refer & Earn", isCurrent: true },
        ]}
      />

      {/* Main Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 p-6 rounded-3xl text-white shadow-xl shadow-rose-200/50 relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-extrabold tracking-wide uppercase">
            <Gift className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
            <span>{t("header.badge")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
            {t("header.title")}
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 font-medium max-w-xl">
            {t("header.desc")}
          </p>
        </div>
      </div>
    </div>
  );
};
