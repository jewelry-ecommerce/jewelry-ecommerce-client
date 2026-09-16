import { describe, expect, it } from "vitest";
import { CheckoutRequestLineType, type CheckoutSessionItem, type CheckoutSessionLine } from "./checkout.interface";
import { flattenCheckoutSessionItems, flattenLooseCheckoutSessionItems } from "./checkout.util";

const createSessionItem = (variationId: string): CheckoutSessionItem => ({
  variationId,
  productId: `product-${variationId}`,
  productName: variationId,
  variationName: variationId,
  skuCode: variationId,
  image: "",
  unitPrice: 100,
  salePrice: 100,
  quantity: 1,
  lineTotal: 100,
  discountAmount: 0,
  finalAmount: 100,
});

describe("flattenCheckoutSessionItems", () => {
  it("flattens mixed loose and Set lines with included packaging", () => {
    const component = {
      ...createSessionItem("set-component"),
      packaging: [{ ...createSessionItem("set-packaging"), lineType: "PACKAGING_INCLUDED" }],
    };
    const lines: CheckoutSessionLine[] = [
      { ...createSessionItem("loose"), type: CheckoutRequestLineType.LOOSE },
      {
        type: CheckoutRequestLineType.SET,
        lineId: "line-1",
        setId: "set-1",
        quantity: 1,
        components: [component],
      },
    ];

    expect(flattenCheckoutSessionItems(lines).map((item) => item.variationId)).toEqual(["loose", "set-component", "set-packaging"]);
  });
});

describe("flattenLooseCheckoutSessionItems", () => {
  it("does not expose Set components as loose checkout products", () => {
    const lines: CheckoutSessionLine[] = [
      createSessionItem("loose"),
      {
        type: CheckoutRequestLineType.SET,
        lineId: "set-line",
        setId: "set-1",
        quantity: 1,
        components: [createSessionItem("set-component")],
      },
    ];

    expect(flattenLooseCheckoutSessionItems(lines).map((item) => item.variationId)).toEqual(["loose"]);
  });
});
