import React from "react";
import {
  Sparkles,
  ArrowRight,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useTranslations } from "next-intl";

export const SribeesAiBanner: React.FC = () => {
  const t = useTranslations("product");

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-8 mt-10 shadow-2xl border border-slate-800">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Column Text & Pills */}
        <div className="max-w-2xl space-y-3">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[#FF4081] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SRIBEES AI ASSISTANT • 24/7 SMART GROCERY GUIDE</span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            {t("aiBanner.title")}
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {t("aiBanner.desc")}
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 text-[11px] font-bold text-slate-300 border border-slate-700">
              <Zap className="w-3 h-3 text-rose-400" />
              Instant Cart Integration
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 text-[11px] font-bold text-slate-300 border border-slate-700">
              <MessageSquare className="w-3 h-3 text-amber-400" />
              Sinhala & English Support
            </span>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="w-full lg:w-auto flex flex-col items-stretch lg:items-end gap-3 shrink-0">
          <button className="px-6 py-3 rounded-2xl bg-[#D81B60] hover:bg-[#C2185B] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95">
            <Sparkles className="w-4 h-4 fill-white/20" />
            <span>{t("aiBanner.chatBtn")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-bold text-slate-400 flex items-center justify-center gap-2 cursor-pointer hover:border-slate-700 transition-colors">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Try: "What can I cook with Polos & Gotukola?"</span>
          </div>
        </div>
      </div>
    </div>
  );
};
