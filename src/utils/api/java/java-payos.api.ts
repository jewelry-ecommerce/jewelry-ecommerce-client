import { commonAxios } from "@/utils/axios";

export const PAYOS_CHECKOUT = {
  startPath: "/thanh-toan-payos",
  hosts: ["pay.payos.vn"],
} as const;

export interface PayosLink {
  orderCode: string;
  payUrl: string;
  redirect: boolean;
}

export function javaPaymentMethod(method?: string | null): "COD" | "PAYOS" {
  if (!method || method === "COD") return "COD";
  if (method === "PAYOS") return "PAYOS";
  throw new Error("Chỉ hỗ trợ COD hoặc PayOS.");
}

export function payosStartUrl(orderCode: string): string {
  const query = new URLSearchParams({ orderCode, start: "1" });
  return `${PAYOS_CHECKOUT.startPath}?${query.toString()}`;
}

export function isPayosPayUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      && PAYOS_CHECKOUT.hosts.includes(url.hostname as (typeof PAYOS_CHECKOUT.hosts)[number]);
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

export async function javaPayosStart(orderCode: string, phone?: string): Promise<PayosLink> {
  const result = (await commonAxios.post<PayosLink>("storefront/payment/payos/start", {
    orderCode, phone: phone || undefined,
  })).data;
  if (result.orderCode !== orderCode || !result.redirect || !isPayosPayUrl(result.payUrl)) {
    throw new Error("Đường dẫn thanh toán PayOS không hợp lệ.");
  }
  return result;
}
