export function formatPhone(input: string): string {
  if (!input) return "";
  let cleaned = input.replace(/[^\d+]/g, "");
  cleaned = cleaned.replace(/\+/g, "");

  return "+" + cleaned;
}


export function isValidPhone(phone: string, minLength = 8, maxLength = 15): boolean {
  const cleaned = formatPhone(phone);
  return cleaned.length >= minLength && cleaned.length <= maxLength;
}

export function isValidEmail(email: string): boolean {
  // Simple regex for email validation
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
