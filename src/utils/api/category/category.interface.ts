export interface ApiCategoryFilterAttribute {
  id: string;
  code: string;
  name: string;
  slug: string;
  type: string;
  options: unknown[];
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  code: string;
  logo: string | null;
  image: string | null;
  level: number;
  parentId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ancestorCategoryIds: string[];
  ancestorCategorySlugs: string[];
  allowedAttributeIds: string[];
  allowedFilterAttributes: ApiCategoryFilterAttribute[];
  productCount: number;
  children: ApiCategory[];
}

export interface ApiPagination {
  total: number;
  currentPage: number;
  nextPage: boolean;
  previousPage: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPage: number;
}

export interface IParamsGetCategoryProducts {
  orderType?: "ASC" | "DESC";
  orderBy?: string;
  page?: number;
  take?: number;
  search?: string;
  isPagination?: boolean;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  attributes?: string;
  sort?: string;
}

export interface ApiCategoryProductItem {
  [key: string]: unknown;
}

export interface ICategoryProductsResponse {
  total: number;
  list: ApiCategoryProductItem[];
  pagination: ApiPagination;
}
