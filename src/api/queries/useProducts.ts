import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/product.service";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { ProductFilterParams } from "@/interfaces/product.interface";

export const useProducts = (
  filters?: ProductFilterParams | string,
  query?: string,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, filters, query],
    queryFn: () => productService.getProducts(filters, query),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const usePopularProducts = (limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEYS.POPULAR_PRODUCTS, limit],
    queryFn: () => productService.getPopularProducts(limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useHomeFeedProducts = (limit: number = 20) => {
  return useQuery({
    queryKey: [QUERY_KEYS.HOME_FEED, limit],
    queryFn: () => productService.getHomeFeedProducts(limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useFeaturedProducts = (limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FEATURED_PRODUCTS, limit],
    queryFn: () => productService.getFeaturedProducts(limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_BY_ID, id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};
