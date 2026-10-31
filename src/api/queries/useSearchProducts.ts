import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/product.service";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { sanitizeSearchQuery } from "@/utils/sanitize";
import { SearchResult } from "@/interfaces/search.interface";

interface UseSearchProductsOptions {
  enabled?: boolean;
}

export const useSearchProducts = (
  query: string,
  page: number = 1,
  limit: number = 20,
  options?: UseSearchProductsOptions
) => {
  const sanitizedQuery = sanitizeSearchQuery(query);

  return useQuery<SearchResult>({
    queryKey: [QUERY_KEYS.SEARCH_PRODUCTS, sanitizedQuery, page, limit],
    queryFn: () => productService.searchProducts(sanitizedQuery, page, limit),
    enabled:
      options?.enabled !== undefined
        ? options.enabled && sanitizedQuery.length >= 1
        : sanitizedQuery.length >= 1,
    staleTime: 1000 * 60 * 3, // 3 minutes cache for search queries
    placeholderData: (previousData) => previousData,
  });
};
