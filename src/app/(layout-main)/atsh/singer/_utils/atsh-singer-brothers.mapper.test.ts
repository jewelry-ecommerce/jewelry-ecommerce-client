import { describe, expect, it } from "vitest";
import { mockAtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers.test-fixture";
import { ProductLifecycleStatus, ProductStockStatus } from "@/utils/api/product/product.enum";
import type { ApiProduct } from "@/utils/api/product/product.interface";
import { getAtshSingerPageDataFromBrothers } from "./atsh-singer-brothers.mapper";

const mockCatalogProducts: ApiProduct[] = [
  {
    productId: "catalog-ring-1",
    productName: "HEARTLOCK HERBARIUM RING",
    productSlug: "mat-day-chuyen-bac-ky-niem-tinh-yeu",
    productStatus: ProductLifecycleStatus.PUBLISHED,
    isPurchasable: true,
    shortDescription: "Mô tả từ catalog.",
    image: "https://cdn.example.com/catalog.png",
    imageHover: "https://cdn.example.com/catalog.png",
    brandName: "Heartlock",
    defaultDisplay: {
      sellingPriceAfterTaxMinor: "8655990",
      compareAtPriceAfterTaxMinor: "8655990",
      image: "https://cdn.example.com/catalog.png",
    },
    requiresSelectionDialog: true,
    stockStatus: ProductStockStatus.IN_STOCK,
  },
];

describe("atsh-singer-brothers.mapper", () => {
  it("maps featured products from CMS showcase config and catalog API", () => {
    const pageData = getAtshSingerPageDataFromBrothers("quang-hung-masterd", mockAtshBrothersData, mockCatalogProducts);

    expect(pageData).toBeDefined();
    expect(pageData?.featuredProducts).toHaveLength(2);
    expect(pageData?.featuredProducts[0].product.productName).toBe("HEARTLOCK HERBARIUM RING");
    expect(pageData?.featuredProducts[0].product.image).toBe(mockAtshBrothersData.brothers[0].products?.[0].image);
    expect(pageData?.featuredProducts[1].imagePosition).toBe("right");
    expect(pageData?.discoverSectionTitle).toBe("KHÁM PHÁ THÊM");
    expect(pageData?.discoverCards).toHaveLength(3);
    expect(pageData?.collectionProducts).toEqual([]);
  });

  it("maps featured products for brothers with showcase config", () => {
    const pageData = getAtshSingerPageDataFromBrothers("wren-evans", mockAtshBrothersData, mockCatalogProducts);

    expect(pageData).toBeDefined();
    expect(pageData?.featuredProducts).toHaveLength(2);
  });
});
