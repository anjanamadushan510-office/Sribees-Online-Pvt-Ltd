import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "../services/cart.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthStore } from "@/state/auth.store";
import {
  AddToCartPayload,
  MergeCartItemPayload,
} from "@/interfaces/cart.interface";
import { useToastStore } from "@/state/toast.store";

export const useGetCart = (addressId?: string) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.CART, addressId],
    queryFn: () => cartService.getCart(addressId),
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });
};

export const useGetCartCount = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.CART_COUNT],
    queryFn: () => cartService.getCartCount(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore.getState();

  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartService.addItem(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART_COUNT] });
      addToast({
        title: "Added to Cart",
        message: `${variables.name} added to your cart`,
        image: variables.image,
        actionLabel: "View Cart",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        "Failed to add item to cart";
      addToast({
        title: "Cart Error",
        message,
        type: "error",
      });
    },
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore.getState();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
      variantId,
    }: {
      productId: string;
      quantity: number;
      variantId?: string | null;
    }) => cartService.updateItemQuantity(productId, quantity, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART_COUNT] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        "Failed to update item quantity";
      addToast({
        title: "Quantity Update Failed",
        message,
        type: "error",
      });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string;
      variantId?: string | null;
    }) => cartService.removeItem(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART_COUNT] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART_COUNT] });
    },
  });
};

export const useApplyCartCoupon = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore.getState();

  return useMutation({
    mutationFn: (code: string) => cartService.applyCoupon(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
      addToast({
        title: "Coupon Applied",
        message: "Coupon has been successfully applied to your cart",
        type: "success",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        "Invalid coupon code";
      addToast({
        title: "Coupon Error",
        message,
        type: "error",
      });
    },
  });
};

export const useRemoveCartCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
    },
  });
};

export const useValidateCart = () => {
  return useMutation({
    mutationFn: () => cartService.validateCart(),
  });
};

export const useMergeCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: MergeCartItemPayload[]) => cartService.mergeCart(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART_COUNT] });
    },
  });
};
