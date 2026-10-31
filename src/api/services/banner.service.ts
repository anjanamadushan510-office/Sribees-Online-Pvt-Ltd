import { apiClient } from "@/utils/apiClient";
import { BANNER_ENDPOINTS } from "../endpoints/banner.endpoint";
import { Banner } from "@/interfaces/banner.interface";
import { formatImageUrl } from "@/utils/formatImageUrl";

export function mapApiBannerToBanner(raw: any, index: number = 0): Banner {
  const imageUrl = formatImageUrl(
    raw.imageUrl || raw.image_url || raw.image,
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1400"
  );

  return {
    id: raw.bannerId || raw.banner_id || raw.id || `banner-${index}`,
    bannerId: raw.bannerId || raw.banner_id || raw.id,
    title: raw.title || "SRIBEES Special Offers",
    subtitle: raw.subtitle || "FRESH HYPERLOCAL MARKET",
    description:
      raw.description ||
      "Farm-fresh vegetables, organic produce & daily household staples delivered to your doorstep.",
    image: imageUrl,
    imageUrl: imageUrl,
    badgeText: raw.badgeText || raw.badge_text || "100% Quality Guaranteed",
    ctaText: raw.ctaText || raw.cta_text || "Shop Now",
    linkType: raw.linkType || raw.link_type || null,
    targetId: raw.targetId || raw.target_id || null,
    categorySlug: raw.categorySlug || raw.category_slug || "vegetables",
  };
}

export const bannerService = {
  getBanners: async (limit: number = 10): Promise<Banner[]> => {
    try {
      const response = await apiClient.get(BANNER_ENDPOINTS.GET_BANNERS, {
        params: { limit },
      });

      const rawBanners =
        response.data?.data?.banners ||
        response.data?.banners ||
        (Array.isArray(response.data?.data) ? response.data.data : null) ||
        (Array.isArray(response.data) ? response.data : []);

      if (Array.isArray(rawBanners)) {
        return rawBanners.map((b, idx) => mapApiBannerToBanner(b, idx));
      }
    } catch (error) {
      console.warn("Failed to fetch banners from API:", error);
    }
    return [];
  },

  recordBannerEvents: async (
    sessionKey: string,
    events: Array<{ bannerId: string; eventType: "impression" | "click" }>,
  ): Promise<boolean> => {
    try {
      await apiClient.post(BANNER_ENDPOINTS.RECORD_EVENTS, {
        sessionKey,
        events,
      });
      return true;
    } catch (error) {
      console.warn("Failed to record banner event:", error);
      return false;
    }
  },
};
