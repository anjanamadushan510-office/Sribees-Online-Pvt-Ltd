import { apiClient } from "@/utils/apiClient";
import { COUPON_ENDPOINTS } from "../endpoints/coupon.endpoint";
import {
  EvaluateCouponsPayload,
  EvaluateCouponsResponse,
  CollectCouponResponse,
  CouponCard,
  CouponSpotlight,
} from "@/interfaces/coupon.interface";

export const couponService = {
  evaluateCoupons: async (
    payload: EvaluateCouponsPayload = { use_cart: true }
  ): Promise<EvaluateCouponsResponse["data"]> => {
    const response = await apiClient.post<EvaluateCouponsResponse>(
      COUPON_ENDPOINTS.EVALUATE,
      payload
    );
    return response.data.data;
  },

  collectCoupon: async (code: string): Promise<CouponCard> => {
    const response = await apiClient.post<CollectCouponResponse>(
      COUPON_ENDPOINTS.COLLECT,
      { code }
    );
    return response.data.data.coupon;
  },

  /** The app-open popup; the server decides `show` (once a day). */
  getSpotlight: async (): Promise<CouponSpotlight> => {
    const response = await apiClient.get<{ data: CouponSpotlight }>(
      COUPON_ENDPOINTS.SPOTLIGHT
    );
    return response.data.data;
  },

  markSpotlightSeen: async (couponIds: string[]): Promise<void> => {
    await apiClient.post(COUPON_ENDPOINTS.SPOTLIGHT_SEEN, { coupon_ids: couponIds });
  },

  /** Saves every code to My Coupons; returns the server's message. */
  collectMany: async (codes: string[]): Promise<string | undefined> => {
    const response = await apiClient.post<{ message?: string }>(
      COUPON_ENDPOINTS.COLLECT_MANY,
      { codes }
    );
    return response.data.message;
  },
};
