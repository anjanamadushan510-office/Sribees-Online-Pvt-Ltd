"use client";

import React from "react";
import { formatLKR } from "@/utils/formatCurrency";

export interface CheckoutCartItem {
  id: string;
  title: string;
  brand?: string;
  subtitle: string;
  unitPrice: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  imageBadge?: string;
  imageBadgeColor?: "emerald" | "pink" | "green" | "dark";
  bottomTag: string;
  bottomTagIcon?: string;
  isSavedForLater?: boolean;
  cashbackPercentage?: number;
  cashbackEarned?: number;
}

interface CartItemCardProps {
  item: CheckoutCartItem;
  onUpdateQuantity?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
  onToggleSaveForLater?: (id: string) => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ item }) => {
  const itemTotal = item.unitPrice * item.quantity;
  const hasDiscount = Boolean(
    item.originalPrice && item.originalPrice > item.unitPrice,
  );

  const getImageBadgeStyle = () => {
    switch (item.imageBadgeColor) {
      case "emerald":
        return "bg-[#007A33] text-white";
      case "pink":
        return "bg-[#D81B60] text-white";
      case "green":
        return "bg-emerald-600 text-white";
      case "dark":
        return "bg-slate-800 text-white";
      default:
        return "bg-[#007A33] text-white";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-rose-200 transition-all">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-between">
        {/* Left Side: Image + Details */}
        <div className="flex gap-3.5 sm:gap-4 flex-1">
          {/* Product Thumbnail with Top-Left Badge */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {item.imageBadge && (
              <span
                className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight shadow-xs ${getImageBadgeStyle()}`}
              >
                {item.imageBadge}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between flex-1 py-0.5">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 leading-snug line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {item.subtitle}
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <p className="text-xs text-slate-700 font-bold">
                  Unit:{" "}
                  <span className="text-slate-900">
                    {formatLKR(item.unitPrice)}
                  </span>
                </p>
                {hasDiscount && (
                  <span className="text-[11px] text-slate-400 font-semibold line-through">
                    {formatLKR(item.originalPrice!)}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                <span>{item.bottomTag}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Price & Cashback */}
        <div className="flex flex-col justify-between sm:items-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 shrink-0 text-right sm:self-stretch">
          <div className="flex items-center sm:items-start justify-between sm:justify-end w-full">
            <span className="text-xs font-bold text-slate-500 sm:hidden">
              Total
            </span>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-black text-slate-900">
                {formatLKR(itemTotal)}
              </div>
              {hasDiscount ? (
                <div className="text-[11px] font-semibold text-slate-400 line-through">
                  {formatLKR(item.originalPrice! * item.quantity)}
                  {item.quantity > 1 &&
                    ` (${formatLKR(item.originalPrice!)} ea)`}
                </div>
              ) : item.quantity > 1 ? (
                <div className="text-[11px] font-semibold text-slate-400">
                  {formatLKR(item.unitPrice)} ea
                </div>
              ) : null}
            </div>
          </div>

          {/* Cashback Badge - aligned on the right in the same horizontal row as the SKU */}
          {item.cashbackPercentage && item.cashbackPercentage > 0 && (
            <div className="pt-2 sm:pt-0 flex justify-end">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
                🎁 Earn{" "}
                {formatLKR(
                  item.cashbackEarned ??
                    (item.unitPrice * item.quantity * item.cashbackPercentage) /
                      100,
                )}{" "}
                cashback ({item.cashbackPercentage}%)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
