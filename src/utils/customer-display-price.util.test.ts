import { describe, expect, it } from "vitest";
import { resolveDiscountPercentForTag, shouldShowDiscountPercentTag } from "./customer-display-price.util";

describe("resolveDiscountPercentForTag", () => {
  it("returns undefined when API explicitly sends discountPercent null", () => {
    expect(
      resolveDiscountPercentForTag({
        discountPercent: null,
        sellingPriceAfterTaxMinor: 225_000,
        compareAtPriceAfterTaxMinor: 500_000,
      }),
    ).toBeUndefined();
  });

  it("returns API discountPercent when greater than zero", () => {
    expect(
      resolveDiscountPercentForTag({
        discountPercent: 55,
        sellingPriceAfterTaxMinor: 225_000,
        compareAtPriceAfterTaxMinor: 500_000,
      }),
    ).toBe(55);
  });

  it("computes percent from prices when discountPercent is undefined", () => {
    expect(
      resolveDiscountPercentForTag({
        sellingPriceAfterTaxMinor: 225_000,
        compareAtPriceAfterTaxMinor: 500_000,
      }),
    ).toBe(55);
  });
});

describe("shouldShowDiscountPercentTag", () => {
  it("requires admin flag, discount, and a percent value", () => {
    expect(
      shouldShowDiscountPercentTag({
        showDiscountPercent: true,
        hasDiscount: true,
        discountPercent: 9,
      }),
    ).toBe(true);
    expect(
      shouldShowDiscountPercentTag({
        showDiscountPercent: false,
        hasDiscount: true,
        discountPercent: 9,
      }),
    ).toBe(false);
    expect(
      shouldShowDiscountPercentTag({
        showDiscountPercent: true,
        hasDiscount: false,
        discountPercent: 9,
      }),
    ).toBe(false);
    expect(
      shouldShowDiscountPercentTag({
        showDiscountPercent: true,
        hasDiscount: true,
        discountPercent: null,
      }),
    ).toBe(false);
  });
});
