import { describe, expect, it } from "vitest";
import type { CartSetViewItem, CartViewItem } from "@/utils/api/cart/cart.interface";
import { CheckoutRequestLineType } from "@/utils/api/checkout/checkout.interface";
import { buildCheckoutItemsPayload, computeCartItemsSubtotal, getCheckoutItemsFromCart, getCheckoutScopeCount } from "./cart-checkout.util";

const createCartItem = (overrides: Partial<CartViewItem> = {}): CartViewItem => ({
  id: "item-1",
  productSlug: "product-1",
  name: "Test Product",
  image: { src: "/test.jpg", alt: "Test" },
  quantity: 2,
  unitPrice: 100_000,
  price: { current: "100.000đ" },
  selected: true,
  ...overrides,
});

describe("buildCheckoutItemsPayload", () => {
  it("maps variation id and quantity", () => {
    expect(buildCheckoutItemsPayload([createCartItem({ id: "v-1", quantity: 3 })])).toEqual([
      { type: CheckoutRequestLineType.LOOSE, variationId: "v-1", quantity: 3, utm_data: null },
    ]);
  });

  it("includes selected packaging relation ids when present", () => {
    expect(
      buildCheckoutItemsPayload([
        createCartItem({
          selectedPackagingRelationIds: ["pkg-1", "", "pkg-2"],
        }),
      ]),
    ).toEqual([
      {
        type: CheckoutRequestLineType.LOOSE,
        variationId: "item-1",
        quantity: 2,
        selectedPackagingRelationIds: ["pkg-1", "pkg-2"],
        utm_data: null,
      },
    ]);
  });

  it("includes utm_data from cart line item", () => {
    const utmData = {
      utm_source: "facebook",
      utm_medium: "cpc",
      utm_campaign: "summer_sale",
      utm_term: null,
      utm_content: null,
      utm_click_time: "2026-06-19T07:00:00.000Z",
    };

    expect(buildCheckoutItemsPayload([createCartItem({ utmData })])).toEqual([
      { type: CheckoutRequestLineType.LOOSE, variationId: "item-1", quantity: 2, utm_data: utmData },
    ]);
  });

  it("includes the Cart line identity when checking out a Set", () => {
    const setComponent = createCartItem({ id: "variation-1", variationId: "variation-1" });
    const setItem: CartSetViewItem = {
      ...createCartItem({ id: "set-1" }),
      lineId: "line-1",
      setId: "set-1",
      setComponents: [setComponent],
      isSet: true,
    };

    expect(buildCheckoutItemsPayload([setItem])).toEqual([
      {
        type: CheckoutRequestLineType.SET,
        lineId: "line-1",
        setId: "set-1",
        quantity: 2,
        components: [{ variationId: "variation-1", utm_data: null }],
      },
    ]);
  });

  it("does not build a checkout payload for a Set without a line identity", () => {
    const setItem: CartSetViewItem = {
      ...createCartItem({ id: "set-1" }),
      lineId: null,
      setId: "set-1",
      setComponents: [createCartItem({ id: "variation-1", variationId: "variation-1" })],
      isSet: true,
    };

    expect(buildCheckoutItemsPayload([setItem])).toEqual([]);
  });
});

describe("getCheckoutItemsFromCart", () => {
  it("selected-eligible returns only selected eligible items", () => {
    const items = [
      createCartItem({ id: "a", selected: true }),
      createCartItem({ id: "b", selected: false }),
      createCartItem({ id: "c", selected: true, isValid: false, reason: "OUT_OF_STOCK" }),
    ];

    expect(getCheckoutItemsFromCart(items, "selected-eligible").map((item) => item.id)).toEqual(["a"]);
  });

  it("all-eligible returns all eligible items regardless of selected", () => {
    const items = [
      createCartItem({ id: "a", selected: false }),
      createCartItem({ id: "b", selected: true, isValid: false, reason: "OUT_OF_STOCK" }),
      createCartItem({ id: "c", selected: false }),
    ];

    expect(getCheckoutItemsFromCart(items, "all-eligible").map((item) => item.id)).toEqual(["a", "c"]);
  });

  it("treats pre-order lines as eligible even when BE marks OUT_OF_STOCK", () => {
    const items = [
      createCartItem({
        id: "preorder",
        selected: true,
        availabilityCode: "PRE_ORDER",
        isValid: false,
        reason: "OUT_OF_STOCK",
        maxQuantity: 999,
        status: { label: "Đặt trước", tone: "warning" },
      }),
    ];

    expect(getCheckoutItemsFromCart(items, "selected-eligible").map((item) => item.id)).toEqual(["preorder"]);
  });

  it("excludes a Set without a line identity", () => {
    const setItem: CartSetViewItem = {
      ...createCartItem({ id: "set-1" }),
      lineId: null,
      setId: "set-1",
      setComponents: [createCartItem({ id: "variation-1", variationId: "variation-1" })],
      isSet: true,
    };

    expect(getCheckoutItemsFromCart([setItem], "selected-eligible")).toEqual([]);
  });
});

describe("getCheckoutScopeCount", () => {
  it("counts selected items for selected-eligible mode", () => {
    const items = [createCartItem({ selected: true }), createCartItem({ id: "b", selected: false })];
    expect(getCheckoutScopeCount(items, "selected-eligible")).toBe(1);
  });

  it("counts all items for all-eligible mode", () => {
    const items = [createCartItem({ selected: true }), createCartItem({ id: "b", selected: false })];
    expect(getCheckoutScopeCount(items, "all-eligible")).toBe(2);
  });
});

describe("computeCartItemsSubtotal", () => {
  it("sums unitPrice * quantity", () => {
    const items = [createCartItem({ unitPrice: 50_000, quantity: 2 }), createCartItem({ id: "b", unitPrice: 30_000, quantity: 1 })];

    expect(computeCartItemsSubtotal(items)).toBe(130_000);
  });

  it("reflects discounted unitPrice when mapper sets it to effective price", () => {
    const items = [
      createCartItem({ unitPrice: 100_000, quantity: 2 }), // discounted effective price
      createCartItem({ id: "b", unitPrice: 150_000, quantity: 1 }), // full price
    ];

    expect(computeCartItemsSubtotal(items)).toBe(350_000); // 100k*2 + 150k*1
  });

  it("handles empty items array", () => {
    expect(computeCartItemsSubtotal([])).toBe(0);
  });
});
