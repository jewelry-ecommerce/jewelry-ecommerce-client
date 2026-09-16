import { withFreshGuestCartHeader } from "@/utils/api/cart/cart.util";
import { commonAxios } from "@/utils/axios";
import type { DiscoverPromotionVouchersResponse, ValidatePromotionVoucherCodeResponse } from "./promotion.interface";

export const discoverPromotionVouchers = async (checkoutSessionId: string): Promise<DiscoverPromotionVouchersResponse> =>
  (await commonAxios.post(`order/checkout/${checkoutSessionId}/promotion-vouchers/discover`, {}, withFreshGuestCartHeader())).data;

export const validatePromotionVoucherCode = async (
  checkoutSessionId: string,
  code: string,
): Promise<ValidatePromotionVoucherCodeResponse> =>
  (await commonAxios.post(`order/checkout/${checkoutSessionId}/promotion-vouchers/validate-code`, { code }, withFreshGuestCartHeader()))
    .data;
