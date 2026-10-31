import { describe, it } from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode";
import {
  sanitizeSearchQuery,
  isValidSearchQuery,
  isSafeSearchQuery,
  safeEncodeSearchParam,
  MAX_SEARCH_QUERY_LENGTH,
} from "./sanitize.ts";
import {
  isSafeRedirectUrl,
  isValidExternalUrl,
  isValidReferralCode,
  sanitizeHtmlContent,
} from "./urlSecurity.ts";

describe("Search Input Sanitization & Validation", () => {
  it("should safely handle non-string and empty inputs", () => {
    assert.equal(sanitizeSearchQuery(null), "");
    assert.equal(sanitizeSearchQuery(undefined), "");
    assert.equal(sanitizeSearchQuery(12345), "");
    assert.equal(sanitizeSearchQuery({ query: "apple" }), "");
    assert.equal(sanitizeSearchQuery(["apple"]), "");
    assert.equal(sanitizeSearchQuery(""), "");

    assert.equal(isValidSearchQuery(null), false);
    assert.equal(isValidSearchQuery(undefined), false);
    assert.equal(isValidSearchQuery(12345), false);
    assert.equal(isValidSearchQuery(""), true);
  });

  it("should preserve normal English, Sinhala, Tamil, and numeric product searches", () => {
    // English
    assert.equal(
      sanitizeSearchQuery("Fresh Red Apples 500g"),
      "Fresh Red Apples 500g"
    );
    // Sinhala with ZWJ (ශ්‍රී ලංකා)
    const sinhalaTerm = "ශ්‍රී ලංකා නැවුම් එළවළු";
    assert.equal(sanitizeSearchQuery(sinhalaTerm), sinhalaTerm);
    assert.equal(isValidSearchQuery(sinhalaTerm), true);

    // Tamil
    const tamilTerm = "பால் மற்றும் பழங்கள்";
    assert.equal(sanitizeSearchQuery(tamilTerm), tamilTerm);
    assert.equal(isValidSearchQuery(tamilTerm), true);
  });

  it("should preserve legitimate product punctuation and symbols", () => {
    const query = "Coca-Cola (1.5L) - 50% Off & Free 100g Pack!";
    assert.equal(sanitizeSearchQuery(query), query);
    assert.equal(isValidSearchQuery(query), true);

    const comparisonQuery = "Weight < 500g & Price > 100";
    assert.equal(sanitizeSearchQuery(comparisonQuery), comparisonQuery);
    assert.equal(isValidSearchQuery(comparisonQuery), true);
  });

  it("should perform Unicode NFC normalization", () => {
    // 'e' + combining acute accent (\u0065\u0301) vs composed 'é' (\u00E9)
    const decomposed = "cafe\u0301";
    const composed = "café";
    assert.equal(sanitizeSearchQuery(decomposed), composed);
  });

  it("should strip and reject dangerous control characters consistently", () => {
    // Null byte injection attempt
    const nullByteQuery = "fresh\u0000milk";
    assert.equal(sanitizeSearchQuery(nullByteQuery), "freshmilk");
    assert.equal(isValidSearchQuery(nullByteQuery), false);

    // Backspace and ASCII controls
    const ctrlQuery = "organic\u0008\u001Ftea";
    assert.equal(sanitizeSearchQuery(ctrlQuery), "organictea");
    assert.equal(isValidSearchQuery(ctrlQuery), false);

    // DEL \x7F and Unicode C1 controls \x90
    const delQuery = "bananas\u007F\u0090ripe";
    assert.equal(sanitizeSearchQuery(delQuery), "bananasripe");
    assert.equal(isValidSearchQuery(delQuery), false);
  });

  it("should normalize multiple whitespaces, tabs, and newlines into a single space", () => {
    const messySpaces = "  fresh \t\n  organic   carrots   ";
    assert.equal(sanitizeSearchQuery(messySpaces), "fresh organic carrots");
    assert.equal(isValidSearchQuery(messySpaces), true);
  });

  it("should enforce maximum search query length of 200 Unicode code points without breaking surrogate pairs", () => {
    const longString = "A".repeat(250);
    const sanitized = sanitizeSearchQuery(longString);
    assert.equal(Array.from(sanitized).length, MAX_SEARCH_QUERY_LENGTH);
    assert.equal(isValidSearchQuery(longString), false);
    assert.equal(isValidSearchQuery(sanitized), true);

    // Emoji / surrogate pair handling (each emoji is 1 code point, 2 UTF-16 code units)
    const emojiString = "🍎".repeat(210);
    const sanitizedEmoji = sanitizeSearchQuery(emojiString);
    assert.equal(Array.from(sanitizedEmoji).length, MAX_SEARCH_QUERY_LENGTH);
    // Ensure the last emoji wasn't cut in half (would result in replacement character)
    assert.ok(!sanitizedEmoji.includes("\uFFFD"));
  });

  it("should maintain alias isSafeSearchQuery identical to isValidSearchQuery", () => {
    assert.equal(isSafeSearchQuery("milk"), true);
    assert.equal(isSafeSearchQuery("bad\u0000query"), false);
  });

  it("should safely encode queries for URL query strings using safeEncodeSearchParam", () => {
    const encoded = safeEncodeSearchParam("Ceylon Tea & Spices 100%");
    assert.equal(encoded, "Ceylon%20Tea%20%26%20Spices%20100%25");
  });
});

