import { useCallback, useEffect, useMemo, useRef } from "react";
import debounce from "lodash/debounce";
import { toast } from "react-toastify";
import type { CheckoutSession, ShippingAddress, UpdatePricingContextPayload } from "@/utils/api/checkout/checkout.interface";
import type { AuthUser } from "@/utils/api/auth/auth.interface";
import type { SelectedCheckoutVoucher } from "../_components/checkout-voucher/checkout-voucher.mapper";
import { buildCheckoutPricingContextPayload } from "../_components/checkout.helpers";
import { isPreOrderReserveCheckout } from "@/utils/api/pre-order/pre-order-checkout.util";
import { getErrorMessage } from "@/utils/helpers/axios";

export type PendingPriceChangeRetry =
  | { kind: "address"; address: ShippingAddress; addressId?: string }
  | { kind: "pricing"; payload: UpdatePricingContextPayload }
  | { kind: "place-order"; payload: import("@/utils/api/checkout/checkout.interface").PlaceOrderPayload };

export interface UseCheckoutVoucherPricingSyncParams {
  session: CheckoutSession | null | undefined;
  isSubmissionLock: React.MutableRefObject<boolean>;
  voucherHydrationCompleteRef: React.MutableRefObject<string | null>;
  voucherHydrationPendingRef: React.MutableRefObject<string | null>;
  sessionCouponCodesKey: string;
  selectedCouponCodesKey: string;
  pricingPaymentMethod: string | undefined;
  resolvedPricingShippingFee: number | undefined;
  user: AuthUser | null;
  resolvedPricingShippingCarrier?: string;
  resolvedPricingCarrierServiceId?: number;
  syncPricingContext: (payload: UpdatePricingContextPayload) => Promise<CheckoutSession>;
  openCheckoutErrorModal: (error: unknown, retry?: PendingPriceChangeRetry) => boolean;
}

export function useCheckoutVoucherPricingSync({
  session,
  isSubmissionLock,
  voucherHydrationCompleteRef,
  voucherHydrationPendingRef,
  sessionCouponCodesKey,
  selectedCouponCodesKey,
  pricingPaymentMethod,
  resolvedPricingShippingFee,
  user,
  resolvedPricingShippingCarrier,
  resolvedPricingCarrierServiceId,
  syncPricingContext,
  openCheckoutErrorModal,
}: UseCheckoutVoucherPricingSyncParams) {
  const voucherPricingParamsRef = useRef({
    paymentMethod: pricingPaymentMethod,
    resolvedPricingShippingFee,
    segmentIds: user?.segmentIds ?? [],
    resolvedPricingShippingCarrier,
    resolvedPricingCarrierServiceId,
  });
  voucherPricingParamsRef.current = {
    paymentMethod: pricingPaymentMethod,
    resolvedPricingShippingFee,
    segmentIds: user?.segmentIds ?? [],
    resolvedPricingShippingCarrier,
    resolvedPricingCarrierServiceId,
  };

  const checkoutVoucherPricingGuardRef = useRef({
    session,
    isSubmissionLock,
    voucherHydrationCompleteRef,
    voucherHydrationPendingRef,
    sessionCouponCodesKey,
    selectedCouponCodesKey,
    paymentMethod: pricingPaymentMethod,
    resolvedPricingShippingFee,
  });
  checkoutVoucherPricingGuardRef.current = {
    session,
    isSubmissionLock,
    voucherHydrationCompleteRef,
    voucherHydrationPendingRef,
    sessionCouponCodesKey,
    selectedCouponCodesKey,
    paymentMethod: pricingPaymentMethod,
    resolvedPricingShippingFee,
  };

  const debouncedVoucherPricingSync = useMemo(
    () =>
      debounce((vouchers: SelectedCheckoutVoucher[]) => {
        const guard = checkoutVoucherPricingGuardRef.current;
        const isDraft = guard.session?.status?.toLowerCase() === "draft";
        const hasOrder = Boolean(guard.session?.orderCode);
        if (!guard.session || !isDraft || hasOrder || guard.isSubmissionLock.current) return;
        if (guard.resolvedPricingShippingFee === undefined || (!guard.paymentMethod && !isPreOrderReserveCheckout(guard.session))) return;
        // Chỉ sync pricing khi BE đã nhận được địa chỉ giao hàng hợp lệ (có receiverPhone)
        if (!isPreOrderReserveCheckout(guard.session) && !guard.session.shippingAddress?.receiverPhone) return;
        if (
          guard.sessionCouponCodesKey &&
          guard.sessionCouponCodesKey !== guard.selectedCouponCodesKey &&
          guard.voucherHydrationCompleteRef.current !== guard.sessionCouponCodesKey
        ) {
          return;
        }

        const params = voucherPricingParamsRef.current;
        const pricingPayload = buildCheckoutPricingContextPayload(
          vouchers,
          isPreOrderReserveCheckout(guard.session) ? undefined : params.paymentMethod,
          params.resolvedPricingShippingFee,
          params.segmentIds,
          params.resolvedPricingShippingCarrier,
          params.resolvedPricingCarrierServiceId,
        );
        void syncPricingContext(pricingPayload).catch((error) => {
          if (openCheckoutErrorModal(error, { kind: "pricing", payload: pricingPayload })) return;
          toast.error(getErrorMessage(error) || "Không thể cập nhật voucher checkout. Vui lòng thử lại.");
        });
      }, 400),
    [openCheckoutErrorModal, syncPricingContext],
  );

  useEffect(() => () => debouncedVoucherPricingSync.cancel(), [debouncedVoucherPricingSync]);

  const scheduleVoucherPricingSync = useCallback(
    (vouchers: SelectedCheckoutVoucher[]) => {
      debouncedVoucherPricingSync(vouchers);
    },
    [debouncedVoucherPricingSync],
  );

  const flushVoucherPricingSync = useCallback(() => {
    debouncedVoucherPricingSync.flush();
  }, [debouncedVoucherPricingSync]);

  return {
    scheduleVoucherPricingSync,
    flushVoucherPricingSync,
  };
}
