"use client";

import React from "react";
import { CreditCard, Gift, ShieldAlert, ArrowRight, Wallet, Percent } from "lucide-react";

export const PromoBankBanner: React.FC = () => {
  const bankOffers = [
    {
      bank: "HNB Cardholder Special",
      offer: "15% Extra Discount",
      desc: "Every Tuesday & Thursday on minimum cart value of LKR 5,000.",
      bgGradient: "from-blue-700 via-indigo-800 to-slate-900",
      code: "HNBCARD15",
    },
    {
      bank: "Sampath Bank Credit Cards",
      offer: "LKR 750 Instant Cashback",
      desc: "Valid on all weekend fresh produce & dairy purchases over LKR 6,000.",
      bgGradient: "from-orange-600 via-amber-700 to-slate-900",
      code: "SAMPATHWEEKEND",
    },
    {
      bank: "Koko Buy Now Pay Later",
      offer: "3 Interest-Free Installments",
      desc: "Split your bill into 3 equal monthly payments with zero hidden fees.",
      bgGradient: "from-purple-700 via-pink-700 to-slate-900",
      code: "NO CODE NEEDED",
    },
  ];

  return (
    <section className="mb-14">
      {/* Section Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-[#D81B60]" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Partner Bank & Payment Offers
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Combine bank card offers with SriBees store coupons for double savings at checkout!
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bankOffers.map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.bgGradient} rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group transform hover:-translate-y-1 transition-all duration-300 border border-white/10`}
          >
            {/* Background pattern */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/30">
                  {card.bank}
                </span>
                <Wallet className="w-5 h-5 text-amber-300" />
              </div>

              <h3 className="text-xl font-black text-amber-300 tracking-tight leading-tight mb-2">
                {card.offer}
              </h3>
              <p className="text-xs text-white/80 font-medium leading-relaxed mb-4">
                {card.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono font-bold text-white/90">
                PROMO: <strong className="text-amber-300 underline">{card.code}</strong>
              </span>
              <span className="text-amber-300 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Claim Offer <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
