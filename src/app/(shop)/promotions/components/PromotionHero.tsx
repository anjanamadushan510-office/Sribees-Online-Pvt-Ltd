"use client";

import React, { useState, useEffect } from "react";
import { Tag, Zap, Sparkles, Clock, ArrowDown, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

interface PromotionHeroProps {
  onScrollToCoupons: () => void;
  onScrollToDeals: () => void;
  totalCouponsCount: number;
  totalDealsCount: number;
}

export const PromotionHero: React.FC<PromotionHeroProps> = ({
  onScrollToCoupons,
  onScrollToDeals,
  totalCouponsCount,
  totalDealsCount,
}) => {
  const t = useTranslations("promotions");
// Live countdown timer till midnight for Today's Deals (temporarily commented out until BE support is ready)
  // const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 42, seconds: 18 });

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setTimeLeft((prev) => {
  //       if (prev.seconds > 0) {
  //         return { ...prev, seconds: prev.seconds - 1 };
  //       } else if (prev.minutes > 0) {
  //         return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
  //       } else if (prev.hours > 0) {
  //         return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
  //       }
  //       return { hours: 23, minutes: 59, seconds: 59 };
  //     });
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);

  // const formatDigit = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D81B60] via-[#C2185B] to-[#880E4F] text-white p-6 sm:p-10 mb-8 shadow-2xl shadow-rose-900/20 border border-rose-400/30">
      {/* Decorative background glow circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-black tracking-wide text-rose-100 uppercase">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            {t("hero.title")}
          </h1>

          <p className="text-sm sm:text-base text-rose-100/90 font-medium max-w-xl">
            {t("hero.desc")}
          </p>
        </div>

        {/* Right CTA Button & Guarantees */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center space-y-5">
          {/* Quick Jump Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full sm:w-auto">
            <button
              onClick={onScrollToCoupons}
              className="px-8 py-3.5 bg-white text-[#D81B60] hover:bg-rose-50 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-xl shadow-rose-950/30 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Tag className="w-4 h-4 text-[#D81B60]" />
              <span>{t("hero.viewCoupons")} ({totalCouponsCount})</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            {totalDealsCount > 0 && (
              <button
                onClick={onScrollToDeals}
                className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-amber-950/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>{t("hero.viewDeals")} ({totalDealsCount})</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 text-xs font-semibold text-rose-200/90">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Instant Coupon Redemption
            </span>
          </div>
        </div>

        {/* Right Live Deal Timer Card - Temporarily commented out until BE support is ready */}
        {/*
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center shadow-xl space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: "8s" }} />
              <span>Flash Deals Refresh Counter</span>
            </div>

            <h3 className="text-lg font-black text-white">Today's Deals Expire In</h3>

            <div className="grid grid-cols-3 gap-3 my-2">
              <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 block font-mono">
                  {formatDigit(timeLeft.hours)}
                </span>
                <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">Hours</span>
              </div>
              <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 block font-mono">
                  {formatDigit(timeLeft.minutes)}
                </span>
                <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">Mins</span>
              </div>
              <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="text-2xl sm:text-3xl font-black text-rose-400 block font-mono">
                  {formatDigit(timeLeft.seconds)}
                </span>
                <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">Secs</span>
              </div>
            </div>

            <p className="text-xs text-rose-100/80 font-medium">
              Limited stocks available! Order before timer ends to lock in flash prices.
            </p>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};
