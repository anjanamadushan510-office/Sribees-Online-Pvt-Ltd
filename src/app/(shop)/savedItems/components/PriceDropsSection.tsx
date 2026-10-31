"use client";

import React from "react";
import { TrendingDown, Sparkles } from "lucide-react";
import { PriceDropItem } from "@/interfaces/wishlist.interface";
import { ProductCard } from "@/components/product/ProductCard";

interface PriceDropsSectionProps {
  priceDrops: PriceDropItem[];
  onRemove?: (productId: string) => void;
}

export const PriceDropsSection: React.FC<PriceDropsSectionProps> = ({
  priceDrops,
  onRemove,
}) => {
  if (!priceDrops || priceDrops.length === 0) {
    return (
      <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-6 text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <TrendingDown className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-amber-900">
          No Price Drops Right Now
        </h3>
        <p className="text-xs text-amber-700 max-w-md mx-auto font-medium">
          None of your saved items currently have a price drop. We&apos;ll automatically alert you when prices drop on your wishlist!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 sm:p-5 text-white shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-amber-100" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold">
            Price Drops Detected on {priceDrops.length} Saved {priceDrops.length === 1 ? "Item" : "Items"}!
          </h2>
          <p className="text-xs text-amber-100 font-medium">
            Prices for these products have recently dropped. Grab them before prices change!
          </p>
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {priceDrops.map((dropItem) => {
          const product = dropItem.product;
          if (!product) return null;
          const pId = product.id || product.product_id || dropItem.product_id;
          return (
            <ProductCard
              key={dropItem.product_id || dropItem.wishlist_id}
              product={product}
              actionIcon="trash"
              onRemove={() => onRemove && onRemove(pId)}
            />
          );
        })}
      </div>
    </div>
  );
};
