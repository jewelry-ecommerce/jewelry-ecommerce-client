import type { IProductSkuCardItem, IProductSkuCardResponse } from "@/utils/api/product/product.interface";
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
