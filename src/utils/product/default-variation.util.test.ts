import { describe, expect, it } from "vitest";
import { ProductStockStatus } from "@/utils/api/product/product.enum";
import { pickDefaultVariation } from "./default-variation.util";

describe("pickDefaultVariation", () => {
  it("trả về undefined khi không có biến thể", () => {
    expect(pickDefaultVariation([])).toBeUndefined();
  });

  it("chọn biến thể còn hàng có giá nhỏ nhất, bỏ qua biến thể hết hàng rẻ hơn", () => {
    const variations = [
      { id: "oos-cheapest", stock: 0, sellingPriceAfterTaxMinor: "100000" },
      { id: "in-stock-expensive", stock: 5, sellingPriceAfterTaxMinor: "300000" },
      { id: "in-stock-cheapest", stock: 2, sellingPriceAfterTaxMinor: "200000" },
    ];

    expect(pickDefaultVariation(variations)?.id).toBe("in-stock-cheapest");
  });

  it("bỏ qua biến thể có stockStatus OUT_OF_STOCK dù stock > 0", () => {
    const variations = [
      { id: "flagged-oos", stock: 3, stockStatus: ProductStockStatus.OUT_OF_STOCK, sellingPriceAfterTaxMinor: "100000" },
      { id: "in-stock", stock: 3, sellingPriceAfterTaxMinor: "200000" },
    ];

    expect(pickDefaultVariation(variations)?.id).toBe("in-stock");
  });

  it("fallback về biến thể giá nhỏ nhất khi tất cả hết hàng", () => {
    const variations = [
      { id: "oos-expensive", stock: 0, sellingPriceAfterTaxMinor: "300000" },
      { id: "oos-cheapest", stock: 0, sellingPriceAfterTaxMinor: "100000" },
    ];

    expect(pickDefaultVariation(variations)?.id).toBe("oos-cheapest");
  });

  it("ưu tiên giá customerDisplayPrice rồi tới displayPrice khi so sánh", () => {
    const variations = [
      {
        id: "display-price-cheaper",
        stock: 1,
        sellingPriceAfterTaxMinor: "500000",
        customerDisplayPrice: { sellingPriceAfterTaxMinor: "150000" },
      },
      { id: "plain-price", stock: 1, displayPriceAfterTaxMinor: "200000", sellingPriceAfterTaxMinor: "180000" },
    ];

    expect(pickDefaultVariation(variations)?.id).toBe("display-price-cheaper");
  });
});
