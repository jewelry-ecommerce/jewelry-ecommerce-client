import { AI_BUDGET_SCOPE_ITEM, AI_BUDGET_SCOPE_SET, AI_MODEL_SOURCE } from "./ai.constant";
import type {
  AiBudgetScope,
  AiPreferenceValues,
  AiRecommendation,
  AiResultSource,
  AiSetBuilderItem,
  AiSetBuilderResponse,
  AiStylistRequest,
  AiStylistResponse,
  AiStylistSession,
  AiStylistSessionItem,
  CatalogPick,
} from "./ai.interface";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const readString = (row: Record<string, unknown>, key: string): string => {
  const value = row[key];
  return typeof value === "string" ? value.trim() : "";
};

export const readNumber = (row: Record<string, unknown>, key: string): number | null => {
  const value = row[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
};

export const readPositiveId = (row: Record<string, unknown>, key: string): number | null => {
  const value = readNumber(row, key);
  if (value == null || !Number.isInteger(value) || value <= 0) return null;
  return value;
};

const readNullableString = (row: Record<string, unknown>, key: string): string | null => readString(row, key) || null;

const readSource = (value: unknown): AiResultSource => (value === AI_MODEL_SOURCE ? "AI" : "FALLBACK");

const readStock = (row: Record<string, unknown>): number | null => {
  const numeric = readNumber(row, "stock") ?? readNumber(row, "availableStock");
  if (numeric != null) return Math.max(0, Math.trunc(numeric));
  const status = readString(row, "stockStatus");
  if (status === "OUT_OF_STOCK" || status === "DISCONTINUED") return 0;
  if (status === "IN_STOCK") return 1;
  return null;
};

const readThumbnail = (row: Record<string, unknown>): string | null => {
  const direct = readNullableString(row, "thumbnailUrl") ?? readNullableString(row, "image");
  if (direct) return direct;
  const displayImage = isRecord(row.defaultDisplay) ? readNullableString(row.defaultDisplay, "image") : null;
  if (displayImage) return displayImage;
  return isRecord(row.selectedSku) ? readNullableString(row.selectedSku, "image") : null;
};

const readSlug = (row: Record<string, unknown>): string | null =>
  readNullableString(row, "slug") ?? readNullableString(row, "productSlug");

const readProductPrice = (row: Record<string, unknown>): number | null => {
  const direct = readNumber(row, "price") ?? readNumber(row, "priceFrom") ?? readNumber(row, "salePrice");
  if (direct != null) return direct;
  if (!isRecord(row.pricing)) return null;
  return readNumber(row.pricing, "minSellingPriceAfterTaxMinor") ?? readNumber(row.pricing, "minDisplayPriceAfterTaxMinor");
};

export const formatMatchScore = (score: number): string => {
  if (!Number.isFinite(score)) return "0";
  const relative = score >= 0 && score <= 1 ? score * 100 : score;
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(relative);
};

export const toStylistRequest = (values: AiPreferenceValues, budgetScope: AiBudgetScope): AiStylistRequest => {
  const request: AiStylistRequest = { occasion: values.occasion.trim(), budget: values.budget, budgetScope };
  if (values.styles.length > 0) request.style = values.styles;
  const recipient = values.recipient.trim();
  if (recipient) request.recipient = recipient;
  return request;
};

export const toSetBuilderRequest = (values: AiPreferenceValues): AiStylistRequest =>
  toStylistRequest(values, AI_BUDGET_SCOPE_SET);

const mapRecommendation = (value: unknown): AiRecommendation | null => {
  if (!isRecord(value)) return null;
  const id = readPositiveId(value, "id") ?? readPositiveId(value, "productId");
  const name = readString(value, "name") || readString(value, "productName");
  if (id == null || !name) return null;
  return {
    type: readString(value, "type") || "PRODUCT",
    id,
    name,
    thumbnailUrl: readThumbnail(value),
    reason: readString(value, "reason"),
    matchScore: readNumber(value, "matchScore") ?? 0,
    skuId: readPositiveId(value, "skuId"),
    skuCode: readNullableString(value, "skuCode"),
    price: readNumber(value, "price"),
    stock: readStock(value),
    source: readSource(value.source),
    slug: readSlug(value),
  };
};

export const mapStylistResponse = (payload: unknown): AiStylistResponse => {
  const row = isRecord(payload) ? payload : {};
  const recommendations = Array.isArray(row.recommendations) ? row.recommendations.flatMap((item) => {
    const mapped = mapRecommendation(item);
    return mapped ? [mapped] : [];
  }) : [];
  const sessionId = readPositiveId(row, "sessionId");
  const banner = readNullableString(row, "banner");
  return {
    source: readSource(row.source),
    ...(banner ? { banner } : {}),
    ...(sessionId != null ? { sessionId } : {}),
    recommendations,
  };
};

const mapSetItem = (value: unknown): AiSetBuilderItem | null => {
  if (!isRecord(value)) return null;
  const productId = readPositiveId(value, "productId") ?? readPositiveId(value, "id");
  const productName = readString(value, "productName") || readString(value, "name");
  if (productId == null || !productName) return null;
  return {
    productId,
    productName,
    thumbnailUrl: readThumbnail(value),
    slotName: readString(value, "slotName"),
    isKeyPiece: value.isKeyPiece === true || value.keyPiece === true,
    sortOrder: readNumber(value, "sortOrder") ?? 0,
    skuId: readPositiveId(value, "skuId"),
    skuCode: readNullableString(value, "skuCode"),
    price: readNumber(value, "price"),
    stock: readStock(value),
    source: readSource(value.source),
    slug: readSlug(value),
  };
};

export const mapSetBuilderResponse = (payload: unknown): AiSetBuilderResponse => {
  const row = isRecord(payload) ? payload : {};
  const items = Array.isArray(row.items) ? row.items.flatMap((item) => {
    const mapped = mapSetItem(item);
    return mapped ? [mapped] : [];
  }) : [];
  const sessionId = readPositiveId(row, "sessionId");
  const banner = readNullableString(row, "banner");
  return {
    code: readString(row, "code"),
    name: readString(row, "name"),
    description: readString(row, "description"),
    bundleDiscountPercent: readNumber(row, "bundleDiscountPercent") ?? 0,
    items,
    source: readSource(row.source),
    ...(banner ? { banner } : {}),
    totalPrice: readNumber(row, "totalPrice") ?? 0,
    ...(sessionId != null ? { sessionId } : {}),
  };
};

const mapSessionItem = (value: unknown): AiStylistSessionItem | null => {
  if (!isRecord(value)) return null;
  const productId = readPositiveId(value, "productId");
  if (productId == null) return null;
  return {
    productId,
    skuId: readPositiveId(value, "skuId"),
    reason: readString(value, "reason"),
    matchScore: readNumber(value, "matchScore") ?? 0,
    sortOrder: readNumber(value, "sortOrder") ?? 0,
  };
};

const readCreatedDate = (row: Record<string, unknown>): string | number | null => {
  const value = row.createdDate;
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
};

const mapSession = (value: unknown): AiStylistSession | null => {
  if (!isRecord(value)) return null;
  const id = readPositiveId(value, "id");
  if (id == null) return null;
  const styles = Array.isArray(value.styles) ? value.styles.filter((item): item is string => typeof item === "string") : [];
  const items = Array.isArray(value.items) ? value.items.flatMap((item) => {
    const mapped = mapSessionItem(item);
    return mapped ? [mapped] : [];
  }) : [];
  return {
    id,
    occasion: readString(value, "occasion"),
    styles,
    budget: readNumber(value, "budget"),
    budgetScope: readString(value, "budgetScope") || AI_BUDGET_SCOPE_ITEM,
    recipient: readNullableString(value, "recipient"),
    source: readSource(value.source),
    fallbackReason: readNullableString(value, "fallbackReason"),
    createdDate: readCreatedDate(value),
    items,
  };
};

export const mapStylistSessions = (payload: unknown): AiStylistSession[] => {
  const rows = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.list) ? payload.list : [];
  return rows.flatMap((row) => {
    const mapped = mapSession(row);
    return mapped ? [mapped] : [];
  });
};

