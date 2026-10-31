"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Heart, Plus, Star, Check, Trash2 } from "lucide-react";
import { Product } from "../../interfaces/product.interface";
import { formatLKR } from "../../utils/formatCurrency";
import { Badge } from "../base/Badge";
import { useCartStore } from "../../state/cart.store";
import { useAuthStore } from "../../state/auth.store";
import { useAddToCart } from "../../api/queries/useCart";
import { useToastStore } from "../../state/toast.store";
import { useUIStore } from "../../state/ui.store";

import { useToggleWishlist, useWishlist } from "../../api/queries/useWishlist";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: Product;
  actionIcon?: "heart" | "trash";
  onRemove?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  actionIcon = "heart",
  onRemove,
}) => {
  const t = useTranslations("product");
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const addToCartMutation = useAddToCart();
  const toggleWishlistMutation = useToggleWishlist();
  const { data: wishlistData } = useWishlist();
  const { addToast } = useToastStore();
  const { openLoginModal, toggleWishlist, isInWishlist } = useUIStore();
  const productId = product.id || product.product_id || "";
  const isWishlistedInApi = wishlistData?.items?.some(
    (item) => item.product_id === productId || item.product?.id === productId,
  );
  const inWishlist = isInWishlist(productId) || Boolean(isWishlistedInApi);

  const [addedAnimation, setAddedAnimation] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
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
    addToCartMutation.mutate({
      product_id: productId,
      quantity: 1,
      name: product.title || product.name || "",
      price: product.price || 0,
      original_price: effectiveOriginalPrice || undefined,
      image: product.image || product.images?.[0]?.image_url || "",
      sku: product.sku || "",
      cashback_percentage:
        product.cashback_percentage != null
          ? Number(product.cashback_percentage)
          : undefined,
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(productId);

    if (isAuthenticated && productId) {
      toggleWishlistMutation.mutate({ productId });
    } else if (!isAuthenticated) {
      addToast({
        title: "Sign In for Sync",
        message:
          "Sign in to save your wishlist items permanently across devices.",
        type: "info",
      });
    }
  };

  const handleCardClick = () => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("sribees_recently_viewed");
        const items: Product[] = raw ? JSON.parse(raw) : [];
        const filtered = items.filter(
          (p) => (p.id || p.product_id) !== productId,
        );
        const updated = [product, ...filtered].slice(0, 20);
        localStorage.setItem(
          "sribees_recently_viewed",
          JSON.stringify(updated),
        );
      } catch (err) {
        console.error("Error saving recently viewed product:", err);
      }
    }
    router.push(`/productView?id=${productId}`);
  };

  const effectiveOriginalPrice =
    (product.global_price && product.global_price > product.price
      ? product.global_price
      : undefined) ||
    product.originalPrice ||
    (product.compare_at_price && product.compare_at_price > product.price
      ? product.compare_at_price
      : undefined);

  const rawDiscount = Number(product.discount_percentage);
  const calculatedDiscount =
    effectiveOriginalPrice && effectiveOriginalPrice > product.price
      ? Math.round(
          ((effectiveOriginalPrice - product.price) / effectiveOriginalPrice) *
            100,
        )
      : 0;

  const discountPercent =
    !isNaN(rawDiscount) && rawDiscount > 0
      ? Math.round(rawDiscount)
      : calculatedDiscount > 0
        ? calculatedDiscount
        : 0;

  const displayBadge =
    discountPercent > 0
      ? `${discountPercent}% OFF`
      : product.badge === "On Sale" || product.badge === "ON SALE"
        ? discountPercent > 0
          ? `${discountPercent}% OFF`
          : "Sale"
        : product.badge;

  const displayBadgeType =
    discountPercent > 0 || displayBadge === "Sale"
      ? "discount"
      : product.badgeType;

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-rose-200 p-4 shadow-xs hover:shadow-xl hover:shadow-rose-100/40 transition-all duration-300 flex flex-col justify-between relative cursor-pointer transform hover:-translate-y-1"
    >
      {/* Top Image Box */}
      <div className="relative w-full aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3.5 p-2">
        {/* Badge */}
        {displayBadge && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant={displayBadgeType}>{displayBadge}</Badge>
          </div>
        )}

        {/* Wishlist Heart or Trash Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (actionIcon === "trash") {
              if (typeof onRemove === "function") {
                onRemove();
              } else {
                handleWishlistToggle(e);
              }
            } else {
              handleWishlistToggle(e);
            }
          }}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            actionIcon === "trash"
              ? "bg-white/90 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-xs"
              : inWishlist
                ? "bg-rose-50 text-[#D81B60]"
                : "bg-white/80 text-slate-400 hover:text-[#D81B60] hover:bg-white"
          }`}
          title={
            actionIcon === "trash" ? "Remove from saved" : "Add to Wishlist"
          }
        >
          {actionIcon === "trash" ? (
            <Trash2 className="w-4 h-4" />
          ) : (
            <Heart
              className={`w-4 h-4 ${inWishlist ? "fill-[#D81B60]" : ""}`}
            />
          )}
        </button>

        {/* Product Image */}
        <img
          src={
            product.image ||
            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400"
          }
          alt={product.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400";
          }}
          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Product Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-800 group-hover:text-[#D81B60] transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5 mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-slate-700">
              {product.rating}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              ({product.reviewsCount}{" "}
              {product.reviewsCount === 1
                ? t("details.review")
                : t("details.reviews")}
              )
            </span>
          </div>
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="flex items-end justify-between pt-2 border-t border-slate-100 mt-2">
          <div>
            {effectiveOriginalPrice && (
              <span className="text-[11px] font-semibold text-slate-400 line-through block leading-none mb-0.5">
                {formatLKR(effectiveOriginalPrice)}
              </span>
            )}
            <span className="text-base font-bold text-[#D81B60] leading-none">
              {formatLKR(product.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
              addedAnimation
                ? "bg-emerald-600 text-white scale-110"
                : "bg-[#D81B60] hover:bg-[#C2185B] text-white shadow-rose-200 hover:scale-105 active:scale-95"
            }`}
            title={t("details.addToCart")}
          >
            {addedAnimation ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
