export function formatPhone(input: string): string {
  if (!input) return "";
  let cleaned = input.replace(/[^\d+]/g, "");
  cleaned = cleaned.replace(/\+/g, "");

  return "+" + cleaned;
}

export function formatPrice(input: string | number): number {
  // Convert input to string
  let str = String(input);

  // Remove all non-digit characters except dot
  str = str.replace(/[^0-9.]/g, "");

  // Handle multiple dots (keep only the first one)
  const firstDotIndex = str.indexOf(".");
  if (firstDotIndex !== -1) {
    // Keep digits before dot + dot + digits after dot (remove other dots)
    const beforeDot = str.slice(0, firstDotIndex);
    const afterDot = str.slice(firstDotIndex + 1).replace(/\./g, "");
    str = beforeDot + "." + afterDot;
  }

  // Convert to number
  const num = parseFloat(str);

  // If NaN, return 0
  return isNaN(num) ? 0 : num;
}