import { apiClient } from "@/utils/apiClient";
import { PROMOTION_ENDPOINTS } from "../endpoints/promotion.endpoint";
import { Coupon, TodayDeal } from "../../interfaces/promotion.interface";

export const promotionService = {
  getCoupons: async (category?: string): Promise<Coupon[]> => {
    try {
      const response = await apiClient.get(PROMOTION_ENDPOINTS.GET_COUPONS, {
        params: category && category !== "All" ? { category } : undefined,
      });
      const data = response.data?.data || response.data || [];
      const list = Array.isArray(data) ? data : data?.coupons || [];
      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.warn("Failed to fetch coupons from API:", error);
      return [];
    }
  },

  getTodayDeals: async (category?: string): Promise<TodayDeal[]> => {
    try {
      const response = await apiClient.get(PROMOTION_ENDPOINTS.GET_TODAY_DEALS, {
        params: category && category !== "All" ? { category } : undefined,
      });
      const data = response.data?.data || response.data || [];

      // /products/home-feed returns { products: Product[], branch: {...}, total: ... }
      if (data?.products && Array.isArray(data.products)) {
        return data.products.map((p: any) => ({
          id: p.product_id || p.id,
          product: {
            ...p,
            id: p.product_id || p.id,
            title: p.name || p.title,
            image: p.images?.[0]?.image_url || p.image || "",
            category: p.category?.name || p.category || "",
          },
          dealPrice: p.discount_price ?? p.price,
          originalPrice: p.compare_at_price ?? p.price,
          discountPercentage: p.discount_percentage ?? 0,
          dealEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          claimedPercentage: Math.floor(Math.random() * 40) + 50,
          stockRemaining: p.stock_quantity ?? 10,
          tag: p.is_on_sale ? "QUICK SALE" : undefined,
        }));
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn("Failed to fetch today deals from API:", error);
      return [];
    }
  },
};

