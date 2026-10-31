/**
 * Search and User Input Sanitization and Validation Utility
 * Follows OWASP recommendations and WEB_STOREFRONT_API specifications.
 */

// Max query length supported by WEB_STOREFRONT_API (200 Unicode code points)
export const MAX_SEARCH_QUERY_LENGTH = 200;

/**
 * Unwanted control characters regex:
 * - ASCII C0 control characters (0x00-0x1F) except tab (\t = 0x09), line feed (\n = 0x0A), carriage return (\r = 0x0D)
 *   which are safely collapsed to spaces in sanitizeSearchQuery.
 * - ASCII DEL (0x7F)
 * - Unicode C1 control characters (0x80-0x9F)
 *
 * NOTE: Zero-Width Joiner (\u200D) and Zero-Width Non-Joiner (\u200C) MUST be preserved
 * as they are critical for Sinhala conjunct characters (bandi akuru, e.g. "ශ්‍රී") and Tamil/Indic scripts.
 */
export const UNWANTED_CONTROL_CHARS_REGEX =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

/**
 * Sanitizes a search query string:
 * - Safely handles unknown inputs and non-string values.
 * - Normalizes Unicode text using NFC (Standard Unicode Normalization Form C).
 * - Preserves Sinhala, Tamil, English, product names, and legitimate punctuation.
 * - Removes unwanted control characters consistently (null bytes, backspaces, control codes).
 * - Converts newlines and tabs to spaces, collapsing consecutive spaces into one.
 * - Enforces a maximum search query length of 200 Unicode code points.
 * - Does NOT blindly delete words like "javascript:" or HTML characters like "<" from ordinary search terms,
 *   relying on parameterization / URL encoding / React output escaping instead.
 *
 * @param input Raw search input of any type
 * @returns Clean, NFC-normalized, safely bounded search query
 */
export function sanitizeSearchQuery(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  // 1. Unicode NFC Normalization
  let sanitized = input.normalize("NFC");

  // 2. Remove unwanted ASCII and Unicode control characters
  sanitized = sanitized.replace(UNWANTED_CONTROL_CHARS_REGEX, "");

  // 3. Collapse whitespace (newlines, tabs, multiple spaces) into a single space
  sanitized = sanitized.replace(/\s+/g, " ");

  // 4. Trim leading and trailing spaces
  sanitized = sanitized.trim();

  // 5. Enforce maximum Unicode code point length (handles surrogate pairs / emoji accurately)
  const codePoints = Array.from(sanitized);
  if (codePoints.length > MAX_SEARCH_QUERY_LENGTH) {
    sanitized = codePoints.slice(0, MAX_SEARCH_QUERY_LENGTH).join("").trim();
  }

  return sanitized;
}

/**
 * Validates whether the search query meets safety and length constraints.
 * Behavior is consistent with sanitizeSearchQuery:
 * - Must be a string
 * - Max 200 Unicode code points
 * - Must not contain unpermitted control characters or null bytes
 *
 * @param input Raw search input
 * @returns boolean indicating if the input is a valid search query
 */
export function isValidSearchQuery(input: unknown): boolean {
  if (typeof input !== "string") {
    return false;
  }

  // Reject unpermitted control characters
  if (UNWANTED_CONTROL_CHARS_REGEX.test(input)) {
    return false;
  }

  const normalized = input.normalize("NFC").trim();
  const codePoints = Array.from(normalized);

  return codePoints.length <= MAX_SEARCH_QUERY_LENGTH;
}

/**
 * Backward compatibility alias for isValidSearchQuery
 */
export const isSafeSearchQuery = isValidSearchQuery;

/**
 * Encodes a sanitized search query safely for inclusion in URL query strings.
 *
 * @param query Input search string or unknown
 * @returns URL-encoded sanitized query string
 */
export function safeEncodeSearchParam(query: unknown): string {
  const clean = sanitizeSearchQuery(query);
  return encodeURIComponent(clean);
}
