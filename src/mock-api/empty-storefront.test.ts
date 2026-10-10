import { describe, expect, it } from "vitest";
import { MOCK_PRODUCTS, getMockProductCards } from "./catalog-mock";
import { getMockBannerPlacement } from "./banner-mock";
import { getMockStorefrontPage } from "./storefront-mock";
describe("fresh storefront", () => {
  it("has no products, banners or home blocks before admin creates them", async () => {
    expect(MOCK_PRODUCTS).toEqual([]);
    expect(getMockProductCards().list).toEqual([]);
    expect(await getMockBannerPlacement("HOME_HERO_VIDEO")).toBeNull();
    expect(getMockStorefrontPage("trang-chu")?.blocks).toEqual([]);
  });
});
