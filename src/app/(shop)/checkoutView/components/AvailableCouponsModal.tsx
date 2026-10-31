"use client";

import React, { useState, useEffect } from "react";
import { X, Tag, ChevronRight, Ticket, Loader2 } from "lucide-react";
import { useEvaluateCoupons } from "@/api/queries/useCoupons";
import { formatLKR } from "@/utils/formatCurrency";
import { CouponCard } from "@/interfaces/coupon.interface";

interface AvailableCouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseCoupon: (code: string) => void;
  appliedCoupon?: string | null;
}

export const AvailableCouponsModal: React.FC<AvailableCouponsModalProps> = ({
  isOpen,
  onClose,
  onUseCoupon,
  appliedCoupon,
}) => {
  const { data: couponData, isLoading, refetch } = useEvaluateCoupons({
    use_cart: true,
  });

  // Refetch every time the modal opens to get fresh cart-based evaluation
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const coupons: CouponCard[] = couponData?.coupons || [];
  const eligible = coupons.filter(
    (c) => c.section === "eligible" || c.eligible,
  );
  const others = coupons.filter((c) => c.section !== "eligible" && !c.eligible);

  const handleUse = (code: string) => {
    onUseCoupon(code);
    onClose();
  };

  const getSectionBadgeStyle = (section: string) => {
    switch (section) {
      case "eligible":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "collect":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "wallet":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "locked":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[80vh] sm:max-h-[70vh] z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-[#D81B60]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                Available Coupons
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {isLoading
                  ? "Loading..."
                  : `${coupons.length} coupon${coupons.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {isLoading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-[#D81B60] animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">
                Loading your coupons...
              </p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                🎟️
              </div>
              <p className="text-sm font-extrabold text-slate-700">
                No coupons available
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                Check back later for exclusive discounts and offers.
              </p>
            </div>
          ) : (
            <>
              {/* Eligible / Ready coupons */}
              {eligible.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase px-1">
                    ✅ Ready to Use
                  </p>
                  {eligible.map((coupon) => (
                    <CouponItem
                      key={coupon.coupon_id}
                      coupon={coupon}
                      isApplied={appliedCoupon === coupon.code}
                      badgeStyle={getSectionBadgeStyle(coupon.section)}
                      onUse={handleUse}
                    />
                  ))}
                </div>
              )}

              {/* Other coupons */}
              {others.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase px-1 pt-1">
                    🔒 Other Offers
                  </p>
                  {others.map((coupon) => (
                    <CouponItem
                      key={coupon.coupon_id}
                      coupon={coupon}
                      isApplied={appliedCoupon === coupon.code}
                      badgeStyle={getSectionBadgeStyle(coupon.section)}
                      onUse={handleUse}
                      dimmed
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer drag handle (mobile) */}
        <div className="flex justify-center pb-3 pt-1 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

// ─── Coupon Card Item ───────────────────────────────────────────────────────
interface CouponItemProps {
  coupon: CouponCard;
  isApplied: boolean;
  badgeStyle: string;
  onUse: (code: string) => void;
  dimmed?: boolean;
}

const CouponItem: React.FC<CouponItemProps> = ({
  coupon,
  isApplied,
  badgeStyle,
  onUse,
  dimmed = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      className={`relative rounded-2xl border px-4 py-3.5 transition-all ${
        isApplied
          ? "border-[#D81B60] bg-rose-50/40"
          : dimmed
            ? "border-slate-200 bg-slate-50/50 opacity-70"
            : "border-slate-200 bg-white hover:border-rose-200 hover:shadow-xs"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Info */}
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
            <Tag className="w-3.5 h-3.5 text-[#D81B60]" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Code + Section badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-sm text-slate-900 tracking-wide">
                {coupon.code}
              </span>
              <span
                className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle}`}
              >
                {coupon.status?.text || coupon.section}
              </span>
            </div>

            {/* Label */}
            <p className="text-[11px] font-semibold text-slate-600 mt-0.5 leading-tight line-clamp-2">
              {coupon.label}
            </p>

            {/* Saving / Discount */}
            {coupon.saving && (
              <p className="text-[11px] font-extrabold text-emerald-600 mt-1">
                🎉 {coupon.saving}
              </p>
            )}
            {!coupon.saving &&
              coupon.estimated_discount &&
              coupon.estimated_discount > 0 && (
                <p className="text-[11px] font-extrabold text-emerald-600 mt-1">
                  🎉 Save {formatLKR(coupon.estimated_discount)}
                </p>
              )}

            {/* Expiry */}
            {coupon.valid_until && (
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Expires:{" "}
                {new Date(coupon.valid_until).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}

            {/* Reason locked */}
            {coupon.reason && (
              <p className="text-[10px] text-amber-600 font-semibold mt-1 italic">
                ⚠️ {coupon.reason}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="shrink-0 flex flex-col items-end gap-1.5 pt-1">
          {isApplied ? (
            <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-[10px] rounded-xl">
              ✓ Applied
            </span>
          ) : coupon.action === "use" || coupon.eligible ? (
            <button
              onClick={() => onUse(coupon.code)}
              className="px-3 py-1.5 bg-[#D81B60] hover:bg-[#C2185B] text-white font-black text-[10px] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
            >
              Use
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] rounded-xl transition-all cursor-pointer"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
