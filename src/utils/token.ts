/**
 * Utility functions for client-side JWT token inspection and validation.
 */

export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

/**
 * Decodes the payload portion of a JWT without requiring external libraries.
 */
export function parseJwtPayload(token?: string | null): JwtPayload | null {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    let jsonStr: string;
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      jsonStr = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } else if (typeof Buffer !== "undefined") {
      jsonStr = Buffer.from(base64, "base64").toString("utf8");
    } else {
      return null;
    }

    return JSON.parse(jsonStr) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Checks whether a given JWT token has passed its expiration (`exp`).
 * Returns true if the token is present, is a valid JWT, and has expired.
 * Adds a small buffer (5s) to mitigate clock skew and network latency.
 */
export function isJwtExpired(token?: string | null, bufferSeconds = 5): boolean {
  if (!token || typeof token !== "string") return false;

  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    // If not a parseable JWT or has no exp, do not assume expired
    return false;
  }

  const expirationMs = payload.exp * 1000 - bufferSeconds * 1000;
  return Date.now() >= expirationMs;
}
