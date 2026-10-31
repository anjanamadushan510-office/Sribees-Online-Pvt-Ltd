"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Sparkles,
  Check,
  Banknote,
  ShieldCheck,
  Package,
  Layers,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Product, ProductVariant } from "@/interfaces/product.interface";
import { formatLKR } from "@/utils/formatCurrency";
import { useCartStore } from "@/state/cart.store";
import { useAuthStore } from "@/state/auth.store";
import { useUIStore } from "@/state/ui.store";
import { useToastStore } from "@/state/toast.store";
import { useAddToCart } from "@/api/queries/useCart";
import { useTranslations } from "next-intl";

const resolveDefaultVariant = (product: Product): ProductVariant | null => {
  if (
    !product.has_variants ||
    !product.variants ||
    product.variants.length === 0
  ) {
    return null;
  }

  const activeVariants = product.variants.filter((v) => v.is_active !== false);
  const pool = activeVariants.length > 0 ? activeVariants : product.variants;

  // 1. Exact SKU match
  if (product.sku) {
    const skuMatch = pool.find((v) => v.sku === product.sku);
    if (skuMatch) return skuMatch;
  }

  // 2. Exact match by base product price or original price
  const candidatePrices = [
    product.originalPrice,
    product.price,
    product.global_price,
    product.discount_price,
  ]
    .filter((p): p is number => p != null && !isNaN(Number(p)) && Number(p) > 0)
    .map((p) => Number(p));

  const priceMatch = pool.find((v) =>
    candidatePrices.includes(Number(v.price)),
  );
  if (priceMatch) return priceMatch;

  // 3. Match 'Standard' or 'Regular' pack
  const standardMatch = pool.find((v) => {
    const lower = (v.name || "").toLowerCase();
    return (
      lower.includes("standard") ||
      lower.includes("regular") ||
      lower.includes("medium")
    );
  });
  if (standardMatch) return standardMatch;

  // 4. Fallback to first variant
  return pool[0] || null;
};

