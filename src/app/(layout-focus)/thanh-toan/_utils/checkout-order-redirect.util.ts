import type { CheckoutSession, PlaceOrderResponse } from "@/utils/api/checkout/checkout.interface";
import { momoStartUrl } from "@/utils/api/java/java-momo.api";
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
  if (!isPreOrder && paymentMethod === "MOMO") return momoRedirect(result);
  if (!isPreOrder && paymentMethod !== "COD") {
    return { type: "error", message: "Bản demo hiện chỉ hỗ trợ thanh toán khi nhận hàng." };
  }
  const query = new URLSearchParams({ status: "success", orderCode: result.orderCode ?? "", sessionId: sessionId ?? "" });
  if (isPreOrder || session?.fulfillmentSummary?.label) query.set("fulfillment", "pre-order");
  return { type: "redirect", url: `/trang-thai-thanh-toan?${query.toString()}` };
}

function momoRedirect(result: PlaceOrderResponse): OrderRedirectResult {
  if (result.paymentMethod === "MOMO" && result.orderCode && result.paymentUrl === momoStartUrl(result.orderCode)) {
    return { type: "redirect", url: result.paymentUrl };
  }
  return { type: "error", message: "Chưa tạo được liên kết thanh toán MoMo." };
}
