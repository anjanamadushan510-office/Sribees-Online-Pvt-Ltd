import { Product } from "./product.interface";

export interface Coupon {
  id?: string;
  coupon_id?: string;
  code: string;
  description: string;
  discount_type: "fixed" | "percentage" | "free_shipping" | string;
  discount_value: number;
  min_order_value: number;
  valid_until: string;
  // Optional client / UI metadata
  title?: string;
  category?: string;
  badge?: string;
  colorTheme?: "rose" | "amber" | "emerald" | "indigo" | "purple";
  usesLeft?: number;
  discountType?: string;
  discountValue?: number;
  minSpend?: number;
  validUntil?: string;
}

export interface TodayDeal {
  id: string;
  product: Product;
  dealPrice: number;
  originalPrice: number;
  discountPercentage: number;
  dealEndTime: string;
  claimedPercentage: number; // e.g. 78 for 78% sold
  stockRemaining: number;
  tag?: string;
}