const getActivePricing = (
  product: Product,
  selectedVariant: ProductVariant | null,
) => {
  const globalPrice =
    product.global_price != null &&
    !isNaN(Number(product.global_price)) &&
    Number(product.global_price) > 0
      ? Number(product.global_price)
      : undefined;

  // If no variant is selected
  if (!selectedVariant) {
    const hasDiscountPrice =
      product.discount_price != null && Number(product.discount_price) > 0;

    const activePrice = hasDiscountPrice
      ? Number(product.discount_price)
      : Number(product.price) || 0;

    const baseComparePrice =
      globalPrice && globalPrice > activePrice
        ? globalPrice
        : product.originalPrice && Number(product.originalPrice) > activePrice
          ? Number(product.originalPrice)
          : product.compare_at_price &&
              Number(product.compare_at_price) > activePrice
            ? Number(product.compare_at_price)
            : hasDiscountPrice && Number(product.price) > activePrice
              ? Number(product.price)
              : undefined;

    const discountAmount =
      baseComparePrice && baseComparePrice > activePrice
        ? Math.round((baseComparePrice - activePrice) * 100) / 100
        : 0;

    const discountPercent =
      product.discount_percentage && Number(product.discount_percentage) > 0
        ? Math.round(Number(product.discount_percentage))
        : discountAmount > 0 && baseComparePrice
          ? Math.round((discountAmount / baseComparePrice) * 100)
          : 0;

    return {
      activePrice,
      activeCompareAtPrice: baseComparePrice,
      discountAmount,
      discountPercent,
    };
  }

  // When a variant is selected
  const variantDiscountPrice = (selectedVariant as any).discount_price;
  const isBaseOrStandard =
    (product.sku && selectedVariant.sku === product.sku) ||
    selectedVariant.name?.toLowerCase().includes("standard") ||
    selectedVariant.name?.toLowerCase().includes("regular") ||
    selectedVariant.name?.toLowerCase().includes("medium") ||
    (globalPrice != null && Number(selectedVariant.price) === globalPrice) ||
    Number(selectedVariant.price) === Number(product.originalPrice) ||
    Number(selectedVariant.price) === Number(product.price);

  let activePrice = Number(selectedVariant.price);
  let activeCompareAtPrice: number | undefined = undefined;

  // 1. Variant has its own discount_price
  if (
    variantDiscountPrice != null &&
    Number(variantDiscountPrice) > 0 &&
    Number(variantDiscountPrice) < activePrice
  ) {
    activeCompareAtPrice =
      isBaseOrStandard && globalPrice ? globalPrice : activePrice;
    activePrice = Number(variantDiscountPrice);
  }
  // 2. Base/standard variant and product has discount_price
  else if (
    isBaseOrStandard &&
    product.discount_price != null &&
    Number(product.discount_price) > 0 &&
    Number(product.discount_price) < activePrice
  ) {
    activeCompareAtPrice =
      globalPrice && globalPrice > Number(product.discount_price)
        ? globalPrice
        : activePrice;
    activePrice = Number(product.discount_price);
  }
  // 3. Product has discount_percentage (e.g. 2% OFF)
  else if (
    product.discount_percentage != null &&
    Number(product.discount_percentage) > 0
  ) {
    const pct = Number(product.discount_percentage);
    activeCompareAtPrice =
      isBaseOrStandard && globalPrice ? globalPrice : activePrice;
    activePrice = Math.round(activePrice * (1 - pct / 100) * 100) / 100;
  }
  // 4. Compare at price or global price
  else if (isBaseOrStandard && globalPrice && globalPrice > activePrice) {
    activeCompareAtPrice = globalPrice;
  } else if (
    selectedVariant.compare_at_price &&
    Number(selectedVariant.compare_at_price) > activePrice
  ) {
    activeCompareAtPrice =
      isBaseOrStandard && globalPrice
        ? globalPrice
        : Number(selectedVariant.compare_at_price);
  }

  if (isBaseOrStandard && globalPrice && globalPrice > activePrice) {
    activeCompareAtPrice = globalPrice;
  }

  const discountAmount =
    activeCompareAtPrice && activeCompareAtPrice > activePrice
      ? Math.round((activeCompareAtPrice - activePrice) * 100) / 100
      : 0;

  const discountPercent =
    product.discount_percentage && Number(product.discount_percentage) > 0
      ? Math.round(Number(product.discount_percentage))
      : discountAmount > 0 && activeCompareAtPrice
        ? Math.round((discountAmount / activeCompareAtPrice) * 100)
        : 0;

  return {
    activePrice,
    activeCompareAtPrice,
    discountAmount,
    discountPercent,
  };
};

interface ProductDetailsInfoProps {
  product: Product;
  onVariantChange?: (variant: ProductVariant | null) => void;
}

