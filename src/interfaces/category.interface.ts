export interface ApiCategory {
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_category_id?: string | null;
  is_active?: boolean;
  product_count?: number;
  is_featured?: boolean;
  children?: ApiCategory[];
}

export interface Category {
  id: string;
  category_id?: string;
  title: string;
  name?: string;
  subtitle: string;
  itemCount: number;
  product_count?: number;
  image: string;
  image_url?: string;
  slug: string;
  subcategories?: string[];
  featured?: boolean;
  tag?: string;
  description?: string;
  parent_category_id?: string | null;
  is_active?: boolean;
  children?: Category[];
}
