import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "../services/wishlist.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthStore } from "@/state/auth.store";
import { useToastStore } from "@/state/toast.store";
import { AddWishlistPayload } from "@/interfaces/wishlist.interface";

/**
 * Fetch saved wishlist items
 */
export const useWishlist = (variantId?: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [QUERY_KEYS.WISHLIST, variantId],
    queryFn: () => wishlistService.getWishlist(variantId),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch price drops on saved wishlist items
 */
export const useWishlistPriceDrops = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [QUERY_KEYS.WISHLIST_PRICE_DROPS],
    queryFn: () => wishlistService.getPriceDrops(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Check if product is in wishlist
 */
export const useCheckWishlist = (productId: string, variantId?: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [QUERY_KEYS.WISHLIST_CHECK, productId, variantId],
    queryFn: () => wishlistService.checkWishlist(productId, variantId),
    enabled: isAuthenticated && Boolean(productId),
  });
};

/**
 * Toggle product in wishlist (Add/Remove)
 */
export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId?: string }) =>
      wishlistService.toggleWishlist(productId, variantId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST_PRICE_DROPS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST_CHECK, data.product_id] });

      addToast({
        title: data.in_wishlist ? "Saved to Wishlist" : "Removed from Wishlist",
        message: data.in_wishlist
          ? "Item has been added to your saved list."
          : "Item was removed from your saved list.",
        type: data.in_wishlist ? "success" : "info",
      });
    },
    onError: (error: any) => {
      addToast({
        title: "Wishlist Error",
        message: error?.response?.data?.detail || error?.message || "Failed to update wishlist.",
        type: "error",
      });
    },
  });
};

/**
 * Add product to wishlist
 */
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (payload: AddWishlistPayload) => wishlistService.addToWishlist(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST] });
      addToast({
        title: "Item Saved",
        message: "Product added to your saved items.",
        type: "success",
      });
    },
    onError: (error: any) => {
      addToast({
        title: "Error",
        message: error?.response?.data?.detail || "Could not save item.",
        type: "error",
      });
    },
  });
};

/**
 * Remove product from wishlist
 */
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId?: string }) =>
      wishlistService.removeFromWishlist(productId, variantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST_PRICE_DROPS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST_CHECK, variables.productId] });

      addToast({
        title: "Item Removed",
        message: "Item removed from your saved items.",
        type: "info",
      });
    },
    onError: (error: any) => {
      addToast({
        title: "Error",
        message: error?.response?.data?.detail || "Could not remove item.",
        type: "error",
      });
    },
  });
};

/**
 * Clear all items from wishlist
 */
export const useClearWishlist = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: () => wishlistService.clearWishlist(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST_PRICE_DROPS] });
      addToast({
        title: "Wishlist Cleared",
        message: "All saved items have been cleared.",
        type: "info",
      });
    },
    onError: (error: any) => {
      addToast({
        title: "Error",
        message: error?.response?.data?.detail || "Could not clear wishlist.",
        type: "error",
      });
    },
  });
};
