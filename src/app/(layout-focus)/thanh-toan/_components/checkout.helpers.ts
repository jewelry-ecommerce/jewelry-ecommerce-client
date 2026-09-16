import type {
  CheckoutSession,
  CheckoutSessionLine,
  CheckoutSessionPricing,
  CheckoutSessionItem,
  CheckoutPriceChangeAction,
  CheckoutPriceChangeDetails,
  IOrderShippingServiceItem,
  OrderDetailLineAttribute,
  UpdatePricingContextPayload,
} from "@/utils/api/checkout/checkout.interface";
import { flattenCheckoutSessionItems, isCheckoutSessionSetItem } from "@/utils/api/checkout/checkout.util";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import type { PromotionVoucherCheckoutContext, PromotionVoucherCheckoutLine } from "@/utils/api/promotion/promotion.interface";
import { isSizeVariantAttribute } from "@/utils/product/size-variant-attribute.util";
import type { SelectedCheckoutVoucher } from "./checkout-voucher/checkout-voucher.mapper";
import { CheckoutStatusModalType } from "./checkout-status-modal/checkout-status-modal.component";

export type ApiPlaceOrderShippingCarrier = "GHN" | "VTP";

export type ApiPlaceOrderShippingMethod = "Express" | "Standard" | "SameDay" | "StorePickup";

const API_SHIPPING_CARRIERS = new Set<ApiPlaceOrderShippingCarrier>(["GHN", "VTP"]);

const API_SHIPPING_METHODS = new Set<ApiPlaceOrderShippingMethod>(["Express", "Standard", "SameDay", "StorePickup"]);

const normalizeCarrier = (v: unknown): ApiPlaceOrderShippingCarrier | undefined => {
  if (typeof v !== "string") return undefined;
  const u = v.trim().toUpperCase();
  return u === "GHN" || u === "VTP" ? u : undefined;
};

const normalizeMethod = (v: unknown): ApiPlaceOrderShippingMethod | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim() as ApiPlaceOrderShippingMethod;
  return API_SHIPPING_METHODS.has(t) ? t : undefined;
};

const serviceLabel = (service: IOrderShippingServiceItem): string =>
  [service.shortName, service.serviceName, service.short_name, service.service_name].filter(Boolean).join(" ").toLowerCase();

/** ISO 8601 gửi place-order — lấy `to_estimate_date` từ item đầu `services/with-leadtime`. */
export const resolveEstimatedDeliveryAt = (service: IOrderShippingServiceItem | null | undefined): string | undefined => {
  const leadtime = service?.leadtime;
  if (!leadtime || typeof leadtime !== "object") return undefined;
  const iso = leadtime.leadtime_order?.to_estimate_date?.trim();
  return iso || undefined;
};

/** Map dịch vụ leadtime/fee → carrier hợp lệ cho place-order. */
export const resolvePlaceOrderShippingCarrier = (service: IOrderShippingServiceItem | null | undefined): ApiPlaceOrderShippingCarrier => {
  const fromApi = normalizeCarrier(service?.carrier) ?? normalizeCarrier(service?.carrierCode);
  if (fromApi) return fromApi;
  const label = service ? serviceLabel(service) : "";
  if (/vtp|viettel\s*post|viettelpost/.test(label)) return "VTP";
  return "GHN";
};

/** Map dịch vụ / session → shippingMethod hợp lệ cho place-order. */
export const resolvePlaceOrderShippingMethod = (
  service: IOrderShippingServiceItem | null | undefined,
  sessionShippingMethod?: string | null,
): ApiPlaceOrderShippingMethod => {
  const fromSession = normalizeMethod(sessionShippingMethod);
  if (fromSession) return fromSession;
  const fromApi = normalizeMethod(service?.shippingMethod);
  if (fromApi) return fromApi;
  const label = service ? serviceLabel(service) : "";
  if (/same\s*day|trong\s*ngày|cùng\s*ngày|giao\s*ngay/.test(label)) return "SameDay";
  if (/express|chuyển\s*phát\s*nhanh|\bcpn\b|\bnhanh\b/.test(label)) return "Express";
  if (/pickup|lấy\s*tại|tại\s*kho|store\s*pick|nhận\s*tại\s*cửa\s*hàng/.test(label)) return "StorePickup";
  return "Standard";
};

