"use client";

import React, { useState } from "react";
import { Copy, Check, Calendar, Sparkles } from "lucide-react";
import { Coupon } from "@/interfaces/promotion.interface";
import { useToastStore } from "@/state/toast.store";
import { formatLKR } from "@/utils/formatCurrency";

interface CouponCardProps {
  coupon: Coupon;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToastStore();

  const code = coupon.code;
  const description = coupon.description;
  const discountType = coupon.discount_type || coupon.discountType || "fixed";
  const discountValue = coupon.discount_value ?? coupon.discountValue ?? 0;
  const minOrderValue = coupon.min_order_value ?? coupon.minSpend ?? 0;
  const validUntil = coupon.valid_until || coupon.validUntil || "";

  // Format valid until ISO date string
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Limited time";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    addToast({
      title: "Coupon Code Copied!",
      message: `Code "${code}" copied to clipboard. Use it at checkout for instant savings!`,
      type: "success",
      duration: 3000,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  // Discount Badge Label
  const renderDiscountBadge = () => {
    if (discountType === "percentage") {
      return `${discountValue}% OFF`;
    }
    if (discountType === "free_shipping") {
      return "FREE SHIPPING";
    }
    return `Rs. ${discountValue.toLocaleString()} OFF`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 hover:border-rose-300 p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group transform hover:-translate-y-1">
      <div>
        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border bg-rose-50 text-[#D81B60] border-rose-200 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#D81B60]" />
            {renderDiscountBadge()}
          </span>

          {minOrderValue > 0 && (
            <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Min Order: {formatLKR(minOrderValue)}
            </span>
          )}
        </div>

        {/* Main Code & Description */}
        <div className="space-y-1.5 mb-4">
          <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#D81B60] transition-colors">
            {code}
          </h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div>
        {/* Coupon Code Ticket Container */}
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-3 flex items-center justify-between gap-3 mb-4 relative overflow-hidden">
          {/* Ticket notch cutouts */}
          <div className="w-3 h-6 bg-white border border-slate-200 border-l-0 rounded-r-full absolute left-0 top-1/2 -translate-y-1/2" />
          <div className="w-3 h-6 bg-white border border-slate-200 border-r-0 rounded-l-full absolute right-0 top-1/2 -translate-y-1/2" />

          <div className="pl-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              COUPON CODE
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-slate-900 tracking-wider">
              {code}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 ${
              copied
                ? "bg-emerald-600 text-white scale-105"
                : "bg-[#D81B60] hover:bg-[#C2185B] text-white active:scale-95"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Info & Expiry */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Valid until {formatDate(validUntil)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
