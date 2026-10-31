"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCategories } from "@/api/queries/useCategories";
import { Skeleton } from "@/components/base/Skeleton";
import { Header } from "@/components/Header";
import { useUIStore } from "@/state/ui.store";
import { ROUTES } from "@/constants/routes";
import { formatImageUrl, DEFAULT_FALLBACK_IMAGE } from "@/utils/formatImageUrl";

export const CategorySection: React.FC = () => {
  const t = useTranslations("home.categories");
  const {
    data: categories,
    isLoading,
    isError,
  } = useCategories({ top_level_only: true });
  const { setActiveFilterCategory } = useUIStore();

  const categoryCount = categories?.length || 0;
  const isLessThanFour = categoryCount > 0 && categoryCount < 4;

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-1 sm:pb-2 lg:pb-3">
      {/* Header */}
      <Header
        badge={t("badge")}
        headingTag="h2"
        size="lg"
        className="mb-1.5 sm:mb-8"
        title={t("title")}
        description={t("description")}
        descriptionClassName="hidden sm:block"
        actionsClassName="hidden sm:flex"
        actions={
          <Link
            href={ROUTES.CATEGORIES}
            className="flex items-center gap-1 text-xs font-semibold text-[#D81B60] hover:text-[#C2185B] transition-colors cursor-pointer"
          >
            <span>{t("viewAll")}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        }
      />

      {/* Circular Categories Grid */}
      {isLoading ? (
        <div className="flex overflow-x-auto no-scrollbar pb-2 sm:pb-0 gap-2.5 sm:gap-6 lg:gap-8 sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 justify-items-center">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center space-y-2 w-20 shrink-0 sm:shrink sm:w-full"
            >
              <Skeleton className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full" />
              <Skeleton className="w-14 h-3 rounded-md" />
              <Skeleton className="w-10 h-2.5 rounded-md" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-rose-50 text-[#D81B60] rounded-2xl text-sm font-semibold">
          Unable to load categories. Please refresh or try again later.
        </div>
      ) : (
        <div
          className={`flex overflow-x-auto no-scrollbar pt-3.5 pb-2.5 -mt-2 gap-2.5 sm:gap-6 lg:gap-8 sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 justify-items-center ${
            isLessThanFour ? "w-full justify-between" : "w-full"
          }`}
        >
          {categories?.map((cat) => {
            const catId = cat.category_id || cat.id;
            const catTitle = cat.title || cat.name || "";
            const queryParams = new URLSearchParams();
            if (catId) queryParams.set("category_id", catId);
            if (catTitle) queryParams.set("category", catTitle);
            const destinationUrl = `${ROUTES.PRODUCTS}?${queryParams.toString()}`;

            return (
              <Link
                key={cat.id}
                href={destinationUrl}
                onClick={() => setActiveFilterCategory(catTitle)}
                className={`group flex flex-col items-center text-center cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ${
                  isLessThanFour
                    ? "flex-1 w-full max-w-full sm:max-w-32.5"
                    : "w-20 shrink-0 sm:shrink sm:w-full sm:max-w-32.5"
                }`}
              >
                {/* Circular Image Container */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-slate-100 p-1 border-2 border-slate-100 group-hover:border-[#D81B60] group-hover:shadow-lg group-hover:shadow-rose-100/70 transition-all duration-300 relative shrink-0">
                  <img
                    src={formatImageUrl(cat.image || cat.image_url)}
                    alt={cat.title}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src !== DEFAULT_FALLBACK_IMAGE) {
                        target.src = DEFAULT_FALLBACK_IMAGE;
                      }
                    }}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#D81B60] transition-colors mt-2 sm:mt-2.5 line-clamp-2 px-0.5 leading-snug">
                  {cat.title}
                </h3>

                {/* Subtitle / Item Count */}
                <span className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-400 group-hover:text-[#D81B60] transition-colors">
                  {cat.itemCount}+ Items
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
