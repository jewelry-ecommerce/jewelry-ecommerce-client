import { describe, expect, it } from "vitest";
import {
  buildCartViewItem,
  buildCartViewItemFromProductCard,
  buildCartViewItemFromProductDetailVariant,
  buildCartViewItemFromProductSwatchCard,
  resolveCartVariantLabelsFromProductDetail,
} from "./cart-view-item-builder.util";

const createProductDetailVariantSelectors = () => [
  {
    attribute: { id: "attr-nl", name: "Nguyên liệu", code: "NL", index: 1, displayType: "TEXT" },
    options: [
      { id: "opt-ag2", code: "AG2", label: "925", value: "925", thumbnail: null, selected: true, available: true, variationIds: [] },
    ],
  },
  {
    attribute: { id: "attr-md", name: "Màu đá", code: "MD", index: 1, displayType: "IMAGE" },
    options: [{ id: "opt-red", code: "RED", label: "Đỏ", value: "Đỏ", thumbnail: null, selected: true, available: true, variationIds: [] }],
  },
  {
    attribute: { id: "attr-ld", name: "Loại đá", code: "LD", index: 1, displayType: "TEXT" },
    options: [
      {
        id: "opt-dia",
        code: "DIA",
        label: "Kim cương",
        value: "Kim cương",
        thumbnail: null,
        selected: true,
        available: true,
        variationIds: [],
      },
    ],
  },
];

const createCharmVariation = () => ({
  id: "019e9608-c629-7753-873f-116903647661",
  slug: "hat-charm-bac-disney-trai-tim-do-dinh-da",
  name: "Hạt Charm Bạc Disney Trái Tim Đỏ Đính Đá",
  sku: "B1SS26CH001-1AG2-ECZ-RED-000",
  stock: 17,
  stockStatus: "IN_STOCK",
  image: "/variant.jpg",
  gallery: [],
  attributeValues: [],
  attributes: {
    NL: "AG2",
    MD: "RED",
    LD: "DIA",
  },
  pricing: {
    currency: "VND",
    sellingPriceAfterTaxMinor: 499_000,
    compareAtPriceAfterTaxMinor: 650_000,
    discountPercent: 23,
  },
});

describe("buildCartViewItem", () => {
  it("formats price and stock defaults from stock count", () => {
    const item = buildCartViewItem({
      variationId: "var-1",
      productSlug: "product-slug",
      name: "Test Product",
      imageSrc: "/image.jpg",
      sellingPriceAfterTaxMinor: 100_000,
      compareAtPriceAfterTaxMinor: 150_000,
      stock: 5,
    });

    expect(item.id).toBe("var-1");
    expect(item.unitPrice).toBe(100_000);
    expect(item.price.current).toBe("100.000đ");
    expect(item.price.original).toBe("150.000đ");
    expect(item.maxQuantity).toBe(5);
    expect(item.status?.tone).toBe("success");
    expect(item.selected).toBe(true);
  });

  it("uses inStock flag for swatch-style stock handling", () => {
    const item = buildCartViewItem({
      variationId: "var-swatch",
      productSlug: "slug",
      name: "Swatch",
      imageSrc: "/img.jpg",
      sellingPriceAfterTaxMinor: 50_000,
      inStock: true,
    });

    expect(item.maxQuantity).toBe(999);
    expect(item.disableQuantityControl).toBe(false);
  });
});

describe("buildCartViewItemFromProductCard", () => {
  it("maps listing product card fields", () => {
    const item = buildCartViewItemFromProductCard({
      id: "var-card",
      slug: "product-slug",
      name: "Card Product",
      images: ["/card.jpg"],
      sellingPriceAfterTaxMinor: 200_000,
    });

    expect(item.variationId).toBe("var-card");
    expect(item.productSlug).toBe("product-slug");
    expect(item.image.src).toBe("/card.jpg");
  });

  it("marks card as pre-order when campaign id is present", () => {
    const item = buildCartViewItemFromProductCard({
      id: "var-preorder",
      slug: "product-slug",
      name: "Preorder Product",
      images: ["/card.jpg"],
      sellingPriceAfterTaxMinor: 200_000,
      stock: 0,
      stockStatus: "OUT_OF_STOCK",
      preOrderCampaignId: "campaign-1",
    });

    expect(item.availabilityCode).toBe("PRE_ORDER");
    expect(item.maxQuantity).toBe(999);
    expect(item.disableQuantityControl).toBe(false);
  });
});

