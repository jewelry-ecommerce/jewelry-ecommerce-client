import { describe, expect, it, vi } from "vitest";
import type { CartApiItem } from "@/utils/api/cart/cart.interface";
import type { CustomerDisplayPrice } from "@/utils/customer-display-price.util";

vi.mock("@/utils/config/tenant-branding.util", () => ({
  resolveProductDefaultImageSrc: () => "/image/default.jpg",
}));

const { isCartItemCheckoutEligible, isCartSetViewItem, mapCartApiResponseToViewItems } = await import("./cart.util");

const createBaseItem = (overrides: Partial<CartApiItem> = {}): CartApiItem => ({
  id: "v-1",
  found: true,
  name: "Test Product",
  slug: "test-product",
  skuCode: "TEST-001",
  status: "ACTIVE",
  productId: "p-1",
  compareAtPriceAfterTaxMinor: 200_000,
  sellingPriceAfterTaxMinor: 150_000,
  stock: 10,
  stockStatus: "IN_STOCK",
  product: {
    id: "p-1",
    name: "Test Product",
    slug: "test-product",
    image: "/img.jpg",
    imageHover: "/img-hover.jpg",
    status: "ACTIVE",
    categoryId: "cat-1",
    categoryName: "Category",
    brandName: "Brand",
  },
  quantity: 2,
  ...overrides,
});

const createSetDisplayPrice = (overrides: Partial<CustomerDisplayPrice> = {}): CustomerDisplayPrice => ({
  currency: "VND",
  compareAtPriceAfterTaxMinor: 200_000,
  sellingPriceAfterTaxMinor: 150_000,
  discountPercent: 25,
  hasDiscount: true,
  ...overrides,
});