export const ProductDetailsInfo: React.FC<ProductDetailsInfoProps> = ({
  product,
  onVariantChange,
}) => {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const { toggleCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const { addToast } = useToastStore();
  const addToCartMutation = useAddToCart();

  // Selected variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    () => resolveDefaultVariant(product),
  );

  useEffect(() => {
    const match = resolveDefaultVariant(product);
    setSelectedVariant(match);
    if (onVariantChange) onVariantChange(match);
  }, [product, onVariantChange]);

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (onVariantChange) onVariantChange(variant);
  };

  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Active pricing and specs calculated with discount priority
  const { activePrice, activeCompareAtPrice, discountAmount, discountPercent } =
    getActivePricing(product, selectedVariant);

  const activeSku = selectedVariant?.sku || product.sku || "";
  const activeStock = selectedVariant
    ? selectedVariant.stock_quantity
    : (product.stock_quantity ?? 0);
  const inStock = activeStock > 0 && product.inStock;

  const categoryName = product.category_info?.name || product.category;

  const getCategoryTitle = (cat?: string) => {
    if (!cat) return t("details.general");
    const lower = cat.toLowerCase();
    if (lower.includes("fresh") || lower.includes("produce")) {
      return tCommon("categoryNav.freshProduce");
    }
    if (lower.includes("dairy") || lower.includes("egg")) {
      return tCommon("categoryNav.dairyEggs");
    }
    if (lower.includes("beverage") || lower.includes("drink")) {
      return tCommon("categoryNav.beverages");
    }
    if (lower.includes("pantry") || lower.includes("staple")) {
      return tCommon("categoryNav.pantryStaples");
    }
    if (
      lower.includes("meat") ||
      lower.includes("seafood") ||
      lower.includes("fish")
    ) {
      return tCommon("categoryNav.meatSeafood");
    }
    if (lower.includes("snack") || lower.includes("sweet")) {
      return tCommon("categoryNav.snacks");
    }
    if (lower.includes("house") || lower.includes("cleaning")) {
      return tCommon("categoryNav.household");
    }
    return cat;
  };

  const ratingVal = product.average_rating ?? product.rating ?? 4.5;
  const reviewCountVal = product.review_count ?? product.reviewsCount ?? 0;

  const handleQuantityDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleQuantityIncrease = () => {
    if (activeStock > 0 && quantity >= activeStock) {
      addToast({
        title: t("details.maxStockReached"),
        message: t("details.maxStockMessage", { count: activeStock }),
        type: "info",
      });
      return;
    }
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      addToast({
        title: t("details.signInRequired"),
        message: t("details.signInCartPrompt"),
        type: "warning",
      });
      openLoginModal();
      return;
    }

    const productId = product.id || product.product_id || "";
    const itemName = selectedVariant
      ? `${product.title || product.name} (${selectedVariant.name})`
      : product.title || product.name || "";

    addToCartMutation.mutate({
      product_id: productId,
      variant_id: selectedVariant?.variant_id || null,
      quantity,
      name: itemName,
      price: activePrice,
      image: selectedVariant?.image_url || product.image || "",
      sku: activeSku,
      original_price: activeCompareAtPrice || undefined,
      cashback_percentage: product.cashback_percentage || undefined,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      addToast({
        title: t("details.signInRequired"),
        message: t("details.signInCartPrompt"),
        type: "warning",
      });
      openLoginModal("/checkoutView");
      return;
    }
    handleAddToCart();
    toggleCart();
  };

  return (
    <div className="w-full space-y-5 font-sans">
      {/* Top Header Tag & SKU */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-[#D81B60] text-xs font-semibold">
          <span>• {categoryName || "GENERAL"}</span>
        </div>
        {activeSku && (
          <span className="text-xs font-mono font-medium text-slate-400">
            SKU: {activeSku}
          </span>
        )}
      </div>

      {/* Title & Ratings/Stock Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Title & Short Description */}
        <div className="space-y-1 flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug">
            {product.title || product.name}
          </h1>
          {product.short_description && (
            <p className="text-xs sm:text-sm font-normal text-slate-500 leading-relaxed">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Right: Ratings & Stock Status Stacked in 2 Rows */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          {/* Row 1: Rating Badge */}
          <div className="flex items-center gap-1.5 bg-amber-50/80 px-2.5 py-1 rounded-full border border-amber-200/60">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-3.5 h-3.5 ${
                    idx < Math.floor(ratingVal)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-800">
              {ratingVal.toFixed(1)}
            </span>
            <span className="text-xs font-normal text-slate-500">
              ({reviewCountVal}{" "}
              {reviewCountVal === 1
                ? t("details.review")
                : t("details.reviews")}
              )
            </span>
          </div>

          {/* Row 2: Stock Status Badge */}
          {inStock ? (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {t("details.inStockAvailable", { count: activeStock })}
              </span>
            </span>
          ) : (
            <span className="text-xs font-medium text-rose-700 bg-rose-50/80 border border-rose-200/80 px-2.5 py-1 rounded-full flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{t("details.outOfStock")}</span>
            </span>
          )}
        </div>
      </div>

      {/* Price Block */}
      <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100/80 space-y-2">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="text-2xl sm:text-3xl font-bold text-[#D81B60]">
            {formatLKR(activePrice)}
          </span>
          {activeCompareAtPrice && activeCompareAtPrice > activePrice && (
            <span className="text-xs sm:text-sm font-normal text-slate-400 line-through">
              {formatLKR(activeCompareAtPrice)}
            </span>
          )}
          {discountAmount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-rose-100/80 text-[#D81B60] font-semibold text-xs">
              {t("details.saveDiscount", {
                amount: formatLKR(discountAmount),
                percent: discountPercent,
              })}
            </span>
          )}
        </div>

        {/* Weight & Cashback Highlights */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-medium text-slate-600">
          {product.cashback_percentage && product.cashback_percentage > 0 && (
            <span className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
              💰{" "}
              {t("details.cashbackEarned", {
                percent: product.cashback_percentage,
              })}
            </span>
          )}
        </div>
      </div>

      {/* Product Details Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-[11px]">
            <span className="font-semibold text-slate-800 block">
              {t("details.returns")}
            </span>
            <span className="text-slate-500 font-normal">
              {product.is_returnable
                ? t("details.eligibleForReturn")
                : t("details.nonReturnable")}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D81B60] shrink-0" />
          <div className="text-[11px]">
            <span className="font-semibold text-slate-800 block">
              {t("details.qualityGuarantee")}
            </span>
            <span className="text-slate-500 font-normal">
              {product.is_perishable
                ? t("details.freshPerishable")
                : t("details.qualityChecked")}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex p-2.5 rounded-xl bg-white border border-slate-200/70 items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="text-[11px]">
            <span className="font-semibold text-slate-800 block">
              {t("details.fulfilledBy")}
            </span>
            <span className="text-slate-500 font-normal">
              {t("details.sribeesExpress")}
            </span>
          </div>
        </div>
      </div>

      {/* Quantity & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
        {/* Quantity Selector */}
        <div className="flex items-center justify-between border border-slate-200/80 rounded-full bg-slate-50/80 px-3 py-1.5 w-full sm:w-32 shrink-0">
          <button
            onClick={handleQuantityDecrease}
            disabled={quantity <= 1}
            className="w-7 h-7 rounded-full bg-white text-slate-700 flex items-center justify-center font-medium text-xs shadow-xs hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Minus className="w-3 h-3" />
          </button>

          <span className="font-semibold text-slate-800 text-sm px-2">
            {quantity}
          </span>

          <button
            onClick={handleQuantityIncrease}
            disabled={!inStock}
            className="w-7 h-7 rounded-full bg-white text-slate-700 flex items-center justify-center font-medium text-xs shadow-xs hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || addToCartMutation.isPending}
          className={`flex-1 py-3 px-5 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
            addedAnimation
              ? "bg-emerald-600 text-white border-emerald-600"
              : !inStock
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-rose-50/80 hover:bg-rose-100/80 text-[#D81B60] border-rose-200/80 shadow-xs"
          }`}
        >
          {addedAnimation ? (
            <>
              <Check className="w-4 h-4 stroke-[2]" />
              <span>{t("details.addedToCart")}</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 stroke-[2]" />
              <span>
                {inStock ? t("details.addToCart") : t("details.outOfStock")}
              </span>
            </>
          )}
        </button>

        {/* Buy Now Button */}
        <button
          onClick={handleBuyNow}
          disabled={!inStock}
          className={`flex-1 py-3 px-5 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
            inStock
              ? "bg-[#D81B60] hover:bg-[#C2185B] text-white"
              : "bg-slate-300 text-slate-500 shadow-none cursor-not-allowed"
          }`}
        >
          <Banknote className="w-4 h-4 stroke-[2]" />
          <span>{t("details.buyNow")}</span>
        </button>
      </div>
    </div>
  );
};
