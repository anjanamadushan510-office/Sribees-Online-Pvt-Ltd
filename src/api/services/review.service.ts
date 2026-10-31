import { apiClient } from "@/utils/apiClient";
import { PRODUCT_ENDPOINTS } from "../endpoints/product.endpoint";
import { Review } from "@/interfaces/product.interface";

export interface GetReviewsResponse {
  reviews: Review[];
  total: number;
  average_rating: number;
}

export interface CreateReviewPayload {
  rating: number;
  title?: string;
  comment: string;
  order_item_id: string;
}

export const reviewService = {
  getProductReviews: async (
    productId: string,
    page: number = 1,
    pageSize: number = 10,
    sortBy: "newest" | "highest" | "lowest" = "newest"
  ): Promise<GetReviewsResponse> => {
    try {
      const response = await apiClient.get(
        PRODUCT_ENDPOINTS.GET_REVIEWS(productId),
        {
          params: { page, page_size: pageSize, sort_by: sortBy },
        }
      );

      const data = response.data?.data || response.data || {};
      const rawReviews = Array.isArray(data.reviews)
        ? data.reviews
        : Array.isArray(data)
        ? data
        : [];

      const reviews: Review[] = rawReviews.map((r: any, idx: number) => ({
        id: r.review_id || r.id || `rev-${idx}`,
        userName:
          r.user?.full_name ||
          r.userName ||
          r.user_name ||
          r.user?.name ||
          "Verified Customer",
        userAvatar: r.user?.profile_picture_url || r.userAvatar,
        rating: r.rating || 5,
        date: r.created_at
          ? new Date(r.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : r.date || "Recently",
        comment: r.comment || r.review || r.content || "",
        verifiedPurchase: r.is_verified_purchase ?? r.verifiedPurchase ?? true,
        likes: r.helpful_count ?? r.likes ?? 0,
      }));

      return {
        reviews,
        total: data.total ?? reviews.length,
        average_rating: data.average_rating ?? 0,
      };
    } catch (error) {
      console.warn(`Failed to fetch reviews for product ${productId}:`, error);
      return { reviews: [], total: 0, average_rating: 0 };
    }
  },

  createProductReview: async (
    productId: string,
    payload: CreateReviewPayload
  ): Promise<Review | null> => {
    try {
      const response = await apiClient.post(
        PRODUCT_ENDPOINTS.POST_REVIEW(productId),
        payload
      );
      const r = response.data?.data || response.data;
      if (!r) return null;

      return {
        id: r.review_id || r.id || `rev-${Date.now()}`,
        userName: r.user?.full_name || "You",
        rating: r.rating || payload.rating,
        date: "Just now",
        comment: r.comment || payload.comment,
        verifiedPurchase: true,
        likes: 0,
      };
    } catch (error) {
      console.error(`Failed to submit review for product ${productId}:`, error);
      throw error;
    }
  },
};