const pickSkuObject = (row: Record<string, unknown>): Record<string, unknown> | null => {
  if (isRecord(row.selectedSku)) return row.selectedSku;
  const skus = Array.isArray(row.skus) ? row.skus.filter(isRecord) : [];
  const inStock = skus.find((sku) => (readNumber(sku, "availableStock") ?? readNumber(sku, "stock") ?? 0) > 0);
  return inStock ?? skus.find((sku) => sku.isDefault === true) ?? skus[0] ?? null;
};

const mapCatalogHit = (row: Record<string, unknown>): CatalogPick | null => {
  const productId = readPositiveId(row, "productId") ?? readPositiveId(row, "id");
  const name = readString(row, "productName") || readString(row, "name");
  if (productId == null || !name) return null;
  const sku = pickSkuObject(row);
  const skuId = sku ? readPositiveId(sku, "id") ?? readPositiveId(sku, "skuId") : readPositiveId(row, "defaultVariationId");
  return {
    productId,
    name,
    thumbnailUrl: readThumbnail(row),
    slug: readSlug(row),
    skuId,
    skuCode: sku ? readNullableString(sku, "skuCode") : null,
    price: (sku ? readNumber(sku, "salePrice") ?? readNumber(sku, "price") : null) ?? readProductPrice(row),
    stock: sku ? readStock(sku) : readStock(row),
  };
};

const readCatalogRows = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];
  const list = payload.list ?? payload.content;
  return Array.isArray(list) ? list.filter(isRecord) : [];
};

export const mapCatalogHits = (payload: unknown): CatalogPick[] =>
  readCatalogRows(payload).flatMap((row) => {
    const mapped = mapCatalogHit(row);
    return mapped ? [mapped] : [];
  });

export const pickCatalogSlug = (payload: unknown, productId: number): string | null =>
  mapCatalogHits(payload).find((item) => item.productId === productId)?.slug ?? null;

export const readApiErrorCode = (error: unknown): string | null => {
  if (!isRecord(error) || !isRecord(error.response) || !isRecord(error.response.data)) return null;
  const data = error.response.data;
  if (typeof data.code === "string" && data.code) return data.code;
  if (!Array.isArray(data.errors) || !isRecord(data.errors[0])) return null;
  return typeof data.errors[0].code === "string" && data.errors[0].code ? data.errors[0].code : null;
};