export function hasCheckoutItemVariantData(item: Pick<CheckoutSessionItem, "productName" | "variationName" | "attributes">): boolean {
  const hasAttributes = (item.attributes ?? []).some((attr) => String(attr.value ?? "").trim());
  if (hasAttributes) return true;

  const productName = item.productName?.trim() || "";
  const variationName = item.variationName?.trim() || "";
  return Boolean(variationName && variationName !== productName);
}

export type CheckoutVariantFallback = {
  variationId: string;
  details?: string;
  sizeLabel?: string;
};

export function buildCheckoutItemAttributesFromFallback(
  fallback: Pick<CheckoutVariantFallback, "details" | "sizeLabel">,
): OrderDetailLineAttribute[] {
  const attributes: OrderDetailLineAttribute[] = [];
  const details = fallback.details?.trim();
  if (details) {
    attributes.push({ attributeCode: "DETAIL", attributeName: "Detail", value: details });
  }

  const sizeLabel = fallback.sizeLabel?.trim();
  if (sizeLabel) {
    attributes.push({ attributeCode: "SIZE", attributeName: "Size", value: sizeLabel });
  }

  return attributes;
}

/** @deprecated Use buildCheckoutItemAttributesFromFallback */
export function buildCheckoutItemAttributesFromCart(cartItem: Pick<CartViewItem, "details" | "sizeLabel">): OrderDetailLineAttribute[] {
  return buildCheckoutItemAttributesFromFallback(cartItem);
}

/** Bổ sung biến thể khi checkout session thiếu attributes/variationName. */
export function enrichCheckoutSessionItemsWithVariantFallbacks(
  items: CheckoutSessionItem[],
  fallbacks: CheckoutVariantFallback[],
): CheckoutSessionItem[] {
  if (!fallbacks.length) return items;

  const fallbackByVariationId = new Map(fallbacks.map((item) => [String(item.variationId), item]));

  return items.map((item) => {
    if (hasCheckoutItemVariantData(item)) return item;

    const fallback = fallbackByVariationId.get(String(item.variationId));
    if (!fallback) return item;

    const attributes = buildCheckoutItemAttributesFromFallback(fallback);
    if (!attributes.length) return item;

    return { ...item, attributes };
  });
}

/** Bổ sung biến thể từ giỏ hàng khi checkout session thiếu attributes/variationName. */
export function enrichCheckoutSessionItemsWithCartVariants(
  items: CheckoutSessionItem[],
  cartItems: Array<Pick<CartViewItem, "id" | "details" | "sizeLabel">>,
): CheckoutSessionItem[] {
  return enrichCheckoutSessionItemsWithVariantFallbacks(
    items,
    cartItems.map((item) => ({
      variationId: String(item.id),
      details: item.details,
      sizeLabel: item.sizeLabel,
    })),
  );
}

/** Dòng biến thể hiển thị dưới tên SP — đồng bộ logic với giỏ hàng (details + Size). */
export function resolveCheckoutItemVariantLines(item: {
  attributes?: OrderDetailLineAttribute[];
  productName?: string;
  variationName?: string;
}): string[] {
  const lines: string[] = [];
  const detailParts: string[] = [];
  let sizeLabel: string | null = null;

  for (const attr of item.attributes ?? []) {
    const value = String(attr.value ?? "").trim();
    if (!value) continue;

    if (isSizeVariantAttribute({ code: attr.attributeCode, name: attr.attributeName })) {
      sizeLabel = value;
      continue;
    }

    detailParts.push(value);
  }

  if (detailParts.length > 0) {
    lines.push(detailParts.join(", "));
  }

  if (sizeLabel) {
    lines.push(`Size: ${sizeLabel}`);
  }

  if (lines.length > 0) {
    return lines;
  }

  const productName = item.productName?.trim() || "";
  const raw = item.variationName?.trim();
  if (!raw || raw === productName) return [];

  const parts = raw
    .split(", ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return [parts[0], `Size: ${parts[1]}`];
  }

  return [raw];
}

export function formatCheckoutItemAttributesLine(attributes?: OrderDetailLineAttribute[]): string | null {
  const lines = resolveCheckoutItemVariantLines({ attributes });
  return lines.length > 0 ? lines.join(", ") : null;
}

const normalizeCheckoutLineType = (lineType?: string | null): string => (lineType || "").toUpperCase();

