import { CheckoutRequestLineType, type CheckoutSessionLine } from "@/utils/api/checkout/checkout.interface";
import { isPathAllowedForTenant } from "@/utils/config/tenant-restricted-routes.util";

export const isStellaVoteEligibleCheckout = (
  tenantCode: string | null | undefined,
  checkoutLines: readonly CheckoutSessionLine[],
): boolean => {
  return isPathAllowedForTenant("/sets", tenantCode) && checkoutLines.some((line) => line.type === CheckoutRequestLineType.SET);
};
