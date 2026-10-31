import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService, CreateReviewPayload } from "../services/review.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useProductReviews = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_REVIEWS, productId],
    queryFn: () => reviewService.getProductReviews(productId),
    enabled: Boolean(productId) && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export interface SubmitReviewParams {
  productId: string;
  payload: CreateReviewPayload;
}

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, payload }: SubmitReviewParams) =>
      reviewService.createProductReview(productId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCT_REVIEWS, variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCT_BY_ID, variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDER_DETAILS],
      });
    },
  });
};

export const useCreateProductReview = (productId: string) => {
  const submitReview = useSubmitReview();

  return {
    ...submitReview,
    mutate: (payload: CreateReviewPayload, options?: any) =>
      submitReview.mutate({ productId, payload }, options),
    mutateAsync: (payload: CreateReviewPayload, options?: any) =>
      submitReview.mutateAsync({ productId, payload }, options),
  };
};
