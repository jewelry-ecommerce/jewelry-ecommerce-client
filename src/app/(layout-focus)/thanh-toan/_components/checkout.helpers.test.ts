import { describe, expect, it } from "vitest";
import {
  buildCheckoutPricingContextPayload,
  buildPromotionVoucherCheckoutContext,
  formatShippingQuoteErrorMessage,
  enrichCheckoutSessionItemsWithCartVariants,
  enrichCheckoutSessionItemsWithVariantFallbacks,
  hasCheckoutItemVariantData,
  resolveCheckoutItemQuotaSplitNote,
  resolveCheckoutItemVariantLines,
  resolveCanonicalCheckoutSummary,
  resolveCheckoutPricingErrorModal,
  resolveCheckoutPriceChangeActions,
  resolveCheckoutPriceChangeCtaLabel,
  resolveCheckoutPriceChangeDetails,
  resolveCheckoutDisplayQuantity,
  isAcceptPriceChangeAction,
  isReviewPriceChangeAction,
} from "./checkout.helpers";
import type { SelectedCheckoutVoucher } from "./checkout-voucher/checkout-voucher.mapper";
import { CheckoutRequestLineType, type CheckoutSession, type CheckoutSessionItem } from "@/utils/api/checkout/checkout.interface";

const selectedVouchers: SelectedCheckoutVoucher[] = [
  {
    voucherCodeId: "voucher-1",
    code: "SAVE50",
    codeMask: "SAVE50",
    title: "Save 50k",
  },
];

const checkoutSessionItem: CheckoutSessionItem = {
  id: "item-1",
  variationId: "variation-1",
  productId: "product-1",
  productName: "Product 1",
  variationName: "Variant 1",
  skuCode: "SKU-1",
  image: "/image.png",
  unitPrice: 120000,
  salePrice: 100000,
  categoryIds: ["cat-1"],
  collectionIds: ["coll-1"],
  quantity: 2,
  lineTotal: 200000,
  discountAmount: 15000,
  finalAmount: 185000,
};

const checkoutSession: CheckoutSession = {
  checkoutSessionId: "session-1",
  consentThirdPartySharing: false,
  totalAmount: 0,
  couponCodes: ["SAVE50"],
  items: [checkoutSessionItem],
};

