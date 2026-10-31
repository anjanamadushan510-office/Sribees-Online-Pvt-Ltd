"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/product/ProductCard";
import { SribeesAiBanner } from "./components/SribeesAiBanner";
import { useProducts } from "@/api/queries/useProducts";
import { useUIStore } from "@/state/ui.store";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/base/Skeleton";
import { Breadcrumb } from "@/components/Breadcumb";
import { sanitizeSearchQuery } from "@/utils/sanitize";
import {
  ProductFilterParams,
  ProductSortBy,
  ProductSortOrder,
  ProductPromotion,
} from "@/interfaces/product.interface";
import { ArrowDownWideNarrow, Star, Tag, Percent, X } from "lucide-react";

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const {
    activeFilterCategory,
    setActiveFilterCategory,
    searchQuery,
    setSearchQuery,
  } = useUIStore();

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedPromotions, setSelectedPromotions] = useState<ProductPromotion[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<ProductSortBy | "">("");
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParamsString = searchParams.toString();

  // Sync URL search parameters into state (only when URL parameters actually change)
  useEffect(() => {
    if (!searchParamsString) {
      setSelectedCategoryIds([]);
      setActiveFilterCategory("All");
      setSelectedRating(null);
      setSelectedPromotions([]);
      setMinPrice(null);
      setMaxPrice(null);
      setSortBy("");
      setSortOrder("desc");
      return;
    }

    // Search query
    const rawSearch = searchParams.get("search") ?? searchParams.get("q");
    if (rawSearch !== null) {
      const clean = sanitizeSearchQuery(rawSearch);
      setSearchQuery(clean);
    }

    // Category Name
    const rawCategory = searchParams.get("category");
    if (rawCategory !== null) {
      const cleanCategory = rawCategory.trim();
      setActiveFilterCategory(cleanCategory || "All");
    }

    // Categories (comma-separated or single)
    const rawCategoryId = searchParams.get("category_id");
    if (rawCategoryId) {
      const ids = rawCategoryId
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      setSelectedCategoryIds(ids);
    } else if (rawCategory === null) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds([]);
    }

    // Rating
    const rawRating = searchParams.get("min_rating");
    if (rawRating) {
      const numRating = Number(rawRating);
      if (!isNaN(numRating) && numRating >= 1 && numRating <= 5) {
        setSelectedRating(numRating);
      }
    } else {
      setSelectedRating(null);
    }

    // Promotions
    const rawPromotions = [
      ...searchParams.getAll("promotion"),
      ...(searchParams.get("feed") === "quick_sale" ? ["sale"] : []),
      ...(searchParams.get("linkType") === "quick_sale" ? ["sale"] : []),
    ];
    const validPromos: ProductPromotion[] = [];
    rawPromotions.forEach((p) => {
      const normalized = p === "quick_sale" || p === "quick-sale" ? "sale" : p;
      if (
        (normalized === "sale" || normalized === "cashback") &&
        !validPromos.includes(normalized as ProductPromotion)
      ) {
        validPromos.push(normalized as ProductPromotion);
      }
    });
    setSelectedPromotions(validPromos);

    // Price
    const rawMinPrice = searchParams.get("min_price");
    if (rawMinPrice && !isNaN(Number(rawMinPrice))) {
      setMinPrice(Number(rawMinPrice));
    } else {
      setMinPrice(null);
    }
    const rawMaxPrice = searchParams.get("max_price");
    if (rawMaxPrice && !isNaN(Number(rawMaxPrice))) {
      setMaxPrice(Number(rawMaxPrice));
    } else {
      setMaxPrice(null);
    }

    // Sort
    const rawSortBy = searchParams.get("sort_by") as ProductSortBy;
    if (
      rawSortBy === "rating" ||
      rawSortBy === "price" ||
      rawSortBy === "name" ||
      rawSortBy === "created_at" ||
      rawSortBy === "view_count"
    ) {
      setSortBy(rawSortBy);
      const rawSortOrder = searchParams.get("sort_order") as ProductSortOrder;
      if (rawSortOrder === "asc" || rawSortOrder === "desc") {
        setSortOrder(rawSortOrder);
      }
    } else {
      setSortBy("");
      setSortOrder("desc");
    }
  }, [searchParamsString, searchParams, setSearchQuery, setActiveFilterCategory]);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Construct structured filter params for TanStack Query & Backend API
  const filterParams: ProductFilterParams = useMemo(() => {
    const params: ProductFilterParams = {};

    if (selectedCategoryIds.length > 0) {
      params.category_id = selectedCategoryIds;
    } else if (activeFilterCategory && activeFilterCategory !== "All") {
      params.category_id = activeFilterCategory;
    }

    if (selectedRating != null) {
      params.min_rating = selectedRating;
    }

    if (selectedPromotions.length > 0) {
      params.promotion = selectedPromotions;
    }

    if (minPrice != null) {
      params.min_price = minPrice;
    }

    if (maxPrice != null) {
      params.max_price = maxPrice;
    }

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    if (sortBy) {
      params.sort_by = sortBy;
      params.sort_order = sortOrder;
    }

    return params;
  }, [
    selectedCategoryIds,
    activeFilterCategory,
    selectedRating,
    selectedPromotions,
    minPrice,
    maxPrice,
    debouncedSearch,
    sortBy,
    sortOrder,
  ]);

  const {
    data: products,
    isLoading,
    isError,
  } = useProducts(filterParams);

  const ITEMS_PER_PAGE = 12;
  const totalItems = products?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterParams]);

  // Adjust page if total pages decreases
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleTogglePromotion = (promo: ProductPromotion) => {
    setSelectedPromotions((prev) =>
      prev.includes(promo) ? prev.filter((p) => p !== promo) : [...prev, promo]
    );
  };

  const handlePriceChange = (min: number | null, max: number | null) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleResetFilters = () => {
    setSelectedCategoryIds([]);
    setActiveFilterCategory("All");
    setSelectedRating(null);
    setSelectedPromotions([]);
    setMinPrice(null);
    setMaxPrice(null);
    setSortBy("");
    setSortOrder("desc");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategoryIds.length > 0 ||
    (activeFilterCategory !== "All" && selectedCategoryIds.length === 0) ||
    selectedRating != null ||
    selectedPromotions.length > 0 ||
    minPrice != null ||
    maxPrice != null ||
    sortBy !== "" ||
    searchQuery.trim() !== "";

  return (
    <main className="flex-1 max-w-350 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumb
        items={
          activeFilterCategory && activeFilterCategory !== "All"
            ? [
                { label: "Shop", href: "/product" },
                { label: activeFilterCategory, isCurrent: true },
              ]
            : [{ label: "Shop", isCurrent: true }]
        }
        className="mb-6"
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Dynamic Sidebar Filter Component */}
        <FilterSidebar
          selectedCategoryIds={selectedCategoryIds}
          onSelectCategoryIds={(ids) => {
            setSelectedCategoryIds(ids);
            if (ids.length === 0) {
              setActiveFilterCategory("All");
            }
          }}
          selectedCategory={activeFilterCategory}
          onSelectCategory={(cat) => {
            setActiveFilterCategory(cat);
          }}
          selectedRating={selectedRating}
          onSelectRating={setSelectedRating}
          selectedPromotions={selectedPromotions}
          onTogglePromotion={handleTogglePromotion}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(sanitizeSearchQuery(q))}
          onReset={handleResetFilters}
        />

        {/* Right Main Grid Area */}
        <div className="flex-1 w-full space-y-5">
          {/* Top Catalog Toolbar: Result count, Sort Dropdown & Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {isLoading ? (
                  "Loading catalog..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="text-[#D81B60] font-extrabold">
                      {totalItems > 0 ? startIndex + 1 : 0}–
                      {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
                    </span>{" "}
                    of <span className="font-extrabold">{totalItems}</span> products
                  </>
                )}
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowDownWideNarrow className="w-4 h-4 text-slate-400 shrink-0" />
              <label
                htmlFor="sort-select"
                className="text-xs font-semibold text-slate-500 hidden sm:inline-block"
              >
                Sort by:
              </label>
              <select
                id="sort-select"
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val || val === ":") {
                    setSortBy("");
                    setSortOrder("desc");
                  } else {
                    const [field, order] = val.split(":") as [
                      ProductSortBy,
                      ProductSortOrder,
                    ];
                    setSortBy(field);
                    setSortOrder(order);
                  }
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#D81B60] focus:bg-white cursor-pointer"
              >
                <option value=":">Default</option>
                <option value="rating:desc">Customer Rating (High to Low)</option>
                <option value="price:asc">Price (Low to High)</option>
                <option value="price:desc">Price (High to Low)</option>
                <option value="name:asc">Product Name (A–Z)</option>
                <option value="created_at:desc">Newest Arrivals</option>
                <option value="view_count:desc">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips / Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-50/80 border border-slate-200/60 p-3 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Active Filters:
              </span>

              {/* Search query chip */}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-rose-200 text-[#D81B60] shadow-xs">
                  <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="hover:text-rose-800 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Rating chip */}
              {selectedRating != null && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-900 shadow-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>★ {selectedRating} & up</span>
                  <button
                    type="button"
                    onClick={() => setSelectedRating(null)}
                    className="hover:text-amber-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Promotion chips */}
              {selectedPromotions.includes("sale") && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 border border-rose-200 text-[#D81B60] shadow-xs">
                  <Tag className="w-3 h-3" />
                  <span>Quick Sale</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePromotion("sale")}
                    className="hover:text-rose-800 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedPromotions.includes("cashback") && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs">
                  <Percent className="w-3 h-3" />
                  <span>Special Cashback</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePromotion("cashback")}
                    className="hover:text-emerald-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Price range chip */}
              {(minPrice != null || maxPrice != null) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-800 shadow-xs">
                  <span>
                    LKR {minPrice ?? 0} — {maxPrice ?? "Any"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePriceChange(null, null)}
                    className="hover:text-slate-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Category chip if single */}
              {activeFilterCategory &&
                activeFilterCategory !== "All" &&
                selectedCategoryIds.length === 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 border border-rose-200 text-[#D81B60] shadow-xs">
                    <span>{activeFilterCategory}</span>
                    <button
                      type="button"
                      onClick={() => setActiveFilterCategory("All")}
                      className="hover:text-rose-800 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

              {/* Clear all button */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#D81B60] hover:underline ml-auto cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4"
                >
                  <Skeleton className="w-full aspect-square rounded-xl" />
                  <Skeleton className="w-20 h-3" />
                  <Skeleton className="w-40 h-4" />
                  <Skeleton className="w-28 h-3" />
                  <Skeleton className="w-full h-9 rounded-xl" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-rose-50 text-[#D81B60] rounded-2xl text-sm font-semibold border border-rose-200">
              Failed to load products. Please try again.
            </div>
          ) : products?.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-base font-bold text-slate-700">
                No products found matching your filters.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try loosening your filter criteria, resetting price ranges, or searching for other items.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-5 py-2.5 bg-[#D81B60] text-white text-xs font-extrabold rounded-full shadow-md shadow-rose-200 hover:scale-105 transition-all cursor-pointer"
              >
                Reset Catalog Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedProducts?.map((product) => (
                <ProductCard key={product.id || product.product_id} product={product} />
              ))}
            </div>
          )}

          {/* SRIBEEES AI Interactive Banner */}
          <SribeesAiBanner />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default function ProductCatalogPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 max-w-350 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <Skeleton className="w-full aspect-square rounded-xl" />
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-full h-9 rounded-xl" />
              </div>
            ))}
          </div>
        </main>
      }
    >
      <ProductCatalogContent />
    </Suspense>
  );
}
