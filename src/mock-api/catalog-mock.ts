import type {
  ApiProduct,
  IProductBySlugResponse,
  IProductSkuCardItem,
  IProductSkuCardResponse,
} from "@/utils/api/product/product.interface";
import { resolveCustomerDisplayPrice } from "@/utils/customer-display-price.util";

type ProductSeed = { name: string; image: string; imageHover: string };

const PRODUCT_SEEDS: ProductSeed[] = [
  { name: "Charm Lavender Lock", image: "/images/product/charm/charm-1.1.png", imageHover: "/images/product/charm/charm-1.2.png" },
  { name: "Charm Celestial Heart", image: "/images/product/charm/charm-2.1.png", imageHover: "/images/product/charm/charm-2.2.png" },
  { name: "Charm Starlight Key", image: "/images/product/charm/charm-3.1.png", imageHover: "/images/product/charm/charm-3.2.png" },
  {
    name: "Dây chuyền Celeste",
    image: "/images/product/day-chuyen/day-chuyen-1.1.png",
    imageHover: "/images/product/day-chuyen/day-chuyen-1.2.png",
  },
  {
    name: "Dây chuyền Moonlight Pearl",
    image: "/images/product/day-chuyen/day-chuyen-2.1.png",
    imageHover: "/images/product/day-chuyen/day-chuyen-2.2.png",
  },
  {
    name: "Dây chuyền Aurora Bloom",
    image: "/images/product/day-chuyen/day-chuyen-3.1.png",
    imageHover: "/images/product/day-chuyen/day-chuyen-3.2.png",
  },
  { name: "Hoa tai Étoile", image: "/images/product/hoa-tai/hoa-tai-1.1.png", imageHover: "/images/product/hoa-tai/hoa-tai-1.2.png" },
  { name: "Hoa tai Pink Sakura", image: "/images/product/hoa-tai/hoa-tai-2.1.png", imageHover: "/images/product/hoa-tai/hoa-tai-2.2.png" },
  {
    name: "Hoa tai Crystal Wings",
    image: "/images/product/hoa-tai/hoa-tai-3.1.png",
    imageHover: "/images/product/hoa-tai/hoa-tai-3.2.png",
  },
  {
    name: "Mặt dây Lumière",
    image: "/images/product/mat-day-chuyen/mat-day-chuyen-1.1.png",
    imageHover: "/images/product/mat-day-chuyen/mat-day-chuyen-1.2.png",
  },
  {
    name: "Mặt dây Mystic Garden",
    image: "/images/product/mat-day-chuyen/mat-day-chuyen-2.1.png",
    imageHover: "/images/product/mat-day-chuyen/mat-day-chuyen-2.2.png",
  },
  {
    name: "Mặt dây Noxara Star",
    image: "/images/product/mat-day-chuyen/mat-day-chuyen-3.1.png",
    imageHover: "/images/product/mat-day-chuyen/mat-day-chuyen-3.2.png",
  },
];

const createProduct = (index: number): IProductSkuCardItem => {
  const sellingPrice = 2_490_000 + index * 420_000;
  const compareAtPrice = index % 2 === 0 ? sellingPrice + 600_000 : null;
  const product = PRODUCT_SEEDS[index]!;

  return {
    productId: `jewelry-product-${index + 1}`,
    name: product.name,
    slug: `jewelry-${index + 1}`,
    status: "ACTIVE",
    isPurchasable: true,
    brandName: "Jewelry Ecommerce",
    selectedSku: {
      id: `jewelry-sku-${index + 1}`,
      skuCode: `JWL-${String(index + 1).padStart(3, "0")}`,
      image: product.image,
      imageHover: product.imageHover,
      customerDisplayPrice: resolveCustomerDisplayPrice({
        sellingPriceAfterTaxMinor: sellingPrice,
        compareAtPriceAfterTaxMinor: compareAtPrice,
      }),
      stockStatus: "IN_STOCK",
    },
    visualSwitch: null,
    addToCart: { mode: "DIRECT" },
    updatedAt: "2026-09-15T00:00:00.000Z",
    pricePresentation: { showDiscountPercent: true },
  };
};

export const MOCK_PRODUCTS = PRODUCT_SEEDS.map((_, index) => createProduct(index));

