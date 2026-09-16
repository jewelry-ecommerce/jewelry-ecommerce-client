import { OrderSource, OrderStatus, PaymentStatus, ShippingMethod } from "@/utils/api/order/order.enum";
import type { OrderDetailResponse, OrderShippingAddressSnapshot } from "@/utils/api/order/order.interface";
import { buildGuestAccessHref } from "@/utils/order/guest-order-access.util";
import type { PreOrderDetailResponse } from "./pre-order-detail.interface";

/** Chi tiết đơn đặt trước không mang mã đơn trên URL — mã/token truyền qua sessionStorage hoặc `#access=`. */
export const PRE_ORDER_DETAIL_ROUTE = "/don-hang/dat-truoc";

/** Thanh toán lần 2 (độc lập `/thanh-toan`) — data đẩy qua sessionStorage, không gọi checkout/initiate. */
export const PRE_ORDER_PAYMENT_ROUTE = "/thanh-toan-dat-truoc";

const PRE_ORDER_DETAIL_STORAGE_KEY = "pre_order_detail:v1";
const PRE_ORDER_ACCESS_TOKEN_STORAGE_KEY = "pre_order_access_token:v1";
const PRE_ORDER_PAYMENT_STORAGE_KEY = "pre_order_payment:v1";

const EMPTY_SHIPPING_ADDRESS: OrderShippingAddressSnapshot = {
  firstName: "",
  lastName: "",
  receiverPhone: "",
  addressLine: "",
  wardCode: null,
  wardName: "",
  provinceCode: null,
  provinceName: "",
};

/** Deep-link guest/ZNS: `/don-hang/dat-truoc#access=<token>`. */
export function buildPreOrderGuestAccessHref(token: string): string {
  return buildGuestAccessHref(PRE_ORDER_DETAIL_ROUTE, token);
}

export function savePreOrderDetailOrderCode(orderCode: string): void {
  if (typeof window === "undefined") return;
  const normalized = orderCode?.trim();
  if (!normalized) return;
  try {
    window.sessionStorage.setItem(PRE_ORDER_DETAIL_STORAGE_KEY, normalized);
  } catch {
    // sessionStorage có thể bị chặn (private mode / quota) — bỏ qua.
  }
}

/**
 * Mở chi tiết pre-order theo mã (member / lịch sử đơn).
 * Xóa token `gpa_*` cũ để trang không ưu tiên `POST .../access` thay vì `GET .../client/:orderCode`.
 */
export function preparePreOrderMemberDetailNavigation(orderCode: string): void {
  savePreOrderDetailOrderCode(orderCode);
  clearPreOrderAccessToken();
}

export function readPreOrderDetailOrderCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(PRE_ORDER_DETAIL_STORAGE_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function clearPreOrderDetailOrderCode(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PRE_ORDER_DETAIL_STORAGE_KEY);
  } catch {
    // Bỏ qua như trên.
  }
}

/** Lưu token `#access=` để reload `/don-hang/dat-truoc` vẫn gọi `pre-orders/access`. */
export function savePreOrderAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  const normalized = token?.trim();
  if (!normalized) return;
  try {
    window.sessionStorage.setItem(PRE_ORDER_ACCESS_TOKEN_STORAGE_KEY, normalized);
  } catch {
    // sessionStorage có thể bị chặn — bỏ qua.
  }
}

export function readPreOrderAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(PRE_ORDER_ACCESS_TOKEN_STORAGE_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function clearPreOrderAccessToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PRE_ORDER_ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Bỏ qua như trên.
  }
}

/**
 * Token guest pre-order cho API `.../pre-orders/client/*`.
 * Ưu tiên storage riêng; fallback `latest_order.guestOrderAccessToken` khi prefix `gpa_`.
 */
export function isPreOrderAccessToken(token?: string | null): boolean {
  return Boolean(token?.trim().toLowerCase().startsWith("gpa_"));
}

export function resolveStoredPreOrderAccessToken(): string | null {
  const dedicated = readPreOrderAccessToken();
  if (dedicated) return dedicated;

  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("latest_order");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { guestOrderAccessToken?: unknown };
    const token = typeof parsed.guestOrderAccessToken === "string" ? parsed.guestOrderAccessToken.trim() : "";
    return isPreOrderAccessToken(token) ? token : null;
  } catch {
    return null;
  }
}

/** Header `x-pre-order-access-token` khi guest thanh toán / sửa đơn đặt trước lần 2. */
export function buildPreOrderAccessRequestConfig(): { headers: { "x-pre-order-access-token": string } } | undefined {
  const token = resolveStoredPreOrderAccessToken();
  if (!token) return undefined;
  return { headers: { "x-pre-order-access-token": token } };
}

/** Lưu toàn bộ chi tiết PO để trang thanh toán lần 2 hydrate UI (không cần initiate). */
export function savePreOrderPaymentDetail(order: PreOrderDetailResponse): void {
  if (typeof window === "undefined") return;
  const orderCode = order?.orderCode?.trim();
  if (!orderCode) return;
  try {
    window.sessionStorage.setItem(PRE_ORDER_PAYMENT_STORAGE_KEY, JSON.stringify({ ...order, orderCode }));
  } catch {
    // sessionStorage có thể bị chặn — bỏ qua.
  }
}

export function readPreOrderPaymentDetail(): PreOrderDetailResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PRE_ORDER_PAYMENT_STORAGE_KEY);
    if (!raw?.trim()) return null;
    const parsed = JSON.parse(raw) as PreOrderDetailResponse;
    if (!parsed?.orderCode?.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPreOrderPaymentDetail(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PRE_ORDER_PAYMENT_STORAGE_KEY);
  } catch {
    // Bỏ qua như trên.
  }
}

/** Fill các field order detail mà API pre-order không trả, để tái dùng `OrderDetailView`. */
export function preOrderDetailToViewOrder(order: PreOrderDetailResponse): OrderDetailResponse {
  return {
    ...order,
    id: order.id ?? "",
    customerId: order.customerId ?? "",
    createdAt: order.createdAt ?? "",
    contactEmail: order.contactEmail ?? null,
    status: order.status ?? OrderStatus.PENDING,
    paymentStatus: order.paymentStatus ?? PaymentStatus.UNPAID,
    paymentMethod: order.paymentMethod as OrderDetailResponse["paymentMethod"],
    source: order.source ?? OrderSource.WEBSITE,
    shippingMethod: order.shippingMethod ?? ShippingMethod.STANDARD,
    shippingAddressSnapshot: order.shippingAddressSnapshot ?? EMPTY_SHIPPING_ADDRESS,
    shippingFee: order.shippingFee ?? "0",
    subtotal: order.subtotal ?? "0",
    discountTotal: order.discountTotal ?? "0",
    taxTotal: order.taxTotal ?? "0",
    grandTotal: order.grandTotal ?? "0",
    note: order.note ?? "",
    notePayment: order.notePayment ?? null,
    errorLog: order.errorLog ?? null,
    items: order.items ?? [],
    statusHistory: order.statusHistory ?? [],
    // Đơn từ endpoint pre-order luôn là pre-order, kể cả khi BE không trả field này.
    fulfillmentType: order.fulfillmentType === "RETAIL" ? "RETAIL" : "PRE_ORDER",
    // Đảm bảo identity PO cho `isPreOrderOrder` khi BE chỉ trả orderCode (kể cả mã retail-looking).
    preOrderCode: order.preOrderCode?.trim() || order.orderCode?.trim() || null,
  };
}
