"use client";

import React, { useState, useEffect } from "react";
import { Heart, Share2, Tag, ImageOff } from "lucide-react";
import { Product } from "@/interfaces/product.interface";
import { useUIStore } from "@/state/ui.store";
import { ShareModal } from "@/components/ShareModal";
import { useTranslations } from "next-intl";

interface ProductGalleryProps {
  product: Product;
  selectedImage?: string | null;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  product,
  selectedImage,
}) => {
  const t = useTranslations("product");
  const { toggleWishlist, isInWishlist } = useUIStore();
  const inWishlist = isInWishlist(product.id || product.product_id || "");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  const [failedThumbnails, setFailedThumbnails] = useState<
    Record<string | number, boolean>
  >({});

  // Extract images from product response
  const imageItems = React.useMemo(() => {
    if (product.images && product.images.length > 0) {
      return [...product.images].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      );
    }
    if (product.image) {
      return [{ image_url: product.image }];
    }
    return [];
  }, [product.images, product.image]);

  const [activeImage, setActiveImage] = useState<string>(
    selectedImage || imageItems[0]?.image_url || product.image || "",
  );

  useEffect(() => {
    if (selectedImage) {
      setActiveImage(selectedImage);
    } else if (imageItems[0]?.image_url) {
      setActiveImage(imageItems[0].image_url);
    } else {
      setActiveImage(product.image || "");
    }
  }, [selectedImage, imageItems, product.image]);

  useEffect(() => {
    setMainImageError(false);
  }, [activeImage]);

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

  return (
    <div className="w-full flex flex-col sm:flex-row gap-3 items-stretch h-full font-sans">
      {/* Main Image Container */}
      <div className="relative flex-1 min-h-[320px] sm:min-h-[420px] bg-slate-50/80 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs group flex items-center justify-center p-4">
        {/* Badges Overlay - Only show Sale/Discount badge if on sale */}
        {(product.is_on_sale || discountPercent > 0) && (
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="px-2.5 py-1 rounded-full bg-[#D81B60] text-white text-xs font-semibold shadow-xs flex items-center gap-1 uppercase tracking-wide">
              <Tag className="w-3 h-3" />
              {discountPercent > 0
                ? `${discountPercent}% ${t("details.off")}`
                : t("details.sale")}
            </span>
          </div>
        )}

        {/* Action Buttons Top Right */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
          {/* Wishlist Heart */}
          <button
            onClick={() =>
              toggleWishlist(product.id || product.product_id || "")
            }
            className={`p-2 rounded-full backdrop-blur-md shadow-xs transition-all cursor-pointer ${
              inWishlist
                ? "bg-rose-50 text-[#D81B60]"
                : "bg-white/90 text-slate-500 hover:text-[#D81B60] hover:bg-white"
            }`}
            title={t("details.addToWishlist")}
          >
            <Heart
              className={`w-4 h-4 ${inWishlist ? "fill-[#D81B60]" : ""}`}
            />
          </button>

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 rounded-full bg-white/90 text-slate-500 hover:text-slate-900 hover:bg-white backdrop-blur-md shadow-xs transition-all cursor-pointer"
            title={t("details.shareProduct")}
            aria-label={t("details.shareProduct")}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Main Product Image or Placeholder */}
        {!activeImage || mainImageError ? (
          <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center text-slate-400 gap-3 py-12 select-none">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
              <ImageOff className="w-8 h-8" />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {t("details.noImageAvailable")}
            </span>
          </div>
        ) : (
          <img
            src={activeImage}
            alt={product.title || product.name || "Product image"}
            onError={() => {
              const fallbackUrl =
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600";
              if (activeImage !== fallbackUrl) {
                setActiveImage(fallbackUrl);
              } else {
                setMainImageError(true);
              }
            }}
            className="w-full h-full max-h-[380px] object-contain transition-all duration-300 group-hover:scale-105"
          />
        )}
      </div>

      {/* Thumbnails Right Column */}
      {imageItems.length > 1 && (
        <div className="flex sm:flex-col gap-2 shrink-0 overflow-x-auto sm:overflow-y-auto max-h-[440px] py-0.5 justify-start">
          {imageItems.map((img, idx) => {
            const thumbKey = img.image_id || idx;
            const isActive = activeImage === img.image_url;
            const hasError = !img.image_url || failedThumbnails[thumbKey];

            return (
              <button
                key={thumbKey}
                onClick={() => setActiveImage(img.image_url || "")}
                className="group cursor-pointer shrink-0"
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border transition-all p-1 bg-white flex items-center justify-center ${
                    isActive
                      ? "border-[#D81B60] ring-1 ring-rose-200 shadow-xs"
                      : "border-slate-200/80 group-hover:border-rose-300"
                  }`}
                >
                  {hasError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 rounded-lg p-1 text-center">
                      <ImageOff className="w-4 h-4 text-slate-300 mb-0.5" />
                      <span className="text-[8px] font-medium text-slate-400 leading-tight">
                        {t("details.noImage")}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={img.image_url}
                      alt={
                        img.alt_text || product.title || `Thumbnail ${idx + 1}`
                      }
                      onError={() => {
                        setFailedThumbnails((prev) => ({
                          ...prev,
                          [thumbKey]: true,
                        }));
                      }}
                      className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={{
          title: product.title || product.name || "Product",
          image:
            activeImage || product.image || (imageItems[0]?.image_url ?? ""),
          price: product.price,
          originalPrice: effectiveOriginalPrice,
          discountPercent: discountPercent,
          category: product.category_info?.name || product.category,
        }}
      />
    </div>
  );
};