export const getMockProductCards = (): IProductSkuCardResponse => ({
  total: MOCK_PRODUCTS.length,
  list: MOCK_PRODUCTS,
  pagination: {
    total: MOCK_PRODUCTS.length,
    currentPage: 1,
    nextPage: false,
    previousPage: false,
    hasNextPage: false,
    hasPreviousPage: false,
    totalPage: 1,
  },
  pricePresentation: { showDiscountPercent: true },
});

export const findMockProduct = (value: string): IProductSkuCardItem | undefined =>
  MOCK_PRODUCTS.find((product) => product.slug === value || product.productId === value || product.selectedSku.id === value);

export const getMockProductDetail = (slug: string): IProductBySlugResponse | null => {
  const product = findMockProduct(slug);
  if (!product) return null;
  const sku = product.selectedSku;
  const price = sku.customerDisplayPrice;
  const sellingPrice = Number(price.sellingPriceAfterTaxMinor ?? 0);
  const compareAtPrice = Number(price.compareAtPriceAfterTaxMinor ?? sellingPrice);
  const image = sku.image ?? "";
  const gallery = [
    { url: image, type: "IMAGE", sortOrder: 0, isPrimary: true },
    ...(sku.imageHover ? [{ url: sku.imageHover, type: "IMAGE", sortOrder: 1, isPrimary: false }] : []),
  ];
  const variant = {
    id: sku.id,
    slug: product.slug,
    name: product.name,
    sku: sku.skuCode,
    stock: 20,
    stockStatus: "IN_STOCK",
    isDefault: true,
    image,
    gallery,
    attributeValues: [],
    pricing: {
      currency: "VND",
      displayPriceAfterTaxMinor: sellingPrice,
      sellingPriceAfterTaxMinor: sellingPrice,
      compareAtPriceAfterTaxMinor: compareAtPrice,
      discountPercent: price.discountPercent ?? null,
      customerDisplayPrice: price,
    },
  };
  return {
    id: product.productId,
    slug: product.slug,
    name: product.name,
    status: "ACTIVE",
    isPurchasable: true,
    sku: sku.skuCode,
    spuCode: sku.skuCode,
    brand: { name: product.brandName ?? "Jewelry Ecommerce", code: "JEWELRY", image: null, tenantCode: "JEWELRY" },
    category: { id: "jewelry", name: "Trang sức", slug: "trang-suc" },
    shortDescription: product.name,
    description: product.name,
    gallery,
    seo: { metaTitle: product.name, metaDescription: product.name, metaKeywords: null, image },
    dimensions: { weight: 100, length: 10, width: 10, height: 5 },
    pricing: variant.pricing,
    availability: { inStock: true, stockStatus: "IN_STOCK" },
    defaultVariant: variant,
    defaultVariantId: sku.id,
    variantSelectors: [],
    variants: [variant],
    productInfos: [],
    createdAt: product.updatedAt,
    updatedAt: product.updatedAt,
    pricePresentation: product.pricePresentation,
  };
};

export const getMockLegacyProduct = (product: IProductSkuCardItem): ApiProduct => {
  const sku = product.selectedSku;
  const price = sku.customerDisplayPrice;
  return {
    productId: product.productId,
    productName: product.name,
    productSlug: product.slug,
    productStatus: product.status,
    isPurchasable: true,
    image: sku.image ?? "",
    imageHover: sku.imageHover ?? sku.image ?? "",
    brandName: product.brandName ?? "Jewelry Ecommerce",
    pricing: {
      minDisplayPriceAfterTaxMinor: String(price.sellingPriceAfterTaxMinor),
      minSellingPriceAfterTaxMinor: String(price.sellingPriceAfterTaxMinor ?? 0),
      minCompareAtPriceAfterTaxMinor: String(price.compareAtPriceAfterTaxMinor ?? 0),
      customerDisplayPrice: price,
    },
    defaultDisplay: {
      displayPriceAfterTaxMinor: String(price.sellingPriceAfterTaxMinor),
      sellingPriceAfterTaxMinor: String(price.sellingPriceAfterTaxMinor ?? 0),
      compareAtPriceAfterTaxMinor: String(price.compareAtPriceAfterTaxMinor ?? 0),
      image: sku.image ?? "",
      customerDisplayPrice: price,
    },
    visualSwitch: null,
    requiresSelectionDialog: false,
    stockStatus: sku.stockStatus,
    defaultVariationId: sku.id,
    updatedAt: product.updatedAt,
    pricePresentation: product.pricePresentation,
  };
};
