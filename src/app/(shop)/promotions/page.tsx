"use client";

import React from "react";
import { Breadcrumb } from "@/components/Breadcumb";
import { PromotionHero } from "./components/PromotionHero";
import { CouponsSection } from "./components/CouponsSection";
import { TodayDealsSection } from "./components/TodayDealsSection";
import { PromoBankBanner } from "./components/PromoBankBanner";
import { useCoupons, useTodayDeals } from "@/api/queries/usePromotions";

export default function PromotionsPage() {
  const { data: coupons = [] } = useCoupons();
  // const { data: deals = [] } = useTodayDeals();

  const scrollToCoupons = () => {
    const element = document.getElementById("coupons-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToDeals = () => {
    const element = document.getElementById("today-deals-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[{ label: "Promotions & Today's Deals", isCurrent: true }]}
        className="mb-6"
      />

      {/* Hero Banner Section */}
      <PromotionHero
        onScrollToCoupons={scrollToCoupons}
        onScrollToDeals={scrollToDeals}
        totalCouponsCount={coupons.length}
        totalDealsCount={0}
      />

      {/* Store Coupons Section */}
      <CouponsSection id="coupons-section" />

      {/* Today's Deals Flash Sales Section - Temporarily commented out until refined */}
      {/* <TodayDealsSection id="today-deals-section" /> */}
    </main>
  );
}
