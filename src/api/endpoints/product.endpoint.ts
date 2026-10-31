export const PRODUCT_ENDPOINTS = {
  GET_PRODUCTS: "/products",
  GET_PRODUCT_BY_ID: (id: string) => `/products/${encodeURIComponent(id)}`,
  GET_HOME_FEED: "/products/home-feed",
  GET_FEATURED: "/products/featured",
  SEARCH_PRODUCTS: "/products/search",
  GET_BY_CATEGORY: (categoryId: string) =>
    `/products/category/${encodeURIComponent(categoryId)}`,
  GET_POPULAR: "/products/home-feed",
  GET_REVIEWS: (productId: string) =>
    `/products/${encodeURIComponent(productId)}/reviews`,
  POST_REVIEW: (productId: string) =>
    `/products/${encodeURIComponent(productId)}/reviews`,
};
