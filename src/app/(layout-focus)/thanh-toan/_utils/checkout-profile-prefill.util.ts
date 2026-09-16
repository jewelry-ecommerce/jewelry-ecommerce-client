import type { AuthUser } from "@/utils/api/auth/auth.interface";
import { normalizePhoneDigits, validatePhoneBrd } from "@/utils/auth/validate-phone-brd";

export function getCheckoutProfileDisplayName(user: AuthUser): string {
  return `${user.firstName?.trim() ?? ""}`.trim();
}

export function getCheckoutProfilePhone(user: AuthUser): string {
  const raw = user.phone?.trim() ?? "";
  if (!raw) return "";

  const validated = validatePhoneBrd(raw);
  if (validated.ok) return validated.normalized;

  const digits = normalizePhoneDigits(raw);
  if (digits.startsWith("0") && digits.length >= 10) return digits.slice(0, 10);
  if (digits.length === 9) return `0${digits}`;
  return digits.slice(0, 10);
}

export function getCheckoutProfilePrefill(user: AuthUser | null | undefined): {
  firstName: string;
  receiverPhone: string;
} {
  if (!user) {
    return { firstName: "", receiverPhone: "" };
  }

  return {
    firstName: getCheckoutProfileDisplayName(user),
    receiverPhone: getCheckoutProfilePhone(user),
  };
}
