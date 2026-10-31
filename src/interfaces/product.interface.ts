export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase?: boolean;
  likes?: number;
}

export interface ProductImage {
  image_id?: string;
  image_url: string;
  alt_text?: string | null;
  is_primary?: boolean;
  sort_order?: number;
}

export interface ProductCategoryInfo {
  category_id?: string;
  name?: string;
  slug?: string;
  image_url?: string;
}

export interface ProductVariant {
  variant_id: string;
  name: string;
  sku: string;
  price: number;
  compare_at_price?: number | null;
  stock_quantity: number;
  image_url?: string | null;
  is_active: boolean;
}

export interface Product {
  id: string;
  product_id?: string;
  title: string;
  name?: string;
  brand?: string;
  category: string;
  category_info?: ProductCategoryInfo;
  category_id?: string;
  subcategory_id?: string | null;
  subcategory?: ProductCategoryInfo | null;
  price: number;
  global_price?: number;
  originalPrice?: number;
  compare_at_price?: number | null;
  discount_price?: number | null;
  discount_percentage?: number | null;
  cashback_percentage?: number | null;
  global_cashback_percentage?: number | null;
  unit: string;
  weight?: number;
  weight_unit?: string;
  image: string;
  images?: ProductImage[];
  rating: number;
  average_rating?: number;
  reviewsCount: number;
  review_count?: number;
  badge?: string;
  badgeType?: 'discount' | 'bestseller' | 'organic' | 'free-harvest' | 'express' | 'sale';
  inStock: boolean;
  stock_quantity?: number;
  isOrganic?: boolean;
  is_on_sale?: boolean;
  is_featured?: boolean;
  is_perishable?: boolean;
  is_returnable?: boolean;
  view_count?: number;
  description?: string;
  short_description?: string;
  slug?: string;
  sku?: string;
  has_variants?: boolean;
  variants?: ProductVariant[];
  reviews?: Review[];
}

export type ProductSortBy =
  | "created_at"
  | "price"
  | "name"
  | "view_count"
  | "rating";

export type ProductSortOrder = "asc" | "desc";

export type ProductPromotion = "sale" | "cashback";

export interface ProductFilterParams {
  category_id?: string | string[];
  min_rating?: number;
  promotion?: ProductPromotion | ProductPromotion[];
  min_price?: number;
  max_price?: number;
  search?: string;
  sort_by?: ProductSortBy;
  sort_order?: ProductSortOrder;
  page?: number;
  limit?: number;
}
