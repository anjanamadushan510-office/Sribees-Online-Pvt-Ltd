"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ChevronRight, Lock } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const PrivacyHeader: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-md">
      {/* Background ambient accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#D81B60]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href={ROUTES.HOME} className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[#D81B60] font-bold">Privacy Policy</span>
        </nav>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Secure & Protected</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Privacy & <span className="text-[#D81B60]">Data Security</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Your trust is our top priority. We protect your personal information and ensure all payments are handled with bank-grade encryption.
          </p>
        </div>

        <p className="text-[11px] font-semibold text-slate-400 pt-1">
          Last Updated: 2026 • SRIBEES Online
        </p>
      </div>
    </div>
  );
};
