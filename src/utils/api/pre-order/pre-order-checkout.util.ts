import type { CheckoutSession } from "@/utils/api/checkout/checkout.interface";
import { PRE_ORDER_DETAIL_ROUTE } from "@/utils/api/pre-order/pre-order-detail.util";

/**
 * Checkout lần 1 (AC1 — đặt trước): cart/PDP → POST /checkout/initiate.
 * Signal từ BE: checkoutType=PRE_ORDER và paymentRequired=false.
 *
 * Lần 2 (thanh toán khi có hàng): đẩy data → `/thanh-toan-dat-truoc` — không dùng helper này.
 */
export function isPreOrderReserveCheckout(session?: CheckoutSession | null): boolean {
  if (!session) return false;
  if (session.checkoutType !== "PRE_ORDER") return false;
  return session.paymentRequired === false;
}

/** Notice checkout lần 1 — `brandName` từ env `TENANT_BRAND_NAME`. */
export function buildPreOrderReservePaymentNotice(brandName?: string | null): string {
  const name = brandName?.trim() || "";
  return `Khi hàng sẵn sàng, ${name} sẽ thông báo qua số điện thoại bạn đã cung cấp để tiến hành thanh toán.`;
}

/**
 * URL chi tiết PO gửi kèm place-order lần 1 (`POST order/checkout/{sessionId}/place-order`).
 * Không kèm orderCode — BE gắn `#access=<token>` khi gửi ZNS/email.
 * FE đọc token tại `/don-hang/dat-truoc#access=...` rồi gọi `POST order/pre-orders/access`.
 */
export function buildPreOrderDetailUrlTemplate(origin: string): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}${PRE_ORDER_DETAIL_ROUTE}`;
}
