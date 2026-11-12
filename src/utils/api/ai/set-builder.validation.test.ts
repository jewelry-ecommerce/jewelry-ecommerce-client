import { describe, expect, it } from "vitest";
import { AI_BUDGET_OVER_MESSAGE, AI_CONFIRM_SKU_MESSAGE, AI_DUPLICATE_PRODUCT_MESSAGE, AI_SET_SIZE_MESSAGE } from "./ai.constant";
import { parseStylistSetDraft } from "./stylist-draft";
import {
  appendSetLine,
  confirmSetLine,
  lineFromCatalogPick,
  replaceSetLine,
  setBuilderBlockMessage,
  setBuilderTotal,
  type SetBuilderLine,
} from "./set-builder.validation";

const line = (patch: Partial<SetBuilderLine> = {}): SetBuilderLine => ({
  productId: 1,
  productName: "Nhẫn",
  thumbnailUrl: null,
  slotName: "",
  isKeyPiece: false,
  skuId: 11,
  skuCode: "SKU-11",
  price: 1_000_000,
  stock: 2,
  slug: "nhan",
  confirmedSku: true,
  ...patch,
});

describe("set builder validation", () => {
  it("blocks a duplicate product and a seventh item", () => {
    const lines = [line(), line({ productId: 2, skuId: 12 })];
    const duplicate = appendSetLine(lines, line());
    const full = [1, 2, 3, 4, 5, 6].map((productId) => line({ productId, skuId: productId }));
    const overflow = appendSetLine(full, line({ productId: 7 }));
    expect(duplicate.ok).toBe(false);
    if (!duplicate.ok) expect(duplicate.message).toBe(AI_DUPLICATE_PRODUCT_MESSAGE);
    if (!overflow.ok) expect(overflow.message).toBe("Bộ tối đa 6 sản phẩm.");
  });

  it("requires a confirmed in-stock SKU and keeps the set under the SET budget", () => {
    const pending = [line({ confirmedSku: false }), line({ productId: 2, skuId: 12, confirmedSku: false })];
    expect(setBuilderBlockMessage(pending, 5_000_000)).toBe(AI_CONFIRM_SKU_MESSAGE);
    const confirmed = confirmSetLine(pending, 1);
    expect(confirmed[0].confirmedSku).toBe(true);
    expect(setBuilderBlockMessage([line(), line({ productId: 2, skuId: 12, stock: 0 })], null)).toContain("hết hàng");
    expect(setBuilderBlockMessage([line(), line({ productId: 2, skuId: 12 })], 1_500_000)).toBe(AI_BUDGET_OVER_MESSAGE);
    expect(setBuilderTotal([line(), line({ productId: 2, price: 2_000_000 })])).toBe(3_000_000);
    expect(setBuilderBlockMessage([line()], null)).toBe(AI_SET_SIZE_MESSAGE);
    expect(setBuilderBlockMessage([line(), line({ productId: 2, skuId: 12 })], 5_000_000)).toBeNull();
  });

  it("replaces a line without accepting the same product twice", () => {
    const lines = [line(), line({ productId: 2, skuId: 12, productName: "Dây" })];
    const duplicate = replaceSetLine(lines, 2, line());
    expect(duplicate.ok).toBe(false);
    if (!duplicate.ok) expect(duplicate.message).toBe(AI_DUPLICATE_PRODUCT_MESSAGE);
    const replaced = replaceSetLine(lines, 2, lineFromCatalogPick({
      productId: 8, name: "Lắc", thumbnailUrl: null, slug: "lac", skuId: 80, skuCode: "SKU-80", price: 500_000, stock: 4,
    }));
    expect(replaced.ok).toBe(true);
    if (replaced.ok) {
      expect(replaced.lines[1].confirmedSku).toBe(false);
      expect(replaced.lines[1].skuId).toBe(80);
    }
  });

  it("restores a draft from selected product, sku and price ids", () => {
    const draft = parseStylistSetDraft({
      prefs: { occasion: "Sinh nhật", styles: ["Tối giản"], budget: 4_000_000, recipient: "" },
      productIds: [12, 13],
      skuIds: [44, null],
      prices: [1_500_000, 800_000],
    });
    expect(draft?.productIds).toEqual([12, 13]);
    expect(draft?.skuIds).toEqual([44, null]);
    expect(draft?.prices).toEqual([1_500_000, 800_000]);
    expect(draft?.lines[0].confirmedSku).toBe(false);
  });
});