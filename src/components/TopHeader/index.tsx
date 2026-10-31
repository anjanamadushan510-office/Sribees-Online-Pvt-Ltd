"use client";

import React from "react";
import Link from "next/link";
import { Mail, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useTranslations } from "next-intl";

export const TopHeader: React.FC = () => {
  const t = useTranslations("common");

  return (
    <div className="hidden md:block bg-[#D81B60] text-white text-xs font-medium py-1.5 px-4 shadow-xs">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-rose-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>{t("topHeader.promo")}</span>
        </div>

        <div className="flex items-center gap-4 text-rose-100 text-[11px] sm:text-xs">
          <Link href={ROUTES.COMPANY} className="hover:text-white transition-colors">
            {t("topHeader.about")}
          </Link>
          <a
            href="mailto:support@sribeesonline.com"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-amber-300" />
            <span>support@sribeesonline.com</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
