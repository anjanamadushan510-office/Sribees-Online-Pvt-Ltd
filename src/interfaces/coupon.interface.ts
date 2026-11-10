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
  /** How the end is shown (server-decided); null when ended or open-ended. */
  expiry?: CouponExpiry | null;
  expiring_soon?: boolean;
  is_new?: boolean;
  /** "NEW" in the site's language, or null. */
  badge?: string | null;
}

/**
 * `timer`: count `ends_at` down against serverNow() with `text` as prefix.
 * `days` / `date` (or anything newer): `text` is the whole line.
 */
export interface CouponExpiry {
  ends_at: string;
  mode: "timer" | "days" | "date" | string;
  text: string;
}

/** A chip above the list; `key` is a card flag (`all` = every card). */
export interface CouponFilter {
  key: "all" | "expiring_soon" | "is_new" | string;
  title: string;
}

export function couponMatches(card: CouponCard, key: string): boolean {
  if (key === "expiring_soon") return Boolean(card.expiring_soon);
  if (key === "is_new") return Boolean(card.is_new);
  return true;
}

export interface CouponSpotlight {
  show: boolean;
  title?: string;
  button?: string;
  coupons: CouponCard[];
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
  /** This client draws `expiry`, so the "Valid till" term is left out. */
  expiry_line?: boolean;
}

export interface EvaluateCouponsResponse {
  success: boolean;
  data: {
    basket?: boolean;
    notice?: string | null;
    sections: CouponSection[];
    coupons: CouponCard[];
    applied?: AppliedCouponDetail | null;
    filters?: CouponFilter[];
  };
}

export interface CollectCouponResponse {
  success: boolean;
  data: {
    coupon: CouponCard;
  };
  message: string;
}
