import { apiClient } from "@/utils/apiClient";
import { CATEGORY_ENDPOINTS } from "../endpoints/category.endpoint";
import { Category } from "@/interfaces/category.interface";
import { formatImageUrl } from "@/utils/formatImageUrl";

export function mapApiCategoryToCategory(raw: any): Category {
  const imageUrl = formatImageUrl(raw.image_url || raw.image);
  const id = raw.category_id || raw._id || raw.id || "";
  const name = raw.name || raw.title || "Category";

  return {
    id,
    category_id: id,
    title: name,
    name,
    subtitle: raw.description || `${raw.product_count || 0} items available`,
    itemCount: raw.product_count ?? raw.itemCount ?? 0,
    product_count: raw.product_count ?? 0,
    image: imageUrl,
    image_url: imageUrl,
    slug: raw.slug || name.toLowerCase().replace(/\s+/g, "-"),
    description: raw.description || "",
    parent_category_id: raw.parent_category_id || null,
    is_active: raw.is_active ?? true,
    subcategories: raw.children
      ? raw.children.map((c: any) => c.name || c.title)
      : raw.subcategories || [],
    children: raw.children
      ? raw.children.map(mapApiCategoryToCategory)
      : undefined,
    featured: raw.is_featured ?? raw.featured ?? true,
  };
}

export const categoryService = {
  getCategories: async (options?: {
    hierarchical?: boolean;
    top_level_only?: boolean;
  }): Promise<Category[]> => {
    try {
      const response = await apiClient.get(CATEGORY_ENDPOINTS.GET_CATEGORIES, {
        params: {
          hierarchical: options?.hierarchical,
          top_level_only: options?.top_level_only,
        },
      });

      const rawData =
        response.data?.data?.categories ||
        response.data?.data ||
        response.data?.categories ||
        response.data;

      if (Array.isArray(rawData)) {
        return rawData.map(mapApiCategoryToCategory);
      }
    } catch (error) {
      console.warn("Failed to fetch categories from backend API:", error);
    }
    return [];
  },

  getCategoryByIdOrSlug: async (
    idOrSlug: string,
  ): Promise<Category | undefined> => {
    try {
      const response = await apiClient.get(
        CATEGORY_ENDPOINTS.GET_CATEGORY_BY_ID(idOrSlug),
      );
      const raw = response.data?.data || response.data;
      if (raw) {
        return mapApiCategoryToCategory(raw);
      }
    } catch (error) {
      console.warn(`Failed to fetch category ${idOrSlug} from backend:`, error);
    }
    return undefined;
  },
};
