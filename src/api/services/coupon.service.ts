import { apiClient } from "@/utils/apiClient";
import { COUPON_ENDPOINTS } from "../endpoints/coupon.endpoint";
import {
  EvaluateCouponsPayload,
  EvaluateCouponsResponse,
  CollectCouponResponse,
  CouponCard,
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
};
