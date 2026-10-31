/**
 * Resolves and formats image URLs from backend services.
 * Backend endpoints (e.g. GET /categories?hierarchical=true) may return relative paths like `/uploads/...`.
 * This utility prefixes relative paths with the API origin and provides a reliable fallback.
 */

import { getApiOrigin } from "@/constants/config";

export const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400";

export { getApiOrigin };

export const formatImageUrl = (
  url?: string | null,
  fallback: string = DEFAULT_FALLBACK_IMAGE,
): string => {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  // Absolute or data/blob URI
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Protocol-relative URI
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  const origin = getApiOrigin();
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return origin ? `${origin}${cleanPath}` : cleanPath;
};
