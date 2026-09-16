import {
  hasLowercase,
  hasMinLength,
  hasNumber,
  hasSpecial,
  hasUppercase,
} from "@/components/password-requirement/password-requirement.component";

export type PasswordStrengthLevel = "weak" | "medium" | "strong";

const CONDITIONS_COUNT = 5;

/** BRD quên MK / đăng ký: 5 điều kiện — thiếu 3–4 → yếu, thiếu 1–2 → TB, đủ 5 → mạnh */
export function getPasswordStrengthLevel(password: string): PasswordStrengthLevel {
  const checks = [hasMinLength(password), hasLowercase(password), hasUppercase(password), hasNumber(password), hasSpecial(password)];
  const satisfied = checks.filter(Boolean).length;
  if (satisfied === CONDITIONS_COUNT) return "strong";
  if (satisfied >= 3) return "medium";
  return "weak";
}

export function isPasswordStrongBrd(password: string): boolean {
  return getPasswordStrengthLevel(password) === "strong";
}

export function passwordStrengthHint(password: string): string {
  const missing: string[] = [];
  if (!hasMinLength(password)) missing.push("ký tự");
  if (!hasLowercase(password)) missing.push("chữ viết thường");
  if (!hasUppercase(password)) missing.push("chữ viết hoa");
  if (!hasNumber(password)) missing.push("số");
  if (!hasSpecial(password)) missing.push("ký tự đặc biệt");
  if (missing.length === 0) return "";
  return `Cần thêm ${missing.join(", ")}.`;
}

export function passwordStrengthSatisfiedCount(password: string): number {
  return [hasMinLength(password), hasLowercase(password), hasUppercase(password), hasNumber(password), hasSpecial(password)].filter(Boolean)
    .length;
}
