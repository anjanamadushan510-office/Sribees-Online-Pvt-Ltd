/**
 * Utility for extracting user avatar initials.
 * Examples:
 * - "Nipu" -> "NI"
 * - "Nipu Shan" -> "NS"
 * - "Kasun Perera" -> "KP"
 * - "Valued Customer" -> "CU"
 * - "Customer (0771234567)" -> "CU"
 */
export function getAvatarInitials(name?: string | null): string {
  if (!name || !name.trim()) return "CU";
  const trimmed = name.trim();

  // Handle generic placeholder names
  if (/^(customer\s*\(|valued customer|customer$|account$)/i.test(trimmed)) {
    return "CU";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CU";

  if (parts.length === 1) {
    return parts[0].length >= 2
      ? parts[0].slice(0, 2).toUpperCase()
      : parts[0].toUpperCase();
  }

  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase() || "CU";
}
