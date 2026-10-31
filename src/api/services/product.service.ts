import { apiClient } from "@/utils/apiClient";
import { PRODUCT_ENDPOINTS } from "../endpoints/product.endpoint";
import { Product, ProductFilterParams } from "@/interfaces/product.interface";
import { SearchResult, SearchPagination } from "@/interfaces/search.interface";
import { sanitizeSearchQuery } from "@/utils/sanitize";
import { categoryService } from "./category.service";
import { formatImageUrl } from "@/utils/formatImageUrl";

export function mapApiProductToProduct(raw: any): Product {
  const rawPrimaryImage =
    raw.images && raw.images.length > 0
      ? raw.images.find((img: any) => img.is_primary)?.image_url ||
        raw.images[0].image_url
      : raw.image_url ||
        raw.image;
  const primaryImage = formatImageUrl(rawPrimaryImage);

  const effectivePrice = raw.discount_price ?? raw.sale_price ?? raw.price ?? 0;
  const globalPrice =
    raw.global_price != null && !isNaN(Number(raw.global_price)) && Number(raw.global_price) > 0
      ? Number(raw.global_price)
      : undefined;
  const originalPrice =
    globalPrice && globalPrice > effectivePrice
      ? globalPrice
      : raw.compare_at_price && Number(raw.compare_at_price) > effectivePrice
        ? Number(raw.compare_at_price)
        : raw.discount_price && raw.price && Number(raw.price) > effectivePrice
          ? Number(raw.price)
          : undefined;

  const rawDiscount = Number(raw.discount_percentage);
  const calculatedDiscount =
    originalPrice && originalPrice > effectivePrice
      ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
      : 0;

  const discountPercent =
    !isNaN(rawDiscount) && rawDiscount > 0
      ? Math.round(rawDiscount)
      : calculatedDiscount > 0
        ? calculatedDiscount
        : 0;

  const isOnSale = Boolean(raw.is_on_sale || discountPercent > 0);
  const badge = isOnSale
    ? discountPercent > 0
      ? `${discountPercent}% OFF`
      : "Sale"
    : raw.is_featured
      ? "Featured"
      : undefined;

  const badgeType = isOnSale
    ? "discount"
    : raw.is_featured
      ? "bestseller"
      : undefined;

  const ratingVal =
    raw.average_rating != null
      ? Number(raw.average_rating)
      : raw.rating != null
        ? Number(raw.rating)
        : 0;
  const reviewCountVal =
    raw.review_count != null
      ? Number(raw.review_count)
      : raw.reviewsCount != null
        ? Number(raw.reviewsCount)
        : 0;

  return {
    id: raw.product_id || raw._id || raw.id || "",
    product_id: raw.product_id || raw.id || "",
    title: raw.name || raw.title || "",
    name: raw.name || raw.title || "",
    brand:
      typeof raw.brand === "object"
        ? raw.brand?.name || "SRIBEES Direct"
        : raw.brand || "SRIBEES Direct",
    category: typeof raw.category === "object" ? raw.category?.name || "" : raw.category || "",
    category_info: typeof raw.category === "object" ? raw.category : undefined,
    category_id: raw.category_id || raw.category?.category_id || "",
    subcategory_id: raw.subcategory_id,
    subcategory: raw.subcategory,
    price: effectivePrice,
    global_price: globalPrice ?? (raw.global_price != null && !isNaN(Number(raw.global_price)) ? Number(raw.global_price) : undefined),
    originalPrice:
      originalPrice && originalPrice > effectivePrice
        ? originalPrice
        : undefined,
    compare_at_price: raw.compare_at_price,
    discount_price: raw.discount_price,
    discount_percentage: discountPercent > 0 ? discountPercent : raw.discount_percentage,
    cashback_percentage:
      raw.cashback_percentage != null && !isNaN(Number(raw.cashback_percentage))
        ? Number(raw.cashback_percentage)
        : raw.global_cashback_percentage != null && !isNaN(Number(raw.global_cashback_percentage))
          ? Number(raw.global_cashback_percentage)
          : undefined,
    global_cashback_percentage:
      raw.global_cashback_percentage != null && !isNaN(Number(raw.global_cashback_percentage))
        ? Number(raw.global_cashback_percentage)
        : undefined,
    unit: raw.weight_unit
      ? `${raw.weight || ""}${raw.weight_unit}`
      : raw.unit || "item",
    weight: raw.weight,
    weight_unit: raw.weight_unit,
    image: primaryImage,
    images: Array.isArray(raw.images)
      ? raw.images.map((img: any) =>
          typeof img === "string"
            ? { image_url: formatImageUrl(img) }
            : { ...img, image_url: formatImageUrl(img.image_url || img.url) }
        )
      : [],
    rating: ratingVal,
    average_rating: ratingVal,
    reviewsCount: reviewCountVal,
    review_count: reviewCountVal,
    badge,
    badgeType,
    inStock: (raw.stock_quantity ?? 1) > 0 && (raw.is_active ?? true),
    stock_quantity: raw.stock_quantity ?? 0,
    is_on_sale: isOnSale,
    is_featured: raw.is_featured,
    is_perishable: raw.is_perishable,
    is_returnable: raw.is_returnable,
    view_count: raw.view_count,
    description: raw.description || raw.short_description || "",
    short_description: raw.short_description,
    slug: raw.slug || "",
    sku: raw.sku || "",
    has_variants: Boolean(raw.has_variants),
    variants: Array.isArray(raw.variants) ? raw.variants : [],
    reviews: Array.isArray(raw.reviews)
      ? raw.reviews.map((r: any, idx: number) => ({
          id: r.id || r.review_id || `rev-${idx}`,
          userName:
            r.userName || r.user_name || r.user?.name || r.name || "Anonymous",
          rating: r.rating || 5,
          date:
            r.date ||
            (r.created_at
              ? new Date(r.created_at).toLocaleDateString()
              : "Recently"),
          comment: r.comment || r.review || r.content || "",
          verifiedPurchase: r.verifiedPurchase ?? r.is_verified ?? true,
          likes: r.likes ?? 0,
        }))
      : undefined,
  };
}

