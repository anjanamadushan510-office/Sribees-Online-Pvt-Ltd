"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Star,
  RotateCcw,
  X,
  Tag,
  Percent,
} from "lucide-react";
import { useCategories } from "@/api/queries/useCategories";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { Skeleton } from "@/components/base/Skeleton";

export interface FilterSidebarProps {
  selectedCategoryIds?: string[];
  onSelectCategoryIds?: (categoryIds: string[]) => void;
  // Legacy / convenience single category props
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;

  selectedRating?: number | null;
  onSelectRating?: (rating: number | null) => void;

  selectedPromotions?: Array<"sale" | "cashback">;
  onTogglePromotion?: (promo: "sale" | "cashback") => void;

  minPrice?: number | null;
  maxPrice?: number | null;
  onPriceChange?: (min: number | null, max: number | null) => void;

  searchQuery?: string;
  onSearchChange?: (query: string) => void;

  onReset?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategoryIds = [],
  onSelectCategoryIds,
  selectedCategory,
  onSelectCategory,
  selectedRating = null,
  onSelectRating,
  selectedPromotions = [],
  onTogglePromotion,
  minPrice = null,
  maxPrice = null,
  onPriceChange,
  searchQuery = "",
  onSearchChange,
  onReset,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  useBodyScrollLock(isMobileOpen);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  // Local price inputs so user can type before applying
  const [inputMinPrice, setInputMinPrice] = useState<string>(
    minPrice != null ? String(minPrice) : ""
  );
  const [inputMaxPrice, setInputMaxPrice] = useState<string>(
    maxPrice != null ? String(maxPrice) : ""
  );

  useEffect(() => {
    setInputMinPrice(minPrice != null ? String(minPrice) : "");
  }, [minPrice]);

  useEffect(() => {
    setInputMaxPrice(maxPrice != null ? String(maxPrice) : "");
  }, [maxPrice]);

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories({ hierarchical: false });

  // Handle category toggle
  const handleToggleCategory = (catId: string, catName: string) => {
    const isCurrentlySelected =
      selectedCategoryIds.includes(catId) ||
      (selectedCategoryIds.length === 0 &&
        Boolean(selectedCategory && selectedCategory !== "All") &&
        (selectedCategory?.toLowerCase() === catName.toLowerCase() ||
          selectedCategory?.toLowerCase() === catId.toLowerCase()));

    if (onSelectCategoryIds) {
      let nextIds: string[];
      if (isCurrentlySelected) {
        nextIds = selectedCategoryIds.filter(
          (id) => id !== catId && id.toLowerCase() !== catName.toLowerCase()
        );
      } else {
        nextIds = [...selectedCategoryIds, catId];
      }
      onSelectCategoryIds(nextIds);
      if (onSelectCategory) {
        if (nextIds.length === 0) {
          onSelectCategory("All");
        } else if (nextIds.length === 1) {
          onSelectCategory(catName);
        }
      }
    } else if (onSelectCategory) {
      if (isCurrentlySelected) {
        onSelectCategory("All");
      } else {
        onSelectCategory(catName);
      }
    }
  };