const isCheckoutPackagingLine = (item: CheckoutSessionItem): boolean => {
  const lineType = normalizeCheckoutLineType(item.lineType);
  return lineType === "PACKAGING_INCLUDED" || lineType === "PACKAGING_OPTIONAL";
};

/** Bao bì/quà kèm miễn phí — tạm ẩn trên UI checkout, vẫn giữ trong session/API. */
export const isCheckoutPackagingIncludedLine = (item: CheckoutSessionItem): boolean =>
  normalizeCheckoutLineType(item.lineType) === "PACKAGING_INCLUDED";

/** Dòng hiển thị trên checkout (loại PACKAGING_INCLUDED). */
export const filterCheckoutDisplayItems = (items: CheckoutSessionItem[]): CheckoutSessionItem[] =>
  items.filter((item) => !isCheckoutPackagingIncludedLine(item));

export type CheckoutItemGroupView = {
  id: string;
  parent: CheckoutSessionItem;
  attached: CheckoutSessionItem[];
};

/** Gom dòng checkout session: SP chính + quà/bao bì kèm theo parent (không gồm PACKAGING_INCLUDED). */
export const groupCheckoutSessionItems = (items: CheckoutSessionItem[]): CheckoutItemGroupView[] =>
  filterCheckoutDisplayItems(items).reduce<CheckoutItemGroupView[]>((groups, item, index) => {
    if (!isCheckoutPackagingLine(item)) {
      groups.push({
        id: item.id || item.variationId || `${item.variationId}-${index}`,
        parent: item,
        attached: [],
      });
      return groups;
    }

    const parentGroup =
      groups.find((group) => group.parent.id && group.parent.id === item.parentCheckoutItemId) ||
      groups.find((group) => group.parent.variationId === item.sourceVariationId);

    if (parentGroup) {
      parentGroup.attached.push(item);
      return groups;
    }

    groups.push({
      id: item.packagingRelationId || `${item.variationId}-${index}-orphan`,
      parent: item,
      attached: [],
    });
    return groups;
  }, []);

/** Số dòng hiển thị trên UI (SP chính + quà/bao bì kèm). */
export const resolveCheckoutVisibleRowCount = (items: CheckoutSessionItem[]): number =>
  groupCheckoutSessionItems(items).reduce((acc, group) => acc + 1 + group.attached.length, 0);

/** Desktop: hiện nút xem thêm khi list tràn viewport hoặc > 3 dòng hiển thị. */
export const shouldShowCheckoutDesktopSeeMore = (items: CheckoutSessionItem[], hasOverflow: boolean): boolean =>
  hasOverflow || resolveCheckoutVisibleRowCount(items) > 3;

/** Tổng số lượng SP chính (cộng `quantity` từng dòng, không tính quà/đóng gói kèm). */
export const resolveCheckoutMerchandiseQuantity = (items: CheckoutSessionItem[]): number =>
  items.filter((item) => !isCheckoutPackagingLine(item)).reduce((acc, item) => acc + Math.max(0, Number(item.quantity) || 0), 0);

/** Tổng số lượng theo checkout session (mọi dòng, gồm bao bì kèm). */
export const resolveCheckoutTotalQuantity = (items: CheckoutSessionItem[]): number =>
  items.reduce((acc, item) => acc + Math.max(0, Number(item.quantity) || 0), 0);

/** Tổng số lượng hiển thị checkout — không tính PACKAGING_INCLUDED. */
export const resolveCheckoutDisplayQuantity = (items: CheckoutSessionLine[]): number =>
  items.reduce((acc, item) => {
    if (isCheckoutSessionSetItem(item)) return acc + Math.max(0, Number(item.quantity) || 0);
    if (isCheckoutPackagingIncludedLine(item)) return acc;
    return acc + Math.max(0, Number(item.quantity) || 0);
  }, 0);

export const CHECKOUT_ERROR_MODAL_MAP: Record<string, CheckoutStatusModalType> = {
  CHECKOUT_ALL_OUT_OF_STOCK: "full_stock",
  CHECKOUT_PARTIAL_OUT_OF_STOCK: "partial_stock",
  CHECKOUT_ITEMS_UNAVAILABLE: "items_unavailable",
  CHECKOUT_PRICE_CHANGED: "price_change",
  CHECKOUT_REQUOTE_REQUIRED: "price_change",
  CHECKOUT_PRICING_QUOTE_UNAVAILABLE: "pricing_unavailable",
  CHECKOUT_PRICING_COMMIT_UNAVAILABLE: "pricing_unavailable",
  CHECKOUT_SHIPPING_FEE_UNAVAILABLE: "shipping_fee_unavailable",
  CHECKOUT_SHIPPING_FEE_MISMATCH: "shipping_fee_mismatch",
};

