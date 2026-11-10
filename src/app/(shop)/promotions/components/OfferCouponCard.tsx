"use client";

import React, { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { CouponCard } from "@/interfaces/coupon.interface";
import { CouponCountdown, CouponNewBadge } from "@/components/coupons/CouponCountdown";
import { useToastStore } from "@/state/toast.store";
import { useTranslations } from "next-intl";

interface Props {
  card: CouponCard;
  /** Signed in: the server's `collect` action becomes a button. */
  onCollect?: (code: string) => void;
  collecting?: boolean;
  /** A countdown reached zero; reload so the server can call it ended. */
  onEnded?: () => void;
}

/**
 * One offer, drawn from the server's card (`POST /coupons/evaluate`). Words,
 * fine print, the end line and the badge are all the server's; this only
 * lays them out, like the app's Offers screen.
 */
export const OfferCouponCard: React.FC<Props> = ({ card, onCollect, collecting, onEnded }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToastStore();
  const t = useTranslations("promotions");
  const dimmed = Boolean(card.dimmed);
  const soon = Boolean(card.expiring_soon);

  const copy = () => {
    navigator.clipboard?.writeText(card.code).catch(() => {});
    setCopied(true);
    addToast({ title: card.code, message: card.label, type: "success", duration: 2500 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative flex rounded-2xl border bg-rose-50/40 overflow-hidden transition-shadow ${
        dimmed ? "opacity-70 border-slate-200" : "border-rose-200/70 hover:shadow-lg"
      }`}
    >
      {/* Value stub */}
      <div className="w-32 sm:w-36 shrink-0 flex flex-col items-center justify-center gap-1 px-3 py-5 text-center">
        {card.badge && !dimmed && <CouponNewBadge text={card.badge} />}
        <span className="text-2xl font-black leading-tight text-[#E5480B]">{card.label}</span>
      </div>

      {/* Ticket perforation */}
      <div className="relative w-0 border-l border-dashed border-rose-300 my-3" aria-hidden>
        <span className="absolute -top-5 -left-2.5 w-5 h-5 rounded-full bg-slate-50" />
        <span className="absolute -bottom-5 -left-2.5 w-5 h-5 rounded-full bg-slate-50" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 p-4 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 truncate">
              {card.description || card.code}
            </p>
            <p className="text-[11px] font-mono font-bold tracking-wider text-[#D81B60]">
              {card.code}
            </p>
          </div>
          {card.action === "collect" && onCollect ? (
            <button
              type="button"
              disabled={collecting}
              onClick={() => onCollect(card.code)}
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-black cursor-pointer disabled:opacity-60"
            >
              {collecting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("coupons.collect")}
            </button>
          ) : card.status?.text ? (
            <span
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-black ${
                card.status.key === "ended"
                  ? "bg-red-50 text-red-600"
                  : card.status.key === "ready"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {card.status.text}
            </span>
          ) : null}
        </div>

        {card.terms && card.terms.length > 0 && (
          <p className="text-[11px] text-slate-500 leading-relaxed">{card.terms.join("  •  ")}</p>
        )}

        <div className="mt-auto pt-1 flex items-center justify-between gap-2 flex-wrap">
          {card.expiry ? (
            <CouponCountdown
              expiry={card.expiry}
              onEnded={onEnded}
              tone={soon ? "text-[#E5480B]" : "text-[#D81B60]"}
            />
          ) : (
            <span />
          )}
          {!dimmed && (
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#D81B60] cursor-pointer"
              aria-label={`Copy ${card.code}`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t("coupons.copied") : t("coupons.copy")}
            </button>
          )}
        </div>

        {card.reason && !card.eligible && (
          <p className="text-[11px] font-semibold text-amber-700">{card.reason}</p>
        )}
      </div>
    </div>
  );
};
