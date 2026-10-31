import { apiClient } from "@/utils/apiClient";
import { CART_ENDPOINTS } from "../endpoints/cart.endpoint";
import {
  ApiCart,
  GetCartResponse,
  CartCountResponse,
  AddToCartPayload,
  MergeCartItemPayload,
  ValidateCartResponse,
} from "@/interfaces/cart.interface";

export const cartService = {
  getCart: async (addressId?: string): Promise<ApiCart> => {
    const url = addressId
      ? `${CART_ENDPOINTS.CART}?address_id=${addressId}`
      : CART_ENDPOINTS.CART;
    const response = await apiClient.get<GetCartResponse>(url);
    return response.data.data;
  },

  addItem: async (payload: AddToCartPayload): Promise<ApiCart> => {
    const response = await apiClient.post<GetCartResponse>(
      CART_ENDPOINTS.CART_ITEMS,
      payload
    );
    return response.data.data;
  },

  updateItemQuantity: async (
    productId: string,
    quantity: number,
    variantId?: string | null
  ): Promise<ApiCart> => {
    const query = variantId ? `?variant_id=${variantId}` : "";
    const response = await apiClient.put<GetCartResponse>(
      `${CART_ENDPOINTS.CART_ITEM_BY_ID(productId)}${query}`,
      { quantity }
    );
    return response.data.data;
  },

  removeItem: async (
    productId: string,
    variantId?: string | null
  ): Promise<ApiCart> => {
    const query = variantId ? `?variant_id=${variantId}` : "";
    const response = await apiClient.delete<GetCartResponse>(
      `${CART_ENDPOINTS.CART_ITEM_BY_ID(productId)}${query}`
    );
    return response.data.data;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete(CART_ENDPOINTS.CART);
  },

  getCartCount: async (): Promise<number> => {
    const response = await apiClient.get<CartCountResponse>(
      CART_ENDPOINTS.CART_COUNT
    );
    return response.data?.data?.count ?? 0;
  },

  applyCoupon: async (code: string): Promise<ApiCart> => {
    const response = await apiClient.post<GetCartResponse>(
      CART_ENDPOINTS.CART_COUPON,
      { code }
    );
    return response.data.data;
  },

  removeCoupon: async (): Promise<ApiCart> => {
    const response = await apiClient.delete<GetCartResponse>(
      CART_ENDPOINTS.CART_COUPON
    );
    return response.data.data;
  },

  validateCart: async (): Promise<ValidateCartResponse["data"]> => {
    const response = await apiClient.post<ValidateCartResponse>(
      CART_ENDPOINTS.CART_VALIDATE
    );
    return response.data.data;
  },

  mergeCart: async (items: MergeCartItemPayload[]): Promise<ApiCart> => {
    const response = await apiClient.post<GetCartResponse>(
      CART_ENDPOINTS.CART_MERGE,
      { items }
    );
    return response.data.data;
  },
};
