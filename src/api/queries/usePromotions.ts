import { useQuery } from "@tanstack/react-query";
import { promotionService } from "../services/promotion.service";
import { QUERY_KEYS } from "../../constants/queryKeys";

export const useCoupons = (category?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COUPONS, category],
    queryFn: () => promotionService.getCoupons(category),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useTodayDeals = (category?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TODAY_DEALS, category],
    queryFn: () => promotionService.getTodayDeals(category),
    staleTime: 1000 * 60 * 2, // 2 minutes cache for live deals
  });
};
