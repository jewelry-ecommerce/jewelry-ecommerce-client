import type { CheckoutSession, PlaceOrderResponse } from "@/utils/api/checkout/checkout.interface";
import { isPreOrderReserveCheckout } from "@/utils/api/pre-order/pre-order-checkout.util";

export type OrderRedirectResult = { type: "redirect"; url: string } | { type: "error"; message: string };

export interface ResolveOrderRedirectParams {
  result: PlaceOrderResponse;
  session: CheckoutSession | null | undefined;
  syncedPricingSession?: CheckoutSession | null;
  sessionId: string | null;
  paymentMethod?: string;
}

export function resolveOrderRedirect({
  result,
  session,
  syncedPricingSession,
  sessionId,
  paymentMethod,
}: ResolveOrderRedirectParams): OrderRedirectResult {
  const isPreOrder = isPreOrderReserveCheckout(session) || isPreOrderReserveCheckout(syncedPricingSession);
  if (!isPreOrder && paymentMethod !== "COD") {
    return { type: "error", message: "Bản demo hiện chỉ hỗ trợ thanh toán khi nhận hàng." };
  }
  const query = new URLSearchParams({ status: "success", orderCode: result.orderCode ?? "", sessionId: sessionId ?? "" });
  if (isPreOrder || session?.fulfillmentSummary?.label) query.set("fulfillment", "pre-order");
  return { type: "redirect", url: `/trang-thai-thanh-toan?${query.toString()}` };
}