describe("buildCartViewItemFromProductSwatchCard", () => {
  it("maps swatch label into details", () => {
    const item = buildCartViewItemFromProductSwatchCard({
      variationId: "var-swatch",
      name: "Ring",
      slug: "ring",
      productId: "prod-1",
      images: ["/a.jpg"],
      label: "Vàng",
      image: "/swatch.jpg",
      sellingPriceAfterTaxMinor: 300_000,
      stockStatus: "IN_STOCK",
    });

    expect(item.details).toBe("Vàng");
    expect(item.maxQuantity).toBe(999);
  });

  it("marks out-of-stock swatch as pre-order when campaign id is present", () => {
    const item = buildCartViewItemFromProductSwatchCard({
      variationId: "var-preorder",
      name: "Ring",
      slug: "ring",
      productId: "prod-1",
      images: ["/a.jpg"],
      label: "Vàng",
      image: "/swatch.jpg",
      sellingPriceAfterTaxMinor: 300_000,
      stockStatus: "OUT_OF_STOCK",
      preOrderCampaignId: "campaign-1",
    });

    expect(item.availabilityCode).toBe("PRE_ORDER");
    expect(item.maxQuantity).toBe(999);
    expect(item.disableQuantityControl).toBe(false);
    expect(item.status?.tone).toBe("warning");
  });
});

describe("resolveCartVariantLabelsFromProductDetail", () => {
  it("maps selected variation attributes through variant selector options", () => {
    const labels = resolveCartVariantLabelsFromProductDetail(createCharmVariation(), createProductDetailVariantSelectors());

    expect(labels.details).toBe("925, Đỏ, Kim cương");
    expect(labels.sizeLabel).toBeUndefined();
  });

  it("puts size attribute into sizeLabel instead of details", () => {
    const labels = resolveCartVariantLabelsFromProductDetail(
      {
        ...createCharmVariation(),
        attributes: {
          NL: "AG2",
          SIZE: "M",
        },
      },
      [
        ...createProductDetailVariantSelectors(),
        {
          attribute: { id: "attr-size", name: "Size", code: "SIZE", index: 2, displayType: "TEXT" },
          options: [{ id: "opt-m", code: "M", label: "M", value: "M", thumbnail: null, selected: true, available: true, variationIds: [] }],
        },
      ],
    );

    expect(labels.details).toBe("925");
    expect(labels.sizeLabel).toBe("M");
  });
});

describe("buildCartViewItemFromProductDetailVariant", () => {
  it("includes mapped details on optimistic cart item", () => {
    const item = buildCartViewItemFromProductDetailVariant({
      productId: "prod-1",
      productSlug: "hat-charm",
      productName: "Hạt Charm Bạc Disney Trái Tim Đỏ Đính Đá",
      productImage: "/product.jpg",
      variation: createCharmVariation(),
      variantSelectors: createProductDetailVariantSelectors(),
    });

    expect(item.details).toBe("925, Đỏ, Kim cương");
    expect(item.variationId).toBe("019e9608-c629-7753-873f-116903647661");
  });

  it("allows pre-order variants with zero stock to be added to cart", () => {
    const item = buildCartViewItemFromProductDetailVariant({
      productId: "prod-1",
      productSlug: "hat-charm",
      productName: "Hạt Charm Bạc Disney Trái Tim Đỏ Đính Đá",
      productImage: "/product.jpg",
      variation: {
        ...createCharmVariation(),
        stock: 0,
        stockStatus: "OUT_OF_STOCK",
        purchaseAction: {
          code: "PRE_ORDER",
          label: "Đặt trước",
          enabled: true,
        },
      },
      variantSelectors: createProductDetailVariantSelectors(),
    });

    expect(item.availabilityCode).toBe("PRE_ORDER");
    expect(item.maxQuantity).toBe(999);
    expect(item.disableQuantityControl).toBe(false);
    expect(item.status?.label).toBe("Đặt trước");
    expect(item.status?.textColor).toBe("#B45309");
    expect(item.status?.backgroundColor).toBe("#FEF3C7");
  });
});
