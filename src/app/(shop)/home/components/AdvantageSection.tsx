"use client";

import React from "react";
import { Zap, Store, ShoppingBag, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/Header";

export const AdvantageSection: React.FC = () => {
  const t = useTranslations("home.advantage");

  const advantages = [
    {
      icon: Zap,
      title: t("convenient.title"),
      description: t("convenient.description"),
      bgColor: "bg-rose-50",
      iconColor: "text-[#D81B60]",
    },
    {
      icon: Store,
      title: t("network.title"),
      description: t("network.description"),
      bgColor: "bg-rose-50",
      iconColor: "text-[#D81B60]",
    },
    {
      icon: ShoppingBag,
      title: t("easyOrdering.title"),
      description: t("easyOrdering.description"),
      bgColor: "bg-rose-50",
      iconColor: "text-[#D81B60]",
    },
    {
      icon: ShieldCheck,
      title: t("freshEssentials.title"),
      description: t("freshEssentials.description"),
      bgColor: "bg-rose-50",
      iconColor: "text-[#D81B60]",
    },
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-200/60 py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Header
          badge={t("badge")}
          headingTag="h2"
          size="lg"
          align="center"
          className="max-w-2xl mx-auto mb-10"
          title={t("title")}
          description={t("description")}
        />

        {/* Advantage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {advantages.map((adv) => {
            const IconComponent = adv.icon;
            return (
              <div
                key={adv.title}
                className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col items-start text-left group hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 sm:block w-full">
                  <div
                    className={`w-12 h-12 rounded-2xl ${adv.bgColor} flex items-center justify-center shrink-0 mb-0 sm:mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent className={`w-6 h-6 ${adv.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mb-1 sm:mb-2">
                      {adv.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {adv.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