export const productService = {
  getProducts: async (
    filterOrCategory?: ProductFilterParams | string,
    query?: string,
  ): Promise<Product[]> => {
    try {
      const filters: ProductFilterParams =
        typeof filterOrCategory === "string"
          ? { category_id: filterOrCategory, search: query }
          : filterOrCategory
            ? { ...filterOrCategory }
            : {};

      if (query && !filters.search) {
        filters.search = query;
      }

      const searchParams = new URLSearchParams();

      // Categories: supports single ID, comma-separated IDs, or array of IDs/names
      const categoryInput = filters.category_id;
      if (categoryInput && categoryInput !== "All") {
        let categoryItems: string[] = [];
        if (Array.isArray(categoryInput)) {
          categoryItems = categoryInput.filter(Boolean);
        } else if (typeof categoryInput === "string") {
          categoryItems = categoryInput
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s && s !== "All");
        }

        if (categoryItems.length > 0) {
          const resolvedIds: string[] = [];
          let allCategories: any[] | null = null;

          for (const item of categoryItems) {
            if (/^[0-9a-fA-F-]{36}$/.test(item) || item.startsWith("c100")) {
              resolvedIds.push(item);
            } else {
              try {
                if (!allCategories) {
                  allCategories = await categoryService.getCategories();
                }
                const matched = allCategories.find(
                  (c) =>
                    c.id?.toLowerCase() === item.toLowerCase() ||
                    c.category_id?.toLowerCase() === item.toLowerCase() ||
                    (c.name && c.name.toLowerCase() === item.toLowerCase()) ||
                    (c.title && c.title.toLowerCase() === item.toLowerCase()) ||
                    (c.slug && c.slug.toLowerCase() === item.toLowerCase()),
                );
                if (matched) {
                  resolvedIds.push(matched.category_id || matched.id);
                } else {
                  resolvedIds.push(item);
                }
              } catch {
                resolvedIds.push(item);
              }
            }
          }

          if (resolvedIds.length > 0) {
            searchParams.set("category_id", resolvedIds.join(","));
          }
        }
      }

      // Customer Ratings: min_rating (e.g. 4, 3, 2, 1)
      if (filters.min_rating != null && !isNaN(Number(filters.min_rating))) {
        searchParams.set("min_rating", String(filters.min_rating));
      }

      // Promotions: promotion=sale, promotion=cashback (multiple allowed)
      if (filters.promotion) {
        const promotions = Array.isArray(filters.promotion)
          ? filters.promotion
          : [filters.promotion];
        promotions.forEach((p) => {
          if (p === "sale" || p === "cashback") {
            searchParams.append("promotion", p);
          }
        });
      }

      // Price filters: min_price, max_price
      if (filters.min_price != null && !isNaN(Number(filters.min_price))) {
        searchParams.set("min_price", String(filters.min_price));
      }
      if (filters.max_price != null && !isNaN(Number(filters.max_price))) {
        searchParams.set("max_price", String(filters.max_price));
      }

      // Search keyword
      if (filters.search) {
        const cleanQuery = sanitizeSearchQuery(filters.search);
        if (cleanQuery) {
          searchParams.set("search", cleanQuery);
        }
      }

      // Sort by & order
      if (filters.sort_by) {
        searchParams.set("sort_by", filters.sort_by);
        if (filters.sort_order) {
          searchParams.set("sort_order", filters.sort_order);
        }
      }

      // Pagination
      if (filters.page != null && filters.page > 0) {
        searchParams.set("page", String(filters.page));
      }
      if (filters.limit != null && filters.limit > 0) {
        searchParams.set("limit", String(filters.limit));
      } else {
        searchParams.set("limit", "100");
      }

      const response = await apiClient.get(PRODUCT_ENDPOINTS.GET_PRODUCTS, {
        params: searchParams,
      });

      const rawProducts =
        response.data?.data?.products ||
        response.data?.products ||
        (Array.isArray(response.data?.data) ? response.data.data : null) ||
        (Array.isArray(response.data) ? response.data : []);

      if (Array.isArray(rawProducts)) {
        let products = rawProducts.map(mapApiProductToProduct);

        // Only sort client-side by name if no sort_by was passed
        if (!filters.sort_by) {
          products.sort((a, b) =>
            (a.title || a.name || "").localeCompare(b.title || b.name || ""),
          );
        }

        return products;
      }
    } catch (error) {
      console.warn("Failed to fetch products from backend API:", error);
    }
    return [];
  },

  searchProducts: async (
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResult> => {
    const cleanQuery = sanitizeSearchQuery(query);
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 20)));

    if (!cleanQuery) {
      return {
        products: [],
        pagination: { total: 0, page: 1, limit: safeLimit, pages: 0 },
        query: "",
      };
    }

    try {
      const response = await apiClient.get(PRODUCT_ENDPOINTS.SEARCH_PRODUCTS, {
        params: {
          q: cleanQuery,
          page: safePage,
          limit: safeLimit,
        },
      });

      const responseData = response.data?.data || response.data || {};
      const rawProducts =
        responseData.products ||
        (Array.isArray(responseData) ? responseData : []);

      const products = Array.isArray(rawProducts)
        ? rawProducts.map(mapApiProductToProduct)
        : [];

      const pagination: SearchPagination = responseData.pagination || {
        total: products.length,
        page,
        limit,
        pages: Math.ceil(products.length / limit) || 1,
      };

      return {
        products,
        pagination,
        branch: responseData.branch,
        query: responseData.query || cleanQuery,
      };
    } catch (error) {
      console.warn("Failed to search products from API:", error);
      try {
        const fallbackProducts = await productService.getProducts(undefined, cleanQuery);
        return {
          products: fallbackProducts,
          pagination: {
            total: fallbackProducts.length,
            page: 1,
            limit,
            pages: Math.ceil(fallbackProducts.length / limit) || 1,
          },
          query: cleanQuery,
        };
      } catch {
        return {
          products: [],
          pagination: { total: 0, page: 1, limit, pages: 0 },
          query: cleanQuery,
        };
      }
    }
  },

  getHomeFeedProducts: async (limit: number = 20): Promise<Product[]> => {
    try {
      const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 20)));
      const response = await apiClient.get(PRODUCT_ENDPOINTS.GET_HOME_FEED, {
        params: { limit: safeLimit },
      });

      const rawProducts =
        response.data?.data?.products ||
        response.data?.products ||
        (Array.isArray(response.data?.data) ? response.data.data : null) ||
        (Array.isArray(response.data) ? response.data : []);

      if (Array.isArray(rawProducts)) {
        return rawProducts.map(mapApiProductToProduct);
      }
    } catch (error) {
      console.warn("Failed to fetch home feed products:", error);
    }
    return [];
  },

  getFeaturedProducts: async (limit: number = 10): Promise<Product[]> => {
    try {
      const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 10)));
      const response = await apiClient.get(PRODUCT_ENDPOINTS.GET_FEATURED, {
        params: { limit: safeLimit },
      });

      const rawProducts =
        response.data?.data?.products ||
        response.data?.products ||
        (Array.isArray(response.data?.data) ? response.data.data : null) ||
        (Array.isArray(response.data) ? response.data : []);

      if (Array.isArray(rawProducts)) {
        const products = rawProducts.map(mapApiProductToProduct);
        products.sort((a, b) =>
          (a.title || a.name || "").localeCompare(b.title || b.name || "")
        );
        return products;
      }
    } catch (error) {
      console.warn("Failed to fetch featured products:", error);
    }
    return [];
  },

  getPopularProducts: async (limit: number = 10): Promise<Product[]> => {
    return productService.getHomeFeedProducts(limit);
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    if (!id || typeof id !== "string") {
      return undefined;
    }

    try {
      const response = await apiClient.get(
        PRODUCT_ENDPOINTS.GET_PRODUCT_BY_ID(id),
      );
      const raw = response.data?.data || response.data;
      if (raw) {
        return mapApiProductToProduct(raw);
      }
    } catch (error) {
      console.warn(`Failed to fetch product ${id} from API:`, error);
    }
    return undefined;
  },
};
