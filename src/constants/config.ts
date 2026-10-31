/**
 * Application-wide configuration constants.
 * Reads environment variables configured in .env / .env.local without hardcoding backend endpoints.
 */

const getNormalizedApiUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
  const trimmed = envUrl.replace(/\/+$/, "");
  if (!trimmed) return "";
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
};

export const API_BASE_URL = getNormalizedApiUrl();

export const getApiOrigin = (): string => {
  if (!API_BASE_URL) return "";
  try {
    const parsed = new URL(API_BASE_URL);
    return parsed.origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
  }
};
