import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import type { CheckoutSession, UpdatePricingContextPayload } from "@/utils/api/checkout/checkout.interface";
import type { AuthUser } from "@/utils/api/auth/auth.interface";
import type { SelectedCheckoutVoucher } from "../_components/checkout-voucher/checkout-voucher.mapper";
import { buildCheckoutPricingContextPayload } from "../_components/checkout.helpers";
import { isPreOrderReserveCheckout } from "@/utils/api/pre-order/pre-order-checkout.util";
import { getErrorMessage } from "@/utils/helpers/axios";
import type { PendingPriceChangeRetry } from "./use-checkout-voucher-pricing-sync.hook";

export interface UseCheckoutPricingContextAutoSyncParams {
  session: CheckoutSession | null | undefined;
  isSubmissionLock: React.MutableRefObject<boolean>;
  resolvedPricingShippingFee: number | undefined;
  pricingPaymentMethod: string | undefined;
  sessionCouponCodesKey: string;
  selectedCouponCodesKey: string;
  voucherHydrationCompleteRef: React.MutableRefObject<string | null>;
  resolvedPricingShippingCarrier?: string;
  resolvedPricingCarrierServiceId?: number;
  canonicalSessionShippingFee: number;
  selectedVouchersRef: React.MutableRefObject<SelectedCheckoutVoucher[]>;
  user: AuthUser | null;
  syncPricingContext: (payload: UpdatePricingContextPayload) => Promise<CheckoutSession>;
  openCheckoutErrorModal: (error: unknown, retry?: PendingPriceChangeRetry) => boolean;
}

export function useCheckoutPricingContextAutoSync({
  session,
  isSubmissionLock,
  resolvedPricingShippingFee,
  pricingPaymentMethod,
  sessionCouponCodesKey,
  selectedCouponCodesKey,
  voucherHydrationCompleteRef,
  resolvedPricingShippingCarrier,
  resolvedPricingCarrierServiceId,
  canonicalSessionShippingFee,
  selectedVouchersRef,
  user,
  syncPricingContext,
  openCheckoutErrorModal,
}: UseCheckoutPricingContextAutoSyncParams) {
  const lastPricingContextSyncKey = useRef<string | null>(null);

  useEffect(() => {
    const isDraft = session?.status?.toLowerCase() === "draft";
    const hasOrder = Boolean(session?.orderCode);
    const isReserve = isPreOrderReserveCheckout(session);
    if (!session || !isDraft || hasOrder || isSubmissionLock.current) return;
    if (!pricingPaymentMethod && !isReserve) return;
    if (!resolvedPricingShippingCarrier && resolvedPricingCarrierServiceId === undefined) return;
    // Chỉ sync pricing khi BE đã nhận được địa chỉ giao hàng hợp lệ (có receiverPhone)
    // Tránh race-condition: shipping-quote resolve trước khi shipping-address được gửi lên BE
    if (!session.shippingAddress?.receiverPhone) return;

    if (
      sessionCouponCodesKey &&
      sessionCouponCodesKey !== selectedCouponCodesKey &&
      voucherHydrationCompleteRef.current !== sessionCouponCodesKey
    ) {
      return;
    }

    const syncKey = JSON.stringify({
      paymentMethod: pricingPaymentMethod ?? null,
      shippingCarrier: resolvedPricingShippingCarrier ?? null,
      carrierServiceId: resolvedPricingCarrierServiceId ?? null,
      couponCodes: selectedCouponCodesKey,
    });

    if (lastPricingContextSyncKey.current === syncKey) return;
    lastPricingContextSyncKey.current = syncKey;

    const pricingPayload = buildCheckoutPricingContextPayload(
      selectedVouchersRef.current,
      pricingPaymentMethod,
      resolvedPricingShippingFee,
      user?.segmentIds ?? [],
      resolvedPricingShippingCarrier,
      resolvedPricingCarrierServiceId,
    );
    void syncPricingContext(pricingPayload).catch((error) => {
      lastPricingContextSyncKey.current = null;
      if (openCheckoutErrorModal(error, { kind: "pricing", payload: pricingPayload })) return;
      toast.error(getErrorMessage(error) || "Không thể cập nhật giá checkout. Vui lòng thử lại.");
    });
  }, [
    session,
    pricingPaymentMethod,
    resolvedPricingShippingFee,
    resolvedPricingShippingCarrier,
    resolvedPricingCarrierServiceId,
    canonicalSessionShippingFee,
    syncPricingContext,
    user?.segmentIds,
    sessionCouponCodesKey,
    selectedCouponCodesKey,
    openCheckoutErrorModal,
    isSubmissionLock,
    voucherHydrationCompleteRef,
    selectedVouchersRef,
  ]);
}
