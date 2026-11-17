import { commonAxios } from "@/utils/axios";

export const MOMO_CHECKOUT = {
  startPath: "/thanh-toan-momo",
  hosts: ["test-payment.momo.vn", "payment.momo.vn"],
} as const;

export interface MomoLink {
  orderCode: string;
  payUrl: string;
  redirect: boolean;
}

export function javaPaymentMethod(method?: string | null): "COD" | "MOMO" {
  if (!method || method === "COD") return "COD";
  if (method === "MOMO") return "MOMO";
  throw new Error("Chỉ hỗ trợ COD hoặc ví MoMo.");
}

export function momoStartUrl(orderCode: string): string {
  const query = new URLSearchParams({ orderCode, start: "1" });
  return `${MOMO_CHECKOUT.startPath}?${query.toString()}`;
}

export function isMomoPayUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      && MOMO_CHECKOUT.hosts.includes(url.hostname as (typeof MOMO_CHECKOUT.hosts)[number]);
  } catch {
    return false;
  }
}

export function latestOrderPhone(orderCode: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value: unknown = JSON.parse(window.sessionStorage.getItem("latest_order") ?? "null");
    if (!value || typeof value !== "object" || !("orderCode" in value) || value.orderCode !== orderCode) return undefined;
    return "phone" in value && typeof value.phone === "string" ? value.phone : undefined;
  } catch {
    return undefined;
  }
}

export async function javaMomoStart(orderCode: string, phone?: string): Promise<MomoLink> {
  const result = (await commonAxios.post<MomoLink>("storefront/payment/momo/start", {
    orderCode, phone: phone || undefined,
  })).data;
  if (result.orderCode !== orderCode || !result.redirect || !isMomoPayUrl(result.payUrl)) {
    throw new Error("Đường dẫn thanh toán MoMo không hợp lệ.");
  }
  return result;
}
