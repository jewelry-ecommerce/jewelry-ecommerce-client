import React from "react";
import { fireEvent, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatPrice } from "@/utils/constants/common.constant";
import ProductItemComponent, { type ProductItemProps, type ProductVariant } from "./product-item.component";

const mockPush = vi.fn();
const mockOnAddToCart = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/components/providers.component", () => ({
  useProductDefaultImage: () => "/fallback.png",
}));

vi.mock("@/components/cdn-image", () => ({
  CdnImage: (props: { alt?: string; src?: string }) => React.createElement("img", { alt: props.alt ?? "", src: props.src ?? "" }),
}));

vi.mock("@/hooks/use-product-card-cdn-transform.hook", () => ({
  useProductCardCdnTransform: () => ({
    width: 350,
    height: 440,
    quality: 95,
    format: "webp",
  }),
}));

vi.mock("@/components/product/product-quick-view-drawer/product-quick-view-drawer.component", () => ({
  default: () => null,
}));

vi.mock("@/components/product/discount-percent-tag/discount-percent-tag.component", () => ({
  DiscountPercentTag: ({ discountPercent }: { discountPercent?: number | null }) =>
    discountPercent != null ? React.createElement("span", { "data-testid": "discount-tag" }, String(discountPercent)) : null,
}));

vi.mock("./product-badge.component", () => ({
  default: () => null,
}));

vi.mock("./product-item.styles", () => {
  const classes = new Proxy(
    {},
    {
      get: (_target, prop) => String(prop),
    },
  ) as Record<string, string>;

  return {
    __esModule: true,
    default: () => ({
      classes,
      cx: (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" "),
    }),
  };
});

vi.mock("@/hooks/use-fetch-product-badges-batch.hook", () => ({
  useFetchProductBadgesBatch: vi.fn(),
}));

vi.mock("@/redux/hooks", () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: vi.fn((selector: (state: unknown) => unknown) => selector({})),
}));

vi.mock("@/redux/slices/auth.slice", () => ({
  selectIsLogin: () => false,
}));

vi.mock("@/redux/slices/badge.slice", () => ({
  selectProductBadgePayload: () => undefined,
}));

vi.mock("@/utils/api/badge/badge.util", () => ({
  pickProductBadgesForCard: () => [],
  resolveProductCardVariantId: (_variants: ProductVariant[], defaultVariationId?: string | null) =>
    defaultVariationId ?? _variants.find((variant) => variant.selected)?.variationId ?? null,
}));

vi.mock("@/utils/helpers/common/navigation", () => ({
  buildAuthUrl: (path: string) => path,
}));

vi.mock("@untitledui/icons", () => ({
  Heart: () => React.createElement("span", { "data-testid": "heart-icon" }),
  Plus: () => React.createElement("span", { "data-testid": "plus-icon" }),
}));

vi.mock("@/components/fly-to-cart/cart-flow.events", () => ({
  dispatchCartFlowAnimate: vi.fn(),
}));

vi.mock("@/utils/api", () => ({
  ProductApi: {
    getProductVariationsBySlug: vi.fn(),
  },
}));

const createVariant = (overrides: Partial<ProductVariant>): ProductVariant => ({
  label: "",
  image: "",
  selected: false,
  ...overrides,
});

const createProps = (): ProductItemProps => ({
  id: "product-1",
  name: "Product 1",
  sellingPriceAfterTaxMinor: 100_000,
  compareAtPriceAfterTaxMinor: 150_000,
  discountPercent: 33,
  hasDiscount: true,
  images: ["/active.png", "/active-hover.png"],
  variants: [
    createVariant({
      label: "Red",
      image: "/red.png",
      imageHover: "/red-hover.png",
      thumbnail: "/red-thumb.png",
      selected: true,
      valueCode: "RED",
      sellingPriceAfterTaxMinor: 100_000,
      compareAtPriceAfterTaxMinor: 150_000,
      stockStatus: "IN_STOCK",
      variationId: "var-red",
      discountPercent: 33,
      hasDiscount: true,
    }),
    createVariant({
      label: "Blue",
      image: "/blue.png",
      imageHover: undefined,
      thumbnail: "/blue-thumb.png",
      selected: false,
      valueCode: "BLUE",
      sellingPriceAfterTaxMinor: 80_000,
      compareAtPriceAfterTaxMinor: null,
      stockStatus: "IN_STOCK",
      variationId: "var-blue",
      discountPercent: null,
    }),
  ],
  slug: "product-1",
  isMobileTemplate: false,
  hideColor: false,
  variantAttributeCode: "COLOR",
  onAddToCart: mockOnAddToCart,
  onClick: vi.fn(),
  isPurchasable: true,
  requiresSelectionDialog: false,
});

