import { describe, expect, it } from "vitest";
import { normalizeCatalogSearchQuery } from "./catalog-search-query.util";

describe("normalizeCatalogSearchQuery", () => {
  it("trims whitespace", () => {
    expect(normalizeCatalogSearchQuery("  nhẫn  ")).toBe("nhẫn");
  });

  it("removes slash-only tokens and collapses slash runs", () => {
    expect(normalizeCatalogSearchQuery("nhẫn /////")).toBe("nhẫn");
  });

  it("collapses repeated whitespace", () => {
    expect(normalizeCatalogSearchQuery("nhẫn    vàng")).toBe("nhẫn vàng");
  });

  it("keeps meaningful tokens separated by a single slash", () => {
    expect(normalizeCatalogSearchQuery("18k/vàng")).toBe("18k/vàng");
  });

  it("returns empty string for slash-only input", () => {
    expect(normalizeCatalogSearchQuery("/////")).toBe("");
  });
});
