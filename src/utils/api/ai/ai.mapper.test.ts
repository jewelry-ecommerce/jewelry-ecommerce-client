import { describe, expect, it } from "vitest";
import { AI_BUDGET_SCOPE_ITEM, AI_BUDGET_SCOPE_SET } from "./ai.constant";
import {
  formatMatchScore,
  mapCatalogHits,
  mapSetBuilderResponse,
  mapStylistResponse,
  mapStylistSessions,
  pickCatalogSlug,
  readApiErrorCode,
  toStylistRequest,
} from "./ai.mapper";

const recommendation = {
  type: "PRODUCT",
  id: 12,
  name: "Nhẫn vàng",
  thumbnailUrl: "https://cdn/ring.jpg",
  reason: "Phù hợp dịp Sinh nhật, trong ngân sách.",
  matchScore: 0.86,
  skuId: 44,
  skuCode: "SKU-44",
  price: 1_500_000,
  stock: 3,
  source: "FALLBACK",
};

describe("ai response mapper", () => {
  it("maps stylist recommendations and keeps match score as a relative number", () => {
    const mapped = mapStylistResponse({
      source: "FALLBACK",
      banner: "Gợi ý cơ bản",
      sessionId: 4,
      recommendations: [recommendation, { id: "bad" }],
    });

    expect(mapped.source).toBe("FALLBACK");
    expect(mapped.banner).toBe("Gợi ý cơ bản");
    expect(mapped.sessionId).toBe(4);
    expect(mapped.recommendations).toEqual([expect.objectContaining({
      id: 12,
      skuId: 44,
      price: 1_500_000,
      stock: 3,
      slug: null,
    })]);
    expect(formatMatchScore(mapped.recommendations[0].matchScore)).toBe("86");
    expect(formatMatchScore(1)).toBe("100");
  });

  it("maps set items including the keyPiece alias and ignores product id as SKU", () => {
    const mapped = mapSetBuilderResponse({
      code: "SET1",
      name: "Set gợi ý",
      description: "Bộ trang sức",
      bundleDiscountPercent: 0,
      source: "AI",
      totalPrice: 3_000_000,
      items: [{ ...recommendation, productId: 12, productName: "Nhẫn vàng", keyPiece: true, sortOrder: 0 }],
    });

    expect(mapped.items[0]).toEqual(expect.objectContaining({ productId: 12, isKeyPiece: true, skuId: 44 }));
    expect(mapped.totalPrice).toBe(3_000_000);
  });

  it("maps member sessions from a raw list", () => {
    const sessions = mapStylistSessions([{
      id: 9,
      occasion: "Đám cưới",
      styles: ["Hiện đại"],
      budget: 8_000_000,
      budgetScope: "SET",
      source: "AI",
      createdDate: "2026-11-12T02:00:00.000Z",
      items: [{ productId: 12, skuId: 44, reason: "Hợp dịp", matchScore: 0.5, sortOrder: 0 }],
    }]);

    expect(sessions[0].items[0].productId).toBe(12);
    expect(sessions[0].createdDate).toBe("2026-11-12T02:00:00.000Z");
  });

  it("reads a catalog slug and an in-stock SKU from the Java product list", () => {
    const payload = {
      list: [{
        id: 12,
        name: "Nhẫn vàng",
        slug: "nhan-vang",
        thumbnailUrl: "https://cdn/ring.jpg",
        priceFrom: 9_000_000,
        skus: [
          { id: "40", skuCode: "OUT", salePrice: 1000, availableStock: 0 },
          { id: "44", skuCode: "SKU-44", salePrice: 1_500_000, availableStock: 3, isDefault: true },
        ],
      }],
    };

    expect(mapCatalogHits(payload)[0]).toEqual(expect.objectContaining({
      productId: 12,
      slug: "nhan-vang",
      skuId: 44,
      price: 1_500_000,
      stock: 3,
    }));
    expect(pickCatalogSlug(payload, 12)).toBe("nhan-vang");
  });

  it("builds the stylist body without treating item budget as a set budget", () => {
    expect(toStylistRequest({ occasion: "Sinh nhật", styles: [], budget: 2_000_000, recipient: "  " }, AI_BUDGET_SCOPE_ITEM)).toEqual({
      occasion: "Sinh nhật",
      budget: 2_000_000,
      budgetScope: "ITEM",
    });
    expect(toStylistRequest({ occasion: "Khác", styles: ["Tối giản"], budget: 9_000_000, recipient: "Mẹ" }, AI_BUDGET_SCOPE_SET).budgetScope)
      .toBe("SET");
  });

  it("reads CART_BATCH_FAILED from the Java error envelope", () => {
    const error = { response: { data: { message: "Hết hàng", errors: [{ code: "CART_BATCH_FAILED", message: "Hết hàng" }] } } };
    expect(readApiErrorCode(error)).toBe("CART_BATCH_FAILED");
  });
});