describe("mapCartApiResponseToViewItems", () => {
  it("returns empty array for empty response", () => {
    expect(mapCartApiResponseToViewItems([])).toEqual([]);
  });

  // set term
  it("preserves the key-product marker returned for a Set component", () => {
    const items = mapCartApiResponseToViewItems([
      {
        setId: "set-1",
        code: "SET-001",
        name: "Test Set",
        quantity: 1,
        subtotalMinor: 150_000,
        customerDisplayPrice: createSetDisplayPrice(),
        isValid: true,
        components: [createBaseItem({ isKey: true })],
      },
    ]);

    expect(items[0].setComponents?.[0].isKey).toBe(true);
  });

  it("preserves Set component identity for later cart mutations", () => {
    const items = mapCartApiResponseToViewItems([
      {
        lineId: "line-1",
        setId: "set-1",
        code: "SET-001",
        name: "Test Set",
        quantity: 1,
        subtotalMinor: 150_000,
        customerDisplayPrice: createSetDisplayPrice(),
        isValid: true,
        components: [
          createBaseItem({
            id: "variation-1",
            variationId: "variation-1",
            setItemId: "set-item-1",
          }),
        ],
      },
    ]);

    expect(items[0].setComponents?.[0]).toMatchObject({
      id: "variation-1",
      variationId: "variation-1",
      setItemId: "set-item-1",
    });
  });

  it("preserves the logical Set line identity returned by Cart", () => {
    const items = mapCartApiResponseToViewItems([
      {
        lineId: "line-1",
        setId: "set-1",
        code: "SET-001",
        name: "Test Set",
        quantity: 1,
        subtotalMinor: 150_000,
        customerDisplayPrice: createSetDisplayPrice(),
        isValid: true,
        components: [createBaseItem()],
      },
    ]);

    expect(isCartSetViewItem(items[0]) && items[0].lineId).toBe("line-1");
    expect(items[0].id).toBe("line-1");
  });

  it("limits a Set by its component with the lowest available stock", () => {
    const items = mapCartApiResponseToViewItems([
      {
        setId: "set-1",
        code: "SET-001",
        name: "Test Set",
        quantity: 1,
        subtotalMinor: 150_000,
        customerDisplayPrice: createSetDisplayPrice(),
        isValid: true,
        components: [
          createBaseItem({ stock: 8, availableStock: 8 }),
          createBaseItem({ id: "variation-2", stock: 148, availableStock: 148 }),
          createBaseItem({ id: "variation-3", stock: 1001, availableStock: 1001 }),
        ],
      },
    ]);

    expect(items[0].maxQuantity).toBe(8);
  });

  it("maps an invalid Set state from its components and blocks checkout", () => {
    const items = mapCartApiResponseToViewItems([
      {
        lineId: "line-1",
        setId: "set-1",
        code: "SET-001",
        name: "Test Set",
        quantity: 2,
        subtotalMinor: 150_000,
        customerDisplayPrice: createSetDisplayPrice(),
        isValid: false,
        components: [
          createBaseItem({
            isValid: false,
            reason: "INSUFFICIENT_STOCK",
            stock: 1,
            quantity: 2,
          }),
        ],
      },
    ]);

    expect(items[0]).toMatchObject({
      isValid: false,
      reason: "INSUFFICIENT_STOCK",
      disableSelection: true,
      disableQuantityControl: false,
    });
    expect(isCartItemCheckoutEligible(items[0])).toBe(false);
  });

  it("keeps an out-of-stock Set removable while blocking checkout", () => {
    const items = mapCartApiResponseToViewItems([
      {
        lineId: "line-1",
        setId: "set-1",
        code: "SET-001",
        name: "Test Set",
        quantity: 1,
        subtotalMinor: 150_000,
        customerDisplayPrice: createSetDisplayPrice(),
        isValid: false,
        components: [createBaseItem({ isValid: false, reason: "OUT_OF_STOCK", stock: 0, stockStatus: "OUT_OF_STOCK" })],
      },
    ]);

    expect(items[0]).toMatchObject({
      isValid: false,
      stockStatus: "OUT_OF_STOCK",
      disableSelection: false,
      disableQuantityControl: false,
    });
    expect(isCartItemCheckoutEligible(items[0])).toBe(false);
  });

  it("uses the Set line display price without summing component prices", () => {
    const items = mapCartApiResponseToViewItems([
      {
        lineId: "line-1",
        setId: "set-1",
        code: "SET-001",
        name: "Test Set",
        quantity: 2,
        subtotalMinor: 16_900_000,
        customerDisplayPrice: createSetDisplayPrice({
          sellingPriceAfterTaxMinor: 15_210_000,
          compareAtPriceAfterTaxMinor: 16_900_000,
          discountPercent: 10,
        }),
        isValid: true,
        components: [
          createBaseItem({
            customerDisplayPrice: {
              currency: "VND",
              sellingPriceAfterTaxMinor: 100_000,
              compareAtPriceAfterTaxMinor: 120_000,
              discountPercent: 17,
              hasDiscount: true,
            },
          }),
          createBaseItem({
            id: "v-2",
            customerDisplayPrice: {
              currency: "VND",
              sellingPriceAfterTaxMinor: 200_000,
              compareAtPriceAfterTaxMinor: 240_000,
              discountPercent: 17,
              hasDiscount: true,
            },
          }),
        ],
      },
    ]);

    expect(items[0]).toMatchObject({
      unitPrice: 15_210_000,
      customerDisplayPrice: {
        sellingPriceAfterTaxMinor: 15_210_000,
        compareAtPriceAfterTaxMinor: 16_900_000,
      },
      price: {
        current: "15.210.000đ",
        original: "16.900.000đ",
      },
    });
    expect(items[0].lineSellingSubtotalMinor).toBeUndefined();
  });

  it("preserves component stock status for Set presentation", () => {
    const items = mapCartApiResponseToViewItems([
      {
        setId: "set-1",
        code: "SET-001",
        name: "Test Set",
        quantity: 1,
        subtotalMinor: 150_000,
        customerDisplayPrice: createSetDisplayPrice(),
        isValid: false,
        components: [createBaseItem({ stock: 0, stockStatus: "OUT_OF_STOCK" })],
      },
    ]);

    expect(items[0].setComponents?.[0].stockStatus).toBe("OUT_OF_STOCK");
  });

  it("joins all non-size cart attributes into details", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        attributes: [
          { attributeId: "1", attributeName: "Nguyên liệu", attributeCode: "NL", value: "925", valueCode: "AG2" },
          { attributeId: "2", attributeName: "Màu đá", attributeCode: "MD", value: "Đỏ", valueCode: "RED" },
          { attributeId: "3", attributeName: "Loại đá", attributeCode: "LD", value: "Kim cương", valueCode: "DIA" },
        ],
      }),
    ]);

    expect(items[0].details).toBe("925, Đỏ, Kim cương");
    expect(items[0].sizeLabel).toBe("");
  });

  it("puts size attribute into sizeLabel and excludes it from details", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        attributes: [
          { attributeId: "1", attributeName: "Nguyên liệu", attributeCode: "NL", value: "925", valueCode: "AG2" },
          { attributeId: "2", attributeName: "Size", attributeCode: "SIZE", value: "M", valueCode: "M" },
        ],
      }),
    ]);

    expect(items[0].details).toBe("925");
    expect(items[0].sizeLabel).toBe("M");
  });

  it("uses sellingPriceAfterTaxMinor as effective price when no promotion fields", () => {
    const items = mapCartApiResponseToViewItems([createBaseItem()]);

    expect(items).toHaveLength(1);
    expect(items[0].unitPrice).toBe(150_000);
    expect(items[0].price.current).toBe("150.000đ");
    expect(items[0].price.original).toBe("200.000đ");
    expect(items[0].price.discountLabel).toBe("-25%");
  });

  it("uses customerDisplayPrice as-is without recomputing compareAt or discountPercent", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        compareAtPriceAfterTaxMinor: 899_999,
        sellingPriceAfterTaxMinor: 299_789,
        displayPriceAfterTaxMinor: 299_789,
        customerDisplayPrice: {
          currency: "VND",
          compareAtPriceAfterTaxMinor: null,
          sellingPriceAfterTaxMinor: 899_999,
          discountPercent: null,
          hasDiscount: false,
        },
      }),
    ]);

    expect(items[0].price.current).toBe("899.999đ");
    expect(items[0].price.original).toBeUndefined();
    expect(items[0].price.discountPercent).toBeUndefined();
    expect(items[0].price.discountLabel).toBeUndefined();
    expect(items[0].unitPrice).toBe(899_999);
  });

  it("shows strikethrough and tag only from customerDisplayPrice fields", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        customerDisplayPrice: {
          currency: "VND",
          sellingPriceAfterTaxMinor: 299_789,
          compareAtPriceAfterTaxMinor: 899_999,
          discountPercent: 67,
          hasDiscount: true,
        },
      }),
    ]);

    expect(items[0].price.current).toBe("299.789đ");
    expect(items[0].price.original).toBe("899.999đ");
    expect(items[0].price.discountPercent).toBe(67);
    expect(items[0].price.discountLabel).toBe("-67%");
    expect(items[0].price.showDiscountPercent).toBeUndefined();
  });

  it("passes cart line pricePresentation.showDiscountPercent onto the view item", () => {
    const hidden = mapCartApiResponseToViewItems([
      createBaseItem({
        customerDisplayPrice: {
          currency: "VND",
          sellingPriceAfterTaxMinor: 299_789,
          compareAtPriceAfterTaxMinor: 899_999,
          discountPercent: 67,
          hasDiscount: true,
        },
        pricePresentation: { showDiscountPercent: false },
      }),
    ]);
    const visible = mapCartApiResponseToViewItems([
      createBaseItem({
        customerDisplayPrice: {
          currency: "VND",
          sellingPriceAfterTaxMinor: 299_789,
          compareAtPriceAfterTaxMinor: 899_999,
          discountPercent: 67,
          hasDiscount: true,
        },
        pricePresentation: { showDiscountPercent: true },
      }),
    ]);

    expect(hidden[0].price.showDiscountPercent).toBe(false);
    expect(visible[0].price.showDiscountPercent).toBe(true);
  });

  it("hides discount tag when discountPercent is null but keeps compareAt from API", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        customerDisplayPrice: {
          currency: "VND",
          sellingPriceAfterTaxMinor: 299_789,
          compareAtPriceAfterTaxMinor: 899_999,
          discountPercent: null,
          hasDiscount: true,
        },
      }),
    ]);

    expect(items[0].price.current).toBe("299.789đ");
    expect(items[0].price.original).toBe("899.999đ");
    expect(items[0].price.discountPercent).toBeUndefined();
    expect(items[0].price.discountLabel).toBeUndefined();
  });

  it("uses displayPriceAfterTaxMinor as effective price when promotion discount exists", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        displayPriceAfterTaxMinor: 100_000,
        discountedSellingPriceAfterTaxMinor: 100_000,
        unitPromotionDiscountMinor: 50_000,
        lineItemDiscountAmountMinor: 100_000,
      }),
    ]);

    expect(items).toHaveLength(1);
    expect(items[0].unitPrice).toBe(100_000);
    expect(items[0].price.current).toBe("100.000đ");
    // Original shows compare-at price when it's higher than effective
    expect(items[0].price.original).toBe("200.000đ");
    expect(items[0].price.discountLabel).toBe("-50%");
  });

  it("shows list price as original when promotion discount exists but compare-at is not higher", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        compareAtPriceAfterTaxMinor: 120_000, // lower than sellingPriceAfterTaxMinor
        sellingPriceAfterTaxMinor: 150_000,
        displayPriceAfterTaxMinor: 100_000,
        unitPromotionDiscountMinor: 50_000,
      }),
    ]);

    expect(items[0].unitPrice).toBe(100_000);
    // Current resolver keeps compare-at as the reference price whenever it is above the effective display price.
    expect(items[0].price.original).toBe("120.000đ");
    expect(items[0].price.discountLabel).toBe("-17%");
  });

  it("uses discountedSellingPriceAfterTaxMinor when displayPriceAfterTaxMinor is missing", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        displayPriceAfterTaxMinor: undefined,
        discountedSellingPriceAfterTaxMinor: 80_000,
        unitPromotionDiscountMinor: 70_000,
      }),
    ]);

    expect(items[0].unitPrice).toBe(80_000);
    expect(items[0].price.current).toBe("80.000đ");
    expect(items[0].price.original).toBe("200.000đ");
  });

  it("preserves no-discount behavior when displayPriceAfterTaxMinor equals selling price", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        displayPriceAfterTaxMinor: 150_000,
        discountedSellingPriceAfterTaxMinor: null,
        unitPromotionDiscountMinor: 0,
        lineItemDiscountAmountMinor: 0,
        promotionWarnings: [],
        pricingWarning: null,
      }),
    ]);

    expect(items[0].unitPrice).toBe(150_000);
    expect(items[0].price.current).toBe("150.000đ");
    expect(items[0].price.original).toBe("200.000đ");
    expect(items[0].price.discountLabel).toBe("-25%");
  });

  it("preserves warning fields from API response", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        promotionWarnings: ["Promotion 1 target not matched"],
        pricingWarning: "Pricing service partially failed",
        displayPriceAfterTaxMinor: 150_000,
      }),
    ]);

    expect(items[0].promotionWarnings).toEqual(["Promotion 1 target not matched"]);
    expect(items[0].pricingWarning).toBe("Pricing service partially failed");
  });

  it("handles displayPriceAfterTaxMinor zero or undefined correctly", () => {
    // displayPriceAfterTaxMinor undefined -> should fall back to sellingPriceAfterTaxMinor
    const itemsNoDisplay = mapCartApiResponseToViewItems([createBaseItem({ displayPriceAfterTaxMinor: undefined })]);
    expect(itemsNoDisplay[0].unitPrice).toBe(150_000);

    // displayPriceAfterTaxMinor 0 -> uses 0 as effective price
    const itemsZeroDisplay = mapCartApiResponseToViewItems([
      createBaseItem({
        displayPriceAfterTaxMinor: 0,
        discountedSellingPriceAfterTaxMinor: 0,
      }),
    ]);
    expect(itemsZeroDisplay[0].unitPrice).toBe(0);
    expect(itemsZeroDisplay[0].price.current).toBe("0đ");
  });

  it("sets originalUnitPrice on CartViewItem when there is a higher reference price", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        displayPriceAfterTaxMinor: 100_000,
        unitPromotionDiscountMinor: 50_000,
      }),
    ]);

    expect(items[0].originalUnitPrice).toBe(200_000);
  });

  it("leaves originalUnitPrice undefined when no higher reference price exists", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        compareAtPriceAfterTaxMinor: 100_000,
        sellingPriceAfterTaxMinor: 100_000,
      }),
    ]);

    expect(items[0].originalUnitPrice).toBeUndefined();
    expect(items[0].price.original).toBeUndefined();
    expect(items[0].price.discountLabel).toBeUndefined();
  });

  it("passes unitPromotionDiscount and lineItemDiscountAmount through", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        displayPriceAfterTaxMinor: 100_000,
        unitPromotionDiscountMinor: 50_000,
        lineItemDiscountAmountMinor: 100_000,
      }),
    ]);

    expect(items[0].unitPromotionDiscount).toBe(50_000);
    expect(items[0].lineItemDiscountAmount).toBe(100_000);
  });

  it("preserves lineSellingSubtotalMinor and lineDisplaySubtotalMinor", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        lineSellingSubtotalMinor: 300_000,
        lineDisplaySubtotalMinor: 200_000,
      }),
    ]);

    expect(items[0].lineSellingSubtotalMinor).toBe(300_000);
    expect(items[0].lineDisplaySubtotalMinor).toBe(200_000);
  });

  it("leaves line subtotal fields undefined when backend does not provide them", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        lineSellingSubtotalMinor: undefined,
        lineDisplaySubtotalMinor: undefined,
      }),
    ]);

    expect(items[0].lineSellingSubtotalMinor).toBeUndefined();
    expect(items[0].lineDisplaySubtotalMinor).toBeUndefined();
  });

  it("keeps out-of-stock items selectable for bulk removal", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        isValid: false,
        reason: "OUT_OF_STOCK",
        stock: 0,
        stockStatus: "OUT_OF_STOCK",
      }),
    ]);

    expect(items[0].disableSelection).toBe(false);
    expect(items[0].disableQuantityControl).toBe(true);
    expect(items[0].status?.label).toBe("Hết hàng");
  });

  it("keeps zero-stock items selectable when stock status is OUT_OF_STOCK", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        stock: 0,
        stockStatus: "OUT_OF_STOCK",
      }),
    ]);

    expect(items[0].disableSelection).toBe(false);
    expect(items[0].disableQuantityControl).toBe(true);
  });

  it("maps availabilityDisplay badge and notes from BE", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        availabilityCode: "PRE_ORDER",
        stock: 0,
        stockStatus: "OUT_OF_STOCK",
        availabilityDisplay: {
          badge: {
            text: "Hàng đặt trước",
            textColor: "#B45309",
            backgroundColor: "#FEF3C7",
          },
          notes: [{ label: "Ngày dự kiến có hàng:", value: "15/07/2026" }],
        },
      }),
    ]);

    expect(items[0].availabilityCode).toBe("PRE_ORDER");
    expect(items[0].disableQuantityControl).toBe(false);
    expect(items[0].maxQuantity).toBe(999);
    expect(items[0].status).toEqual({
      label: "Hàng đặt trước",
      tone: "warning",
      textColor: "#B45309",
      backgroundColor: "#FEF3C7",
      notes: [{ label: "Thời gian mở bán dự kiến:", value: "15/07/2026" }],
    });
  });

  it("keeps pre-order selectable when BE marks line invalid OUT_OF_STOCK", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        availabilityCode: "PRE_ORDER",
        isValid: false,
        reason: "OUT_OF_STOCK",
        stock: 0,
        stockStatus: "OUT_OF_STOCK",
      }),
    ]);

    expect(items[0].disableSelection).toBe(false);
    expect(items[0].disableQuantityControl).toBe(false);
    expect(items[0].maxQuantity).toBe(999);
  });

  it("keeps non-out-of-stock invalid items unselectable", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        isValid: false,
        reason: "SOME_OTHER_REASON",
        stock: 10,
        stockStatus: "IN_STOCK",
      }),
    ]);

    expect(items[0].disableSelection).toBe(true);
  });

  it("handles INSUFFICIENT_STOCK with helperText warning while keeping in-stock status", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        id: "01a00ec3-0993-754b-90fc-ffa78e5a13ac",
        isValid: false,
        reason: "INSUFFICIENT_STOCK",
        stock: 1,
        availableStock: 1,
        stockStatus: "IN_STOCK",
        quantity: 2,
      }),
    ]);

    expect(items[0].disableSelection).toBe(true);
    expect(items[0].disableQuantityControl).toBe(false);
    expect(items[0].maxQuantity).toBe(1);
    expect(items[0].status).toEqual({
      label: "Đang có hàng",
      tone: "success",
      helperText: "Số lượng trong kho chỉ còn 1 sản phẩm.",
    });
  });

  it("warns when cart quantity exceeds available stock even without explicit reason", () => {
    const items = mapCartApiResponseToViewItems([
      createBaseItem({
        stock: 2,
        quantity: 5,
        stockStatus: "IN_STOCK",
      }),
    ]);

    expect(items[0].disableSelection).toBe(true);
    expect(items[0].status).toEqual({
      label: "Đang có hàng",
      tone: "success",
      helperText: "Số lượng trong kho chỉ còn 2 sản phẩm.",
    });
  });
});

