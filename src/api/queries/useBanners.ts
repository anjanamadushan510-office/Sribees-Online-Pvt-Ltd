import { useQuery } from "@tanstack/react-query";
import { bannerService } from "../services/banner.service";
import { QUERY_KEYS } from "../../constants/queryKeys";

export const useBanners = (limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BANNERS, limit],
    queryFn: () => bannerService.getBanners(limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};
