/** Activity-log names for the store's pages (components/WebActivity). */
const PAGE_NAMES: Record<string, string> = {
  "/shop": "home",
  "/productView": "product_details",
  "/categories": "categories",
  "/checkoutView": "checkout",
  "/savedItems": "saved",
  "/orderHistory": "orders",
  "/myAccount": "profile",
  "/accountSettings": "settings",
  "/promotions": "offers",
  "/referral": "invite_friends",
  "/privacyPolicy": "privacy_policy",
  "/returnPolicy": "return_policy",
  "/terms": "terms",
};

/** The page's activity name: "/product?search=rice" is a search, "?category=" a category. */
export function pageName(pathname: string, params: URLSearchParams): string {
  if (pathname === "/product") {
    if (params.get("search") || params.get("q")) return "search";
    if (params.get("category")) return "category_products";
    return "products";
  }
  return PAGE_NAMES[pathname] ?? (pathname.replace(/^\//, "").replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase() || "home");
}
