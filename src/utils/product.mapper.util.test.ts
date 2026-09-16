import { describe, expect, it } from "vitest";
import type { ApiProduct, IProductSkuCardItem } from "@/utils/api/product/product.interface";
import {
  applyWishlistStateToProductItems,
  mapApiProductToProductItem,
  mapApiProductSkuCardToProductItem,
  mapApiProductSkuCardsToProductItems,
} from "./product.mapper.util";

const createSkuCard = (overrides: Partial<IProductSkuCardItem> = {}): IProductSkuCardItem => ({
  productId: "product-1",
  name: "Product 1",
  slug: "product-1",
  status: "PUBLISHED",
  isPurchasable: true,
  brandName: "Brand",
  selectedSku: {
    id: "var-red",
    skuCode: "SKU-RED",
    image: "/red.png",
    imageHover: "/red-hover.png",
    customerDisplayPrice: {
      currency: "VND",
      compareAtPriceAfterTaxMinor: 150_000,
      sellingPriceAfterTaxMinor: 100_000,
      discountPercent: 33,
      hasDiscount: true,
    },
    stockStatus: "IN_STOCK",
  },
  visualSwitch: {
    displayType: "IMAGE",
    label: "Màu",
    attributeCode: "COLOR",
    options: [
      {
        valueCode: "RED",
        label: "Đỏ",
        swatchImage: "/red-swatch.png",
        selected: true,
        sku: {
          id: "var-red",
          skuCode: "SKU-RED",
          image: "/red.png",
          imageHover: "/red-hover.png",
          customerDisplayPrice: {
            currency: "VND",
            compareAtPriceAfterTaxMinor: 150_000,
            sellingPriceAfterTaxMinor: 100_000,
            discountPercent: 33,
            hasDiscount: true,
          },
          stockStatus: "IN_STOCK",
        },
      },
      {
        valueCode: "BLUE",
        label: "Xanh",
        swatchImage: "/blue-swatch.png",
        selected: false,
        sku: {
          id: "var-blue",
          skuCode: "SKU-BLUE",
          image: "/blue.png",
          imageHover: null,
          customerDisplayPrice: {
            currency: "VND",
            compareAtPriceAfterTaxMinor: null,
            sellingPriceAfterTaxMinor: 80_000,
            discountPercent: null,
            hasDiscount: false,
          },
          stockStatus: "OUT_OF_STOCK",
        },
      },
    ],
  },
  addToCart: {
    mode: "SELECT_REQUIRED",
  },
  updatedAt: "2026-07-03T00:00:00.000Z",
  ...overrides,
});

describe("mapApiProductToProductItem listing contract", () => {
  it("maps preOrderCampaignId and previewVariationId per visualSwitch option", () => {
    const product: ApiProduct = {
      productId: "p1",
      productName: "Ring",
      productSlug: "ring",
      productStatus: "PUBLISHED",
      isPurchasable: true,
      image: "/a.jpg",
      imageHover: "",
      brandName: "",
      requiresSelectionDialog: true,
      stockStatus: "OUT_OF_STOCK",
      defaultVariationId: "var-14",
      preOrderCampaignId: "campaign-product",
      visualSwitch: {
        displayType: "TEXT",
        label: "Kích cỡ",
        attributeCode: "KC",
        options: [
          {
            valueCode: "140",
            label: "14",
            selected: true,
            thumbnail: "",
            image: "/a.jpg",
            stockStatus: "OUT_OF_STOCK",
            previewVariationId: "var-14",
            preOrderCampaignId: null,
            customerDisplayPrice: {
              currency: "VND",
              compareAtPriceAfterTaxMinor: 900000,
              sellingPriceAfterTaxMinor: 590000,
              discountPercent: 34,
              hasDiscount: true,
            },
          },
          {
            valueCode: "AG2",
            label: "925",
            selected: false,
            thumbnail: "",
            image: "/b.jpg",
            stockStatus: "OUT_OF_STOCK",
            previewVariationId: "var-preorder",
            preOrderCampaignId: "campaign-sku",
            customerDisplayPrice: {
              currency: "VND",
              compareAtPriceAfterTaxMinor: null,
              sellingPriceAfterTaxMinor: 500000,
              discountPercent: null,
              hasDiscount: false,
            },
          },
        ],
      },
    };

    const item = mapApiProductToProductItem(product);

    expect(item.variants?.[0]).toMatchObject({
      valueCode: "140",
      variationId: "var-14",
      stockStatus: "OUT_OF_STOCK",
      preOrderCampaignId: null,
      discountPercent: 34,
    });
    expect(item.variants?.[1]).toMatchObject({
      valueCode: "AG2",
      variationId: "var-preorder",
      stockStatus: "OUT_OF_STOCK",
      preOrderCampaignId: "campaign-sku",
    });
  });

  it("passes product.pricePresentation.showDiscountPercent onto listing product items", () => {
    const product: ApiProduct = {
      productId: "p1",
      productName: "Ring",
      productSlug: "ring",
      productStatus: "PUBLISHED",
      isPurchasable: true,
      image: "/a.jpg",
      imageHover: "",
      brandName: "",
      stockStatus: "IN_STOCK",
      requiresSelectionDialog: true,
    };

    expect(mapApiProductToProductItem(product).showDiscountPercent).toBeUndefined();
    expect(mapApiProductToProductItem({ ...product, pricePresentation: { showDiscountPercent: false } }).showDiscountPercent).toBe(false);
    expect(mapApiProductToProductItem({ ...product, pricePresentation: { showDiscountPercent: true } }).showDiscountPercent).toBe(true);
  });
});

