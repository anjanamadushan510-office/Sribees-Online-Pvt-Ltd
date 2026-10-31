import { apiClient } from "@/utils/apiClient";
import { WISHLIST_ENDPOINTS } from "../endpoints/wishlist.endpoint";
import {
  WishlistItem,
  WishlistResponse,
  WishlistToggleResponse,
  PriceDropItem,
  PriceDropsResponse,
  AddWishlistPayload,
} from "@/interfaces/wishlist.interface";
import { mapApiProductToProduct } from "./product.service";

export const wishlistService = {
  /**
   * Fetch all saved wishlist items for the authenticated user
   */
  getWishlist: async (variantId?: string): Promise<WishlistResponse> => {
    try {
      const response = await apiClient.get(WISHLIST_ENDPOINTS.GET_WISHLIST, {
        params: variantId ? { variant_id: variantId } : undefined,
      });

      const payload = response.data?.data || response.data || {};
      const rawItems = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : [];

      const items: WishlistItem[] = rawItems.map((raw: any) => {
        const rawProduct = raw.product || (raw.title || raw.name ? raw : null);
        return {
          wishlist_id: raw.wishlist_id || raw.id || raw.product_id,
          product_id: raw.product_id || (rawProduct ? rawProduct.product_id || rawProduct.id : ""),
          variant_id: raw.variant_id ?? null,
          price_at_watch: raw.price_at_watch ?? null,
          created_at: raw.created_at || raw.createdAt,
          product: rawProduct ? mapApiProductToProduct(rawProduct) : undefined,
        };
      });

      return {
        items,
        count: typeof payload.count === "number" ? payload.count : items.length,
      };
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        console.error("Failed to fetch wishlist:", error);
      }
      return { items: [], count: 0 };
    }
  },

  /**
   * Toggle item in wishlist (Add if not present, Remove if present)
   */
  toggleWishlist: async (
    productId: string,
    variantId?: string
  ): Promise<WishlistToggleResponse> => {
    const response = await apiClient.post(
      WISHLIST_ENDPOINTS.TOGGLE_WISHLIST(productId),
      null,
      { params: variantId ? { variant_id: variantId } : undefined }
    );
    const data = response.data?.data || response.data || {};
    return {
      product_id: data.product_id || productId,
      in_wishlist: Boolean(data.in_wishlist),
    };
  },

  /**
   * Add specific product item to wishlist
   */
  addToWishlist: async (payload: AddWishlistPayload): Promise<any> => {
    const response = await apiClient.post(WISHLIST_ENDPOINTS.ADD_WISHLIST, payload);
    return response.data?.data || response.data;
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (
    productId: string,
    variantId?: string
  ): Promise<void> => {
    await apiClient.delete(WISHLIST_ENDPOINTS.REMOVE_WISHLIST(productId), {
      params: variantId ? { variant_id: variantId } : undefined,
    });
  },

  /**
   * Check if a single product is in the wishlist
   */
  checkWishlist: async (
    productId: string,
    variantId?: string
  ): Promise<WishlistToggleResponse> => {
    try {
      const response = await apiClient.get(
        WISHLIST_ENDPOINTS.CHECK_WISHLIST(productId),
        { params: variantId ? { variant_id: variantId } : undefined }
      );
      const data = response.data?.data || response.data || {};
      return {
        product_id: data.product_id || productId,
        in_wishlist: Boolean(data.in_wishlist),
      };
    } catch {
      return { product_id: productId, in_wishlist: false };
    }
  },

  /**
   * Get wishlist items with active price drops
   */
  getPriceDrops: async (): Promise<PriceDropsResponse> => {
    try {
      const response = await apiClient.get(WISHLIST_ENDPOINTS.GET_PRICE_DROPS);
      const payload = response.data?.data || response.data || {};
      const rawDrops = Array.isArray(payload.price_drops)
        ? payload.price_drops
        : Array.isArray(payload)
          ? payload
          : [];

      const price_drops: PriceDropItem[] = rawDrops.map((raw: any) => {
        const rawProduct = raw.product || raw;
        return {
          wishlist_id: raw.wishlist_id || raw.id,
          product_id: raw.product_id || (rawProduct ? rawProduct.product_id || rawProduct.id : ""),
          original_price: raw.original_price ?? raw.price_at_watch,
          current_price: raw.current_price ?? (rawProduct ? rawProduct.price : undefined),
          price_drop_amount: raw.price_drop_amount,
          price_drop_percentage: raw.price_drop_percentage,
          product: rawProduct ? mapApiProductToProduct(rawProduct) : undefined,
        };
      });

      return {
        price_drops,
        count: typeof payload.count === "number" ? payload.count : price_drops.length,
      };
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        console.error("Failed to fetch price drops:", error);
      }
      return { price_drops: [], count: 0 };
    }
  },

  /**
   * Clear entire wishlist
   */
  clearWishlist: async (): Promise<void> => {
    await apiClient.delete(WISHLIST_ENDPOINTS.CLEAR_WISHLIST);
  },
};
