"use client";

import React, { useState } from "react";
import { Tag, Sparkles, AlertCircle } from "lucide-react";
import { useEvaluateCoupons, useCollectCoupon } from "@/api/queries/useCoupons";
import { couponMatches } from "@/interfaces/coupon.interface";
import { OfferCouponCard } from "./OfferCouponCard";
import { Skeleton } from "@/components/base/Skeleton";
import { Header } from "@/components/Header";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/state/auth.store";

interface CouponsSectionProps {
  id?: string;
}

/**
 * Offers & coupons, decided and worded by the server (`/coupons/evaluate`,
 * browsing): the same cards, chips, countdowns and badges as the app.
 */
export const CouponsSection: React.FC<CouponsSectionProps> = ({
  id = "coupons-section",
}) => {
  const t = useTranslations("promotions");
  const { isAuthenticated } = useAuthStore();
  const [filter, setFilter] = useState("all");
  const collect = useCollectCoupon();

  const { data, isLoading, isError, refetch } = useEvaluateCoupons({
    include_offers: true,
    expiry_line: true,
  });

  const cards = data?.coupons ?? [];
  const filters = data?.filters ?? [];
  // A chip the server stopped sending falls back to everything.
  const active = filters.some((f) => f.key === filter) ? filter : "all";
  const shown = cards.filter((c) => couponMatches(c, active));

  return (
    <section id={id} className="mb-14 scroll-mt-24">
      {/* Section Header */}
      <Header
        headingTag="h2"
        size="lg"
        className="mb-6"
        title={
          <span className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#D81B60]" />
            {t("coupons.title")}
          </span>
        }
        description={t("coupons.desc")}
      />

      {filters.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-4 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-colors ${
                f.key === active
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
              }`}
            >
              {f.title}
            </button>
          ))}
        </div>
      )}

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 flex gap-4">
              <Skeleton className="w-24 h-16 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="w-3/4 h-5 rounded-md" />
                <Skeleton className="w-full h-4 rounded-md" />
                <Skeleton className="w-1/2 h-4 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 text-[#D81B60] rounded-3xl space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <h3 className="text-base font-extrabold">Failed to load coupons</h3>
          <p className="text-xs text-slate-600">
            We couldn&apos;t connect to fetch current coupons. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-[#D81B60] text-white text-xs font-bold rounded-full cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : shown.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800">{t("coupons.empty")}</h3>
          <p className="text-xs text-slate-500">{t("coupons.emptyDesc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {shown.map((card) => (
            <OfferCouponCard
              key={card.coupon_id || card.code}
              card={card}
              onCollect={isAuthenticated ? (code) => collect.mutate(code) : undefined}
              collecting={collect.isPending && collect.variables === card.code}
              onEnded={() => refetch()}
            />
          ))}
        </div>
      )}
    </section>
  );
};
