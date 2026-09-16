import { useEffect } from "react";
import type { CheckoutSession } from "@/utils/api/checkout/checkout.interface";
import type { AuthUser } from "@/utils/api/auth/auth.interface";
import type { SelectedCheckoutVoucher } from "../_components/checkout-voucher/checkout-voucher.mapper";
import { DEFAULT_MAX_SELECTED_CART_VOUCHERS, mapCardToSelected } from "../_components/checkout-voucher/checkout-voucher.mapper";
import { PromotionApi } from "@/utils/api";

export interface UseCheckoutVoucherHydrationParams {
  session: CheckoutSession | null | undefined;
  isSubmissionLock: React.MutableRefObject<boolean>;
  sessionCouponCodesKey: string;
  selectedCouponCodesKey: string;
  normalizedSessionCouponCodes: string[];
  user: AuthUser | null;
  voucherHydrationPendingRef: React.MutableRefObject<string | null>;
  voucherHydrationCompleteRef: React.MutableRefObject<string | null>;
  setSelectedVouchers: React.Dispatch<React.SetStateAction<SelectedCheckoutVoucher[]>>;
}

export function useCheckoutVoucherHydration({
  session,
  isSubmissionLock,
  sessionCouponCodesKey,
  selectedCouponCodesKey,
  normalizedSessionCouponCodes,
  user,
  voucherHydrationPendingRef,
  voucherHydrationCompleteRef,
  setSelectedVouchers,
}: UseCheckoutVoucherHydrationParams) {
  useEffect(() => {
    const isDraft = session?.status?.toLowerCase() === "draft";
    const hasOrder = Boolean(session?.orderCode);
    if (!session || !isDraft || hasOrder || isSubmissionLock.current) return;
    if (!sessionCouponCodesKey) {
      voucherHydrationPendingRef.current = null;
      voucherHydrationCompleteRef.current = null;
      return;
    }

    if (selectedCouponCodesKey === sessionCouponCodesKey) {
      voucherHydrationPendingRef.current = null;
      voucherHydrationCompleteRef.current = sessionCouponCodesKey;
      return;
    }

    if (voucherHydrationPendingRef.current === sessionCouponCodesKey) return;
    if (voucherHydrationCompleteRef.current === sessionCouponCodesKey) return;

    voucherHydrationPendingRef.current = sessionCouponCodesKey;
    voucherHydrationCompleteRef.current = null;
    let cancelled = false;
    const checkoutSessionId = session.checkoutSessionId;
    if (!checkoutSessionId) {
      voucherHydrationPendingRef.current = null;
      return;
    }

    void Promise.all(
      normalizedSessionCouponCodes.slice(0, DEFAULT_MAX_SELECTED_CART_VOUCHERS).map(async (code) => {
        try {
          const response = await PromotionApi.validatePromotionVoucherCode(checkoutSessionId, code);
          return response.valid && response.card ? mapCardToSelected(response.card) : null;
        } catch {
          return null;
        }
      }),
    )
      .then((hydratedVouchers) => {
        if (cancelled) return;
        setSelectedVouchers(hydratedVouchers.filter((voucher): voucher is SelectedCheckoutVoucher => voucher !== null));
        voucherHydrationPendingRef.current = null;
        voucherHydrationCompleteRef.current = sessionCouponCodesKey;
      })
      .catch(() => {
        if (cancelled) return;
        voucherHydrationPendingRef.current = null;
        voucherHydrationCompleteRef.current = null;
      });

    return () => {
      cancelled = true;
    };
  }, [
    session,
    sessionCouponCodesKey,
    selectedCouponCodesKey,
    normalizedSessionCouponCodes,
    user?.id,
    user?.segmentIds,
    isSubmissionLock,
    voucherHydrationPendingRef,
    voucherHydrationCompleteRef,
    setSelectedVouchers,
  ]);
}