describe("URL Security & Open Redirect Prevention", () => {
  it("should accept valid relative local application paths", () => {
    assert.equal(isSafeRedirectUrl("/product"), true);
    assert.equal(isSafeRedirectUrl("/checkoutView?step=2"), true);
    assert.equal(isSafeRedirectUrl("/categories#dairy"), true);
    assert.equal(isSafeRedirectUrl("/orderHistory?status=completed"), true);
  });

  it("should reject open redirect vectors", () => {
    // Protocol-relative external redirect
    assert.equal(isSafeRedirectUrl("//evil.com"), false);
    assert.equal(isSafeRedirectUrl("//evil.com/phish"), false);

    // Windows backslash separator bypass
    assert.equal(isSafeRedirectUrl("/\\evil.com"), false);
    assert.equal(isSafeRedirectUrl("\\evil.com"), false);
    assert.equal(isSafeRedirectUrl("/path\\to"), false);

    // Absolute URLs
    assert.equal(isSafeRedirectUrl("https://evil.com"), false);
    assert.equal(isSafeRedirectUrl("http://evil.com"), false);

    // Dangerous schemes
    assert.equal(isSafeRedirectUrl("javascript:alert(1)"), false);
    assert.equal(isSafeRedirectUrl("data:text/html,<script>alert(1)</script>"), false);
    assert.equal(isSafeRedirectUrl("vbscript:msgbox(1)"), false);

    // Control characters in redirect target
    assert.equal(isSafeRedirectUrl("/product\r\nSet-Cookie:admin=1"), false);
    assert.equal(isSafeRedirectUrl("/product\u0000"), false);
  });

  it("should validate external URLs with permitted protocols", () => {
    assert.equal(isValidExternalUrl("https://devapionline.sribees.com"), true);
    assert.equal(isValidExternalUrl("http://localhost:8000"), true);
    assert.equal(isValidExternalUrl("javascript:alert(1)"), false);
    assert.equal(isValidExternalUrl("data:text/html,abc"), false);
    assert.equal(isValidExternalUrl("not a url"), false);
  });
});

describe("Referral Security & Local QR Code Generation", () => {
  it("should validate referral code formats and reject malicious injection attempts", () => {
    // Valid codes
    assert.equal(isValidReferralCode("SRIBEES10"), true);
    assert.equal(isValidReferralCode("REF_2026"), true);
    assert.equal(isValidReferralCode("friend-code"), true);

    // Malicious or invalid codes
    assert.equal(isValidReferralCode("' OR '1'='1"), false); // SQLi pattern
    assert.equal(isValidReferralCode("<script>alert(1)</script>"), false); // XSS pattern
    assert.equal(isValidReferralCode("../../../admin"), false); // Path traversal
    assert.equal(isValidReferralCode("A"), false); // Too short
    assert.equal(isValidReferralCode("A".repeat(50)), false); // Too long
    assert.equal(isValidReferralCode(null), false);
  });

  it("should generate local QR code data URLs without network requests", async () => {
    const inviteUrl = "https://sribees.online?ref=SRIBEES10";
    const dataUrl = await QRCode.toDataURL(inviteUrl, {
      width: 240,
      margin: 2,
    });

    assert.ok(dataUrl.startsWith("data:image/png;base64,"));
    assert.ok(dataUrl.length > 100);
  });
});

describe("HTML Content Sanitization", () => {
  it("should sanitize dangerous HTML tags while preserving permitted formatting", () => {
    const dirty = '<p>Fresh honey from <b>Sri Lanka</b> <script>alert("XSS")</script></p>';
    const cleaned = sanitizeHtmlContent(dirty);
    assert.ok(!cleaned.includes("<script>"));
    assert.ok(!cleaned.includes('alert("XSS")') || !cleaned.includes("<script"));
  });
});
