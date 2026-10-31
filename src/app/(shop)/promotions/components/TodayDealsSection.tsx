"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  ShoppingBag,
  Flame,
  AlertCircle,
  Check,
  Plus,
  Eye,
} from "lucide-react";
import { useTodayDeals } from "@/api/queries/usePromotions";
import { formatLKR } from "@/utils/formatCurrency";
import { useCartStore } from "@/state/cart.store";
import { useAuthStore } from "@/state/auth.store";
import { useUIStore } from "@/state/ui.store";
import { useToastStore } from "@/state/toast.store";
import { useAddToCart } from "@/api/queries/useCart";
import { Skeleton } from "@/components/base/Skeleton";
import { TodayDeal } from "@/interfaces/promotion.interface";

interface TodayDealsSectionProps {
  id?: string;
}

export const TodayDealsSection: React.FC<TodayDealsSectionProps> = ({
  id = "today-deals-section",
}) => {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const { addToast } = useToastStore();
  const addToCartMutation = useAddToCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [addedItemsMap, setAddedItemsMap] = useState<Record<string, boolean>>(
    {},
  );

  const categories = [
    { label: "All Deals", value: "All" },
    { label: "Fruits & Vegetables", value: "Fruits & Vegetables" },
    { label: "Dairy & Eggs", value: "Dairy & Eggs" },
    { label: "Meat & Seafood", value: "Meat & Seafood" },
    { label: "Pantry & Spices", value: "Pantry & Spices" },
  ];

  const {
    data: deals = [],
    isLoading,
    isError,
    refetch,
  } = useTodayDeals(selectedCategory);

  const handleAddToCart = (e: React.MouseEvent, deal: TodayDeal) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast({
        title: "Sign In Required",
        message: "Please sign in or register to add items to your cart.",
        type: "warning",
      });
      openLoginModal();
      return;
    }
    const productId = deal.product.id || deal.product.product_id || "";
    addToCartMutation.mutate({
      product_id: productId,
      quantity: 1,
      name: deal.product.title || deal.product.name || "",
      price: deal.product.price || 0,
      image: deal.product.image || deal.product.images?.[0]?.image_url || "",
      sku: deal.product.sku || "",
      cashback_percentage:
        deal.product.cashback_percentage != null
          ? Number(deal.product.cashback_percentage)
          : undefined,
    });
    setAddedItemsMap((prev) => ({ ...prev, [deal.id]: true }));
    setTimeout(() => {
      setAddedItemsMap((prev) => ({ ...prev, [deal.id]: false }));
    }, 1200);
  };

  const handleCardClick = (productId: string) => {
    router.push(`/productView?id=${productId}`);
  };

  return (
    <section id={id} className="mb-14 scroll-mt-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-[#D81B60] p-6 rounded-3xl text-white mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-rose-900/10">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-200 animate-bounce" />
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/30">
              Limited Time Deals
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
            Today's Super Deals
          </h2>
          <p className="text-xs sm:text-sm text-rose-100 font-medium">
            Massive price drops on fresh groceries, seafood & pantry items.
            Refreshed daily!
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.value
                  ? "bg-slate-950 text-amber-300 shadow-lg"
                  : "bg-white/20 hover:bg-white/30 text-white border border-white/20"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Deals */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4"
            >
              <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
              <Skeleton className="w-2/3 h-5 rounded-md" />
              <Skeleton className="w-full h-4 rounded-md" />
              <Skeleton className="w-full h-3 rounded-full" />
              <div className="flex justify-between pt-2">
                <Skeleton className="w-24 h-6 rounded-md" />
                <Skeleton className="w-24 h-9 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 text-[#D81B60] rounded-3xl space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <h3 className="text-base font-extrabold">
            Failed to load Today's Deals
          </h3>
          <p className="text-xs text-slate-600">
            Please try again to view active flash sales.
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-[#D81B60] text-white text-xs font-bold rounded-full cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : deals.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Zap className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800">
            No deals found in "{selectedCategory}"
          </h3>
          <p className="text-xs text-slate-500">
            Check back later for fresh flash sales or choose another category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5  gap-6">
          {deals.map((deal) => {
            const isAdded = addedItemsMap[deal.id];

            return (
              <div
                key={deal.id}
                onClick={() => handleCardClick(deal.product.id)}
                className="group bg-white rounded-3xl border border-slate-200/90 hover:border-rose-300 p-5 shadow-xs hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1 relative"
              >
                {/* Discount Ribbon Tag */}
                <div className="absolute top-4 left-4 z-10 bg-[#D81B60] text-white px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{deal.discountPercentage}% OFF</span>
                </div>

                {/* Product Image */}
                <div className="relative w-full aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden mb-4 p-3">
                  <img
                    src={deal.product.image}
                    alt={deal.product.title}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                  />
                  {deal.tag && (
                    <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider">
                      {deal.tag}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block mb-0.5">
                      {deal.product.brand} • {deal.product.category}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#D81B60] transition-colors line-clamp-2 leading-snug">
                      {deal.product.title}
                    </h3>
                  </div>

                  {/* Claimed Progress Bar */}
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-rose-600">
                        ⚡ {deal.claimedPercentage}% Claimed
                      </span>
                      <span className="text-slate-500">
                        {deal.stockRemaining} left
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-[#D81B60] rounded-full transition-all duration-500"
                        style={{ width: `${deal.claimedPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 line-through block leading-none mb-1">
                        {formatLKR(deal.originalPrice)}
                      </span>
                      <span className="text-xl font-black text-[#D81B60] leading-none">
                        {formatLKR(deal.dealPrice)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(e, deal)}
                      className={`px-4 py-2.5 rounded-full text-xs font-black tracking-wide transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                        isAdded
                          ? "bg-emerald-600 text-white scale-105"
                          : "bg-[#D81B60] hover:bg-[#C2185B] text-white shadow-rose-200 active:scale-95"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>ADDED</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>ADD TO CART</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
