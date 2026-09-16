import { describe, expect, it } from "vitest";
import { CatalogSortType } from "@/utils/api/product/product.enum";
import {
  areProductListParamsEqual,
  applyFilterValuesToSections,
  buildProductListParams,
  buildProductListSWRKey,
  buildProductListUrl,
  hasProductListFacetSearchParams,
  parseProductListFilterValues,
  parseProductListSortValue,
  serializeProductListFilterValues,
} from "./product-list-query.utils";

const createSearchParams = (entries: Record<string, string | string[]>) => ({
  get: (key: string) => {
    const value = entries[key];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  },
  getAll: (key: string) => {
    const value = entries[key];
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.includes(",") ? value.split(",") : [value];
  },
});

describe("product-list-query.utils", () => {
  it("parses and serializes filter values in stable order", () => {
    expect(parseProductListFilterValues(createSearchParams({ filter: "blue,gold,blue" }))).toEqual(["blue", "gold"]);
    expect(parseProductListFilterValues(createSearchParams({ filter: ["gold", "blue", "gold"] }))).toEqual(["blue", "gold"]);
    expect(serializeProductListFilterValues(["gold", "blue"])).toBe("blue,gold");
  });

  it("parses sort with legacy aliases", () => {
    expect(parseProductListSortValue(createSearchParams({ sort: "price-asc" }), CatalogSortType.BEST_SELLING)).toBe(
      CatalogSortType.PRICE_ASC,
    );
    expect(parseProductListSortValue(createSearchParams({}), CatalogSortType.BEST_SELLING)).toBe(CatalogSortType.BEST_SELLING);
  });

  it("builds clean URLs without default query values", () => {
    const url = buildProductListUrl({
      pathname: "/san-pham/dong-ho",
      searchParams: createSearchParams({ page: "2", take: "60", sort: CatalogSortType.BEST_SELLING, filter: "gold" }),
      defaultSort: CatalogSortType.BEST_SELLING,
      defaultTake: 48,
      filterValues: ["gold", "silver"],
      sort: CatalogSortType.PRICE_ASC,
      page: 1,
    });

    expect(url).toBe(`/san-pham/dong-ho?filter=gold&filter=silver&sort=${CatalogSortType.PRICE_ASC}&take=60`);
  });

  it("preserves the SKU card contract in product params and cache keys", () => {
    const params = buildProductListParams({
      page: 1,
      take: 24,
      sortValue: CatalogSortType.BEST_SELLING,
      defaultSort: CatalogSortType.BEST_SELLING,
      contract: "sku-card-v2",
    });

    expect(params.contract).toBe("sku-card-v2");
    expect(buildProductListSWRKey(params)).toContain("sku-card-v2");
    expect(
      areProductListParamsEqual(params, {
        ...params,
      }),
    ).toBe(true);
  });

  it("applies filter values to sections", () => {
    const sections = applyFilterValuesToSections(
      [
        {
          id: "color",
          label: "Màu",
          options: [
            { id: "gold", label: "Vàng" },
            { id: "silver", label: "Bạc" },
          ],
        },
      ],
      ["silver"],
    );

    expect(sections[0].options?.find((option) => option.id === "silver")?.checked).toBe(true);
    expect(sections[0].options?.find((option) => option.id === "gold")?.checked).toBe(false);
  });

  it("detects facet query params for canonical handling", () => {
    expect(hasProductListFacetSearchParams(createSearchParams({ filter: "gold" }))).toBe(true);
    expect(hasProductListFacetSearchParams(createSearchParams({ sort: "price_asc" }))).toBe(true);
    expect(hasProductListFacetSearchParams(createSearchParams({}))).toBe(false);
  });
});