describe("checkout.helpers canonical pricing", () => {
  it("counts a Set as one logical line quantity in a mixed checkout", () => {
    expect(
      resolveCheckoutDisplayQuantity([
        checkoutSessionItem,
        {
          type: CheckoutRequestLineType.SET,
          lineId: "set-line-1",
          setId: "set-1",
          quantity: 2,
          components: [checkoutSessionItem],
        },
      ]),
    ).toBe(4);
  });

  it("renders line-only discount as 230000 / 0 / 230000", () => {
    const summary = resolveCanonicalCheckoutSummary(
      {
        subtotal: 230000,
        shippingFee: 0,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: 230000,
        linePromotionSpend: 20000,
        cartPromotionSpend: 0,
        totalPromotionSpend: 20000,
      },
      0,
    );

    expect(summary).toMatchObject({
      subtotalMinor: 230000,
      cartPromotionDiscountMinor: 0,
      canonicalGrandTotalMinor: 230000,
      finalTotalMinor: 230000,
    });
  });

  it("renders line plus cart voucher as 230000 / 50000 / 180000 without double subtraction", () => {
    const summary = resolveCanonicalCheckoutSummary(
      {
        subtotal: 230000,
        shippingFee: 0,
        discountTotal: 50000,
        taxTotal: 0,
        grandTotal: 180000,
        linePromotionSpend: 20000,
        cartPromotionSpend: 50000,
        totalPromotionSpend: 70000,
      },
      0,
    );

    expect(summary).toMatchObject({
      subtotalMinor: 230000,
      cartPromotionDiscountMinor: 50000,
      canonicalGrandTotalMinor: 180000,
      finalTotalMinor: 180000,
    });
  });

  it("builds voucher repricing payload with selected validated coupon codes and shipping context", () => {
    expect(buildCheckoutPricingContextPayload(selectedVouchers, "COD", 15000, [], "GHN", 53321)).toEqual({
      couponCodes: ["SAVE50"],
      paymentMethod: "COD",
      shippingCarrier: "GHN",
      carrierServiceId: 53321,
    });
  });

  it("omits paymentMethod from pricing-context payload when empty (pre-order lần 1)", () => {
    expect(buildCheckoutPricingContextPayload(selectedVouchers, undefined, 15000, [], "GHN", 53321)).toEqual({
      couponCodes: ["SAVE50"],
      shippingCarrier: "GHN",
      carrierServiceId: 53321,
    });
    expect(buildCheckoutPricingContextPayload(selectedVouchers, "   ", 0)).toEqual({
      couponCodes: ["SAVE50"],
    });
  });

  it("builds cart-aware voucher checkout context from the checkout session", () => {
    expect(
      buildPromotionVoucherCheckoutContext(checkoutSession, selectedVouchers, {
        customerId: "customer-1",
        segmentIds: ["segment-a", " segment-a ", "segment-b"],
      }),
    ).toEqual({
      customer: {
        customerId: "customer-1",
        segmentIds: ["segment-a", "segment-b"],
      },
      cart: {
        cartId: "session-1",
        checkoutSessionId: "session-1",
      },
      lines: [
        {
          lineId: "item-1",
          skuId: "variation-1",
          quantity: 2,
          unitPriceMinor: "100000",
          lineSubtotalMinor: "200000",
          categoryIds: ["cat-1"],
          collectionIds: ["coll-1"],
          hasExistingPromotion: false,
          hasExistingDiscount: false,
        },
      ],
      couponCodes: ["SAVE50"],
    });
  });

  it("describes partial quota splits with promotion and regular quantity counts", () => {
    expect(
      resolveCheckoutItemQuotaSplitNote({
        quantity: 5,
        appliedQuantity: 3,
        regularQuantity: 0,
        quotaExceededQuantity: 2,
      }),
    ).toBe("3 sản phẩm giá khuyến mãi, 2 sản phẩm giá gốc");
  });

  it("maps pricing errors to blocking checkout modals", () => {
    expect(resolveCheckoutPricingErrorModal("CHECKOUT_PRICE_CHANGED")).toBe("price_change");
    expect(resolveCheckoutPricingErrorModal("CHECKOUT_PRICING_QUOTE_UNAVAILABLE")).toBe("pricing_unavailable");
    expect(resolveCheckoutPricingErrorModal("CHECKOUT_PRICING_COMMIT_UNAVAILABLE")).toBe("pricing_unavailable");
  });

  it("reads price-change popup actions and labels", () => {
    const details = resolveCheckoutPriceChangeDetails({
      previousTotals: { amountPayableMinor: 591500 },
      currentTotals: { amountPayableMinor: 119500 },
      popup: {
        actions: [
          {
            id: "accept_price_changes",
            action_type: "REQUEST_PATCH",
            cta_text: "Dong y",
            action_payload: { request_patch: { acceptPriceChanges: true } },
          },
          {
            id: "review_price_change",
            action_type: "REVIEW_PRICE_CHANGE",
            cta_text: "Xem lai gia moi",
          },
        ],
      },
    });
    const actions = resolveCheckoutPriceChangeActions(details);
    expect(actions).toHaveLength(2);
    expect(resolveCheckoutPriceChangeCtaLabel(actions[0])).toBe("Đồng Ý");
    expect(resolveCheckoutPriceChangeCtaLabel(actions[1])).toBe("Xem Lại Giá Mới");
    expect(isAcceptPriceChangeAction(actions[0])).toBe(true);
    expect(isReviewPriceChangeAction(actions[1])).toBe(true);
  });

  it("normalizes ward-not-found shipping quote errors", () => {
    expect(formatShippingQuoteErrorMessage("mã phường mới không tồn tại: 27112")).toBe("mã phường mới không tồn tại");
    expect(formatShippingQuoteErrorMessage("Không thể tính phí")).toBe("Không thể tính phí");
    expect(formatShippingQuoteErrorMessage("")).toBe("Địa chỉ này không hỗ trợ giao hàng");
    expect(formatShippingQuoteErrorMessage(null)).toBe("Địa chỉ này không hỗ trợ giao hàng");
  });
});

describe("checkout.helpers variant display", () => {
  it("renders detail and size lines from checkout attributes", () => {
    expect(
      resolveCheckoutItemVariantLines({
        productName: "Nhẫn Bạc",
        variationName: "Nhẫn Bạc",
        attributes: [
          { attributeCode: "MATERIAL", attributeName: "Chất liệu", value: "925" },
          { attributeCode: "SIZE", attributeName: "Size", value: "7" },
        ],
      }),
    ).toEqual(["925", "Size: 7"]);
  });

  it("enriches checkout session items from cart when API omits variant data", () => {
    const enriched = enrichCheckoutSessionItemsWithCartVariants(
      [
        {
          variationId: "v-1",
          productId: "p-1",
          productName: "Nhẫn Bạc S925",
          variationName: "Nhẫn Bạc S925",
          skuCode: "SKU-1",
          image: "/img.jpg",
          unitPrice: 34500,
          salePrice: 34500,
          quantity: 1,
          lineTotal: 34500,
          discountAmount: 0,
          finalAmount: 34500,
        },
      ],
      [{ id: "v-1", details: "925", sizeLabel: "7" }],
    );

    expect(resolveCheckoutItemVariantLines(enriched[0])).toEqual(["925", "Size: 7"]);
    expect(hasCheckoutItemVariantData(enriched[0])).toBe(true);
  });

  it("enriches checkout session items from buy-now variant snapshots", () => {
    const enriched = enrichCheckoutSessionItemsWithVariantFallbacks(
      [
        {
          variationId: "v-2",
          productId: "p-2",
          productName: "Dây chuyền",
          variationName: "Dây chuyền",
          skuCode: "SKU-2",
          image: "/img-2.jpg",
          unitPrice: 50000,
          salePrice: 50000,
          quantity: 1,
          lineTotal: 50000,
          discountAmount: 0,
          finalAmount: 50000,
        },
      ],
      [{ variationId: "v-2", details: "Vàng 18K", sizeLabel: "45cm" }],
    );

    expect(resolveCheckoutItemVariantLines(enriched[0])).toEqual(["Vàng 18K", "Size: 45cm"]);
  });
});
