import { BlockTypeCode } from "@/utils/api/cms/cms.enum";
import type { Block } from "@/utils/api/cms/cms.interface";
import type { IParamsGetProducts } from "@/utils/api/product/product.interface";

/** Số sản phẩm tải mỗi page trong slider. Desktop hiện 4 SP/màn hình → 8 = preload 2 màn hình. */
export const CAROUSEL_PAGE_SIZE = 8;

export const getBannerPlacementCode = (block: Block): string | null => {
  const placementCode = block.config?.placementCode;
  if (typeof placementCode !== "string" || !placementCode.trim()) {
    return null;
  }
  return placementCode.trim();
};

export const getProductDataSourceCategorySlugs = (dataSource: Block["config"]["dataSource"]): string[] => {
  const categorySlugs = Array.isArray(dataSource?.categorySlugs) ? dataSource.categorySlugs : [];
  const legacyCategorySlug = dataSource?.categoryId;
  const slugs = [...categorySlugs, legacyCategorySlug]
    .filter((slug): slug is string => typeof slug === "string")
    .map((slug) => slug.trim())
    .filter(Boolean);
  return Array.from(new Set(slugs));
};

const applyCategoryParams = (params: IParamsGetProducts, dataSource: Block["config"]["dataSource"]): void => {
  const categorySlugs = getProductDataSourceCategorySlugs(dataSource);
  if (categorySlugs.length === 1) {
    params.categorySlug = categorySlugs[0];
    return;
  }
  if (categorySlugs.length > 1) {
    params.categorySlugs = categorySlugs.join(",");
  }
};

type CatalogFilterDataSource = Block["config"]["dataSource"] | Block["config"]["productDataSource"];

const resolveCatalogFilterDataSource = (block: Block): CatalogFilterDataSource | undefined => {
  if (block.blockTypeCode === BlockTypeCode.PRODUCT_LIST) {
    return block.config.productDataSource;
  }
  return block.config.dataSource;
};

const applyCollectionParams = (params: IParamsGetProducts, dataSource?: CatalogFilterDataSource): void => {
  const collectionSlug = dataSource?.collectionSlug?.trim();
  if (collectionSlug) {
    params.collectionSlug = collectionSlug;
  }
};

const applyDataSourceSortParam = (params: IParamsGetProducts, dataSource?: CatalogFilterDataSource): void => {
  const sort = dataSource?.sort?.trim();
  if (sort) params.sort = sort;
};

const applyManualProductParams = (params: IParamsGetProducts, dataSource?: Block["config"]["dataSource"]): void => {
  const productIds = Array.isArray(dataSource?.productIds)
    ? dataSource.productIds
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter(Boolean)
    : [];

  if (productIds.length > 0) {
    params.productIds = productIds.join(",");
  }
};

/**
 * Build params cơ bản (filter/sort) cho carousel, không bao gồm page/take/isPagination.
 * Dùng nội bộ — consumer tự thêm pagination state.
 */
const buildProductCarouselFilterParams = (block: Block): IParamsGetProducts => {
  const dataSource = resolveCatalogFilterDataSource(block);
  const params: IParamsGetProducts = {};
  const filterType = dataSource?.filterType;

  if (filterType === "MANUAL_PRODUCTS") {
    applyManualProductParams(params, block.config.dataSource);
    return params;
  }

  switch (filterType) {
    case "CATEGORY":
      applyCategoryParams(params, dataSource as Block["config"]["dataSource"]);
      applyDataSourceSortParam(params, dataSource);
      break;
    case "COLLECTION":
      applyCollectionParams(params, dataSource);
      applyDataSourceSortParam(params, dataSource);
      break;
    case "NEW_ARRIVALS":
      params.sort = "newest";
      break;
    case "BEST_SELLERS":
      params.sort = "best_selling";
      break;
    default:
      applyDataSourceSortParam(params, dataSource);
      break;
  }

  return params;
};

/**
 * Build params cho trang đầu của carousel (isPagination=true, page=1, take=CAROUSEL_PAGE_SIZE).
 * Dùng làm base params trong useProductCarouselInfinite.
 */
export const buildProductCarouselParams = (block: Block): IParamsGetProducts => {
  const filterParams = buildProductCarouselFilterParams(block);
  const dataSource = resolveCatalogFilterDataSource(block);
  const isManual = dataSource?.filterType === "MANUAL_PRODUCTS";

  if (isManual) {
    return {
      ...filterParams,
      isPagination: false,
    };
  }

  return {
    ...filterParams,
    isPagination: true,
    page: 1,
    take: CAROUSEL_PAGE_SIZE,
  };
};
