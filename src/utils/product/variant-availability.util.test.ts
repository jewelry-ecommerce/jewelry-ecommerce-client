import { describe, expect, it } from "vitest";
import { ProductStockStatus } from "@/utils/api/product/product.enum";
import type { IProductVariation, IVariantSelector } from "@/utils/api/product/product.interface";
import { buildContextualVariantSelectors } from "./variant-availability.util";

const selectors: IVariantSelector[] = [
  {
    attribute: { id: "1", name: "Kích cỡ", code: "size", index: 0, displayType: "TEXT" },
    options: [
      { id: "50", code: "50", label: "50", value: "50", thumbnail: null, selected: false, available: true, variationIds: [] },
      { id: "54", code: "54", label: "54", value: "54", thumbnail: null, selected: false, available: true, variationIds: [] },
    ],
  },
  {
    attribute: { id: "2", name: "Nguyên liệu", code: "material", index: 1, displayType: "TEXT" },
    options: [{ id: "925", code: "925", label: "925", value: "925", thumbnail: null, selected: false, available: true, variationIds: [] }],
  },
  {
    attribute: { id: "3", name: "Màu đá", code: "color", index: 2, displayType: "COLOR" },
    options: [
      { id: "red", code: "red", label: "Đỏ", value: "Đỏ", thumbnail: "/red.png", selected: false, available: true, variationIds: [] },
      {
        id: "white",
        code: "white",
        label: "Trắng",
        value: "Trắng",
        thumbnail: "/white.png",
        selected: false,
        available: true,
        variationIds: [],
      },
    ],
  },
  {
    attribute: { id: "4", name: "Loại đá", code: "stone", index: 3, displayType: "TEXT" },
    options: [
      {
        id: "diamond",
        code: "diamond",
        label: "Kim cương",
        value: "Kim cương",
        thumbnail: null,
        selected: false,
        available: true,
        variationIds: [],
      },
    ],
  },
];

const variants: IProductVariation[] = [
  {
    id: "v1",
    slug: "v1",
    name: "50 / 925 / Đỏ / Kim cương",
    sku: "sku-1",
    stock: 0,
    stockStatus: ProductStockStatus.OUT_OF_STOCK,
    image: "",
    gallery: [],
    attributeValues: [],
    attributes: { size: "50", material: "925", color: "red", stone: "diamond" },
  },
  {
    id: "v2",
    slug: "v2",
    name: "50 / 925 / Trắng / Kim cương",
    sku: "sku-2",
    stock: 5,
    stockStatus: ProductStockStatus.IN_STOCK,
    image: "",
    gallery: [],
    attributeValues: [],
    attributes: { size: "50", material: "925", color: "white", stone: "diamond" },
  },
  {
    id: "v3",
    slug: "v3",
    name: "54 / 925 / Trắng / Kim cương",
    sku: "sku-3",
    stock: 0,
    stockStatus: ProductStockStatus.OUT_OF_STOCK,
    image: "",
    gallery: [],
    attributeValues: [],
    attributes: { size: "54", material: "925", color: "white", stone: "diamond" },
  },
];

