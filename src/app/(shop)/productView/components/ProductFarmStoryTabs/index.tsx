"use client";

import React, { useState } from "react";
import { Product } from "@/interfaces/product.interface";
import {
  Star,
  Package,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  Coins,
  FileText,
  ThumbsUp,
  MessageSquare,
  Send,
  UserCheck,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/state/auth.store";
import { useUIStore } from "@/state/ui.store";
import { useToastStore } from "@/state/toast.store";
import {
  useProductReviews,
  useCreateProductReview,
} from "@/api/queries/useReviews";
import { useGetOrders, useGetOrder } from "@/api/queries/useOrders";
import { ApiOrder } from "@/interfaces/order.interface";
import { useTranslations } from "next-intl";

interface ProductFarmStoryTabsProps {
  product: Product;
}

export const ProductFarmStoryTabs: React.FC<ProductFarmStoryTabsProps> = ({
  product,
}) => {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");

  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const { addToast } = useToastStore();

  const productId = product.id || product.product_id || "";

  // Check user orders to verify purchase and get order_item_id
  const { data: userOrdersData } = useGetOrders(1, 100);

  const matchedOrder = React.useMemo(() => {
    if (!isAuthenticated || !userOrdersData) return null;
    const orders: ApiOrder[] = Array.isArray(userOrdersData)
      ? userOrdersData
      : Array.isArray((userOrdersData as any)?.orders)
        ? (userOrdersData as any).orders
        : [];

    // Prioritize delivered orders
    const delivered = orders.find((order) => {
      const status = (order.status || "").toLowerCase();
      if (status !== "delivered") return false;
      return order.items?.some(
        (i) =>
          String(i.product_id) === String(productId) ||
          String(i.order_item_id) === String(productId),
      );
    });
    if (delivered) return delivered;

    // Fallback to any non-cancelled order
    return (
      orders.find((order) => {
        const status = (order.status || "").toLowerCase();
        if (["cancelled", "canceled"].includes(status)) return false;
        return order.items?.some(
          (i) =>
            String(i.product_id) === String(productId) ||
            String(i.order_item_id) === String(productId),
        );
      }) || null
    );
  }, [isAuthenticated, userOrdersData, productId]);

  const matchedOrderId =
    matchedOrder?.order_id || (matchedOrder as any)?.id || "";

  const { data: fullOrderDetails } = useGetOrder(
    matchedOrderId ? String(matchedOrderId) : "",
  );

  const resolvedOrderItem = React.useMemo(() => {
    if (fullOrderDetails?.items) {
      const found = fullOrderDetails.items.find(
        (i) =>
          String(i.product_id) === String(productId) ||
          String(i.order_item_id) === String(productId),
      );
      if (found) return found;
    }
    if (matchedOrder?.items) {
      const found = matchedOrder.items.find(
        (i) =>
          String(i.product_id) === String(productId) ||
          String(i.order_item_id) === String(productId),
      );
      if (found) return found;
    }
    return null;
  }, [fullOrderDetails, matchedOrder, productId]);

  const resolvedOrderItemId =
    resolvedOrderItem?.order_item_id ||
    (resolvedOrderItem as any)?.id ||
    (resolvedOrderItem as any)?.orderItemId;

  const hasPurchased = Boolean(matchedOrder);

  // Fetch reviews directly from backend API using TanStack Query
  const { data: reviewsData, isLoading: isReviewsLoading } = useProductReviews(
    productId,
    activeTab === "reviews",
  );

  // Mutation to submit a review to backend API
  const createReviewMutation = useCreateProductReview(productId);

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

  const reviewsList = reviewsData?.reviews || [];
  const totalReviewsCount =
    reviewsData?.total ??
    product.review_count ??
    product.reviewsCount ??
    reviewsList.length;
  const ratingVal =
    reviewsData?.average_rating ||
    product.average_rating ||
    product.rating ||
    4.5;

  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const handleToggleLike = (reviewId: string) => {
    setLikedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast({
        title: t("details.signInRequired"),
        message: t("details.signInReviewPrompt"),
        type: "warning",
      });
      openLoginModal();
      return;
    }

    if (!hasPurchased || !resolvedOrderItemId) {
      addToast({
        title: t("details.verifiedBuyerOnly"),
        message: `${t("details.onlyBuyersCanReview")} ${t("details.reviewInOrderHistory")}`,
        type: "warning",
      });
      return;
    }

    if (!newComment.trim()) {
      addToast({
        title: t("details.reviewEmpty"),
        message: t("details.reviewEmptyPrompt"),
        type: "warning",
      });
      return;
    }

    createReviewMutation.mutate(
      {
        rating: newRating,
        comment: newComment.trim(),
        order_item_id: resolvedOrderItemId,
      },
      {
        onSuccess: () => {
          setNewComment("");
          setShowReviewForm(false);
          addToast({
            title: t("details.reviewSubmitted"),
            message: t("details.reviewSubmittedMsg"),
            type: "success",
          });
        },
        onError: (err: any) => {
          const detail = err?.response?.data?.detail;
          const errorMsg =
            typeof detail === "string"
              ? detail
              : Array.isArray(detail) && detail[0]?.msg
                ? detail[0].msg
                : err?.response?.data?.message ||
                  t("details.submissionFailedMsg");
          addToast({
            title: t("details.submissionFailed"),
            message: errorMsg,
            type: "error",
          });
        },
      },
    );
  };

  const specifications = [
    {
      icon: <Package className="w-4 h-4 text-[#D81B60]" />,
      label: t("details.skuCode"),
      value: product.sku || "N/A",
    },
    {
      icon: <Layers className="w-4 h-4 text-[#D81B60]" />,
      label: t("details.category"),
      value: getCategoryTitle(categoryName),
    },
    {
      icon: <FileText className="w-4 h-4 text-[#D81B60]" />,
      label: t("details.weightUnit"),
      value: product.weight
        ? `${product.weight} ${product.weight_unit || product.unit}`
        : product.unit || t("details.standardUnit"),
    },
    {
      icon: <RotateCcw className="w-4 h-4 text-[#D81B60]" />,
      label: t("details.returnPolicy"),
      value: product.is_returnable
        ? t("details.returnEligibleDesc")
        : t("details.returnNonDesc"),
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-[#D81B60]" />,
      label: t("details.perishableStatus"),
      value: product.is_perishable
        ? t("details.perishableFreshDesc")
        : t("details.perishableNonDesc"),
    },
    {
      icon: <Coins className="w-4 h-4 text-[#D81B60]" />,
      label: t("details.cashbackReward"),
      value: product.cashback_percentage
        ? t("details.cashbackOrderDesc", {
            percent: product.cashback_percentage,
          })
        : t("details.standardRewardPoints"),
    },
  ];

  return (
    <div className="w-full mt-10 space-y-6 font-sans">
      {/* Tab Navigation Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "details"
              ? "bg-[#D81B60] text-white shadow-xs"
              : "bg-white border border-slate-200/80 text-slate-600 hover:bg-rose-50/50 hover:text-[#D81B60]"
          }`}
        >
          {t("details.descriptionAndSpecs")}
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "reviews"
              ? "bg-[#D81B60] text-white shadow-xs"
              : "bg-white border border-slate-200/80 text-slate-600 hover:bg-rose-50/50 hover:text-[#D81B60]"
          }`}
        >
          {t("details.customerReviewsTab", { count: totalReviewsCount })}
        </button>
      </div>

      {/* Tab 1: Description & Specifications */}
      {activeTab === "details" && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 space-y-5 shadow-xs">
          {/* Product Overview Header & Description */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#D81B60] bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-100">
              {t("details.productOverview")}
            </span>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 pt-1">
              {product.title || product.name}
            </h3>
            <p className="text-xs sm:text-sm font-normal text-slate-600 leading-relaxed max-w-4xl">
              {product.description ||
                product.short_description ||
                t("details.noDescription")}
            </p>
          </div>

          {/* Specifications Grid */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
              {t("details.productSpecifications")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex items-start gap-2.5"
                >
                  <div className="p-1.5 rounded-xl bg-white border border-slate-200/70 shrink-0">
                    {spec.icon}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-medium text-slate-400 block uppercase">
                      {spec.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {spec.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Customer Reviews */}
      {activeTab === "reviews" && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 space-y-6 shadow-xs">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                {t("details.customerRatings")}
              </h3>
              <p className="text-xs font-normal text-slate-500 mt-0.5">
                {totalReviewsCount === 1
                  ? t("details.ratingSummarySingle", {
                      rating: ratingVal.toFixed(1),
                    })
                  : t("details.ratingSummary", {
                      rating: ratingVal.toFixed(1),
                      count: totalReviewsCount,
                    })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-amber-50/80 px-3 py-1.5 rounded-2xl border border-amber-200/60 w-fit">
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
              </div>

              {/*               {isAuthenticated && !hasPurchased ? (
                <button
                  type="button"
                  onClick={() => {
                    addToast({
                      title: t("details.verifiedBuyerOnly"),
                      message: `${t("details.onlyBuyersCanReview")} ${t("details.reviewInOrderHistory")}`,
                      type: "info",
                    });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-2xl transition-all cursor-pointer"
                  title={t("details.onlyBuyersCanReview")}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t("details.verifiedBuyerOnly")}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      addToast({
                        title: t("details.signInRequired"),
                        message: t("details.signInReviewPrompt"),
                        type: "warning",
                      });
                      openLoginModal();
                    } else {
                      setShowReviewForm(!showReviewForm);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D81B60] bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-2xl hover:bg-rose-100/80 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>
                    {showReviewForm ? t("details.cancel") : t("details.writeReview")}
                  </span>
                </button>
              )} */}
            </div>
          </div>

          {/* Review Submission Form */}
          {showReviewForm && (
            <form
              onSubmit={handleAddReviewSubmit}
              className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3"
            >
              <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#D81B60]" />
                {t("details.shareFeedback", {
                  product: product.title || product.name || "",
                })}
              </h4>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">
                  {t("details.yourRating")}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-0.5 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= newRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t("details.reviewPlaceholder")}
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D81B60] bg-white text-slate-800"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={createReviewMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D81B60] text-white text-xs font-semibold shadow-xs hover:bg-[#C2185B] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {createReviewMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{t("details.submitReview")}</span>
                </button>
              </div>
            </form>
          )}

          {/* Loading state for reviews */}
          {isReviewsLoading ? (
            <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-[#D81B60]" />
              <span>{t("details.loadingReviews")}</span>
            </div>
          ) : reviewsList.length > 0 ? (
            <div className="space-y-3.5 max-h-105 overflow-y-auto pr-2">
              {reviewsList.map((review, idx) => {
                const isLiked = likedReviews[review.id];
                const likesCount = (review.likes || 0) + (isLiked ? 1 : 0);

                return (
                  <div
                    key={review.id || idx}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-rose-100 text-[#D81B60] font-semibold text-xs flex items-center justify-center border border-rose-200/80">
                          {review.userName
                            ? review.userName.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 text-xs">
                              {review.userName}
                            </span>
                            {review.verifiedPurchase && (
                              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200/80">
                                ✓ {t("details.verifiedBuyer")}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-normal text-slate-400 block">
                            {review.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/50">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs font-normal text-slate-700 leading-relaxed">
                      {review.comment}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-200/40">
                      <span>{t("details.wasHelpful")}</span>
                      <button
                        onClick={() => handleToggleLike(review.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isLiked
                            ? "bg-rose-50 text-[#D81B60] border-rose-200 font-medium"
                            : "bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50"
                        }`}
                      >
                        <ThumbsUp
                          className={`w-3 h-[#D81B60] ${isLiked ? "fill-[#D81B60]" : ""}`}
                        />
                        <span>{likesCount}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
              <Sparkles className="w-5 h-5 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                {t("details.noReviews")}
              </p>
              <p className="text-xs text-slate-500 font-normal">
                {t("details.firstReview")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
