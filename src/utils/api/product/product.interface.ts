import type { AttributeDisplayType } from "@/utils/constants/attribute-display-type.enum";
import type { CustomerDisplayPrice, PricePresentation } from "@/utils/customer-display-price.util";

export interface ProductItemColor {
  id: string;
  image?: string;
  color?: string;
}

export interface ApiProduct {
  productId: string;
  productName: string;
  productSlug: string;
  productStatus: string;
  isPurchasable?: boolean;
  shortDescription?: string;
  image: string;
  imageHover: string;
  brandName: string;
  pricing?: {
    minDisplayPriceAfterTaxMinor?: string;
    minSellingPriceAfterTaxMinor?: string | null;
    minCompareAtPriceAfterTaxMinor?: string | null;
    customerDisplayPrice?: CustomerDisplayPrice;
  } | null;
  defaultDisplay?: {
    displayPriceAfterTaxMinor?: string;
    sellingPriceAfterTaxMinor?: string | null;
    compareAtPriceAfterTaxMinor?: string | null;
    image: string;
    customerDisplayPrice?: CustomerDisplayPrice;
  } | null;
  visualSwitch?: {
    displayType: AttributeDisplayType | string;
    label: string;
    attributeCode: string;
    options: Array<{
      valueCode: string;
      label: string;
      selected: boolean;
      thumbnail: string;
      image: string;
      displayPriceAfterTaxMinor?: string;
      sellingPriceAfterTaxMinor?: string | null;
      compareAtPriceAfterTaxMinor?: string | null;
      customerDisplayPrice?: CustomerDisplayPrice;
      stockStatus: string;
      /** Khi có, thêm nhanh vào giỏ (Freesize / không cần popup size) */
      variationId?: string;
      /** Preview SKU khi đổi swatch trên card (listing). */
      previewVariationId?: string;
      /** Campaign đặt trước theo SKU đang preview; null = không pre-order. */
      preOrderCampaignId?: string | null;
    }>;
  } | null;
  /** false = không mở popup chọn biến thể (chỉ màu / Freesize), dùng màu đang xem */
  requiresSelectionDialog: boolean;
  stockStatus: string;
  defaultVariationId?: string | null;
  /** Fallback khi option không có preOrderCampaignId (legacy). */
  preOrderCampaignId?: string | null;
  updatedAt?: string | null;
  pricePresentation?: PricePresentation;
}

export interface ApiProductPagination {
  total: number;
  currentPage: number;
  nextPage: boolean;
  previousPage: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPage: number;
}

