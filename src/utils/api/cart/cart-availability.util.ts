import type {
  CartApiItem,
  CartAvailabilityDisplay,
  CartItemStatus,
  CartItemStatusTone,
  CartViewItem,
} from "@/utils/api/cart/cart.interface";
import { ProductAvailabilityCode } from "@/utils/api/product/product.enum";
import { PRE_ORDER_EXPECTED_STOCK_LABEL } from "@/utils/constants/pre-order-badge.constant";
import { formatDate, toVietnamDisplayDate } from "@/utils/format";

export const MIXED_RETAIL_PREORDER_MESSAGE =
  "Không thể thanh toán chung Sản phẩm có sẵn và Sản phẩm Đặt trước. Vui lòng thanh toán tách biệt từng loại.";

export const CART_CHECKOUT_CTA_PRE_ORDER = "Đặt Trước";
export const CART_CHECKOUT_CTA_PAY_NOW = "Thanh Toán Ngay";

export type CartFulfillmentGroup = "RETAIL" | "PRE_ORDER";
export type CartFulfillmentComposition = "EMPTY" | "RETAIL" | "PRE_ORDER" | "MIXED";

type CartFulfillmentItem = Pick<CartViewItem, "availabilityCode" | "disableSelection" | "selected">;

export function getCartFulfillmentGroup(availabilityCode?: string | null): CartFulfillmentGroup | null {
  if (availabilityCode === ProductAvailabilityCode.PRE_ORDER) return "PRE_ORDER";
  if (availabilityCode === ProductAvailabilityCode.IN_STOCK || !availabilityCode) return "RETAIL";
  return null;
}

/** Thành phần fulfillment của các dòng đang xét (bỏ disableSelection; optional chỉ selected). */
export function getCartFulfillmentComposition(
  items: CartFulfillmentItem[],
  options?: { onlySelected?: boolean },
): CartFulfillmentComposition {
  let hasRetail = false;
  let hasPreOrder = false;

  for (const item of items) {
    if (item.disableSelection) continue;
    if (options?.onlySelected && !item.selected) continue;

    const group = getCartFulfillmentGroup(item.availabilityCode);
    if (group === "RETAIL") hasRetail = true;
    if (group === "PRE_ORDER") hasPreOrder = true;
  }

  if (!hasRetail && !hasPreOrder) return "EMPTY";
  if (hasRetail && hasPreOrder) return "MIXED";
  if (hasPreOrder) return "PRE_ORDER";
  return "RETAIL";
}

export function hasMixedRetailAndPreOrder(items: CartFulfillmentItem[], options?: { onlySelected?: boolean }): boolean {
  return getCartFulfillmentComposition(items, options) === "MIXED";
}

/** Lọc dòng giỏ theo nhóm fulfillment (RETAIL / PRE_ORDER). */
export function filterCartItemsByFulfillmentGroup<T extends Pick<CartViewItem, "availabilityCode">>(
  items: T[],
  group: CartFulfillmentGroup,
): T[] {
  return items.filter((item) => getCartFulfillmentGroup(item.availabilityCode) === group);
}

/**
 * CTA giỏ / mini-cart:
 * - full đặt trước → "Đặt Trước"
 * - full thường hoặc mix → "Thanh Toán Ngay" (mix: popup chọn nhóm khi checkout)
 */
export function resolveCartCheckoutCtaLabel(items: CartFulfillmentItem[], options?: { onlySelected?: boolean }): string {
  return getCartFulfillmentComposition(items, options) === "PRE_ORDER" ? CART_CHECKOUT_CTA_PRE_ORDER : CART_CHECKOUT_CTA_PAY_NOW;
}

function toneFromAvailabilityCode(code?: string | null): CartItemStatusTone {
  switch (code) {
    case ProductAvailabilityCode.PRE_ORDER:
      return "warning";
    case ProductAvailabilityCode.OUT_OF_STOCK:
      return "error";
    case ProductAvailabilityCode.DISCONTINUED:
      return "warning";
    case ProductAvailabilityCode.IN_STOCK:
    default:
      return "success";
  }
}

/** Lấy ISO expectedStockAt từ payload cart (nhiều chỗ BE có thể đặt). */
export function resolveCartExpectedStockAt(
  item: Pick<CartApiItem, "expectedStockAt" | "preOrder" | "availabilityDisplay" | "variation">,
): string | null {
  const candidates = [
    item.expectedStockAt,
    item.preOrder?.expectedStockAt,
    item.availabilityDisplay?.expectedStockAt,
    item.variation?.expectedStockAt,
    item.variation?.preOrder?.expectedStockAt,
  ];
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

function formatAvailabilityNoteValue(noteValue: string, expectedStockAt?: string | null): string {
  if (expectedStockAt?.trim()) {
    const fromIso = formatDate(expectedStockAt);
    if (fromIso) return fromIso;
  }
  return toVietnamDisplayDate(noteValue);
}

export function mapAvailabilityDisplayToCartItemStatus(
  availabilityCode: string | undefined,
  availabilityDisplay: CartAvailabilityDisplay | undefined | null,
  expectedStockAt?: string | null,
): CartItemStatus | undefined {
  if (!availabilityDisplay?.badge?.text) return undefined;

  return {
    label: availabilityDisplay.badge.text,
    tone: toneFromAvailabilityCode(availabilityCode),
    textColor: availabilityDisplay.badge.textColor,
    backgroundColor: availabilityDisplay.badge.backgroundColor,
    notes: availabilityDisplay.notes?.length
      ? availabilityDisplay.notes.map((note) => ({
          ...note,
          label: PRE_ORDER_EXPECTED_STOCK_LABEL,
          value: formatAvailabilityNoteValue(note.value, expectedStockAt),
        }))
      : undefined,
  };
}

export function resolveLegacyCartItemStatus(params: {
  isDiscontinued: boolean;
  isOutOfStock: boolean;
  isInsufficientStock?: boolean;
  availableStock?: number;
}): CartItemStatus {
  if (params.isDiscontinued) {
    return {
      label: "NGỪNG KINH DOANH",
      tone: "warning",
      helperText: "Sản phẩm này đã ngừng kinh doanh và không thể tạo đơn hàng.",
    };
  }

  if (params.isOutOfStock) {
    return {
      label: "Hết hàng",
      tone: "error",
      helperText: "Sản phẩm này hiện không có sẵn",
    };
  }

  if (params.isInsufficientStock) {
    return {
      label: "Đang có hàng",
      tone: "success",
      helperText:
        typeof params.availableStock === "number" && params.availableStock > 0
          ? `Số lượng trong kho chỉ còn ${params.availableStock} sản phẩm.`
          : "Số lượng trong giỏ hàng vượt quá số lượng tồn kho.",
    };
  }

  return {
    label: "Đang có hàng",
    tone: "success",
  };
}
