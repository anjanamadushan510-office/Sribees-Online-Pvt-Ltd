import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponService } from "../services/coupon.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { EvaluateCouponsPayload } from "@/interfaces/coupon.interface";
import { useAuthStore } from "@/state/auth.store";
import { useToastStore } from "@/state/toast.store";

export const useEvaluateCoupons = (payload: EvaluateCouponsPayload = { use_cart: true }) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.EVALUATE_COUPONS, payload],
    queryFn: () => couponService.evaluateCoupons(payload),
    enabled: isAuthenticated || Boolean(payload.include_offers),
    staleTime: 1000 * 60,
  });
};

export const useCollectCoupon = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore.getState();

  return useMutation({
    mutationFn: (code: string) => couponService.collectCoupon(code),
    onSuccess: (coupon) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVALUATE_COUPONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COUPONS] });
      addToast({
        title: "Coupon Collected",
        message: `${coupon.code} added to My Coupons`,
        type: "success",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        "Failed to collect offer";
      addToast({
        title: "Offer Error",
        message,
        type: "error",
      });
    },
  });
};
