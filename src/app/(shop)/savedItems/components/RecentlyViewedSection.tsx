"use client";

import React from "react";
import { Product } from "@/interfaces/product.interface";
import { ProductCard } from "@/components/product/ProductCard";
import { Sparkles, Trash2, Clock } from "lucide-react";

interface RecentlyViewedSectionProps {
  products: Product[];
  onClearHistory: () => void;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  products,
  onClearHistory,
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800">
          No Recently Viewed Products
        </h3>
        <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto font-medium">
          Products you browse on Sribees will show up here so you can easily find them later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg md:text-xl font-black text-slate-900">
            Recently Viewed ({products.length})
          </h2>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id || product.product_id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
};