  const handleApplyPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onPriceChange) return;

    const parsedMin =
      inputMinPrice.trim() !== "" ? Number(inputMinPrice) : null;
    const parsedMax =
      inputMaxPrice.trim() !== "" ? Number(inputMaxPrice) : null;

    onPriceChange(
      parsedMin != null && !isNaN(parsedMin) && parsedMin >= 0 ? parsedMin : null,
      parsedMax != null && !isNaN(parsedMax) && parsedMax > 0 ? parsedMax : null
    );
  };

  const handleClearPrice = () => {
    setInputMinPrice("");
    setInputMaxPrice("");
    if (onPriceChange) {
      onPriceChange(null, null);
    }
  };

  const handleResetAll = () => {
    setInputMinPrice("");
    setInputMaxPrice("");
    if (onReset) {
      onReset();
    } else {
      if (onSelectCategoryIds) onSelectCategoryIds([]);
      if (onSelectCategory) onSelectCategory("All");
      if (onSelectRating) onSelectRating(null);
      if (onPriceChange) onPriceChange(null, null);
      if (onSearchChange) onSearchChange("");
    }
  };

  // Count active filters for badge
  const activeFiltersCount =
    selectedCategoryIds.length +
    (selectedCategory && selectedCategory !== "All" && selectedCategoryIds.length === 0 ? 1 : 0) +
    (selectedRating ? 1 : 0) +
    selectedPromotions.length +
    (minPrice != null || maxPrice != null ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const ratingsList = [4, 3, 2, 1];

  const renderFilterContent = () => (
    <>
      {/* 1. Categories Filter (Dynamic from GET /categories) */}
      <div className="border-b border-slate-100 pb-5">
        <button
          type="button"
          onClick={() => setCategoriesOpen(!categoriesOpen)}
          className="w-full flex items-center justify-between font-extrabold text-xs text-slate-900 mb-3 cursor-pointer"
        >
          <span>Categories</span>
          {categoriesOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {categoriesOpen && (
          <div className="space-y-1">
            {/* All Categories Button */}
            <button
              type="button"
              onClick={() => {
                if (onSelectCategoryIds) onSelectCategoryIds([]);
                if (onSelectCategory) onSelectCategory("All");
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategoryIds.length === 0 &&
                (!selectedCategory || selectedCategory === "All")
                  ? "bg-rose-50 text-[#D81B60]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>All Categories</span>
            </button>

            {isCategoriesLoading ? (
              <div className="space-y-2 py-1">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="w-full h-7 rounded-lg" />
                ))}
              </div>
            ) : (
              categories.map((cat) => {
                const catId = cat.category_id || cat.id;
                const catName = cat.name || cat.title;
                const isSelected =
                  selectedCategoryIds.includes(catId) ||
                  (selectedCategoryIds.length === 0 &&
                    Boolean(selectedCategory && selectedCategory !== "All") &&
                    (selectedCategory?.toLowerCase() === catName.toLowerCase() ||
                      selectedCategory?.toLowerCase() === catId.toLowerCase()));
                const count = cat.product_count ?? cat.itemCount ?? 0;

                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => handleToggleCategory(catId, catName)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-rose-50 text-[#D81B60]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-[#D81B60] border-[#D81B60] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-2.5 h-2.5 stroke-current stroke-2 fill-none"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="truncate">{catName}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                        isSelected
                          ? "bg-rose-100 text-[#D81B60]"
                          : "text-slate-400 bg-slate-100"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 2. Customer Ratings Filter (min_rating: 4, 3, 2, 1) */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-xs text-slate-900">
            Customer Ratings
          </h3>
          {selectedRating != null && (
            <button
              type="button"
              onClick={() => onSelectRating && onSelectRating(null)}
              className="text-[10px] text-[#D81B60] font-semibold hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {ratingsList.map((ratingVal) => {
            const isSelected = selectedRating === ratingVal;
            return (
              <button
                key={ratingVal}
                type="button"
                onClick={() => {
                  if (onSelectRating) {
                    onSelectRating(isSelected ? null : ratingVal);
                  }
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "bg-rose-50 border border-rose-200 shadow-xs"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < ratingVal
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 fill-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-xs ml-1 ${
                      isSelected
                        ? "font-extrabold text-[#D81B60]"
                        : "font-semibold text-slate-700"
                    }`}
                  >
                    ★ {ratingVal} & up
                  </span>
                </div>
                {isSelected && (
                  <span className="text-[10px] font-bold text-[#D81B60] bg-rose-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Promotions & Deals Filter (promotion=sale, promotion=cashback) */}
      <div className="border-b border-slate-100 pb-5">
        <h3 className="font-extrabold text-xs text-slate-900 mb-3">
          Promotions & Deals
        </h3>
        <div className="space-y-2">
          {/* Quick Sale / On Sale */}
          <label
            className="flex items-center justify-between text-xs text-slate-700 font-medium cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPromotions.includes("sale")}
                onChange={() => onTogglePromotion && onTogglePromotion("sale")}
                className="w-4 h-4 rounded text-[#D81B60] focus:ring-[#D81B60] border-slate-300 cursor-pointer accent-[#D81B60]"
              />
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-rose-500" />
                <span
                  className={`group-hover:text-slate-900 ${
                    selectedPromotions.includes("sale")
                      ? "font-extrabold text-slate-900"
                      : "text-slate-700"
                  }`}
                >
                  Quick Sale
                </span>
              </span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-[#D81B60]">
              Discounts
            </span>
          </label>

          {/* Cashback */}
          <label
            className="flex items-center justify-between text-xs text-slate-700 font-medium cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPromotions.includes("cashback")}
                onChange={() => onTogglePromotion && onTogglePromotion("cashback")}
                className="w-4 h-4 rounded text-[#D81B60] focus:ring-[#D81B60] border-slate-300 cursor-pointer accent-[#D81B60]"
              />
              <span className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
                <span
                  className={`group-hover:text-slate-900 ${
                    selectedPromotions.includes("cashback")
                      ? "font-extrabold text-slate-900"
                      : "text-slate-700"
                  }`}
                >
                  Special Cashback
                </span>
              </span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
              Rewards
            </span>
          </label>
        </div>
      </div>

      {/* 4. Price Range (LKR) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-xs text-slate-900">
            Price Range (LKR)
          </h3>
          {(minPrice != null || maxPrice != null) && (
            <button
              type="button"
              onClick={handleClearPrice}
              className="text-[10px] text-[#D81B60] font-semibold hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <form onSubmit={handleApplyPrice} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Min LKR
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={inputMinPrice}
                onChange={(e) => setInputMinPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#D81B60] focus:bg-white"
              />
            </div>
            <span className="text-slate-300 font-bold mt-4">—</span>
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Max LKR
              </label>
              <input
                type="number"
                min="0"
                placeholder="5000"
                value={inputMaxPrice}
                onChange={(e) => setInputMaxPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#D81B60] focus:bg-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
          >
            Apply Price
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Filter Trigger Button (Visible only on mobile: < lg) */}
      <div className="lg:hidden w-full">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="w-full bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-extrabold text-slate-900">
              Filter Catalog
            </h2>
            {activeFiltersCount > 0 && (
              <span className="bg-[#D81B60] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Desktop Sidebar (Visible only on lg and above) */}
      <aside className="hidden lg:block w-72 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-extrabold text-slate-900">
              Filter Catalog
            </h2>
            {activeFiltersCount > 0 && (
              <span className="bg-rose-100 text-[#D81B60] text-[11px] font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleResetAll}
            className="text-slate-400 hover:text-[#D81B60] transition-colors p-1 rounded-md flex items-center gap-1 text-xs cursor-pointer"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Reset</span>
          </button>
        </div>

        {renderFilterContent()}
      </aside>

      {/* Mobile Modal Popup (Visible only on mobile when opened) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs lg:hidden">
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileOpen(false)}
          />

          <div className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl z-10 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-extrabold text-slate-900">
                  Filter Catalog
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#D81B60] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-xs font-semibold text-slate-500 hover:text-[#D81B60] flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Close Filter Dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {renderFilterContent()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3 sticky bottom-0 z-20">
              <button
                type="button"
                onClick={handleResetAll}
                className="w-1/3 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all cursor-pointer text-center"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="w-2/3 py-2.5 bg-[#D81B60] text-white text-xs font-extrabold rounded-xl shadow-md hover:bg-rose-700 transition-all cursor-pointer text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