describe("buildContextualVariantSelectors", () => {
  it("strikes only color when same size/material has another in-stock color", () => {
    const selected = { size: "50", material: "925", color: "red", stone: "diamond" };
    const result = buildContextualVariantSelectors(selectors, variants, selected);

    expect(result[0].options.find((option) => option.code === "50")?.available).toBe(true);
    expect(result[1].options.find((option) => option.code === "925")?.available).toBe(true);
    expect(result[2].options.find((option) => option.code === "red")?.available).toBe(false);
    expect(result[2].options.find((option) => option.code === "white")?.available).toBe(true);
    expect(result[3].options.find((option) => option.code === "diamond")?.available).toBe(false);
  });

  it("strikes later size options using only prior attribute constraints", () => {
    const selected = { size: "50", material: "925", color: "red", stone: "diamond" };
    const result = buildContextualVariantSelectors(selectors, variants, selected);

    expect(result[0].options.find((option) => option.code === "54")?.available).toBe(false);
  });

  it("keeps zero-stock pre-order options selectable", () => {
    const preOrderVariants: IProductVariation[] = [
      {
        ...variants[0],
        purchaseAction: { code: "PRE_ORDER", label: "Đặt trước", enabled: true },
      },
      variants[1],
    ];
    const selected = { size: "50", material: "925", color: "red", stone: "diamond" };
    const result = buildContextualVariantSelectors(selectors, preOrderVariants, selected);

    expect(result[2].options.find((option) => option.code === "red")?.available).toBe(true);
  });

  it("keeps zero-stock options selectable when preOrderCampaignId is present", () => {
    const preOrderVariants: IProductVariation[] = [
      {
        ...variants[0],
        preOrderCampaignId: "campaign-1",
      },
      variants[1],
    ];
    const selected = { size: "50", material: "925", color: "red", stone: "diamond" };
    const result = buildContextualVariantSelectors(selectors, preOrderVariants, selected);

    expect(result[2].options.find((option) => option.code === "red")?.available).toBe(true);
  });

  it("supports exchange/quick-view attributeValues shape (attributeCode/valueCode)", () => {
    const selected = { size: "13", color: "14k", stoneColor: "white", stoneType: "zirconia" };
    const exchangeSelectors: IVariantSelector[] = [
      {
        attribute: { id: "1", name: "Kích cỡ", code: "size", index: 0, displayType: "TEXT" },
        options: [
          { id: "13", code: "13", label: "13", value: "13", thumbnail: null, selected: false, available: true, variationIds: [] },
          { id: "13.5", code: "13.5", label: "13.5", value: "13.5", thumbnail: null, selected: false, available: true, variationIds: [] },
        ],
      },
      {
        attribute: { id: "2", name: "Màu sắc", code: "color", index: 1, displayType: "TEXT" },
        options: [
          { id: "14k", code: "14k", label: "14k", value: "14k", thumbnail: null, selected: false, available: true, variationIds: [] },
        ],
      },
      {
        attribute: { id: "3", name: "Màu đá", code: "stoneColor", index: 2, displayType: "COLOR" },
        options: [
          {
            id: "white",
            code: "white",
            label: "Trắng",
            value: "Trắng",
            thumbnail: "/w.png",
            selected: false,
            available: true,
            variationIds: [],
          },
          {
            id: "gold",
            code: "gold",
            label: "Vàng",
            value: "Vàng",
            thumbnail: "/g.png",
            selected: false,
            available: true,
            variationIds: [],
          },
        ],
      },
      {
        attribute: { id: "4", name: "Mã loại đá", code: "stoneType", index: 3, displayType: "TEXT" },
        options: [
          {
            id: "zirconia",
            code: "zirconia",
            label: "Zirconia",
            value: "Zirconia",
            thumbnail: null,
            selected: false,
            available: true,
            variationIds: [],
          },
        ],
      },
    ];

    const exchangeVariations = [
      {
        stock: 0,
        attributeValues: [
          { attributeCode: "size", valueCode: "13" },
          { attributeCode: "color", valueCode: "14k" },
          { attributeCode: "stoneColor", valueCode: "white" },
          { attributeCode: "stoneType", valueCode: "zirconia" },
        ],
      },
      {
        stock: 3,
        attributeValues: [
          { attributeCode: "size", valueCode: "13" },
          { attributeCode: "color", valueCode: "14k" },
          { attributeCode: "stoneColor", valueCode: "gold" },
          { attributeCode: "stoneType", valueCode: "zirconia" },
        ],
      },
      {
        stock: 0,
        attributeValues: [
          { attributeCode: "size", valueCode: "13.5" },
          { attributeCode: "color", valueCode: "14k" },
          { attributeCode: "stoneColor", valueCode: "gold" },
          { attributeCode: "stoneType", valueCode: "zirconia" },
        ],
      },
    ];

    const result = buildContextualVariantSelectors(exchangeSelectors, exchangeVariations, selected);

    expect(result[0].options.find((option) => option.code === "13")?.available).toBe(true);
    expect(result[0].options.find((option) => option.code === "13.5")?.available).toBe(false);
    expect(result[2].options.find((option) => option.code === "white")?.available).toBe(false);
    expect(result[2].options.find((option) => option.code === "gold")?.available).toBe(true);
    expect(result[3].options.find((option) => option.code === "zirconia")?.available).toBe(false);
  });
});
