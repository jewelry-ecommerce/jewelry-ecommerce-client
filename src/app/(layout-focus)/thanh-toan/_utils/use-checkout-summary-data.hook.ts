import { useMemo } from "react";
import type { CheckoutSession } from "@/utils/api/checkout/checkout.interface";
import type { SelectedCheckoutVoucher } from "../_components/checkout-voucher/checkout-voucher.mapper";
import { calculateCheckoutSummaryData, type CheckoutSummaryDataResult } from "./checkout-summary-data.util";

export function useCheckoutSummaryData(
  session: CheckoutSession | null | undefined,
  pointsUsed: number,
  dynamicShippingFee: string | number | undefined,
  selectedVouchers: SelectedCheckoutVoucher[],
): CheckoutSummaryDataResult {
  return useMemo(
    () => calculateCheckoutSummaryData(session, pointsUsed, dynamicShippingFee, selectedVouchers),
    [session, pointsUsed, dynamicShippingFee, selectedVouchers],
  );
}
