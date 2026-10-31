import { Product } from './product.interface';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ApiCartItem {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  price: number;
  name: string;
  image: string;
  sku?: string | null;
  category_id?: string | null;
  original_price?: number | null;
  cashback_percentage?: number | null;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  cashback_earned: number;
  total: number;
}

export interface AppliedCartCoupon {
  code: string;
  discount_type?: string;
  discount_value?: number;
  max_discount_amount?: number;
  min_order_value?: number;
  discount_amount?: number;
}

export interface CartDeliveryInfo {
  status: 'quoted' | 'no_address' | 'not_serviceable' | 'unavailable' | 'empty_cart' | string;
  available: boolean;
  fee: number;
  message?: string | null;
  address_id?: string | null;
  postal_city?: string | null;
}

export interface ApiCart {
  items: ApiCartItem[];
  totals: CartTotals;
  coupon?: AppliedCartCoupon | null;
  delivery: CartDeliveryInfo;
  updated_at: number;
}

export interface GetCartResponse {
  success: boolean;
  message?: string;
  data: ApiCart;
}

export interface CartCountResponse {
  success?: boolean;
  data: {
    count: number;
  };
}

export interface AddToCartPayload {
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  sku?: string;
  variant_id?: string | null;
  category_id?: string;
  original_price?: number;
  cashback_percentage?: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface MergeCartItemPayload {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  price: number;
  name: string;
  image: string;
  sku?: string;
  cashback_percentage?: number;
}

export interface ValidateCartResponse {
  success: boolean;
  data: {
    valid: boolean;
    items: ApiCartItem[];
    totals: CartTotals;
    delivery: CartDeliveryInfo;
    issues?: Array<{
      code: string;
      message: string;
    }>;
  };
}
