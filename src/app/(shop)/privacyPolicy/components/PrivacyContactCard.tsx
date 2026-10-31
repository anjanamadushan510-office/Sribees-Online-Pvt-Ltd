"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, Settings, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const PrivacyContactCard: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Customer Support & Privacy Desk</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
            Questions about your privacy or payments?
          </h3>
          <p className="text-xs text-slate-300 font-normal leading-relaxed">
            Our support team is available 7 days a week to help with your account details, payments, or security inquiries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:support@sribeesonline.com"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-rose-400" />
            <span>support@sribeesonline.com</span>
          </a>
          <Link
            href="/accountSettings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-extrabold transition-all shadow-sm cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Manage My Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