const { buildPostCartLine, getCartAddLimitError, getCartVariationMergeLimitError, mapViewItemToPostLine } = await import("./cart.util");

describe("buildPostCartLine", () => {
  it("builds a POST line with absolute quantity", () => {
    expect(buildPostCartLine({ variationId: "var-1", quantity: 8 })).toEqual({
      variationId: "var-1",
      quantity: 8,
    });
  });

  it("includes packaging ids when provided", () => {
    expect(
      buildPostCartLine({
        variationId: "var-1",
        quantity: 2,
        selectedPackagingRelationIds: ["pkg-1", "", "pkg-2"],
      }),
    ).toEqual({
      variationId: "var-1",
      quantity: 2,
      selectedPackagingRelationIds: ["pkg-1", "pkg-2"],
    });
  });

  it("omits packaging field when empty", () => {
    expect(
      buildPostCartLine({
        variationId: "var-1",
        quantity: 0,
        selectedPackagingRelationIds: [],
      }),
    ).toEqual({
      variationId: "var-1",
      quantity: 0,
    });
  });
});

describe("mapViewItemToPostLine", () => {
  it("maps cart view item to POST line with item quantity", () => {
    const items = mapCartApiResponseToViewItems([createBaseItem({ quantity: 5 })]);
    expect(mapViewItemToPostLine(items[0])).toEqual({
      variationId: "v-1",
      quantity: 5,
    });
  });

  it("allows overriding quantity for delete or absolute updates", () => {
    const items = mapCartApiResponseToViewItems([createBaseItem({ quantity: 5 })]);
    expect(mapViewItemToPostLine(items[0], 0)).toEqual({
      variationId: "v-1",
      quantity: 0,
    });
  });
});

