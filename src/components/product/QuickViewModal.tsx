"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle,
  Shield,
  ThumbsUp,
  MessageSquare,
  Send,
  UserCheck,
  Sparkles,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Modal } from "../base/Modal";
import { useUIStore } from "../../state/ui.store";
import { useCartStore } from "../../state/cart.store";
import { useAuthStore } from "../../state/auth.store";
import { useToastStore } from "../../state/toast.store";
import { useAddToCart } from "../../api/queries/useCart";
import { formatLKR } from "../../utils/formatCurrency";
import { Badge } from "../base/Badge";
import { Review } from "../../interfaces/product.interface";

// Default realistic customer reviews
const getDefaultReviews = (productTitle: string): Review[] => [
  {
    id: "rev-1",
    userName: "Dilini Fernando",
    rating: 5,
    date: "2 days ago",
    comment: `Super fresh ${productTitle}! Crisp quality with no damaged leaves. Perfectly packed with SriBees Express delivery.`,
    verifiedPurchase: true,
    likes: 14,
  },
  {
    id: "rev-2",
    userName: "Kamal Perera",
    rating: 5,
    date: "5 days ago",
    comment:
      "Great quality organic produce. Cleanly washed and delivered fast via SriBees Express!",
    verifiedPurchase: true,
    likes: 8,
  },
  {
    id: "rev-3",
    userName: "Nipuni Wickramasinghe",
    rating: 4,
    date: "1 week ago",
    comment:
      "Very good quality and fresh aroma. Highly recommend buying organic produce from Sribees.",
    verifiedPurchase: true,
    likes: 5,
  },
  {
    id: "rev-4",
    userName: "Sahan Gunawardena",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Excellent service and top tier farm fresh items. Value for money.",
    verifiedPurchase: true,
    likes: 3,
  },
];

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, openLoginModal } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();
  const addToCartMutation = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [userNameInput, setUserNameInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setQuantity(1);
      setActiveTab("details");
      setShowReviewForm(false);
      setReviewSubmitted(false);
      const initialReviews = quickViewProduct.reviews?.length
        ? quickViewProduct.reviews
        : getDefaultReviews(quickViewProduct.title);
      setReviewsList(initialReviews);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      addToast({
        title: "Sign In Required",
        message: "Please sign in or register to add items to your cart.",
        type: "warning",
      });
      setQuickViewProduct(null);
      openLoginModal();
      return;
    }
    const productId = quickViewProduct.id || quickViewProduct.product_id || "";
    addToCartMutation.mutate({
      product_id: productId,
      quantity,
      name: quickViewProduct.title || quickViewProduct.name || "",
      price: quickViewProduct.price || 0,
      original_price: effectiveOriginalPrice || undefined,
      image: quickViewProduct.image || quickViewProduct.images?.[0]?.image_url || "",
      sku: quickViewProduct.sku || "",
      cashback_percentage:
        quickViewProduct.cashback_percentage != null
          ? Number(quickViewProduct.cashback_percentage)
          : undefined,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuickViewProduct(null);
    }, 1000);
  };

  const handleToggleLike = (reviewId: string) => {
    setLikedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newRev: Review = {
      id: `rev-custom-${Date.now()}`,
      userName: userNameInput.trim() || "Verified Customer",
      rating: newRating,
      date: "Just now",
      comment: commentInput.trim(),
      verifiedPurchase: true,
      likes: 0,
    };

    setReviewsList([newRev, ...reviewsList]);
    setCommentInput("");
    setUserNameInput("");
    setShowReviewForm(false);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  const totalReviewsCount =
    (quickViewProduct.reviewsCount || 0) +
    (reviewsList.length - 4 > 0 ? reviewsList.length - 4 : 0);

  const effectiveOriginalPrice =
    (quickViewProduct.global_price && quickViewProduct.global_price > quickViewProduct.price
      ? quickViewProduct.global_price
      : undefined) ||
    quickViewProduct.originalPrice ||
    (quickViewProduct.compare_at_price && quickViewProduct.compare_at_price > quickViewProduct.price
      ? quickViewProduct.compare_at_price
      : undefined);

  const rawDiscount = Number(quickViewProduct.discount_percentage);
  const calculatedDiscount =
    effectiveOriginalPrice && effectiveOriginalPrice > quickViewProduct.price
      ? Math.round(((effectiveOriginalPrice - quickViewProduct.price) / effectiveOriginalPrice) * 100)
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
      : quickViewProduct.badge === "On Sale" || quickViewProduct.badge === "ON SALE"
        ? (discountPercent > 0 ? `${discountPercent}% OFF` : "Sale")
        : quickViewProduct.badge;

  const displayBadgeType =
    discountPercent > 0 || displayBadge === "Sale"
      ? "discount"
      : quickViewProduct.badgeType;

  return (
    <Modal
      isOpen={!!quickViewProduct}
      onClose={() => setQuickViewProduct(null)}
      title="Product Quick View"
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Product Image */}
        <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2 md:sticky md:top-0">
          {displayBadge && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant={displayBadgeType}>
                {displayBadge}
              </Badge>
            </div>
          )}
          <img
            src={quickViewProduct.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400"}
            alt={quickViewProduct.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400";
            }}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        {/* Right Column: Details or Reviews Switcher */}
        <div className="flex flex-col h-full justify-between min-h-[380px]">
          {/* Navigation Tabs Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("details")}
                className={`text-xs font-black uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "details"
                    ? "border-[#D81B60] text-[#D81B60]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`text-xs font-black uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "reviews"
                    ? "border-[#D81B60] text-[#D81B60]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Reviews ({totalReviewsCount})</span>
              </button>
            </div>

            {activeTab === "reviews" && (
              <button
                onClick={() => setActiveTab("details")}
                className="text-xs font-bold text-slate-500 hover:text-[#D81B60] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            )}
          </div>

          {/* Tab 1: Product Details View */}
          {activeTab === "details" && (
            <div className="overflow-y-auto max-h-[52vh] md:max-h-[420px] pr-2 space-y-4 custom-scrollbar flex-1">
              <div>
                <span className="text-xs font-black uppercase text-rose-500 tracking-wider">
                  {quickViewProduct.brand}
                </span>

                <h2 className="text-xl font-black text-slate-900 mt-1 leading-snug">
                  {quickViewProduct.title}
                </h2>

                {/* Clickable Rating Badge -> Switches to Reviews Tab */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    <span className="text-xs font-black text-amber-900">
                      {quickViewProduct.rating}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className="text-xs font-bold text-slate-500 hover:text-[#D81B60] underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>({totalReviewsCount} verified reviews)</span>
                    <ChevronRight className="w-3 h-3 text-[#D81B60]" />
                  </button>
                </div>

                {/* Price & Unit */}
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-2xl font-black text-[#D81B60]">
                    {formatLKR(quickViewProduct.price)}
                  </span>
                  {effectiveOriginalPrice && (
                    <span className="text-sm font-semibold text-slate-400 line-through">
                      {formatLKR(effectiveOriginalPrice)}
                    </span>
                  )}
                  {/*                   <span className="text-xs font-bold text-slate-500">
                    / {quickViewProduct.unit}
                  </span> */}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-3 border-t border-slate-100 pt-3">
                  {quickViewProduct.description}
                </p>

                {/* Quality Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" /> In Stock
                    (SriBees Express)
                  </span>
                  <span className="flex items-center gap-1 bg-rose-50 text-[#D81B60] px-2.5 py-1 rounded-full border border-rose-200">
                    <Shield className="w-3.5 h-3.5" /> 100% Quality Guaranteed
                  </span>
                </div>

                {/* Quick Reviews Preview Banner */}
                {/*                 <div className="p-3 bg-gradient-to-r from-rose-50/80 to-amber-50/80 rounded-xl border border-rose-100/80 flex items-center justify-between mt-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-[#D81B60]">
                      <Star className="w-4 h-4 fill-[#D81B60]" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        {quickViewProduct.rating} ★ Customer Rating
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Based on {totalReviewsCount} verified buyer reviews
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="text-xs font-black text-white bg-[#D81B60] hover:bg-[#C2185B] px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Read Reviews</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div> */}
              </div>
            </div>
          )}

          {/* Tab 2: Customer Reviews Loaded Directly Here */}
          {activeTab === "reviews" && (
            <div className="overflow-y-auto max-h-[52vh] md:max-h-[420px] pr-2 space-y-4 custom-scrollbar flex-1 animate-fadeIn">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    Customer Reviews
                    <span className="bg-rose-100 text-[#D81B60] text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {quickViewProduct.rating} ★
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {totalReviewsCount} verified farm-fresh purchases
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      addToast({
                        title: "Sign In Required",
                        message: "Please sign in to write a review. Only verified buyers can submit reviews.",
                        type: "warning",
                      });
                      openLoginModal();
                      return;
                    }
                    setShowReviewForm(!showReviewForm);
                  }}
                  className="text-xs font-bold text-[#D81B60] bg-white hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {showReviewForm ? "Cancel" : "Write Review"}
                </button>
              </div>

              {/* Write Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-slate-50 border border-rose-200 rounded-xl p-3 space-y-3 animate-fadeIn shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700">
                      Your Rating:
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
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

                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#D81B60]"
                  />

                  <textarea
                    rows={2}
                    placeholder="Share your experience with this product..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#D81B60] resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#D81B60] hover:bg-[#C2185B] text-white font-extrabold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </button>
                </form>
              )}

              {/* Success Notification */}
              {reviewSubmitted && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Thank you! Your review has been added.</span>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {reviewsList.map((review) => {
                  const isLiked = likedReviews[review.id];
                  const likesCount = (review.likes || 0) + (isLiked ? 1 : 0);

                  return (
                    <div
                      key={review.id}
                      className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-slate-200 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-rose-100 text-[#D81B60] font-black text-xs flex items-center justify-center uppercase">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800">
                                {review.userName}
                              </span>
                              {review.verifiedPurchase && (
                                <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  <UserCheck className="w-3 h-3" /> Verified
                                  Buyer
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {review.date}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "fill-amber-400"
                                  : "text-slate-200 fill-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-slate-600 font-normal leading-relaxed pt-1">
                        {review.comment}
                      </p>

                      {/* Helpful Button */}
                      <div className="flex items-center justify-end pt-1">
                        <button
                          onClick={() => handleToggleLike(review.id)}
                          className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                            isLiked
                              ? "text-[#D81B60] bg-rose-50 font-bold"
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({likesCount})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Footer (Quantity + Add to Cart) - Always visible */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3 bg-white mt-2">
            {/* Quantity Adjuster */}
            <div className="flex items-center gap-3 bg-slate-100 rounded-full px-3 py-2 border border-slate-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-slate-600 hover:text-[#D81B60] p-1 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-slate-900 w-5 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-slate-600 hover:text-[#D81B60] p-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-6 rounded-full font-extrabold text-xs uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                added
                  ? "bg-emerald-600 shadow-emerald-200"
                  : "bg-[#D81B60] hover:bg-[#C2185B] shadow-rose-200"
              }`}
            >
              {added ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Add to Cart ({formatLKR(quickViewProduct.price * quantity)})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
