import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ApiProduct, IProductBySlugResponse } from "@/utils/api/product/product.interface";
import type { ComponentProps } from "react";
import type ProductDetailContent from "./_components/product-detail-content.component";
import ProductDetailApp from "./product-detail.app";

vi.mock("swr", () => ({
  default: (_key: unknown, _fetcher: unknown, options?: { fallbackData?: IProductBySlugResponse }) => ({ data: options?.fallbackData }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components", () => ({ BreadcrumbComponent: () => null, ProductSliderComponent: () => null }));
vi.mock("@/components/providers.component", () => ({ useProductDefaultImage: () => "/product.webp" }));
vi.mock("@/utils/api", () => ({ ProductApi: { recordRecentlyViewedProduct: () => Promise.resolve() } }));
vi.mock("@/lib/gtm/track-view-item", () => ({ resolveViewableVariation: () => undefined }));
vi.mock("@/hooks/cart/use-add-to-cart.hook", () => ({ default: () => ({ handleAddToCart: vi.fn() }) }));
vi.mock("@/components/product/product-drawer/product-drawer.component", () => ({ default: () => null }));
vi.mock("@/hooks", () => {
  const mapWishlistProducts = (products: ApiProduct[]) => products;
  const isProductWished = () => false;
  return { useProductWishlist: () => ({ mapWishlistProducts, isProductWished, handleToggleWishlist: vi.fn() }) };
});
vi.mock("./_components/product-detail-content.component", () => ({
  default: ({ onOpenLightbox }: ComponentProps<typeof ProductDetailContent>) => (
    <>
      <button onClick={() => onOpenLightbox(0)}>Desktop image</button>
      <button onClick={() => onOpenLightbox(0, 1)}>Mobile image without pinch</button>
      <button onClick={() => onOpenLightbox(0, 3)}>Mobile image pinched to 3</button>
    </>
  ),
}));

const product: IProductBySlugResponse = {
  id: "zoom-feedback-product", slug: "zoom-feedback-product", name: "Zoom feedback product",
  status: "ACTIVE", isPurchasable: true, sku: "ZOOM-SKU", spuCode: "ZOOM-SPU",
  brand: { name: "Brand", code: "BRAND", image: null, tenantCode: "TEST" },
  category: { id: "category", name: "Category", slug: "category" },
  shortDescription: "", description: "",
  gallery: [{ url: "/product.webp", type: "IMAGE", sortOrder: 0, isPrimary: true }],
  seo: { metaTitle: null, metaDescription: null, metaKeywords: null },
  dimensions: { weight: null, length: null, width: null, height: null },
  pricing: { discountPercent: null }, availability: { inStock: true, stockStatus: "IN_STOCK" },
  variantSelectors: [], variants: [], productInfos: [], createdAt: "", updatedAt: "",
};

class BrowserZoomViewport extends EventTarget {
  scale = 2.5;
  width = 160;
  height = 280;
  offsetLeft = 0;
  offsetTop = 0;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each(["Desktop image", "Mobile image without pinch"])(
  "inherits browser zoom through ProductDetailApp when opening %s", (buttonLabel) => {
    vi.stubGlobal("visualViewport", new BrowserZoomViewport());
    render(<ProductDetailApp slug={product.slug} initialData={product} />);
    fireEvent.click(screen.getByRole("button", { name: buttonLabel }));
    expect(screen.getByAltText(product.name).style.transform).toContain("scale(2.5)");
    fireEvent.click(screen.getByRole("button", { name: "Close product zoom" }));
    expect(screen.queryByAltText(product.name)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: buttonLabel }));
    expect(screen.getByAltText(product.name).style.transform).toContain("scale(2.5)");
  },
);

it("keeps the larger gallery zoom through ProductDetailApp", () => {
  vi.stubGlobal("visualViewport", new BrowserZoomViewport());
  render(<ProductDetailApp slug={product.slug} initialData={product} />);
  fireEvent.click(screen.getByRole("button", { name: "Mobile image pinched to 3" }));
  expect(screen.getByAltText(product.name).style.transform).toContain("scale(3)");
  fireEvent.click(screen.getByRole("button", { name: "Close product zoom" }));
  fireEvent.click(screen.getByRole("button", { name: "Mobile image without pinch" }));
  expect(screen.getByAltText(product.name).style.transform).toContain("scale(2.5)");
});