describe("product.mapper.util sku card v2", () => {
  it("maps selectedSku and visual switch options into ProductItemProps", () => {
    const item = mapApiProductSkuCardToProductItem(createSkuCard());

    expect(item).toMatchObject({
      id: "product-1",
      name: "Product 1",
      slug: "product-1",
      sellingPriceAfterTaxMinor: 100_000,
      compareAtPriceAfterTaxMinor: 150_000,
      discountPercent: 33,
      images: ["/red.png", "/red-hover.png"],
      variantAttributeCode: "COLOR",
      stockStatus: "IN_STOCK",
      productStatus: "PUBLISHED",
      isPurchasable: true,
      requiresSelectionDialog: true,
      defaultVariationId: "var-red",
    });
    expect(item.variants).toHaveLength(2);
    expect(item.variants?.[0]).toMatchObject({
      label: "Đỏ",
      image: "/red.png",
      imageHover: "/red-hover.png",
      thumbnail: "/red-swatch.png",
      selected: true,
      variationId: "var-red",
      sellingPriceAfterTaxMinor: 100_000,
      compareAtPriceAfterTaxMinor: 150_000,
      stockStatus: "IN_STOCK",
      discountPercent: 33,
      preOrderCampaignId: null,
    });
    expect(item.variants?.[1]).toMatchObject({
      label: "Xanh",
      image: "/blue.png",
      imageHover: undefined,
      thumbnail: "/blue-swatch.png",
      selected: false,
      variationId: "var-blue",
      sellingPriceAfterTaxMinor: 80_000,
      compareAtPriceAfterTaxMinor: null,
      stockStatus: "OUT_OF_STOCK",
      discountPercent: null,
      preOrderCampaignId: null,
    });
  });

  it("maps preOrderCampaignId from selectedSku for out-of-stock pre-order cards", () => {
    const item = mapApiProductSkuCardToProductItem(
      createSkuCard({
        visualSwitch: null,
        selectedSku: {
          id: "var-preorder",
          skuCode: "SKU-PRE",
          image: "/pre.png",
          imageHover: null,
          customerDisplayPrice: {
            currency: "VND",
            compareAtPriceAfterTaxMinor: null,
            sellingPriceAfterTaxMinor: 500_000,
            discountPercent: null,
            hasDiscount: false,
          },
          stockStatus: "OUT_OF_STOCK",
          preOrderCampaignId: "019fd093-cb2a-7735-a70d-f9b424a6e6c7",
        },
      }),
    );

    expect(item.stockStatus).toBe("OUT_OF_STOCK");
    expect(item.variants?.[0]).toMatchObject({
      variationId: "var-preorder",
      stockStatus: "OUT_OF_STOCK",
      preOrderCampaignId: "019fd093-cb2a-7735-a70d-f9b424a6e6c7",
    });
  });

  it("falls back to selectedSku.preOrderCampaignId when visualSwitch option sku omits it", () => {
    const item = mapApiProductSkuCardToProductItem(
      createSkuCard({
        selectedSku: {
          id: "var-red",
          skuCode: "SKU-RED",
          image: "/red.png",
          imageHover: "/red-hover.png",
          customerDisplayPrice: {
            currency: "VND",
            compareAtPriceAfterTaxMinor: null,
            sellingPriceAfterTaxMinor: 500_000,
            discountPercent: null,
            hasDiscount: false,
          },
          stockStatus: "OUT_OF_STOCK",
          preOrderCampaignId: "019fd093-cb2a-7735-a70d-f9b424a6e6c7",
        },
        visualSwitch: {
          displayType: "IMAGE",
          label: "Màu",
          attributeCode: "COLOR",
          options: [
            {
              valueCode: "RED",
              label: "Đỏ",
              swatchImage: "/red-swatch.png",
              selected: true,
              sku: {
                id: "var-red",
                skuCode: "SKU-RED",
                image: "/red.png",
                imageHover: "/red-hover.png",
                customerDisplayPrice: {
                  currency: "VND",
                  compareAtPriceAfterTaxMinor: null,
                  sellingPriceAfterTaxMinor: 500_000,
                  discountPercent: null,
                  hasDiscount: false,
                },
                stockStatus: "OUT_OF_STOCK",
                // intentionally omit preOrderCampaignId on option.sku
              },
            },
          ],
        },
      }),
    );

    expect(item.variants?.[0]).toMatchObject({
      variationId: "var-red",
      stockStatus: "OUT_OF_STOCK",
      preOrderCampaignId: "019fd093-cb2a-7735-a70d-f9b424a6e6c7",
    });
  });

  it("keeps explicit null preOrderCampaignId on option.sku (does not inherit selectedSku)", () => {
    const item = mapApiProductSkuCardToProductItem(
      createSkuCard({
        selectedSku: {
          id: "var-red",
          skuCode: "SKU-RED",
          image: "/red.png",
          imageHover: null,
          customerDisplayPrice: {
            currency: "VND",
            compareAtPriceAfterTaxMinor: null,
            sellingPriceAfterTaxMinor: 100_000,
            discountPercent: null,
            hasDiscount: false,
          },
          stockStatus: "IN_STOCK",
          preOrderCampaignId: "campaign-product",
        },
        visualSwitch: {
          displayType: "IMAGE",
          label: "Màu",
          attributeCode: "COLOR",
          options: [
            {
              valueCode: "BLUE",
              label: "Xanh",
              swatchImage: "/blue-swatch.png",
              selected: false,
              sku: {
                id: "var-blue",
                skuCode: "SKU-BLUE",
                image: "/blue.png",
                imageHover: null,
                customerDisplayPrice: {
                  currency: "VND",
                  compareAtPriceAfterTaxMinor: null,
                  sellingPriceAfterTaxMinor: 80_000,
                  discountPercent: null,
                  hasDiscount: false,
                },
                stockStatus: "OUT_OF_STOCK",
                preOrderCampaignId: null,
              },
            },
          ],
        },
      }),
    );

    expect(item.variants?.[0]?.preOrderCampaignId).toBeNull();
  });

  it("maps a list of sku cards into product items", () => {
    expect(mapApiProductSkuCardsToProductItems([createSkuCard()])).toHaveLength(1);
  });

  it("passes product.pricePresentation.showDiscountPercent onto sku card product items", () => {
    const hidden = mapApiProductSkuCardsToProductItems([createSkuCard({ pricePresentation: { showDiscountPercent: false } })]);
    const visible = mapApiProductSkuCardsToProductItems([createSkuCard({ pricePresentation: { showDiscountPercent: true } })]);

    expect(hidden[0]?.showDiscountPercent).toBe(false);
    expect(visible[0]?.showDiscountPercent).toBe(true);
  });

  it("applies wishlist state and toggle handlers to mapped sku card items", () => {
    const mappedItems = mapApiProductSkuCardsToProductItems([createSkuCard()]);
    const onToggleFavorite = () => undefined;

    const result = applyWishlistStateToProductItems(mappedItems, (productId) => productId === "product-1", onToggleFavorite);

    expect(result[0]).toMatchObject({
      id: "product-1",
      isWishlistActive: true,
    });
    expect(result[0]?.onToggleFavorite).toBe(onToggleFavorite);
  });
});
