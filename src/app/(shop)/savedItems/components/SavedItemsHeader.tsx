import React from "react";
import { Header } from "@/components/Header";
import { useTranslations } from "next-intl";
import {
  Heart,
  Search,
  Filter,
  Grid,
  List,
  ShoppingCart,
  Trash2,
  TrendingDown,
  Sparkles,
} from "lucide-react";

interface SavedItemsHeaderProps {
  totalSaved: number;
  priceDropCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  categories: string[];
  onCategoryChange: (cat: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onAddAllToCart: () => void;
  onClearWishlist: () => void;
  isAddingAll: boolean;
  activeTab: "all" | "pricedrops" | "recentlyViewed";
  onTabChange: (tab: "all" | "pricedrops" | "recentlyViewed") => void;
  recentlyViewedCount: number;
}

export const SavedItemsHeader: React.FC<SavedItemsHeaderProps> = ({
  totalSaved,
  priceDropCount,
  searchQuery,
  onSearchChange,
  selectedCategory,
  categories,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  onAddAllToCart,
  onClearWishlist,
  isAddingAll,
  activeTab,
  onTabChange,
  recentlyViewedCount,
}) => {
  const t = useTranslations("savedItems");

  return (
    <div className="mb-3 space-y-4 sm:space-y-5">
      {/* Header Title & Batch Actions */}
      <Header
        badge={t("header.badge")}
        title={t("header.title")}
        description={t("header.subtitle")}
        size="md"
        actions={
          totalSaved > 0 && activeTab === "all" ? (
            <>
              <button
                onClick={onAddAllToCart}
                disabled={isAddingAll}
                className="flex items-center gap-2 px-4 h-10 rounded-xl bg-[#D81B60] hover:bg-[#c21753] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{isAddingAll ? "Adding All..." : t("header.addAllBtn")}</span>
              </button>

              <button
                onClick={onClearWishlist}
                className="flex items-center gap-1.5 px-3 h-10 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
                title="Clear all saved items"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("header.clearBtn")}</span>
              </button>
            </>
          ) : undefined
        }
      />
    </div>
  );
};
