/** The link types the admin's "What opens when a customer taps this?" offers. */
const DESTINATIONS = new Set(["quick_sale", "category", "product"]);

export interface HeroBannerLayout {
  /** Words the admin typed (title, subtitle or description). */
  showText: boolean;
  /** The dark shade only sits behind words; artwork stays clean. */
  showShade: boolean;
  /** The Shop Now button. */
  showButton: boolean;
}

export function bannerHasDestination(linkType?: string | null): boolean {
  return DESTINATIONS.has((linkType || "").toLowerCase().trim());
}

/**
 * What the hero banner draws over its picture.
 *
 * A banner with words keeps them, the shade and the button. An artwork-only
 * banner (words blank) stays clean, but still gets a Shop Now button when the
 * admin chose where it opens -- otherwise nothing tells a customer it leads
 * anywhere.
 */
export function heroBannerLayout(banner: {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  linkType?: string | null;
}): HeroBannerLayout {
  const showText = Boolean(banner.title || banner.subtitle || banner.description);
  return {
    showText,
    showShade: showText,
    showButton: showText || bannerHasDestination(banner.linkType),
  };
}
