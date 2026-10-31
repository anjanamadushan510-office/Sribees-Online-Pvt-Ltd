"use client";

import React from "react";
import { Headphones, PhoneCall, MessageCircle } from "lucide-react";
import { useToastStore } from "@/state/toast.store";
import { useGetSupportInfo } from "@/api/queries/useAuth";
import { useTranslations } from "next-intl";

export const SecuritySupportBanner: React.FC = () => {
  const t = useTranslations("account");
  const { data: supportInfo } = useGetSupportInfo();
  const addToast = useToastStore((state) => state.addToast);

  const phoneDisplay = supportInfo?.supportPhone || "+94 11 234 5678";
  const telHref = `tel:${phoneDisplay.replace(/\s+/g, "")}`;

  const handleConciergeClick = () => {
    addToast({
      title: t("settings.conciergeToastTitle"),
      message: t("settings.conciergeToastMsg", {
        email: supportInfo?.supportEmail || "support@sribees.com",
      }),
      type: "info",
    });
  };

  return (
    <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#D81B60] rounded-3xl p-6 sm:p-8 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl shadow-rose-900/10">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner mt-0.5">
          <Headphones className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base sm:text-xl font-extrabold tracking-tight text-white leading-snug">
            {t("settings.supportTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-rose-100/90 font-medium mt-1 leading-relaxed">
            {t("settings.supportDesc")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 self-stretch sm:self-auto">
        <a
          href={telHref}
          className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm whitespace-nowrap grow sm:grow-0"
        >
          <PhoneCall className="w-4 h-4 text-[#D81B60]" />
          <span>{phoneDisplay}</span>
        </a>

        <button
          type="button"
          onClick={handleConciergeClick}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap grow sm:grow-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{t("settings.contactConcierge")}</span>
        </button>
      </div>
    </div>
  );
};
