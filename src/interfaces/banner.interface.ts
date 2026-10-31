export interface Banner {
  id: string;
  bannerId?: string;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  imageUrl?: string;
  badgeText?: string;
  ctaText?: string;
  linkType?: string | null;
  targetId?: string | null;
  categorySlug?: string;
}
