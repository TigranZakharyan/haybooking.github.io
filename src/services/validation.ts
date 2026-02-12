export function formatPhone(input: string): string {
  return input.replace(/\D/g, "");
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
