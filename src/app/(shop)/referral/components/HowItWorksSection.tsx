"use client";

import React from "react";
import { Share2, ShoppingBag, Wallet } from "lucide-react";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: "01",
      icon: Share2,
      title: "Share Your Code",
      description:
        "Invite your friends and family using your unique referral code or link.",
      color: "bg-rose-100 text-[#D81B60]",
    },
    {
      step: "02",
      icon: ShoppingBag,
      title: "Friends Shop & Order",
      description:
        "When your friends order groceries and essentials on SriBees, their orders generate commission for you.",
      color: "bg-amber-100 text-amber-700",
    },
    {
      step: "03",
      icon: Wallet,
      title: "Claim to Wallet",
      description:
        "Once orders pass the return window, move claimable commissions straight to your Sribees Wallet!",
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h2 className="text-xl font-black text-slate-900">How Refer & Earn Works</h2>
        <p className="text-xs text-slate-500 font-medium">
          Start earning commission in 3 quick and easy steps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.step}
              className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 space-y-3 relative flex flex-col items-center text-center group hover:bg-white hover:shadow-md transition-all"
            >
              {/* Step Badge */}
              <span className="absolute top-4 left-4 text-xs font-black text-slate-400">
                {item.step}
              </span>

              {/* Icon Circle */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-xs ${item.color}`}
              >
                <IconComp className="w-6 h-6" />
              </div>

              <h3 className="text-base font-extrabold text-slate-900">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