afterEach(() => {
  cleanup();
  mockPush.mockReset();
  mockOnAddToCart.mockReset();
});

describe("ProductItemComponent", () => {
  it("previews a hovered swatch without inheriting the active discount", () => {
    render(React.createElement(ProductItemComponent, createProps()));

    const mainImage = screen.getByAltText("Product 1") as HTMLImageElement;
    expect(mainImage.getAttribute("src")).toBe("/red.png");
    expect(screen.getByText(formatPrice(100_000))).toBeTruthy();
    expect(screen.getByText(formatPrice(150_000))).toBeTruthy();

    const blueSwatch = screen.getByAltText("Blue").parentElement?.parentElement;
    expect(blueSwatch).toBeTruthy();
    fireEvent.mouseEnter(blueSwatch as Element);

    expect(mainImage.getAttribute("src")).toBe("/blue.png");
    expect(screen.getByText(formatPrice(80_000))).toBeTruthy();
    expect(screen.queryByText(formatPrice(150_000))).toBeNull();

    fireEvent.mouseLeave(blueSwatch as Element);
    expect(mainImage.getAttribute("src")).toBe("/red.png");
    expect(screen.getByText(formatPrice(150_000))).toBeTruthy();
  });

  it("commits the clicked swatch before add to cart", async () => {
    render(React.createElement(ProductItemComponent, createProps()));

    const blueSwatch = screen.getByAltText("Blue").parentElement?.parentElement;
    expect(blueSwatch).toBeTruthy();
    fireEvent.click(blueSwatch as Element);

    const mainImage = screen.getByAltText("Product 1") as HTMLImageElement;
    expect(mainImage.getAttribute("src")).toBe("/blue.png");
    expect(screen.getByText(formatPrice(80_000))).toBeTruthy();

    fireEvent.click(screen.getByRole("button"));

    expect(mockOnAddToCart).toHaveBeenCalledWith(
      "var-blue",
      expect.objectContaining({
        variationId: "var-blue",
        productId: "product-1",
        image: {
          src: "/blue.png",
          alt: "Product 1",
        },
      }),
    );
  });

  it("keeps add-to-cart label when selected sku is out of stock but has preOrderCampaignId", () => {
    const props = createProps();
    props.variants = [
      createVariant({
        label: "Pre-order",
        image: "/pre.png",
        selected: true,
        stockStatus: "OUT_OF_STOCK",
        variationId: "var-pre",
        preOrderCampaignId: "019fd093-cb2a-7735-a70d-f9b424a6e6c7",
        sellingPriceAfterTaxMinor: 500_000,
      }),
    ];

    render(React.createElement(ProductItemComponent, props));

    expect(screen.getByText("Thêm vào giỏ hàng")).toBeTruthy();
    expect(screen.queryByText("Liên hệ khi có hàng")).toBeNull();
  });

  it("hides discount percent tag unless showDiscountPercent is true", () => {
    const hiddenByDefault = createProps();
    const { rerender } = render(React.createElement(ProductItemComponent, hiddenByDefault));
    expect(screen.queryByTestId("discount-tag")).toBeNull();

    rerender(React.createElement(ProductItemComponent, { ...createProps(), showDiscountPercent: false }));
    expect(screen.queryByTestId("discount-tag")).toBeNull();

    rerender(React.createElement(ProductItemComponent, { ...createProps(), showDiscountPercent: true }));
    expect(screen.getByTestId("discount-tag").textContent).toBe("33");
  });
});
