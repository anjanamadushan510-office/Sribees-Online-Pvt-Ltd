"use client";

import React from "react";
import Link from "next/link";
import { Truck, RefreshCw, Headphones, ArrowRight } from "lucide-react";

export const CategoryTrustBanner: React.FC = () => {
  const perks = [
    {
      icon: Truck,
      title: "SriBees Express Delivery",
      desc: "Fresh produce dispatched safely and delivered right to your doorstep.",
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: RefreshCw,
      title: "Freshness & Replacement",
      desc: "100% money-back guarantee or immediate item swap if not satisfied.",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: Headphones,
      title: "24/7 Order Hotline",
      desc: "Need custom cuts or bulky orders? Chat with our team via WhatsApp.",
      color: "text-rose-500 bg-rose-500/10",
    },
  ];

  return (
    <div className="mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#D81B60]">
            THE SRIBEES PROMISE
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Why Shop Fresh Categories with SRIBEES?
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {perks.map((perk, idx) => {
          const IconComponent = perk.icon;
          return (
            <div key={idx} className="space-y-3">
              <div
                className={`w-12 h-12 rounded-2xl ${perk.color} flex items-center justify-center`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">
                {perk.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {perk.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
