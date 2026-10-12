import type { JavaDraft } from "./java-commerce.types";
import { JAVA_CHECKOUT_POLICY } from "./java-commerce.types";

function isDraft(value: unknown): value is JavaDraft {
  if (!value || typeof value !== "object" || !("session" in value) || !("items" in value) || !("expiresAt" in value)) return false;
  if (!value.session || typeof value.session !== "object" || !("checkoutSessionId" in value.session)
    || typeof value.session.checkoutSessionId !== "string" || !Array.isArray(value.items) || typeof value.expiresAt !== "number") return false;
  const lines: unknown[] = value.items;
  return lines.every(line => line !== null && typeof line === "object" && "skuId" in line && "quantity" in line
    && typeof line.skuId === "number" && Number.isSafeInteger(line.skuId) && line.skuId > 0
    && typeof line.quantity === "number" && Number.isSafeInteger(line.quantity) && line.quantity > 0);
}
export function saveJavaDraft(draft: JavaDraft): void {
  window.sessionStorage.setItem(JAVA_CHECKOUT_POLICY.storagePrefix + draft.session.checkoutSessionId, JSON.stringify(draft));
}
export function readJavaDraft(id: string): JavaDraft {
  const raw = window.sessionStorage.getItem(JAVA_CHECKOUT_POLICY.storagePrefix + id);
  const value: unknown = raw ? JSON.parse(raw) : null;
  if (!isDraft(value) || value.expiresAt <= Date.now()) throw new Error("Phiên thanh toán đã hết hạn. Quay lại giỏ hàng để bắt đầu lại.");
  return value;
}
export async function currentJavaOwner(): Promise<string | null> {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (!response.ok) throw new Error("Không xác định được tài khoản thanh toán. Vui lòng thử lại.");
  const result: { success: boolean; user?: { id: number | string } | null } = await response.json();
  return result.success && result.user ? String(result.user.id) : null;
}
export async function ownedJavaDraft(id: string): Promise<JavaDraft> {
  const draft = readJavaDraft(id);
  if (draft.ownerId !== await currentJavaOwner()) throw new Error("Tài khoản đã thay đổi. Quay lại giỏ hàng để bắt đầu thanh toán lại.");
  return draft;
}
