// set term
import type { CustomerDisplayPrice } from "@/utils/customer-display-price.util";
import { CatalogSortType } from "@/utils/api/product/product.enum";

export type SetListItem = {
  id: string;
  code: string;
  slug: string;
  name: string;
  images: string[];
  status: string;
  productCount: number;
  updatedAt: string;
  setPriceFrom: number | null;
  compareAtPrice: number | null;
  sellingPrice: number | null;
  discountPercent: number | null;
};

export type SetPagination = {
  total: number;
  currentPage: number;
  nextPage: number | false;
  previousPage: number | false;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPage: number;
};

export type SetListResponse = {
  total: number;
  list: SetListItem[];
  pagination: SetPagination;
};

export type GetSetsParams = {
  orderType: "ASC" | "DESC";
  orderBy: string;
  sort?: CatalogSortType.PRICE_ASC | CatalogSortType.PRICE_DESC;
  page: number;
  take: number;
  isPagination: true;
};

// set term
export type SetVariant = {
  id: string;
  sku: string;
  image: string | null;
  stock: number;
  stockStatus: string;
  attributes: Record<string, string>;
};

// set term
export type SetIncludedProduct = {
  itemId: string;
  quantity: number;
  isKey: boolean;
  sortOrder: number;
  defaultVariantId: string;
  variantSelectors: Array<{
    attribute: { id: string; name: string; code: string; index: number; displayType: string };
    options: Array<{ id: string; code: string; label: string; value: string; thumbnail: string | null }>;
  }>;
  variants: SetVariant[];
  product: {
    name: string;
    slug: string;
    categoryName: string | null;
    variantAttributeOrder: string[];
  };
};

export type SetPriceFields = {
  customerDisplayPrice: CustomerDisplayPrice | null;
};

// set term
export type SetDetailResponse = {
  id: string;
  code: string;
  slug: string;
  name: string;
  description: string | null;
  shortDescriptions: Array<{ title: string; content: string }> | null;
  images: string[];
  status: string;
  customerDisplayPrice: CustomerDisplayPrice | null;
  includedProducts: SetIncludedProduct[];
  createdAt: string;
  updatedAt: string;
};

export type SetItemVariationSelection = {
  itemId: string;
  variationId: string;
};

export type SetItemVariationsResponse = {
  setId: string;
  itemId: string;
  customerDisplayPrice: CustomerDisplayPrice | null;
  selections: Array<SetItemVariationSelection & { stock: number; stockStatus: string }>;
};
