"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";

interface SavedItemsEmptyProps {
  hasFilter: boolean;
  onClearFilter?: () => void;
}

export const SavedItemsEmpty: React.FC<SavedItemsEmptyProps> = ({
  hasFilter,
  onClearFilter,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center max-w-md mx-auto space-y-4 my-6 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#D81B60] flex items-center justify-center mx-auto">
        <Heart className="w-8 h-8 fill-rose-100 text-[#D81B60]" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">
          {hasFilter ? "No Matching Saved Items" : "Your Saved Items is Empty"}
        </h3>
        <p className="text-xs text-slate-500 font-normal leading-relaxed">
          {hasFilter
            ? "We couldn't find any saved items matching your search or category filter."
            : "Save items you love by tapping the heart icon on any product card while browsing our store!"}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        {hasFilter && onClearFilter ? (
          <button
            onClick={onClearFilter}
            className="w-full sm:w-auto px-5 h-10 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 cursor-pointer transition-all"
          >
            Reset Filters
          </button>
        ) : (
          <Link
            href="/product"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 h-10 rounded-xl bg-[#D81B60] hover:bg-[#c21753] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Explore Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
