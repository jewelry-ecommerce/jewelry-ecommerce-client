import type {
  PromotionVoucherCard,
  PromotionVoucherCheckoutContext,
  PromotionVoucherSection,
} from "@/utils/api/promotion/promotion.interface";
import { PromotionVoucherDisabledReason } from "@/utils/api/promotion/promotion.enum";
import { resolveProductDefaultImageSrc } from "@/utils/config/tenant-branding.util";

export const DEFAULT_MAX_SELECTED_CART_VOUCHERS = 1;

const PROMOTION_VOUCHER_REASON_TEXT: Record<string, string> = {
  [PromotionVoucherDisabledReason.PROMOTION_VOUCHER_CODE_DISABLED]: "Mã voucher đã bị vô hiệu hóa.",
  [PromotionVoucherDisabledReason.PROMOTION_VOUCHER_CODE_REDEEMED]: "Mã voucher đã được sử dụng.",
  [PromotionVoucherDisabledReason.PROMOTION_VOUCHER_CODE_EXPIRED]: "Mã voucher đã hết hạn.",
  [PromotionVoucherDisabledReason.PROMOTION_VOUCHER_PROMOTION_NOT_ACTIVE]: "Khuyến mãi chưa kích hoạt hoặc đã kết thúc.",
  [PromotionVoucherDisabledReason.PROMOTION_VOUCHER_SCHEMA_DISABLED]: "Schema voucher đang tạm tắt.",
  [PromotionVoucherDisabledReason.PROMOTION_VOUCHER_AUDIENCE_NOT_ELIGIBLE]: "Bạn chưa thuộc nhóm khách hàng áp dụng.",
  [PromotionVoucherDisabledReason.PROMOTION_VOUCHER_TARGET_NOT_ELIGIBLE]: "Giỏ hàng hiện tại chưa nằm trong phạm vi áp dụng.",
  [PromotionVoucherDisabledReason.PROMOTION_VOUCHER_CONDITION_NOT_MET]: "Giỏ hàng chưa đạt điều kiện áp dụng voucher.",
  [PromotionVoucherDisabledReason.PROMOTION_VOUCHER_CONFLICT_LOST]: "Voucher này không được chọn do xung đột với voucher khác.",
  [PromotionVoucherDisabledReason.PROMOTION_VOUCHER_NOT_APPLICABLE]: "Voucher không áp dụng cho giỏ hàng hiện tại.",
};

export const resolveVoucherReasonText = (reasonCode?: string | null): string => {
  if (!reasonCode) return "";
  return PROMOTION_VOUCHER_REASON_TEXT[reasonCode] ?? reasonCode;
};

function normalizeVietnameseText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function isHiddenCheckoutVoucherSection(section: PromotionVoucherSection): boolean {
  const normalizedTitle = normalizeVietnameseText(section.title);
  return normalizedTitle.includes("ngay thu 181");
}

export function getCheckoutDisplayVoucherItems(sections: readonly PromotionVoucherSection[]): PromotionVoucherCard[] {
  return sections.filter((section) => !isHiddenCheckoutVoucherSection(section)).flatMap((section) => section.items);
}

export interface MappedVoucherItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  isDisable: boolean;
  conditionSummary: string;
  code: string;
  codeMask: string;
}

export function mapVoucherCardToItem(card: PromotionVoucherCard): MappedVoucherItem {
  return {
    id: card.voucherCodeId,
    title: card.title,
    subtitle: card.disabled ? resolveVoucherReasonText(card.disabledReason ?? card.reasonCodes?.[0]) : card.subtitle || card.benefitSummary,
    image: card.image?.trim() || resolveProductDefaultImageSrc(),
    isDisable: card.disabled,
    conditionSummary: card.conditionSummary,
    code: card.code,
    codeMask: card.codeMask,
  };
}

export interface SelectedCheckoutVoucher {
  voucherCodeId: string;
  code: string;
  codeMask: string;
  title: string;
  benefitSummary?: string;
  subtitle?: string;
}

export function mapCardToSelected(card: PromotionVoucherCard): SelectedCheckoutVoucher {
  return {
    voucherCodeId: card.voucherCodeId,
    code: card.code,
    codeMask: card.codeMask,
    title: card.title,
    benefitSummary: card.benefitSummary,
    subtitle: card.subtitle,
  };
}

export function isVoucherSelected(selected: SelectedCheckoutVoucher[], voucherCodeId: string): boolean {
  return selected.some((v) => v.voucherCodeId === voucherCodeId);
}

export function toggleVoucher(
  selected: SelectedCheckoutVoucher[],
  card: PromotionVoucherCard,
  maxVouchers = DEFAULT_MAX_SELECTED_CART_VOUCHERS,
): SelectedCheckoutVoucher[] {
  const alreadySelected = isVoucherSelected(selected, card.voucherCodeId);
  if (alreadySelected) {
    return selected.filter((v) => v.voucherCodeId !== card.voucherCodeId);
  }
  if (selected.length >= maxVouchers) return selected;
  return [...selected, mapCardToSelected(card)];
}

export function addOrReplaceVoucher(
  selected: SelectedCheckoutVoucher[],
  card: PromotionVoucherCard,
  maxVouchers = DEFAULT_MAX_SELECTED_CART_VOUCHERS,
): SelectedCheckoutVoucher[] {
  if (isVoucherSelected(selected, card.voucherCodeId)) return selected;
  const deduped = selected.filter((v) => v.code !== card.code);
  if (deduped.length >= maxVouchers) return selected;
  return [...deduped, mapCardToSelected(card)];
}

/** Stable key để discover chỉ refetch khi context thực sự đổi — tránh reload UI do reference mới. */
export function serializePromotionVoucherCheckoutContext(context?: PromotionVoucherCheckoutContext | null): string {
  if (!context) return "";

  return JSON.stringify({
    customerId: context.customer?.customerId ?? null,
    segmentIds: [...(context.customer?.segmentIds ?? [])].sort(),
    cartId: context.cart?.cartId ?? null,
    checkoutSessionId: context.cart?.checkoutSessionId ?? null,
    couponCodes: [...(context.couponCodes ?? [])].map((code) => code.trim().toLowerCase()).sort(),
    lines: (context.lines ?? []).map((line) => ({
      lineId: line.lineId,
      skuId: line.skuId,
      quantity: line.quantity,
      unitPriceMinor: line.unitPriceMinor,
      lineSubtotalMinor: line.lineSubtotalMinor,
      categoryIds: [...(line.categoryIds ?? [])].sort(),
      collectionIds: [...(line.collectionIds ?? [])].sort(),
      hasExistingPromotion: Boolean(line.hasExistingPromotion),
      hasExistingDiscount: Boolean(line.hasExistingDiscount),
    })),
  });
}