describe("getCartAddLimitError", () => {
  it("blocks retail items with maxQuantity 0", () => {
    expect(getCartAddLimitError(undefined, 1, { maxQuantity: 0 })).toEqual({
      toastMessage: "Sản phẩm này hiện đã hết hàng.",
    });
  });

  it("allows pre-order items even when maxQuantity is 0", () => {
    expect(
      getCartAddLimitError(undefined, 1, {
        maxQuantity: 0,
        availabilityCode: "PRE_ORDER",
      }),
    ).toBeNull();
  });
});

describe("getCartVariationMergeLimitError", () => {
  it("blocks retail merge when target stock is 0", () => {
    expect(getCartVariationMergeLimitError(0, 0, 1)).toEqual({
      toastMessage: "Bạn đã có tối đa 0 sản phẩm trong giỏ hàng. Không thể đổi sang sản phẩm này vì sẽ vượt qua giới hạn mua hàng của bạn.",
    });
  });

  it("blocks retail merge when combined qty exceeds targetStock even if cart maxQuantity is higher", () => {
    expect(
      getCartVariationMergeLimitError(5, 4, 3, {
        maxQuantity: 10,
      }),
    ).toEqual({
      toastMessage: "Bạn đã có tối đa 4 sản phẩm trong giỏ hàng. Không thể đổi sang sản phẩm này vì sẽ vượt qua giới hạn mua hàng của bạn.",
    });
  });

  it("allows pre-order variation update when stock is 0", () => {
    expect(
      getCartVariationMergeLimitError(0, 0, 1, {
        availabilityCode: "PRE_ORDER",
        maxQuantity: 0,
      }),
    ).toBeNull();
  });

  it("still blocks pre-order merge when quantity exceeds resolved max", () => {
    expect(
      getCartVariationMergeLimitError(0, 2, 2, {
        availabilityCode: "PRE_ORDER",
        maxQuantity: 3,
      }),
    ).toEqual({
      toastMessage: "Bạn đã có tối đa 2 sản phẩm trong giỏ hàng. Không thể đổi sang sản phẩm này vì sẽ vượt qua giới hạn mua hàng của bạn.",
    });
  });
});