export interface IParamsGetProductFilters {
  categorySlug?: string;
  categorySlugs?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export interface IParamsGetProducts {
  orderType?: "ASC" | "DESC";
  orderBy?: string;
  page?: number;
  take?: number;
  search?: string;
  isPagination?: boolean;
  categorySlug?: string;
  categorySlugs?: string;
  collectionSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  attributes?: string;
  sort?: string;
  productIds?: string;
  contract?: "sku-card-v2";
}

export interface IProductsResponse {
  total: number;
  list: ApiProduct[];
  pagination: ApiProductPagination;
  pricePresentation?: PricePresentation;
}

export interface IProductSkuCardSelectedSku {
  id: string;
  skuCode: string;
  image: string | null;
  imageHover: string | null;
  customerDisplayPrice: CustomerDisplayPrice;
  stockStatus: string;
  /** Present when SKU is in an active pre-order campaign (may be OUT_OF_STOCK). */
  preOrderCampaignId?: string | null;
}

export interface IProductSkuCardVisualSwitchOption {
  valueCode: string | null;
  label: string;
  swatchImage: string | null;
  selected: boolean;
  sku: IProductSkuCardSelectedSku;
}

export interface IProductSkuCardVisualSwitch {
  displayType: AttributeDisplayType | string;
  label: string;
  attributeCode: string;
  options: IProductSkuCardVisualSwitchOption[];
}

export interface IProductSkuCardAddToCart {
  mode: "DIRECT" | "SELECT_REQUIRED";
}

export interface IProductSkuCardItem {
  productId: string;
  name: string;
  slug: string;
  status: string;
  isPurchasable: boolean;
  brandName: string | null;
  selectedSku: IProductSkuCardSelectedSku;
  visualSwitch: IProductSkuCardVisualSwitch | null;
  addToCart: IProductSkuCardAddToCart;
  updatedAt: string;
  pricePresentation?: PricePresentation;
}

export interface IProductSkuCardResponse {
  total: number;
  list: IProductSkuCardItem[];
  pagination: ApiProductPagination;
  pricePresentation?: PricePresentation;
}

export interface IProductFilterOption {
  value: string;
  label: string;
  count: number;
  code: string;
}

export interface IProductFilterSection {
  id: string;
  label: string;
  options: IProductFilterOption[];
}

export type IProductFiltersResponse = IProductFilterSection[];

export interface IProductAttribute {
  id: string;
  name: string;
  code: string;
  index: number;
}

export interface IProductAttributeDef {
  id: string;
  name: string;
  code: string;
  index: number;
  displayType: AttributeDisplayType | string;
}

export interface IProductAttributeValue {
  id: string;
  code: string;
  value: string;
  image?: string | null;
  attribute: IProductAttributeDef;
}

export interface ProductPurchaseAction {
  code: string;
  label: string;
  enabled: boolean;
}

export interface IProductVariation {
  id: string;
  slug: string;
  name: string;
  sku: string;
  stock: number;
  stockStatus: string;
  purchaseAction?: ProductPurchaseAction;
  /** Present when SKU is in an active pre-order campaign. */
  preOrderCampaignId?: string | null;
  expectedStockAt?: string | null;
  preOrder?: {
    expectedStockAt?: string | null;
  } | null;
  isDefault?: boolean;
  image: string;
  gallery: Array<{
    url: string;
    type: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  attributeValues: IProductAttributeValue[];
  pricing?: {
    currency: string;
    displayPriceAfterTaxMinor?: number | string | null;
    sellingPriceAfterTaxMinor?: number | string | null;
    compareAtPriceAfterTaxMinor?: number | string | null;
    discountPercent: number | null;
    customerDisplayPrice?: CustomerDisplayPrice;
  };
  attributes?: Record<string, string>;
  pricePresentation?: PricePresentation;
}

export interface IProductBreadcrumb {
  id: string | null;
  name: string;
  slug: string;
  path: string;
  type: string;
  isCurrent: boolean;
  level: number;
}

export interface IProductPricing {
  currency?: string;
  displayPriceAfterTaxMinor?: number | string | null;
  sellingPriceAfterTaxMinor?: number | string | null;
  compareAtPriceAfterTaxMinor?: number | string | null;
  discountPercent: number | null;
  customerDisplayPrice?: CustomerDisplayPrice;
}

export interface IProductGalleryItem {
  url: string;
  type: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface IVariantSelectorOption {
  id: string;
  code: string;
  label: string;
  value: string;
  thumbnail: string | null;
  selected: boolean;
  available: boolean;
  variationIds: string[];
}

export interface IVariantSelector {
  attribute: {
    id: string;
    name: string;
    code: string;
    index: number;
    displayType: AttributeDisplayType | string;
  };
  options: IVariantSelectorOption[];
}

export interface IProductInfo {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
}

export interface IProductInfoItem {
  title: string;
  description: string;
}

export interface IProductPackagingSummary {
  variationId: string;
  skuCode: string;
  name: string;
  status: string;
  productId: string;
  productSlug: string;
  productName: string;
  image?: string | null;
  basePriceAfterTax?: number | null;
  includedPriceAfterTax?: number | null;
  isVisible?: boolean;
  canBeSold?: boolean;
  packagingType?: string | null;
  profileStatus?: string | null;
}

export interface IProductPackagingOption {
  relationId: string;
  scope: string;
  sourceVariationId?: string | null;
  quantity: number;
  includedPriceAfterTax?: number | null;
  isRequired: boolean;
  isDefault: boolean;
  canCustomerChoose: boolean;
  isVisibleOnProduct: boolean;
  sortOrder: number;
  status: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  packaging: IProductPackagingSummary;
}

export interface IProductBySlugResponse {
  id: string;
  slug: string;
  name: string;
  status: string;
  isPurchasable: boolean;
  sku: string;
  spuCode: string;
  brand: {
    name: string;
    code: string;
    image: string | null;
    tenantCode: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  breadcrumbs?: IProductBreadcrumb[];
  shortDescription: string;
  description: string;
  gallery: IProductGalleryItem[];
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    image?: string | null;
  };
  dimensions: {
    weight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
  };
  pricing: IProductPricing;
  defaultDisplay?: ApiProduct["defaultDisplay"] | null;
  availability: {
    inStock: boolean;
    stockStatus: string;
  };
  defaultVariant?: IProductVariation;
  defaultVariantId?: string;
  variantSelectors: IVariantSelector[];
  variants: IProductVariation[];
  packagingOptions?: IProductPackagingOption[];
  productInfos: IProductInfo[];
  createdAt: string;
  updatedAt: string;
  pricePresentation?: PricePresentation;
}

export interface ICustomerWishlistResponse {
  total: number;
  list: ApiProduct[];
  pricePresentation?: PricePresentation;
}

export interface ICustomerWishlistProductIdsResponse {
  total: number;
  productIds: string[];
}

export interface IProductVariationAttributeOption {
  code: string;
  value: string;
  image?: string | null;
}

export interface IProductVariationAttribute {
  id: string;
  name: string;
  code: string;
  index: number;
  values: IProductVariationAttributeOption[];
  displayType: string;
}

export interface IProductVariationResponse {
  id: string;
  skuCode: string;
  name: string;
  slug: string;
  displayPriceAfterTaxMinor?: string;
  sellingPriceAfterTaxMinor?: string | null;
  compareAtPriceAfterTaxMinor?: string | null;
  customerDisplayPrice?: CustomerDisplayPrice;
  stock: number;
  stockStatus?: string;
  status: string;
  image: string;
  imageHover?: string | null;
  /** Present only when SKU is in an active pre-order campaign. */
  preOrderCampaignId?: string | null;
  medias?: Array<{
    url: string;
    sortOrder: number;
  }>;
  attributeValues: Array<{ attributeCode: string; valueCode: string }>;
  pricePresentation?: PricePresentation;
}

export interface IProductVariationsResponse {
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
    isPurchasable: boolean;
    image: string;
    imageHover: string;
    brandName: string;
    categoryName: string;
  };
  attributes: IProductVariationAttribute[];
  variations: IProductVariationResponse[];
  pricePresentation?: PricePresentation;
}

export interface IProductRelatedResponse {
  productId: string;
  productSlug: string;
  items: ApiProduct[];
  source: string;
  todo?: string;
  pricePresentation?: PricePresentation;
}

export interface IProductGiftItem {
  id: string;
  name: string;
  quantity: number;
  image: string | null;
  note: string;
  compareAtPriceAfterTaxMinor: string;
  sellingPriceAfterTaxMinor: string;
}

export interface IProductGiftsResponse {
  productId: string;
  productSlug: string;
  items: IProductGiftItem[];
  source: string;
  todo?: string;
}

export interface IProductVoucher {
  id: string;
  code: string;
  description: string;
  source: string;
}

export interface IProductFlashSale {
  active: boolean;
  flashSaleBadge: {
    slug: string;
    name: string;
    image: string | null;
  };
  label: string;
  backGroundImage: string | null;
  endsInSeconds: number;
  soldCount: number;
  soldTotalCount: number;
  soldValue: number;
  soldType: string;
  source: string;
}

export interface IProductPromotionsResponse {
  productId: string;
  productSlug: string;
  flashSale?: IProductFlashSale;
  vouchers: IProductVoucher[];
  source: string;
  todo?: string;
}

export interface IProductReviewSummaryResponse {
  productId: string;
  productSlug: string;
  averageRating: number;
  reviewCount: number;
  breakdown: Record<string, number>;
  source: string;
  todo?: string;
}

export interface IProductReviewStatsResponse {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: Record<string, number>;
}

export interface IGetProductReviewsParams {
  orderType?: "ASC" | "DESC";
  orderBy?: string;
  page?: number;
  take?: number;
  search?: string;
  isPagination?: boolean;
  productId: string;
  rating?: number;
}

export interface IProductReviewListItem {
  id: string;
  orderId?: string;
  productId: string;
  customerId?: string;
  rating: number;
  comment?: string | null;
  headline?: string | null;
  images?: string[];
  isAnonymous: boolean;
  customerContentEdited?: boolean;
  status: string;
  createdById?: string;
  createdByType?: string;
  updatedById?: string | null;
  updatedByType?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdByUser?: {
    id: string;
    userType?: string;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    status?: string;
  } | null;
  updatedByUser?: {
    id: string;
    userType?: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    status?: string;
  } | null;
  replies?: Array<{
    id: string;
    reviewId: string;
    message: string;
    createdAt?: string;
    updatedAt?: string;
    createdByUser?: {
      id: string;
      userType?: string;
      firstName?: string | null;
      lastName?: string | null;
      displayName?: string | null;
      avatarUrl?: string | null;
      status?: string;
    } | null;
    updatedByUser?: {
      id: string;
      userType?: string;
      displayName?: string | null;
      avatarUrl?: string | null;
      status?: string;
    } | null;
  }>;
}

export interface IProductReviewsResponse {
  total: number;
  list: IProductReviewListItem[];
  pagination?: ApiProductPagination;
}

export interface ICreateProductReviewBatchItemPayload {
  productId: string;
  rating: number;
  comment?: string;
  headline?: string;
  images?: string[];
  isAnonymous: boolean;
}

export interface IProductReviewBatchRequest {
  orderId: string;
  items: ICreateProductReviewBatchItemPayload[];
}

export interface IGetProductReviewMyOrdersParams {
  orderType?: "ASC" | "DESC";
  orderBy?: string;
  page?: number;
  take?: number;
  search?: string;
  isPagination?: boolean;
}

export interface IProductReviewMyOrderListItem {
  orderId: string;
  isEdited?: boolean;
}

export interface IProductReviewMyOrdersResponse {
  total: number;
  list: IProductReviewMyOrderListItem[];
}

export interface IProductReviewOrderItem {
  id: string;
  productId: string;
  orderId: string;
  rating: number;
  headline?: string | null;
  comment?: string | null;
  images: string[];
  isAnonymous: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductReviewOrderDetailResponse {
  orderId: string;
  reviews: IProductReviewOrderItem[];
}

export interface ISearchSuggestionsResponse {
  text: string;
  type: "keyword" | "category" | string;
  slug?: string;
}

export interface ISearchHistoryItem {
  keyword: string;
  searchedAt?: string;
}

export interface IVariationCardItem {
  variationId: string;
  found: boolean;
  productId?: string;
  productSlug?: string;
  productName?: string;
  name?: string;
  slug?: string;
  skuCode?: string;
  image?: string | null;
  imageHover?: string | null;
  brandName?: string | null;
  pricing?: {
    minDisplayPriceAfterTaxMinor?: string | null;
    minSellingPriceAfterTaxMinor?: string | null;
    minCompareAtPriceAfterTaxMinor?: string | null;
  } | null;
  defaultDisplay?: {
    displayPriceAfterTaxMinor?: string | null;
    sellingPriceAfterTaxMinor?: string | null;
    compareAtPriceAfterTaxMinor?: string | null;
    image?: string | null;
  } | null;
  visualSwitch?: ApiProduct["visualSwitch"];
  requiresSelectionDialog?: boolean;
  defaultVariationId?: string | null;
  displayPriceAfterTaxMinor?: string | number;
  sellingPriceAfterTaxMinor?: string | number;
  compareAtPriceAfterTaxMinor?: string | number | null;
  stockStatus?: string;
  productStatus?: string;
  isPurchasable?: boolean;
  status?: string;
  preOrderCampaignId?: string | null;
  updatedAt?: string | null;
  pricePresentation?: PricePresentation;
}

export interface IVariationCardsResponse {
  items: IVariationCardItem[];
  pricePresentation?: PricePresentation;
}

export interface IVariationCardsRequest {
  ids: string[];
}
