import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../services/category.service";
import { QUERY_KEYS } from "../../constants/queryKeys";

export const useCategories = (options?: {
  hierarchical?: boolean;
  top_level_only?: boolean;
}) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.CATEGORIES,
      options?.hierarchical,
      options?.top_level_only,
    ],
    queryFn: () => categoryService.getCategories(options),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};

export const useCategoryByIdOrSlug = (idOrSlug: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, idOrSlug],
    queryFn: () => categoryService.getCategoryByIdOrSlug(idOrSlug),
    enabled: !!idOrSlug,
  });
};