const toMinorUnit = (value: string | number | null | undefined): number => Math.max(0, Math.round(Number(value ?? 0) || 0));

const normalizeStringArray = (values: readonly string[]): string[] => [
  ...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)),
];

export const resolveCheckoutPricingErrorModal = (errorCode?: string | null): CheckoutStatusModalType | null => {
  if (!errorCode) return null;
  return CHECKOUT_ERROR_MODAL_MAP[errorCode] ?? null;
};

export interface CheckoutApiErrorResponse {
  errorCode?: string;
  message?: string | string[];
  details?: CheckoutPriceChangeDetails & {
    unavailableItems?: Array<{ productName?: string; variationName?: string }>;
    outOfStockItems?: Array<{ productName?: string; variationName?: string }>;
    items?: Array<{ productName?: string; variationName?: string }>;
  };
}

const CHECKOUT_PRICE_CHANGE_CTA_LABELS: Record<string, string> = {
  accept_price_changes: "Đồng Ý",
  review_price_change: "Xem Lại Giá Mới",
};

export function getCheckoutApiError(error: unknown): CheckoutApiErrorResponse | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = (error as { response?: { data?: CheckoutApiErrorResponse } }).response;
  return response?.data;
}

export function resolveCheckoutPriceChangeDetails(details?: CheckoutApiErrorResponse["details"]): CheckoutPriceChangeDetails | undefined {
  if (!details) return undefined;
  if (!details.popup && !details.priceChangedItems?.length && !details.previousTotals && !details.currentTotals) {
    return undefined;
  }
  return {
    priceChangedItems: details.priceChangedItems,
    previousTotals: details.previousTotals,
    currentTotals: details.currentTotals,
    popup: details.popup,
  };
}

export function resolveCheckoutPriceChangeActions(details?: CheckoutPriceChangeDetails): CheckoutPriceChangeAction[] {
  return details?.popup?.actions?.filter((action) => Boolean(action.cta_text?.trim())) ?? [];
}

export function resolveCheckoutPriceChangeCtaLabel(action: CheckoutPriceChangeAction): string {
  return CHECKOUT_PRICE_CHANGE_CTA_LABELS[action.id] || action.cta_text.trim();
}

export function isAcceptPriceChangeAction(action: CheckoutPriceChangeAction): boolean {
  return (
    action.id === "accept_price_changes" ||
    action.action_type === "REQUEST_PATCH" ||
    action.action_payload?.request_patch?.acceptPriceChanges === true
  );
}

export function isReviewPriceChangeAction(action: CheckoutPriceChangeAction): boolean {
  return action.id === "review_price_change" || action.action_type === "REVIEW_PRICE_CHANGE";
}

export const buildCheckoutPricingContextPayload = (
  selectedVouchers: SelectedCheckoutVoucher[],
  paymentMethod: string | undefined,
  _shippingFee?: number | undefined,
  segmentIds: string[] = [],
  shippingCarrier?: string,
  carrierServiceId?: number,
): UpdatePricingContextPayload => {
  const trimmedPaymentMethod = paymentMethod?.trim();

  return {
    couponCodes: selectedVouchers.map((voucher) => voucher.code),
    // Pre-order lần 1: không gửi paymentMethod (omit key, không gửi empty/undefined).
    ...(trimmedPaymentMethod ? { paymentMethod: trimmedPaymentMethod } : {}),
    ...(shippingCarrier ? { shippingCarrier } : {}),
    ...(carrierServiceId !== undefined ? { carrierServiceId } : {}),
    ...(segmentIds.length > 0 ? { segmentIds: normalizeStringArray(segmentIds) } : {}),
  };
};

