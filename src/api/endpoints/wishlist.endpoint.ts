export const WISHLIST_ENDPOINTS = {
  GET_WISHLIST: "/wishlist",
  TOGGLE_WISHLIST: (productId: string) =>
    `/wishlist/toggle/${encodeURIComponent(productId)}`,
  ADD_WISHLIST: "/wishlist",
  REMOVE_WISHLIST: (productId: string) =>
    `/wishlist/${encodeURIComponent(productId)}`,
  CHECK_WISHLIST: (productId: string) =>
    `/wishlist/check/${encodeURIComponent(productId)}`,
  GET_PRICE_DROPS: "/wishlist/price-drops",
  CLEAR_WISHLIST: "/wishlist",
};
