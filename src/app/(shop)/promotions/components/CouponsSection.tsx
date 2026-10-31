"use client";

import React from "react";
import { Tag, Sparkles, AlertCircle } from "lucide-react";
import { useCoupons } from "@/api/queries/usePromotions";
import { CouponCard } from "./CouponCard";
import { Skeleton } from "@/components/base/Skeleton";
import { Header } from "@/components/Header";
import { useTranslations } from "next-intl";

interface CouponsSectionProps {
  id?: string;
}

export const CouponsSection: React.FC<CouponsSectionProps> = ({
  id = "coupons-section",
}) => {
  const t = useTranslations("promotions");

  const {
    data: coupons = [],
    isLoading,
    isError,
    refetch,
  } = useCoupons();

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

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4"
            >
              <Skeleton className="w-24 h-6 rounded-full" />
              <Skeleton className="w-3/4 h-6 rounded-md" />
              <Skeleton className="w-full h-4 rounded-md" />
              <Skeleton className="w-full h-14 rounded-2xl" />
              <div className="flex justify-between pt-2">
                <Skeleton className="w-24 h-4 rounded-md" />
                <Skeleton className="w-12 h-4 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 text-[#D81B60] rounded-3xl space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <h3 className="text-base font-extrabold">Failed to load coupons</h3>
          <p className="text-xs text-slate-600">
            We couldn't connect to fetch current coupons. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-[#D81B60] text-white text-xs font-bold rounded-full cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800">
            No active coupons
          </h3>
          <p className="text-xs text-slate-500">
            Check back soon for available promo codes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon, index) => (
            <CouponCard
              key={coupon.id || coupon.coupon_id || coupon.code || `coupon-${index}`}
              coupon={coupon}
            />
          ))}
        </div>
      )}
    </section>
  );
};
