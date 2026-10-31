"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/state/auth.store";
import { useUIStore } from "@/state/ui.store";
import { useToastStore } from "@/state/toast.store";
import {
  useWishlist,
  useWishlistPriceDrops,
  useRemoveFromWishlist,
  useClearWishlist,
} from "@/api/queries/useWishlist";
import { useAddToCart } from "@/api/queries/useCart";
import { Product } from "@/interfaces/product.interface";

import { Breadcrumb } from "@/components/Breadcumb";
import { ProductCard } from "@/components/product/ProductCard";
import { SavedItemsHeader } from "./components/SavedItemsHeader";
import { PriceDropsSection } from "./components/PriceDropsSection";
import { RecentlyViewedSection } from "./components/RecentlyViewedSection";
import { SavedItemsSkeleton } from "./components/SavedItemsSkeleton";
import { SavedItemsEmpty } from "./components/SavedItemsEmpty";
import { SavedItemsGuestNotice } from "./components/SavedItemsGuestNotice";
import { QuickViewModal } from "@/components/product/QuickViewModal";

export default function SavedItemsPage() {
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const { addToast } = useToastStore();

  // Queries & Mutations
  const { data: wishlistData, isLoading: isWishlistLoading } = useWishlist();
  const { data: priceDropsData } = useWishlistPriceDrops();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const clearWishlistMutation = useClearWishlist();
  const addToCartMutation = useAddToCart();

  // Local State
  const [activeTab, setActiveTab] = useState<"all" | "pricedrops" | "recentlyViewed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddingAll, setIsAddingAll] = useState(false);

  // Recently Viewed State from LocalStorage
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("sribees_recently_viewed");
        if (raw) {
          setRecentlyViewed(JSON.parse(raw));
        }
      } catch (err) {
        console.error("Error loading recently viewed items:", err);
      }
    }
  }, []);

  const clearRecentlyViewed = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sribees_recently_viewed");
    }
    setRecentlyViewed([]);
    addToast({
      title: "History Cleared",
      message: "Recently viewed items history cleared.",
      type: "info",
    });
  };

  const wishlistItems = wishlistData?.items || [];
  const priceDrops = priceDropsData?.price_drops || [];

  // Extract distinct categories for filtering
  const categories = useMemo(() => {
    const set = new Set<string>();
    wishlistItems.forEach((item) => {
      if (item.product?.category) {
        set.add(item.product.category);
      }
    });
    return Array.from(set);
  }, [wishlistItems]);

  // Filtered Wishlist Items
  const filteredItems = useMemo(() => {
    return wishlistItems.filter((item) => {
      const prod = item.product;
      if (!prod) return false;

      const title = (prod.title || prod.name || "").toLowerCase();
      const brand = (prod.brand || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || title.includes(query) || brand.includes(query);
      const matchesCategory =
        selectedCategory === "All" ||
        (prod.category && prod.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [wishlistItems, searchQuery, selectedCategory]);

  const handleRemoveItem = React.useCallback(
    (productId: string) => {
      if (isAuthenticated && productId) {
        removeFromWishlistMutation.mutate({ productId });
      }
    },
    [isAuthenticated, removeFromWishlistMutation]
  );

  const handleAddAllToCart = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (filteredItems.length === 0) return;

    setIsAddingAll(true);
    try {
      for (const item of filteredItems) {
        if (item.product && item.product.inStock) {
          const productId = item.product.id || item.product.product_id || item.product_id;
          await addToCartMutation.mutateAsync({
            product_id: productId,
            quantity: 1,
            name: item.product.title || item.product.name || "",
            price: item.product.price || 0,
            image: item.product.image || item.product.images?.[0]?.image_url || "",
            sku: item.product.sku || "",
            cashback_percentage:
              item.product.cashback_percentage != null
                ? Number(item.product.cashback_percentage)
                : undefined,
          });
        }
      }
      addToast({
        title: "All Items Added",
        message: "In-stock items moved to your shopping cart.",
        type: "success",
      });
    } catch (err) {
      console.error("Error adding all to cart:", err);
    } finally {
      setIsAddingAll(false);
    }
  };

  const handleClearWishlist = () => {
    if (confirm("Are you sure you want to clear all saved wishlist items?")) {
      clearWishlistMutation.mutate();
    }
  };

  return (
    <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[{ label: "Saved Items & Viewed", isCurrent: true }]}
        className="mb-5"
      />

      {/* Guest Banner Notice */}
      {!isAuthenticated && <SavedItemsGuestNotice />}

      {/* Header Controls */}
      <SavedItemsHeader
        totalSaved={wishlistItems.length}
        priceDropCount={priceDrops.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        categories={categories}
        onCategoryChange={setSelectedCategory}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddAllToCart={handleAddAllToCart}
        onClearWishlist={handleClearWishlist}
        isAddingAll={isAddingAll}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        recentlyViewedCount={recentlyViewed.length}
      />

      {/* Content Body */}
      {activeTab === "all" && (
        <>
          {isWishlistLoading ? (
            <SavedItemsSkeleton count={10} viewMode={viewMode} />
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {filteredItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                const pId = product.id || product.product_id || item.product_id;
                return (
                  <ProductCard
                    key={item.wishlist_id || pId}
                    product={product}
                    actionIcon="trash"
                    onRemove={() => handleRemoveItem(pId)}
                  />
                );
              })}
            </div>
          ) : (
            <SavedItemsEmpty
              hasFilter={Boolean(searchQuery || selectedCategory !== "All")}
              onClearFilter={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            />
          )}
        </>
      )}

      {/* Price Drops Tab */}
      {activeTab === "pricedrops" && (
        <PriceDropsSection
          priceDrops={priceDrops}
          onRemove={handleRemoveItem}
        />
      )}

      {/* Recently Viewed Tab */}
      {activeTab === "recentlyViewed" && (
        <RecentlyViewedSection
          products={recentlyViewed}
          onClearHistory={clearRecentlyViewed}
        />
      )}

      {/* Quick View Modal */}
      <QuickViewModal />
    </main>
  );
}
