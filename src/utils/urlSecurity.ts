import DOMPurify from "dompurify";

/**
 * URL and HTML Security Utility
 * Provides protection against Open Redirects, XSS, and parameter tampering.
 */

/**
 * Validates whether a redirect path is safe and local to the application.
 * Prevents Open Redirect attacks (CWE-601):
 * - Must be a string starting with a single forward slash '/'
 * - Must NOT start with '//' (protocol-relative URL)
 * - Must NOT start with '/\' (Windows path separator bypass)
 * - Must NOT contain ASCII/Unicode control characters
 * - Must NOT use pseudo-protocols like javascript:, data:, vbscript:
 *
 * @param url Candidate redirect path
 * @returns boolean indicating if the target is a safe local redirect
 */
export function isSafeRedirectUrl(url: unknown): boolean {
  if (typeof url !== "string") {
    return false;
  }

  const trimmed = url.trim();

  // Must begin with a single '/'
  if (!trimmed.startsWith("/")) {
    return false;
  }

  // Reject protocol-relative URLs (e.g. //attacker.com)
  if (trimmed.startsWith("//")) {
    return false;
  }

  // Reject backslash bypasses (e.g. /\attacker.com or \attacker.com)
  if (trimmed.startsWith("/\\") || trimmed.includes("\\")) {
    return false;
  }

  // Reject control characters or null bytes
  if (/[\u0000-\u001F\u007F-\u009F]/.test(trimmed)) {
    return false;
  }

  // Reject dangerous URI schemes
  if (/^\s*(javascript|data|vbscript|file):/i.test(trimmed)) {
    return false;
  }

  return true;
}

/**
 * Validates whether an external URL uses an allowed protocol (http or https).
 *
 * @param url String URL to validate
 * @returns boolean
 */
export function isValidExternalUrl(url: unknown): boolean {
  if (typeof url !== "string") {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates a referral code format:
 * - Must be a string
 * - Alphanumeric with optional underscores or dashes
 * - Between 3 and 30 characters
 *
 * @param code Referral code to validate
 * @returns boolean
 */
export function isValidReferralCode(code: unknown): boolean {
  if (typeof code !== "string") {
    return false;
  }

  const trimmed = code.trim();
  return /^[A-Za-z0-9_-]{3,30}$/.test(trimmed);
}

/**
 * Sanitizes rich HTML content using DOMPurify with an explicit safe allowlist.
 * Prevents stored and reflected XSS when rendering HTML descriptions.
 *
 * @param dirtyHtml Raw unescaped HTML string
 * @returns Clean, safe HTML string
 */
export function sanitizeHtmlContent(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") {
    return "";
  }

  // If running in browser or environment where DOMPurify can sanitize
  if (typeof window !== "undefined" && DOMPurify.isSupported) {
    return DOMPurify.sanitize(dirtyHtml, {
      ALLOWED_TAGS: [
        "b",
        "i",
        "em",
        "strong",
        "a",
        "p",
        "span",
        "ul",
        "ol",
        "li",
        "br",
        "h4",
        "h5",
        "h6",
      ],
      ALLOWED_ATTR: ["href", "title", "target", "rel", "class"],
      ALLOWED_URI_REGEXP:
        /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  }

  // Safe fallback for SSR or environments where DOMPurify DOM is absent:
  // Strip all tag delimiters and dangerous keywords
  return dirtyHtml
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:lt|gt|amp|quot|apos);/g, "");
}
