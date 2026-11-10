import { apiClient } from "@/utils/apiClient";
import { BANNER_ENDPOINTS } from "../endpoints/banner.endpoint";
import { Banner } from "@/interfaces/banner.interface";
import { formatImageUrl } from "@/utils/formatImageUrl";

/** The admin's own words, or nothing: a blank field stays blank. */
const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/**
 * A banner exactly as the admin made it.
 *
 * Banner artwork usually carries its own words, so the admin leaves title,
 * subtitle and description empty. Filling those blanks with stock copy here
 * ("SRIBEES Special Offers", "FRESH HYPERLOCAL MARKET", ...) laid placeholder
 * text and a dark shade over the real artwork; the app never did. Blank now
 * means blank, as in the app.
 */
export function mapApiBannerToBanner(
  raw: Record<string, unknown>,
  index: number = 0,
): Banner {
  const imageUrl = formatImageUrl(
    text(raw.imageUrl) || text(raw.image_url) || text(raw.image),
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1400"
  );
  const bannerId = text(raw.bannerId) || text(raw.banner_id) || text(raw.id);

  return {
    id: bannerId || `banner-${index}`,
    bannerId: bannerId || undefined,
    title: text(raw.title),
    subtitle: text(raw.subtitle),
    description: text(raw.description),
    image: imageUrl,
    imageUrl: imageUrl,
    badgeText: text(raw.badgeText ?? raw.badge_text),
    ctaText: text(raw.ctaText ?? raw.cta_text),
    linkType: text(raw.linkType) || text(raw.link_type) || null,
    targetId: text(raw.targetId) || text(raw.target_id) || null,
    // No invented category: a category banner without one opens Categories.
    categorySlug: text(raw.categorySlug ?? raw.category_slug) || undefined,
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
