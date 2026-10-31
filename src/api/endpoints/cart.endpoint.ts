export const CART_ENDPOINTS = {
  CART: "/cart",
  CART_ITEMS: "/cart/items",
  CART_ITEM_BY_ID: (productId: string) =>
    `/cart/items/${encodeURIComponent(productId)}`,
  CART_COUNT: "/cart/count",
  CART_COUPON: "/cart/coupon",
  CART_VALIDATE: "/cart/validate",
  CART_MERGE: "/cart/merge",
} as const;
