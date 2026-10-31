/**
 * Promotion & Coupon Endpoints
 * Reference: WEB_STOREFRONT_API.md
 * - Section 10: Coupons (/coupons/evaluate, /coupons/collect, /coupons/available, /coupons/collected)
 * - Section 7.2: Deals / Quick Sale (/products/home-feed, /products/featured)
 * - Section 7.5: Promotional Banners (/banners, /banners/events)
 * - Section 9: Cart Coupons (/cart/coupon)
 */
export const PROMOTION_ENDPOINTS = {
  // Coupons & Offers (Section 10)
  EVALUATE_COUPONS: "/coupons/evaluate",
  COLLECT_COUPON: "/coupons/collect",
  GET_COUPONS: "/coupons/available",
  GET_AVAILABLE_COUPONS: "/coupons/available",
  GET_COLLECTED_COUPONS: "/coupons/collected",

  // Deals & Quick Sales (Section 7.2)
  // /products/home-feed returns Quick Sale items with the highest discounts at the branch
  GET_TODAY_DEALS: "/products/home-feed",
  GET_HOME_FEED: "/products/home-feed",
  GET_FEATURED_DEALS: "/products/featured",

  // Promotional Banners (Section 7.5)
  GET_BANNERS: "/banners",
  RECORD_BANNER_EVENTS: "/banners/events",

  // Cart Coupon Operations (Section 9)
  APPLY_CART_COUPON: "/cart/coupon",
  REMOVE_CART_COUPON: "/cart/coupon",
} as const;