export const buildPromotionVoucherCheckoutContext = (
  session: CheckoutSession | null | undefined,
  selectedVouchers: SelectedCheckoutVoucher[],
  params?: {
    customerId?: string | null;
    segmentIds?: string[];
  },
): PromotionVoucherCheckoutContext => {
  const lines: PromotionVoucherCheckoutLine[] = flattenCheckoutSessionItems(session?.items ?? []).map((item) => ({
    lineId: item.id || item.variationId,
    skuId: item.variationId,
    quantity: Math.max(0, Number(item.quantity) || 0),
    unitPriceMinor: String(item.salePrice ?? item.unitPrice ?? 0),
    lineSubtotalMinor: String(item.lineTotal ?? 0),
    categoryIds: item.categoryIds ?? [],
    collectionIds: item.collectionIds ?? [],
    hasExistingPromotion: Boolean(item.hasExistingPromotion),
    hasExistingDiscount: Boolean(item.hasExistingDiscount),
  }));

  const segmentIds = normalizeStringArray(params?.segmentIds ?? []);
  return {
    customer: {
      customerId: params?.customerId ?? null,
      ...(segmentIds.length > 0 ? { segmentIds } : {}),
    },
    cart: {
      cartId: session?.checkoutSessionId ?? null,
      checkoutSessionId: session?.checkoutSessionId ?? null,
    },
    lines,
    couponCodes: selectedVouchers.map((voucher) => voucher.code),
  };
};

const toQuantity = (value: string | number | null | undefined): number => Math.max(0, Math.trunc(Number(value ?? 0) || 0));

export const resolveCheckoutItemQuotaSplitNote = (
  item: Pick<CheckoutSessionItem, "quantity" | "appliedQuantity" | "regularQuantity" | "quotaExceededQuantity">,
): string | null => {
  const quantity = toQuantity(item.quantity);
  const appliedQuantity = toQuantity(item.appliedQuantity);
  if (quantity <= 0 || appliedQuantity <= 0) return null;

  const regularQuantity = toQuantity(item.regularQuantity) > 0 ? toQuantity(item.regularQuantity) : toQuantity(item.quotaExceededQuantity);
  if (regularQuantity > 0) {
    return `${appliedQuantity} sản phẩm giá khuyến mãi, ${regularQuantity} sản phẩm giá gốc`;
  }

  if (appliedQuantity < quantity) {
    return `Áp dụng giá khuyến mãi cho ${appliedQuantity}/${quantity} sản phẩm`;
  }

  return null;
};

export const resolveCanonicalCheckoutSummary = (pricing: CheckoutSessionPricing | undefined, pointsDiscountAmount = 0) => {
  const subtotalMinor = toMinorUnit(pricing?.subtotal);
  const shippingFeeMinor = toMinorUnit(pricing?.shippingFee);
  const cartPromotionDiscountMinor = toMinorUnit(pricing?.discountTotal);
  const canonicalGrandTotalMinor = toMinorUnit(pricing?.grandTotal);
  const finalTotalMinor = Math.max(0, canonicalGrandTotalMinor - toMinorUnit(pointsDiscountAmount));

  return {
    subtotalMinor,
    shippingFeeMinor,
    cartPromotionDiscountMinor,
    canonicalGrandTotalMinor,
    finalTotalMinor,
  };
};

export const SHIPPING_WARD_NOT_FOUND_MESSAGE = "mã phường mới không tồn tại";
export const SHIPPING_ADDRESS_NOT_SUPPORTED_MESSAGE = "Địa chỉ này không hỗ trợ giao hàng";

/** Chuẩn hóa message lỗi quote vận chuyển (vd. bỏ mã phường khỏi suffix API). */
export function formatShippingQuoteErrorMessage(message: string | null | undefined): string {
  const normalized = (message || "").trim();
  if (!normalized) return SHIPPING_ADDRESS_NOT_SUPPORTED_MESSAGE;
  if (/mã phường mới không tồn tại/i.test(normalized)) return SHIPPING_WARD_NOT_FOUND_MESSAGE;
  return normalized;
}

export const PAYOO_LOADING_IMAGE_SRC = "/image/checkout/checkout-loading.svg";

export const PAYOO_REDIRECT_DELAY_MS = 500;

export function preloadPayooLoadingImage(): void {
  if (typeof window === "undefined") return;
  const img = new window.Image();
  img.src = PAYOO_LOADING_IMAGE_SRC;
}

export function redirectToPayooPayment(paymentUrl: string, delayMs = PAYOO_REDIRECT_DELAY_MS): void {
  window.setTimeout(() => {
    window.location.href = paymentUrl;
  }, delayMs);
}
