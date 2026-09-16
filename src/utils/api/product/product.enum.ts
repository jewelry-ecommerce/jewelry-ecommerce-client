export enum CatalogSortType {
  PRICE_ASC = "price_asc",
  PRICE_DESC = "price_desc",
  NEWEST = "newest",
  NAME = "name",
  NAME_DESC = "name_desc",
  BEST_SELLING = "best_selling",
}

export enum ProductStockStatus {
  IN_STOCK = "IN_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export enum ProductPurchaseActionCode {
  BUY_NOW = "BUY_NOW",
  PRE_ORDER = "PRE_ORDER",
  NOTIFY_ME = "NOTIFY_ME",
  DISABLED = "DISABLED",
}

export enum ProductAvailabilityCode {
  IN_STOCK = "IN_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  PRE_ORDER = "PRE_ORDER",
  DISCONTINUED = "DISCONTINUED",
}

export enum ProductLifecycleStatus {
  DRAFT = "DRAFT",
  UNPUBLISHED = "UNPUBLISHED",
  PUBLISHED = "PUBLISHED",
  DISCONTINUED = "DISCONTINUED",
  ARCHIVED = "ARCHIVED",
}

export enum ProductVariationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum ProductReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
