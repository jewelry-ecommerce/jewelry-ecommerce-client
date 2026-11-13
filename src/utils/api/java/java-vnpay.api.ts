import { commonAxios } from "@/utils/axios";

export const VNPAY_CHECKOUT = {
  startPath: "/thanh-toan-vnpay",
  demoPath: "/thanh-toan-vnpay/demo",
  payHost: "sandbox.vnpayment.vn",
  payPath: "/paymentv2/vpcpay.html",
} as const;

export interface VnpayLink {
  orderCode: string;
  payUrl: string;
  redirect: boolean;
}

export interface VnpayReturn {
  orderCode: string;
  success: boolean;
  responseCode?: string;
  message?: string;
  redirect?: string;
}

export interface VnpayDemoConfirm {
  orderCode: string;
  txnRef: string;
  amount: number;
  success: boolean;
  sig: string;
}

export function javaPaymentMethod(method?: string | null): "COD" | "VNPAY" {
  if (!method || method === "COD") return "COD";
  if (method === "VNPAY") return "VNPAY";
  throw new Error("Chỉ hỗ trợ COD hoặc VNPay Sandbox.");
}

export function vnpayStartUrl(orderCode: string): string {
  const query = new URLSearchParams({ orderCode, start: "1" });
  return `${VNPAY_CHECKOUT.startPath}?${query.toString()}`;
}

export function isSandboxPayUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === VNPAY_CHECKOUT.payHost
      && url.pathname === VNPAY_CHECKOUT.payPath && !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}

export function isDemoPayUrl(value: string): boolean {
  try {
    const base = clientOrigin();
    const url = new URL(value, base);
    if (!demoPath(url) || url.hostname === VNPAY_CHECKOUT.payHost) return false;
    if (value.startsWith("/") && !value.startsWith("//")) return true;
    return clientAbsolute(url, base);
  } catch {
    return false;
  }
}

export function isAllowedPayUrl(value: string): boolean {
  return isSandboxPayUrl(value) || isDemoPayUrl(value);
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

export async function javaVnpayStart(orderCode: string, phone?: string): Promise<VnpayLink> {
  const result = (await commonAxios.post<VnpayLink>("storefront/payment/vnpay/start", {
    orderCode, phone: phone || undefined,
  })).data;
  if (result.orderCode !== orderCode || !result.redirect || !isAllowedPayUrl(result.payUrl)) {
    throw new Error("Đường dẫn thanh toán VNPay không hợp lệ.");
  }
  return result;
}

export async function javaVnpayDemoConfirm(body: VnpayDemoConfirm): Promise<VnpayReturn> {
  const result = (await commonAxios.post<VnpayReturn>("storefront/payment/vnpay/demo/confirm", body)).data;
  if (!result || result.orderCode !== body.orderCode || typeof result.success !== "boolean") {
    throw new Error("Không xác nhận được thanh toán thử.");
  }
  return result;
}

function clientOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "http://localhost:3100";
}

function demoPath(url: URL): boolean {
  return url.pathname === VNPAY_CHECKOUT.demoPath && !url.username && !url.password;
}

function clientAbsolute(url: URL, base: string): boolean {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.origin === new URL(base).origin) return true;
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

export async function javaVnpayReturn(params: URLSearchParams): Promise<VnpayReturn> {
  const query: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith("vnp_")) query[key] = value;
  });
  const result = (await commonAxios.get<VnpayReturn>("storefront/payment/vnpay/return", { params: query })).data;
  if (!result || typeof result.orderCode !== "string" || typeof result.success !== "boolean") {
    throw new Error("Không đối soát được kết quả VNPay.");
  }
  return result;
}
