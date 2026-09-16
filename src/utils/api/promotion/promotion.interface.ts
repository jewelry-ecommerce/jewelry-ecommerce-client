import type {
  PromotionVoucherDisabledReason,
  PromotionVoucherGroupType,
  PromotionVoucherReasonCode,
  PromotionVoucherSchemaType,
  PromotionVoucherStatus,
} from "./promotion.enum";

export interface PromotionVoucherCheckoutCustomerContext {
  customerId?: string | null;
  segmentIds?: readonly string[];
}

export interface PromotionVoucherCheckoutCartContext {
  cartId?: string | null;
  checkoutSessionId?: string | null;
  evaluatedAt?: string | null;
}

export interface PromotionVoucherCheckoutLine {
  lineId: string;
  skuId: string;
  quantity: number;
  unitPriceMinor: string;
  lineSubtotalMinor: string;
  categoryIds?: readonly string[];
  collectionIds?: readonly string[];
  hasExistingPromotion?: boolean;
  hasExistingDiscount?: boolean;
}

export interface PromotionVoucherCheckoutContext {
  evaluatedAt?: string | null;
  customer?: PromotionVoucherCheckoutCustomerContext | null;
  cart?: PromotionVoucherCheckoutCartContext | null;
  lines?: readonly PromotionVoucherCheckoutLine[];
  couponCodes?: readonly string[];
}

export interface DiscoverPromotionVouchersRequest {
  checkoutContext?: PromotionVoucherCheckoutContext | null;
}

export interface PromotionVoucherCard {
  voucherCodeId: string;
  promotionId: string;
  promotionSchemaId: string;
  promotionName: string;
  schemaType: PromotionVoucherSchemaType;
  code: string;
  codeMask: string;
  image: string;
  status: PromotionVoucherStatus;
  title: string;
  subtitle: string;
  conditionSummary: string;
  benefitSummary: string;
  startsAt: string;
  endsAt: string;
  disabled: boolean;
  disabledReason?: PromotionVoucherDisabledReason | null;
  reasonCodes: readonly PromotionVoucherReasonCode[];
}

export interface PromotionVoucherSection {
  groupType: PromotionVoucherGroupType;
  groupKey: string;
  title: string;
  subtitle: string;
  items: PromotionVoucherCard[];
}

export interface ValidatePromotionVoucherCodeRequest {
  code: string;
  checkoutContext?: PromotionVoucherCheckoutContext | null;
}

export interface ValidatePromotionVoucherCodeResponse {
  reasonCode: PromotionVoucherReasonCode;
  reasonCodes: readonly PromotionVoucherReasonCode[];
  message: string;
  valid: boolean;
  card?: PromotionVoucherCard | null;
}

export interface DiscoverPromotionVouchersResponse {
  sections: PromotionVoucherSection[];
}
