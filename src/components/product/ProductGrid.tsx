"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  useHomeFeedProducts,
  useProducts,
} from "../../api/queries/useProducts";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "../base/Skeleton";
import { useUIStore } from "../../state/ui.store";
import { useDebounce } from "../../hooks/useDebounce";
import { ChevronRight } from "lucide-react";

export const ProductGrid: React.FC = () => {
  const t = useTranslations("home.popularPicks");
  const { searchQuery, setSearchQuery } = useUIStore();
  const debouncedSearch = useDebounce(searchQuery, 300);
  const isSearching = Boolean(debouncedSearch.trim());

  const {
    data: homeFeedProducts,
    isLoading: isHomeFeedLoading,
    isError: isHomeFeedError,
  } = useHomeFeedProducts(10);

  const {
    data: searchProducts,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useProducts(undefined, debouncedSearch);

  const products = isSearching ? searchProducts : homeFeedProducts;
  const isLoading = isSearching ? isSearchLoading : isHomeFeedLoading;
  const isError = isSearching ? isSearchError : isHomeFeedError;

  return (
    <section
      id="popular-picks-section"
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 lg:pt-3 pb-3 sm:pb-6 lg:pb-10"
    >
      {/* Header & View All Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2.5 sm:mb-8">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D81B60]">
            {t("badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            {t("title")}
          </h2>
          <p className="hidden sm:block text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {t("description")}
          </p>
        </div>

        {/* View All Products Link */}
        <div className="hidden sm:block">
          <Link
            href="/product"
            className="flex items-center gap-1 text-xs font-semibold text-[#D81B60] hover:text-[#C2185B] transition-colors cursor-pointer"
          >
            <span>{t("viewAll")}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-2xl border border-slate-100 space-y-4"
            >
              <Skeleton className="w-full aspect-square rounded-xl" />
              <Skeleton className="w-20 h-3" />
              <Skeleton className="w-40 h-4" />
              <Skeleton className="w-28 h-3" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="w-24 h-6" />
                <Skeleton className="w-9 h-9 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-rose-50 text-[#D81B60] rounded-2xl text-sm font-semibold">
          Error loading products. Please try again later.
        </div>
      ) : products?.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-base font-bold text-slate-700">
            No products found matching "{searchQuery}"
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try clearing your search keyword.
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 bg-[#D81B60] text-white text-xs font-bold rounded-full cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
          {products?.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* View All Button */}
      {products && products.length > 10 && (
        <div className="mt-10 flex justify-center">
          <Link
            href="/product"
            className="group flex items-center gap-1.5 px-8 py-3 rounded-full border border-rose-300 text-[#D81B60] font-extrabold text-xs hover:bg-[#D81B60] hover:text-white transition-all cursor-pointer shadow-xs hover:shadow-md"
          >
            <span>View All Products</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1 stroke-[2.5]" />
          </Link>
        </div>
      )}
    </section>
  );
};
