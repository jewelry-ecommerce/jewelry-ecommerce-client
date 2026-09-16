import { describe, expect, it } from "vitest";

import { filterOrderDisplayItems, isOrderPackagingDisplayLine } from "./order-display.util";

describe("isOrderPackagingDisplayLine", () => {
  it("hides packaging line types", () => {
    expect(isOrderPackagingDisplayLine({ lineType: "PACKAGING_INCLUDED" })).toBe(true);
    expect(isOrderPackagingDisplayLine({ lineType: "PACKAGING_OPTIONAL", salePrice: "0" })).toBe(true);
  });

  it("keeps product lines even when salePrice is 0 or empty", () => {
    expect(isOrderPackagingDisplayLine({ lineType: "PRODUCT", salePrice: "0" })).toBe(false);
    expect(isOrderPackagingDisplayLine({ salePrice: "0" })).toBe(false);
    expect(isOrderPackagingDisplayLine({ salePrice: "" })).toBe(false);
    expect(isOrderPackagingDisplayLine({ salePrice: null })).toBe(false);
    expect(isOrderPackagingDisplayLine({})).toBe(false);
  });

  it("hides free attached child without lineType (legacy packaging)", () => {
    expect(isOrderPackagingDisplayLine({ salePrice: "0", parentOrderItemId: "parent-1" })).toBe(true);
  });
});

describe("filterOrderDisplayItems", () => {
  it("keeps both main products when BE omits lineType / zero price", () => {
    const items = [
      { id: "1", productName: "SP A", salePrice: "20000" },
      { id: "2", productName: "SP B", salePrice: "0" },
    ];

    expect(filterOrderDisplayItems(items)).toHaveLength(2);
  });

  it("drops packaging lines only", () => {
    const items = [
      { id: "1", productName: "SP A", salePrice: "20000", lineType: "PRODUCT" },
      { id: "2", productName: "Hộp", salePrice: "0", lineType: "PACKAGING_INCLUDED" },
    ];

    expect(filterOrderDisplayItems(items).map((item) => item.id)).toEqual(["1"]);
  });
});
