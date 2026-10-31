import { Product } from "./product.interface";

export interface WishlistItem {
  wishlist_id?: string;
  product_id: string;
  variant_id?: string | null;
  price_at_watch?: number | null;
  created_at?: string;
  product?: Product;
}

export interface WishlistResponse {
  items: WishlistItem[];
  count: number;
}

export interface WishlistToggleResponse {
  product_id: string;
  in_wishlist: boolean;
}

export interface PriceDropItem {
  wishlist_id?: string;
  product_id: string;
  original_price?: number;
  current_price?: number;
  price_drop_amount?: number;
  price_drop_percentage?: number;
  product?: Product;
}

export interface PriceDropsResponse {
  price_drops: PriceDropItem[];
  count: number;
}

export interface AddWishlistPayload {
  product_id: string;
  variant_id?: string | null;
  price_at_watch?: number;
}
