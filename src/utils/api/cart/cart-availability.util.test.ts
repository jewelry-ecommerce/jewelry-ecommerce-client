import { describe, expect, it } from "vitest";
import { ProductAvailabilityCode } from "@/utils/api/product/product.enum";
import {
  CART_CHECKOUT_CTA_PAY_NOW,
  CART_CHECKOUT_CTA_PRE_ORDER,
  filterCartItemsByFulfillmentGroup,
  getCartFulfillmentComposition,
  getCartFulfillmentGroup,
  hasMixedRetailAndPreOrder,
  mapAvailabilityDisplayToCartItemStatus,
  resolveCartCheckoutCtaLabel,
  resolveLegacyCartItemStatus,
} from "./cart-availability.util";

describe("getCartFulfillmentGroup", () => {
  it("maps pre-order and retail", () => {
    expect(getCartFulfillmentGroup(ProductAvailabilityCode.PRE_ORDER)).toBe("PRE_ORDER");
    expect(getCartFulfillmentGroup(ProductAvailabilityCode.IN_STOCK)).toBe("RETAIL");
    expect(getCartFulfillmentGroup(undefined)).toBe("RETAIL");
    expect(getCartFulfillmentGroup(ProductAvailabilityCode.OUT_OF_STOCK)).toBeNull();
  });
});

describe("getCartFulfillmentComposition", () => {
  it("classifies retail, pre-order, mixed, and empty", () => {
    expect(getCartFulfillmentComposition([{ availabilityCode: ProductAvailabilityCode.IN_STOCK }])).toBe("RETAIL");
    expect(getCartFulfillmentComposition([{ availabilityCode: ProductAvailabilityCode.PRE_ORDER }])).toBe("PRE_ORDER");
    expect(
      getCartFulfillmentComposition([
        { availabilityCode: ProductAvailabilityCode.IN_STOCK },
        { availabilityCode: ProductAvailabilityCode.PRE_ORDER },
      ]),
    ).toBe("MIXED");
    expect(getCartFulfillmentComposition([])).toBe("EMPTY");
  });
});

describe("resolveCartCheckoutCtaLabel", () => {
  it("uses Đặt trước only for full pre-order cart", () => {
    expect(resolveCartCheckoutCtaLabel([{ availabilityCode: ProductAvailabilityCode.PRE_ORDER }])).toBe(CART_CHECKOUT_CTA_PRE_ORDER);
    expect(resolveCartCheckoutCtaLabel([{ availabilityCode: ProductAvailabilityCode.IN_STOCK }])).toBe(CART_CHECKOUT_CTA_PAY_NOW);
    expect(
      resolveCartCheckoutCtaLabel([
        { availabilityCode: ProductAvailabilityCode.IN_STOCK },
        { availabilityCode: ProductAvailabilityCode.PRE_ORDER },
      ]),
    ).toBe(CART_CHECKOUT_CTA_PAY_NOW);
  });
});

describe("hasMixedRetailAndPreOrder", () => {
  it("detects mixed selectable cart", () => {
    expect(
      hasMixedRetailAndPreOrder([
        { availabilityCode: ProductAvailabilityCode.IN_STOCK },
        { availabilityCode: ProductAvailabilityCode.PRE_ORDER },
      ]),
    ).toBe(true);
  });

  it("ignores disabled selection items", () => {
    expect(
      hasMixedRetailAndPreOrder([
        { availabilityCode: ProductAvailabilityCode.IN_STOCK },
        { availabilityCode: ProductAvailabilityCode.PRE_ORDER, disableSelection: true },
      ]),
    ).toBe(false);
  });

  it("supports onlySelected option", () => {
    expect(
      hasMixedRetailAndPreOrder(
        [
          { availabilityCode: ProductAvailabilityCode.IN_STOCK, selected: true },
          { availabilityCode: ProductAvailabilityCode.PRE_ORDER, selected: false },
        ],
        { onlySelected: true },
      ),
    ).toBe(false);

    expect(
      hasMixedRetailAndPreOrder(
        [
          { availabilityCode: ProductAvailabilityCode.IN_STOCK, selected: true },
          { availabilityCode: ProductAvailabilityCode.PRE_ORDER, selected: true },
        ],
        { onlySelected: true },
      ),
    ).toBe(true);
  });
});

