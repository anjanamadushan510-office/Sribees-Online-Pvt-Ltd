"use client";

import React from "react";
import { Category } from "@/interfaces/category.interface";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/state/ui.store";
import { ROUTES } from "@/constants/routes";
import { formatImageUrl, DEFAULT_FALLBACK_IMAGE } from "@/utils/formatImageUrl";

interface CategoryCardItemProps {
  category: Category;
  viewMode: "grid" | "list";
}

export const CategoryCardItem: React.FC<CategoryCardItemProps> = ({
  category,
  viewMode,
}) => {
  const router = useRouter();
  const { setActiveFilterCategory } = useUIStore();
  const displayImage = formatImageUrl(category.image || category.image_url);

  const handleCategoryClick = () => {
    const catId = category.category_id || category.id;
    const catTitle = category.title || category.name || "";
    setActiveFilterCategory(catTitle);
    const query = new URLSearchParams();
    if (catId) query.set("category_id", catId);
    if (catTitle) query.set("category", catTitle);
    router.push(`${ROUTES.PRODUCTS}?${query.toString()}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src !== DEFAULT_FALLBACK_IMAGE) {
      target.src = DEFAULT_FALLBACK_IMAGE;
    }
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={handleCategoryClick}
        className="group bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/80 hover:border-[#D81B60] hover:shadow-md sm:hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-between gap-3.5 sm:gap-5"
      >
        {/* Circular Avatar Image */}
        <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-100 p-0.5 sm:p-1 border border-slate-100 sm:border-2 group-hover:border-[#D81B60] group-hover:shadow-md transition-all duration-300 shrink-0">
          <img
            src={displayImage}
            alt={category.title}
            onError={handleImageError}
            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0 text-left space-y-0.5 sm:space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-sm sm:text-lg font-bold sm:font-black text-slate-900 group-hover:text-[#D81B60] transition-colors truncate">
              {category.title}
            </h3>
            <span className="text-xs font-semibold sm:font-bold text-slate-400 group-hover:text-[#D81B60] transition-colors shrink-0">
              {category.itemCount}+ Items
            </span>
          </div>

          <p className="text-xs text-slate-500 sm:text-slate-600 font-medium leading-relaxed truncate sm:line-clamp-2">
            {category.description || category.subtitle}
          </p>
        </div>

        {/* Action Button / Arrow */}
        <div className="shrink-0">
          <div className="sm:hidden w-8 h-8 rounded-full bg-slate-50 group-hover:bg-rose-50 flex items-center justify-center text-slate-400 group-hover:text-[#D81B60] transition-colors">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <button className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 group-hover:bg-[#D81B60] text-white text-xs font-bold rounded-xl transition-all shadow-sm">
            <span>Explore Products</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Screen List Layout (< sm) */}
      <div
        onClick={handleCategoryClick}
        className="sm:hidden group bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-[#D81B60] active:bg-slate-50 transition-all duration-200 cursor-pointer flex items-center gap-3.5 shadow-sm"
      >
        {/* Circular Avatar Image */}
        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 p-0.5 border border-slate-200/70 group-hover:border-[#D81B60] transition-colors shrink-0">
          <img
            src={displayImage}
            alt={category.title}
            onError={handleImageError}
            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#D81B60] transition-colors truncate">
              {category.title}
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-[#D81B60] transition-colors shrink-0">
              {category.itemCount}+ Items
            </span>
          </div>

          {(category.description || category.subtitle) && (
            <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
              {category.description || category.subtitle}
            </p>
          )}
        </div>

        {/* Arrow Icon at the edge */}
        <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-rose-50 flex items-center justify-center text-slate-400 group-hover:text-[#D81B60] transition-colors shrink-0">
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Desktop Grid Card Layout (>= sm) */}
      <div
        onClick={handleCategoryClick}
        className="hidden sm:flex group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-[#D81B60] hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300 cursor-pointer flex-col items-center text-center justify-between"
      >
        <div className="flex flex-col items-center w-full">
          {/* Circular Image Container */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-slate-100 p-1 border-2 border-slate-100 group-hover:border-[#D81B60] group-hover:shadow-xl group-hover:shadow-rose-100/60 transition-all duration-300 relative mb-4">
            <img
              src={displayImage}
              alt={category.title}
              onError={handleImageError}
              className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Category Title */}
          <h3 className="text-base sm:text-lg font-black text-slate-800 group-hover:text-[#D81B60] transition-colors line-clamp-2 px-1 leading-snug">
            {category.title}
          </h3>

          {/* Subtitle / Item Count */}
          <span className="mt-1 text-xs font-bold text-slate-400 group-hover:text-[#D81B60] transition-colors">
            {category.itemCount}+ Items
          </span>

          {/* Short Description */}
          <p className="mt-3 text-xs text-slate-500 font-medium leading-relaxed px-2 line-clamp-3">
            {category.description || category.subtitle}
          </p>
        </div>

        {/* Footer CTA */}
        <div className="w-full pt-4 mt-4 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-bold text-[#D81B60] group-hover:text-[#C2185B]">
          <span>Explore Products</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </>
  );
};
