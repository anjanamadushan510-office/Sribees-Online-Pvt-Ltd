"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  TrendingDown,
  Eye,
  Check,
  Tag,
  AlertCircle,
} from "lucide-react";
import { WishlistItem } from "@/interfaces/wishlist.interface";
import { Product } from "@/interfaces/product.interface";
import { formatLKR } from "@/utils/formatCurrency";

interface SavedItemCardProps {
  item: WishlistItem;
  product: Product;
  viewMode?: "grid" | "list";
  onRemove: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export const SavedItemCard: React.FC<SavedItemCardProps> = ({
  item,
  product,
  viewMode = "grid",
  onRemove,
  onAddToCart,
  onQuickView,
}) => {
  const router = useRouter();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const productId = product.id || product.product_id || item.product_id;
  const price = product.price || 0;
  const originalPrice =
    (product.global_price && product.global_price > price
      ? product.global_price
      : undefined) ||
    product.originalPrice ||
    product.compare_at_price;
  const isPriceDrop =
    item.price_at_watch && item.price_at_watch > price && price > 0;
  const priceDropAmount = isPriceDrop ? item.price_at_watch! - price : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(productId);
  };

  const handleCardClick = () => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("sribees_recently_viewed");
        const items: Product[] = raw ? JSON.parse(raw) : [];
        const filtered = items.filter(
          (p) => (p.id || p.product_id) !== productId
        );
        const updated = [product, ...filtered].slice(0, 20);
        localStorage.setItem("sribees_recently_viewed", JSON.stringify(updated));
      } catch (err) {
        console.error("Error updating recently viewed:", err);
      }
    }
    router.push(`/productView?id=${productId}`);
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-2xl border border-slate-200/80 hover:border-rose-200 p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-center gap-4 cursor-pointer relative"
      >
        {/* Product Image */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-slate-50 rounded-xl overflow-hidden shrink-0 p-1.5">
          <img
            src={
              product.image ||
              "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400"
            }
            alt={product.title || product.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400";
            }}
            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
          />

          {isPriceDrop && (
            <div className="absolute top-1.5 left-1.5 z-10 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
              <TrendingDown className="w-2.5 h-2.5" />
              <span>Drop</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              {product.brand || "SRIBEES"}
            </span>
            {product.category && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.2 rounded-full">
                  {product.category}
                </span>
              </>
            )}
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#D81B60] transition-colors line-clamp-2">
            {product.title || product.name}
          </h3>

          <div className="flex items-baseline justify-center sm:justify-start gap-2">
            <span className="text-sm sm:text-base font-black text-slate-900">
              {formatLKR(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {formatLKR(originalPrice)}
              </span>
            )}
            {product.unit && (
              <span className="text-xs text-slate-400 font-normal">
                / {product.unit}
              </span>
            )}
          </div>

          {isPriceDrop && (
            <p className="text-[11px] font-bold text-emerald-600 flex items-center justify-center sm:justify-start gap-1">
              <Tag className="w-3 h-3" />
              <span>Price dropped by {formatLKR(priceDropAmount)}!</span>
            </p>
          )}

          {!product.inStock && (
            <p className="text-[11px] font-semibold text-rose-500 flex items-center justify-center sm:justify-start gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Out of Stock</span>
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-1 sm:pt-0">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              addedAnimation
                ? "bg-emerald-600 text-white"
                : product.inStock
                  ? "bg-[#D81B60] hover:bg-[#c21753] text-white shadow-xs"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1">
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="Quick View"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleRemove}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
              title="Remove from saved"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Layout matching ProductCard styling
  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-rose-200 p-3.5 shadow-xs hover:shadow-xl hover:shadow-rose-100/40 transition-all duration-300 flex flex-col justify-between relative cursor-pointer transform hover:-translate-y-1"
    >
      {/* Top Image Box */}
      <div className="relative w-full aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3 p-1.5">
        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer shadow-xs"
          title="Remove from saved"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Price Drop / Stock Badge */}
        {isPriceDrop ? (
          <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
            <TrendingDown className="w-2.5 h-2.5" />
            <span>Save {formatLKR(priceDropAmount)}</span>
          </div>
        ) : !product.inStock ? (
          <div className="absolute top-2 left-2 z-10 bg-slate-800/90 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
            Out of Stock
          </div>
        ) : null}

        {/* Product Image */}
        <img
          src={
            product.image ||
            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400"
          }
          alt={product.title || product.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400";
          }}
          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Details Box */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            {product.brand || "SRIBEES"}
          </span>
          <h3 className="text-xs font-bold text-slate-800 group-hover:text-[#D81B60] transition-colors line-clamp-2 mt-0.5 leading-snug">
            {product.title || product.name}
          </h3>
        </div>

        <div className="pt-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-slate-900">
              {formatLKR(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-[11px] text-slate-400 line-through font-medium">
                {formatLKR(originalPrice)}
              </span>
            )}
          </div>
          {product.unit && (
            <p className="text-[10px] text-slate-400 font-medium">
              {product.unit}
            </p>
          )}

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full mt-2.5 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              addedAnimation
                ? "bg-emerald-600 text-white"
                : product.inStock
                  ? "bg-[#D81B60] hover:bg-[#c21753] text-white shadow-xs"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
