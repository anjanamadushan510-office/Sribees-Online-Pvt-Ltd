"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useCategories } from "@/api/queries/useCategories";
import { CategoryHeroHeader } from "./components/CategoryHeroHeader";
import { FeaturedCategories } from "./components/FeaturedCategories";
import { CategoryCardItem } from "./components/CategoryCardItem";
import { CategoryTrustBanner } from "./components/CategoryTrustBanner";
import { Skeleton } from "@/components/base/Skeleton";
import { ChevronRight, Grid, AlertCircle, RefreshCw } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Breadcrumb } from "@/components/Breadcumb";

export default function AllCategoriesPage() {
  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useCategories({ hierarchical: true });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Featured Categories filter
  const featuredCategoriesList = useMemo(() => {
    return categories.filter((c) => c.featured);
  }, [categories]);

  // Tab Filtering logic
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Search filter check
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        cat.title.toLowerCase().includes(query) ||
        cat.subtitle.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query) ||
        cat.subcategories?.some((sub) => sub.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Tab filter check
      if (selectedTab === "fresh") {
        return (
          cat.slug.includes("fruits") ||
          cat.slug.includes("dairy") ||
          cat.slug.includes("meat")
        );
      }
      if (selectedTab === "pantry") {
        return (
          cat.slug.includes("pantry") ||
          cat.slug.includes("beverages") ||
          cat.slug.includes("snacks")
        );
      }
      if (selectedTab === "lifestyle") {
        return cat.slug.includes("household") || cat.slug.includes("personal");
      }

      return true;
    });
  }, [categories, searchQuery, selectedTab]);

  return (
    <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[{ label: "All Categories", isCurrent: true }]}
        className="mb-6"
      />

      {/* Hero Section with Search & Tabs */}
      <CategoryHeroHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCategories={filteredCategories.length}
      />

      {/* Category Items Grid / List View */}
      {isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6"
              : "space-y-4"
          }
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <React.Fragment key={idx}>
              {/* Mobile Skeleton */}
              <div className="sm:hidden bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-3.5 shadow-sm">
                <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-28 h-4 rounded-md" />
                  <Skeleton className="w-40 h-3 rounded-md" />
                </div>
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              </div>

              {/* Desktop Skeleton */}
              <div className="hidden sm:block bg-white p-6 rounded-3xl border border-slate-200 space-y-4 text-center">
                <Skeleton className="w-28 h-28 rounded-full mx-auto" />
                <Skeleton className="w-32 h-5 rounded-md mx-auto" />
                <Skeleton className="w-16 h-3 rounded-md mx-auto" />
                <Skeleton className="w-48 h-3 rounded-md mx-auto" />
                <div className="pt-3 border-t border-slate-100">
                  <Skeleton className="w-24 h-4 rounded-md mx-auto" />
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      ) : isError ? (
        <div className="p-10 text-center bg-rose-50 border border-rose-200 text-[#D81B60] rounded-3xl space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <h3 className="text-base font-extrabold">
            Failed to load store categories
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            We encountered a network issue while fetching the store directory.
            Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-[#D81B60] text-white text-xs font-bold rounded-full shadow-md shadow-rose-200 hover:bg-[#C2185B] transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4 max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Grid className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">
              No categories found matching "{searchQuery}"
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Try searching for broader keywords like "Vegetables", "Milk",
              "Tea", or "Snacks".
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTab("all");
            }}
            className="px-6 py-2.5 bg-[#D81B60] text-white text-xs font-bold rounded-full shadow-md shadow-rose-200 hover:scale-105 transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6"
              : "space-y-4"
          }
        >
          {filteredCategories.map((category) => (
            <CategoryCardItem
              key={category.id}
              category={category}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Store Guarantees & Delivery Trust Banner */}
      <CategoryTrustBanner />
    </main>
  );
}
