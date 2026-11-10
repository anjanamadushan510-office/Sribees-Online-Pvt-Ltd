"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useBanners } from "@/api/queries/useBanners";
import { bannerService } from "@/api/services/banner.service";
import { Skeleton } from "@/components/base/Skeleton";
import { Banner } from "@/interfaces/banner.interface";
import { heroBannerLayout } from "@/utils/heroBannerLayout";

export const getBannerDestination = (banner: Banner): string => {
  const linkType = (banner.linkType || "").toLowerCase().trim();
  const targetId = banner.targetId;

  // 1. Quick Sale promotional destination
  if (
    linkType === "quick_sale" ||
    linkType === "quick-sale" ||
    linkType === "sale"
  ) {
    return "/product?promotion=sale";
  }

  // 2. Category destination
  if (linkType === "category") {
    if (targetId) {
      return `/product?category_id=${encodeURIComponent(targetId)}`;
    }
    if (banner.categorySlug) {
      return `/product?category=${encodeURIComponent(banner.categorySlug)}`;
    }
    return "/categories";
  }

  // 3. Specific product destination
  if (linkType === "product") {
    if (targetId) {
      return `/productView?id=${encodeURIComponent(targetId)}`;
    }
    return "/product";
  }

  // Default fallback
  return "/product";
};

export const HeroBanner: React.FC = () => {
  const t = useTranslations("home.hero");
  const router = useRouter();
  const { data: banners = [], isLoading } = useBanners(10);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto carousel slide change
  useEffect(() => {
    if (!banners.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleBannerNavigate = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      if (!banners.length) return;
      const current = banners[currentSlide] || banners[0];
      if (!current) return;

      const bannerId = current.bannerId || current.id;
      if (bannerId && /^[0-9a-fA-F-]{36}$/.test(bannerId)) {
        let sessionKey = "";
        if (typeof window !== "undefined") {
          sessionKey = sessionStorage.getItem("sribees_banner_session") || "";
          if (!sessionKey) {
            sessionKey =
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : "sess-" + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem("sribees_banner_session", sessionKey);
          }
        }
        bannerService
          .recordBannerEvents(sessionKey, [{ bannerId, eventType: "click" }])
          .catch(() => {});
      }

      const destination = getBannerDestination(current);
      router.push(destination);
    },
    [banners, currentSlide, router],
  );

  if (isLoading) {
    return (
      <section className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 md:pt-6 pb-1">
        <Skeleton className="w-full rounded-2xl min-h-[180px] md:min-h-[400px]" />
      </section>
    );
  }

  if (!banners.length) return null;

  const slide = banners[currentSlide] || banners[0];
  // Artwork-only banner (the admin left the words blank): show the picture
  // clean, with no shade. It still gets a Shop Now button when the admin
  // chose where it opens. The whole banner stays clickable.
  const layout = heroBannerLayout(slide);
  const hasText = layout.showText;
  const shopNowButton = (
    <button
      type="button"
      onClick={handleBannerNavigate}
      className="px-4 py-1.5 md:px-6 md:py-3 bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs md:text-sm font-extrabold tracking-wide rounded-full shadow-lg shadow-rose-900/50 hover:shadow-rose-700/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
    >
      {slide.ctaText || t("shopNow")} &rarr;
    </button>
  );

  return (
    <section className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 md:pt-6 pb-1">
      {/* Banner Container */}
      <div
        onClick={handleBannerNavigate}
        className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-xl min-h-45 md:min-h-100 flex items-center group cursor-pointer"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={slide.image || slide.imageUrl}
            alt={slide.title || "SRIBEES Online"}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {layout.showShade && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-transparent md:from-slate-600 md:via-slate-600/50" />
          )}
        </div>

        {/* Content: only the words the admin wrote */}
        {hasText && (
        <div className="relative z-10 p-4 md:p-12 max-w-2xl text-white space-y-2 md:space-y-4">
          {slide.subtitle && (
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-[#D81B60] text-white text-[10px] md:text-xs font-black uppercase tracking-wider shadow-md">
              <span>{slide.subtitle}</span>
            </div>
          )}

          {slide.title && (
            <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              {slide.title}
            </h1>
          )}

          {slide.description && (
            <p className="hidden md:block text-sm md:text-base text-slate-300 font-medium line-clamp-2">
              {slide.description}
            </p>
          )}

          <div className="pt-0.5 md:pt-2 flex flex-wrap items-center gap-4">
            {shopNowButton}
          </div>
        </div>
        )}

        {/* Artwork-only banner that leads somewhere: the button sits in the
            bottom-left corner so it does not cover the artwork's own words. */}
        {!hasText && layout.showButton && (
          <div className="absolute left-4 bottom-3 md:left-8 md:bottom-6 z-10">
            {shopNowButton}
          </div>
        )}

        {/* Navigation Controls */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(
                  (prev) => (prev - 1 + banners.length) % banners.length,
                );
              }}
              className="absolute left-2 md:left-3 z-20 p-1.5 md:p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-[#D81B60] transition-all cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) => (prev + 1) % banners.length);
              }}
              className="absolute right-2 md:right-3 z-20 p-1.5 md:p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-[#D81B60] transition-all cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-2.5 right-4 md:bottom-4 md:right-6 z-20 flex items-center gap-1.5 md:gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className={`h-1.5 md:h-2 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx
                      ? "w-4 md:w-6 bg-[#D81B60]"
                      : "w-1.5 md:w-2 bg-white/40"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
