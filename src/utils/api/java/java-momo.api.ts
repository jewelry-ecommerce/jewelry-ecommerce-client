import { authAxios, commonAxios } from "@/utils/axios";
import { PaymentMethod } from "../order/order.enum";

export const MOMO_CHECKOUT = { statusPath: "/thanh-toan-momo", refreshMs: 3000, maxPolls: 20 } as const;
export interface MomoMethods {
  momoEnabled: boolean;
  sandbox: boolean;
}
interface MomoLink {
  orderCode: string;
  paymentUrl: string;
  sandbox: boolean;
}

export function javaPaymentMethod(method?: string | null): "COD" | "MOMO" {
  if (!method || method === PaymentMethod.COD) return "COD";
  if (method === PaymentMethod.MOMO_WALLET || method === "MOMO") return "MOMO";
  throw new Error("Chỉ hỗ trợ COD hoặc MoMo Sandbox.");
}
export async function javaPaymentMethods(): Promise<MomoMethods> {
  return (await commonAxios.get<MomoMethods>("storefront/payment/methods")).data;
}
export function momoStatusUrl(orderCode: string, start = false): string {
  const query = new URLSearchParams({ orderCode });
  if (start) query.set("start", "1");
  return `${MOMO_CHECKOUT.statusPath}?${query}`;
}
export function latestOrderPhone(orderCode: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = window.sessionStorage.getItem("latest_order");
  try {
    const value: unknown = raw ? JSON.parse(raw) : null;
    return value &&
      typeof value === "object" &&
      "orderCode" in value &&
      value.orderCode === orderCode &&
      "phone" in value &&
      typeof value.phone === "string"
      ? value.phone
      : undefined;
  } catch {
    return undefined;
  } // Malformed browser storage is not an order credential.
}
export async function javaMomoPayment(orderCode: string): Promise<MomoLink> {
  const result = (
    await authAxios.post<MomoLink>("storefront/payment/momo/start", {
      orderCode,
      phone: latestOrderPhone(orderCode),
    })
  ).data;
  const url = new URL(result.paymentUrl);
  if (
    result.orderCode !== orderCode ||
    !result.sandbox ||
    url.protocol !== "https:" ||
    url.hostname !== "test-payment.momo.vn" ||
    url.username ||
    url.password ||
    url.port
  )
    throw new Error("Đường dẫn MoMo Sandbox không hợp lệ.");
  return result;
}
