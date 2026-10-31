/**
 * Utility functions for formatting and validating Sri Lankan mobile numbers.
 */

/**
 * Sanitizes and formats user input while typing a mobile number.
 * - Strips non-numeric characters.
 * - Allows max 10 digits if input starts with '0' (e.g. "0771234567").
 * - Allows max 9 digits if input does not start with '0' (e.g. "771234567").
 */
export const formatMobileInput = (value: string): string => {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return digits.slice(0, 10);
  }

  return digits.slice(0, 9);
};

/**
 * Prepares and cleans a mobile number for backend submission / OTP dispatch.
 * Removes leading '0' so it returns a clean 9-digit number (e.g. "771234567").
 */
export const getCleanMobileNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return digits.slice(1, 10);
  }
  return digits.slice(0, 9);
};

/**
 * Validates if the entered mobile number is complete and valid.
 * - Starts with '0' and has exactly 10 digits.
 * - Does not start with '0' and has exactly 9 digits.
 */
export const isValidMobileNumber = (value: string): boolean => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return digits.length === 10;
  }
  return digits.length === 9;
};

/**
 * Formats a clean 9-digit or 10-digit number for display (e.g. "77 123 4567" or "077 123 4567").
 */
export const formatMobileDisplay = (value: string): string => {
  const cleaned = getCleanMobileNumber(value);
  if (cleaned.length !== 9) return value;
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
};

export type SriLankanOperator = "Mobitel" | "Dialog" | "Hutch" | "Airtel";

/**
 * Detects the Sri Lankan telecom operator from a phone number.
 * Operator Prefixes:
 * - Mobitel: 070, 071
 * - Dialog: 077, 074, 076
 * - Hutch: 078, 072
 * - Airtel: 075
 */
export const getSriLankanOperator = (value: string): SriLankanOperator | null => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;

  let local = digits;
  if (local.startsWith("94")) {
    local = local.slice(2);
  }
  if (local.startsWith("0")) {
    local = local.slice(1);
  }

  const prefix = local.slice(0, 2);

  // Mobitel: 070, 071
  if (prefix === "70" || prefix === "71") {
    return "Mobitel";
  }

  // Dialog: 077, 074, 076
  if (prefix === "77" || prefix === "74" || prefix === "76") {
    return "Dialog";
  }

  // Hutch: 078, 072
  if (prefix === "78" || prefix === "72") {
    return "Hutch";
  }

  // Airtel: 075
  if (prefix === "75") {
    return "Airtel";
  }

  return null;
};

/**
 * Detects if a phone number string is an empty, invalid, or dummy placeholder
 * such as "0770000000", "+94770000000", "0771234567", etc.
 */
export const isDummyPhone = (value?: string | null): boolean => {
  if (!value) return true;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 9) return true;
  if (/^0+$/.test(digits)) return true;
  if (digits.endsWith("0000000")) return true;
  if (digits.endsWith("1234567")) return true;
  if (digits === "94770000000" || digits === "0770000000") return true;
  return false;
};

