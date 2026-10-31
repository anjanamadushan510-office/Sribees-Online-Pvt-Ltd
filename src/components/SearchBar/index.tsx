"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  X,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useUIStore } from "@/state/ui.store";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/hooks/useDebounce";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useSearchProducts } from "@/api/queries/useSearchProducts";
import { sanitizeSearchQuery, safeEncodeSearchParam } from "@/utils/sanitize";
import { formatLKR } from "@/utils/formatCurrency";
import { Product } from "@/interfaces/product.interface";

const RECENT_SEARCHES_KEY = "sb_recent_searches";
const MAX_RECENT_SEARCHES = 6;

export interface SearchBarProps {
  variant?: "desktop" | "mobile" | "standalone";
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  onSearchSubmit?: (query: string) => void;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  variant = "desktop",
  placeholder,
  className = "",
  showSuggestions = true,
  onSearchSubmit,
  autoFocus = false,
}) => {
  const router = useRouter();
  const t = useTranslations("common.searchBar");
  const effectivePlaceholder = placeholder || t("placeholder");
  const { searchQuery, setSearchQuery, setActiveFilterCategory } = useUIStore();

  const popularTags = [
    t("tags.vegetables"),
    t("tags.milk"),
    t("tags.fruits"),
    t("tags.bakery"),
    t("tags.spices"),
    t("tags.rice"),
  ];

  const [inputValue, setInputValue] = useState(searchQuery || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useClickOutside(containerRef, () => {
    setIsDropdownOpen(false);
  });

  // Sync external search query from store if it changes
  useEffect(() => {
    if (searchQuery !== inputValue && !isDropdownOpen) {
      setInputValue(searchQuery);
    }
  }, [searchQuery, isDropdownOpen]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.map(sanitizeSearchQuery).filter(Boolean));
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }, []);

  // Save query into recent searches safely
  const saveRecentSearch = useCallback((term: string) => {
    const clean = sanitizeSearchQuery(term);
    if (!clean || clean.length < 2) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== clean.toLowerCase()
      );
      const updated = [clean, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage quota errors
      }
      return updated;
    });
  }, []);

  // Clear single recent search item
  const removeRecentSearch = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== itemToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  // Clear all recent searches
  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  // Debounced query for live autocomplete / preview (300ms)
  const debouncedRaw = useDebounce(inputValue, 300);
  const debouncedSearchTerm = sanitizeSearchQuery(debouncedRaw);

  // TanStack Query: calls GET /products/search?q=
  const { data: searchResults, isLoading: isSearching } = useSearchProducts(
    debouncedSearchTerm,
    1,
    6,
    {
      enabled: isDropdownOpen && showSuggestions && debouncedSearchTerm.length >= 1,
    }
  );

  const productsList = searchResults?.products || [];
  const totalMatches = searchResults?.pagination?.total ?? productsList.length;

  // Execute full search submission
  const executeSearch = useCallback(
    (queryToExecute: string) => {
      const sanitized = sanitizeSearchQuery(queryToExecute);
      setIsDropdownOpen(false);

      if (sanitized) {
        saveRecentSearch(sanitized);
        setSearchQuery(sanitized);
        setActiveFilterCategory("All");
      } else {
        setSearchQuery("");
      }

      if (onSearchSubmit) {
        onSearchSubmit(sanitized);
      } else {
        // Navigate to shop / products catalog page with search parameter
        const targetUrl = sanitized
          ? `/product?search=${safeEncodeSearchParam(sanitized)}`
          : `/product`;
        router.push(targetUrl);
      }
    },
    [
      onSearchSubmit,
      router,
      saveRecentSearch,
      setActiveFilterCategory,
      setSearchQuery,
    ]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeSearch(inputValue);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setInputValue("");
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleSelectProduct = (product: Product) => {
    const productId = product.id || product.product_id;
    saveRecentSearch(product.title || product.name || inputValue);
    setIsDropdownOpen(false);
    if (productId) {
      router.push(`/productView?id=${productId}`);
    }
  };

  const handleSelectRecentOrTag = (term: string) => {
    setInputValue(term);
    executeSearch(term);
  };

  // Distinguish styling variations
  const isMobile = variant === "mobile";

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      role="combobox"
      aria-expanded={isDropdownOpen}
      aria-haspopup="listbox"
      aria-controls="search-results-dropdown"
    >
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        {/* Left Search Icon for Mobile or Compact */}
        {isMobile && (
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        )}

        <input
          ref={inputRef}
          type="search"
          autoFocus={autoFocus}
          value={inputValue}
          maxLength={200}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search products"
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!isDropdownOpen) setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={effectivePlaceholder}
          className={
            isMobile
              ? "w-full pl-9 pr-8 py-1.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-full border border-slate-200 focus:border-[#D81B60] focus:ring-2 focus:ring-rose-100 outline-none transition-all placeholder:text-slate-400 font-medium"
              : "w-full pl-4 pr-12 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 rounded-full border border-transparent focus:border-[#D81B60] focus:ring-4 focus:ring-rose-100 transition-all outline-none"
          }
        />

        {/* Clear Button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear search query"
            className={`absolute ${
              isMobile ? "right-2" : "right-11"
            } text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Desktop Search Submit Button */}
        {!isMobile && (
          <button
            type="submit"
            title="Search"
            className="absolute right-1.5 p-2 bg-[#D81B60] hover:bg-[#C2185B] text-white rounded-full transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Live Dropdown / Autocomplete Panel */}
      {isDropdownOpen && showSuggestions && (
        <div
          id="search-results-dropdown"
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Section 1: When user is typing a search keyword */}
          {inputValue.trim().length > 0 ? (
            <div className="py-2 divide-y divide-slate-100">
              {/* Header with Search Status */}
              <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 truncate">
                  <Search className="w-3.5 h-3.5 text-[#D81B60]" />
                  <span>
                    {t("searching")} &ldquo;
                    <strong className="text-slate-800">
                      {sanitizeSearchQuery(inputValue)}
                    </strong>
                    &rdquo;
                  </span>
                </span>
                {isSearching ? (
                  <span className="flex items-center gap-1 text-[#D81B60]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{t("checkingStock")}</span>
                  </span>
                ) : (
                  totalMatches > 0 && (
                    <span className="text-slate-400">
                      {totalMatches} {totalMatches === 1 ? t("item") : t("items")}
                    </span>
                  )
                )}
              </div>

              {/* Loading State Skeleton */}
              {isSearching && productsList.length === 0 && (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="w-3/4 h-3.5 bg-slate-200 rounded" />
                        <div className="w-1/3 h-3 bg-slate-100 rounded" />
                      </div>
                      <div className="w-14 h-4 bg-slate-200 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Products List */}
              {!isSearching && productsList.length > 0 && (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {productsList.map((product) => {
                    const price = product.price ?? 0;
                    const originalPrice =
                      (product.global_price && product.global_price > price
                        ? product.global_price
                        : undefined) ||
                      product.originalPrice ||
                      product.compare_at_price;
                    const hasDiscount =
                      originalPrice && originalPrice > price;
                    const imageUrl =
                      product.image ||
                      product.images?.[0]?.image_url ||
                      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=120";

                    return (
                      <div
                        key={product.id || product.product_id}
                        onClick={() => handleSelectProduct(product)}
                        className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-rose-50/40 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Product Thumbnail */}
                          <div className="relative w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                            <Image
                              src={imageUrl}
                              alt={product.title || product.name || "Product"}
                              fill
                              sizes="44px"
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate group-hover:text-[#D81B60] transition-colors">
                              {product.title || product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="truncate">
                                {product.category || product.brand || "Sribees"}
                              </span>
                              {product.unit && (
                                <>
                                  <span>•</span>
                                  <span>{product.unit}</span>
                                </>
                              )}
                              {product.inStock === false && (
                                <span className="text-rose-600 font-bold">
                                  {t("outOfStock")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price and Discount */}
                        <div className="text-right shrink-0">
                          <div className="text-xs sm:text-sm font-extrabold text-[#D81B60]">
                            {formatLKR(price)}
                          </div>
                          {hasDiscount && (
                            <div className="text-[10px] text-slate-400 line-through">
                              {formatLKR(originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty Results State */}
              {!isSearching && productsList.length === 0 && (
                <div className="p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-[#D81B60] flex items-center justify-center mx-auto mb-2">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {t("noProductsFound")} &ldquo;{sanitizeSearchQuery(inputValue)}&rdquo;
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    {t("noProductsHint")}
                  </p>
                </div>
              )}

              {/* View All Matches Footer */}
              <div className="p-2.5 bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => executeSearch(inputValue)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 text-xs font-bold text-[#D81B60] rounded-xl border border-rose-200 transition-colors shadow-xs cursor-pointer"
                >
                  <span>
                    {t("viewAllResults")} {totalMatches > 0 ? `(${totalMatches})` : ""}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Section 2: When input is empty — show Recent Searches & Popular Tags */
            <div className="p-4 space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t("recentSearches")}</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      {t("clearAll")}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => handleSelectRecentOrTag(term)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-[#D81B60] text-slate-700 text-xs font-medium rounded-full cursor-pointer transition-colors"
                      >
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded-full"
                          title="Remove item"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Category Searches */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#D81B60]" />
                  <span>{t("popularSearches")}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSelectRecentOrTag(tag)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-slate-700 hover:text-[#D81B60] text-xs font-medium rounded-full cursor-pointer transition-all"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sribees Hyperlocal Tip */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-[#D81B60] shrink-0" />
                <span>
                  {t("hubNotice")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
