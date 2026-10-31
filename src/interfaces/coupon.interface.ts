export interface CouponCard {
  coupon_id: string;
  code: string;
  label: string;
  description?: string;
  terms?: string[];
  valid_until?: string;
  section: "eligible" | "collect" | "locked" | "wallet" | string;
  action: "use" | "collect" | "remove" | null;
  applied: boolean;
  collected?: boolean;
  eligible: boolean;
  status?: {
    key: "ready" | "applied" | "used" | "ended" | "locked" | string;
    text: string;
  };
  dimmed?: boolean;
  reason?: string | null;
  estimated_discount?: number;
  saving?: string;
  tier?: {
    name: string;
    color: string;
  } | null;
}

export interface CouponSection {
  key: string;
  title: string;
}

export interface AppliedCouponDetail {
  code: string;
  label: string;
  eligible: boolean;
  discount: number;
  saving: string;
  reason?: string | null;
}

export interface EvaluateCouponsPayload {
  use_cart?: boolean;
  items?: Array<{
    product_id: string;
    variant_id?: string | null;
    quantity: number;
  }>;
  applied_code?: string;
  include_offers?: boolean;
}

export interface EvaluateCouponsResponse {
  success: boolean;
  data: {
    basket?: boolean;
    notice?: string | null;
    sections: CouponSection[];
    coupons: CouponCard[];
    applied?: AppliedCouponDetail | null;
  };
}

export interface CollectCouponResponse {
  success: boolean;
  data: {
    coupon: CouponCard;
  };
  message: string;
}