describe("filterCartItemsByFulfillmentGroup", () => {
  it("keeps only matching fulfillment group", () => {
    const retail = { availabilityCode: ProductAvailabilityCode.IN_STOCK, id: "r" };
    const preOrder = { availabilityCode: ProductAvailabilityCode.PRE_ORDER, id: "p" };
    const outOfStock = { availabilityCode: ProductAvailabilityCode.OUT_OF_STOCK, id: "o" };

    expect(filterCartItemsByFulfillmentGroup([retail, preOrder, outOfStock], "RETAIL")).toEqual([retail]);
    expect(filterCartItemsByFulfillmentGroup([retail, preOrder, outOfStock], "PRE_ORDER")).toEqual([preOrder]);
  });
});

describe("mapAvailabilityDisplayToCartItemStatus", () => {
  it("maps badge and notes from BE display payload", () => {
    expect(
      mapAvailabilityDisplayToCartItemStatus(ProductAvailabilityCode.PRE_ORDER, {
        badge: {
          text: "Hàng đặt trước",
          textColor: "#B45309",
          backgroundColor: "#FEF3C7",
        },
        notes: [{ label: "Ngày dự kiến có hàng:", value: "15/07/2026" }],
      }),
    ).toEqual({
      label: "Hàng đặt trước",
      tone: "warning",
      textColor: "#B45309",
      backgroundColor: "#FEF3C7",
      notes: [{ label: "Thời gian mở bán dự kiến:", value: "15/07/2026" }],
    });
  });

  it("formats ISO expectedStockAt notes to Vietnam calendar date", () => {
    expect(
      mapAvailabilityDisplayToCartItemStatus(ProductAvailabilityCode.PRE_ORDER, {
        badge: {
          text: "Đặt trước",
          textColor: "#B45309",
          backgroundColor: "#FEF3C7",
        },
        notes: [{ label: "Ngày dự kiến có hàng:", value: "2026-08-12T17:00:00.000Z" }],
      })?.notes,
    ).toEqual([{ label: "Thời gian mở bán dự kiến:", value: "13/08/2026" }]);
  });

  it("prefers raw expectedStockAt ISO over DD/MM note from BE", () => {
    expect(
      mapAvailabilityDisplayToCartItemStatus(
        ProductAvailabilityCode.PRE_ORDER,
        {
          badge: {
            text: "Hàng đặt trước",
            textColor: "#B45309",
            backgroundColor: "#FEF3C7",
          },
          notes: [{ label: "Ngày dự kiến có hàng:", value: "12/08/2026" }],
        },
        "2026-08-12T17:00:00.000Z",
      )?.notes,
    ).toEqual([{ label: "Thời gian mở bán dự kiến:", value: "13/08/2026" }]);
  });

  it("keeps DD/MM note when no expectedStockAt ISO is provided", () => {
    expect(
      mapAvailabilityDisplayToCartItemStatus(ProductAvailabilityCode.PRE_ORDER, {
        badge: {
          text: "Hàng đặt trước",
          textColor: "#B45309",
          backgroundColor: "#FEF3C7",
        },
        notes: [{ label: "Ngày dự kiến có hàng:", value: "12/08/2026" }],
      })?.notes,
    ).toEqual([{ label: "Thời gian mở bán dự kiến:", value: "12/08/2026" }]);
  });
});

describe("resolveLegacyCartItemStatus", () => {
  it("returns warning status for discontinued items", () => {
    expect(resolveLegacyCartItemStatus({ isDiscontinued: true, isOutOfStock: false })).toEqual({
      label: "NGỪNG KINH DOANH",
      tone: "warning",
      helperText: "Sản phẩm này đã ngừng kinh doanh và không thể tạo đơn hàng.",
    });
  });

  it("returns error status for out-of-stock items", () => {
    expect(resolveLegacyCartItemStatus({ isDiscontinued: false, isOutOfStock: true })).toEqual({
      label: "Hết hàng",
      tone: "error",
      helperText: "Sản phẩm này hiện không có sẵn",
    });
  });

  it("returns in-stock status and quantity limit helper text for insufficient stock", () => {
    expect(
      resolveLegacyCartItemStatus({
        isDiscontinued: false,
        isOutOfStock: false,
        isInsufficientStock: true,
        availableStock: 1,
      }),
    ).toEqual({
      label: "Đang có hàng",
      tone: "success",
      helperText: "Số lượng trong kho chỉ còn 1 sản phẩm.",
    });
  });

  it("returns success status for in-stock items", () => {
    expect(resolveLegacyCartItemStatus({ isDiscontinued: false, isOutOfStock: false })).toEqual({
      label: "Đang có hàng",
      tone: "success",
    });
  });
});
