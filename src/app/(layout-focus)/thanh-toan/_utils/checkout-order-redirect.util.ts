import type { CheckoutSession, PlaceOrderResponse } from "@/utils/api/checkout/checkout.interface";
import { isPreOrderReserveCheckout } from "@/utils/api/pre-order/pre-order-checkout.util";

export type OrderRedirectResult =
  { type: "redirect"; url: string } | { type: "payoo_payment"; paymentUrl: string } | { type: "error"; message: string };

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
  // Pre-order lần 1: không Payoo — về trang xác nhận đặt trước.
  if (isPreOrderReserveCheckout(session) || isPreOrderReserveCheckout(syncedPricingSession)) {
    const successQuery = new URLSearchParams({
      status: "success",
      orderCode: result?.orderCode || "",
      sessionId: sessionId || "",
      fulfillment: "pre-order",
    });
    return {
      type: "redirect",
      url: `/trang-thai-thanh-toan?${successQuery.toString()}`,
    };
  }

  if (paymentMethod !== "COD") {
    const resultStatus = String(result?.status || "").toLowerCase();
    const isPendingPayment = resultStatus === "pending";

    if (isPendingPayment && !result?.paymentUrl) {
      return {
        type: "redirect",
        url: `/trang-thai-thanh-toan?status=payoo-create-link-error`,
      };
    }

    if (result?.paymentUrl) {
      return {
        type: "payoo_payment",
        paymentUrl: result.paymentUrl,
      };
    }

    return {
      type: "error",
      message: "Không thể tạo phiên thanh toán. Vui lòng thử thanh toán lại.",
    };
  }

  const successQuery = new URLSearchParams({
    status: "success",
    orderCode: result?.orderCode || "",
    sessionId: sessionId || "",
  });
  if (session?.fulfillmentSummary?.label && session?.fulfillmentSummary?.value) {
    successQuery.set("fulfillment", "pre-order");
  }
  return {
    type: "redirect",
    url: `/trang-thai-thanh-toan?${successQuery.toString()}`,
  };
}
