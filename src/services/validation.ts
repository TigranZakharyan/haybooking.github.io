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
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidPasswordMatch(
  newPassword: string,
  confirmPassword: string
): boolean {
  if (!confirmPassword) return true;
  return newPassword === confirmPassword;
}

export function isValidPasswordLength(password: string) {
  return password.length >= 8
}
