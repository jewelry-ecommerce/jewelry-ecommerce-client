import type { OrderDetailItem, OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import { isOrderReturnReason, type OrderReturnReason } from "@/utils/api/order/order.enum";
import type { OrderProductItemData } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-product-item.interface";
import {
  isPickupAddressStorable,
  normalizePickupAddressValues,
  type PickupAddressValues,
} from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-pickup.interface";
import {
  ORDER_RETURN_DRAFT_MAX_EVIDENCE,
  ORDER_RETURN_DRAFT_VERSION,
  type OrderReturnDraftFlow,
  type OrderReturnDraftHydration,
  type OrderReturnDraftSnapshot,
} from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-draft.interface";
import { isPersistableEvidenceUrl } from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-evidence.util";

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function sanitizeQty(raw: unknown, maxQty: number): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  return clampInt(n, 1, Math.max(1, maxQty));
}

function sanitizeReturnQuantities(
  orderItems: OrderDetailItem[],
  selectedIds: string[],
  raw: Record<string, unknown> | undefined,
): Record<string, number> {
  const byId = new Map(orderItems.map((i) => [i.id, i]));
  const out: Record<string, number> = {};
  for (const id of selectedIds) {
    const item = byId.get(id);
    if (!item) continue;
    const maxQty = item.quantity > 0 ? item.quantity : 1;
    out[id] = sanitizeQty(raw?.[id], maxQty);
  }
  return out;
}

function sanitizeSelectedItemIds(orderItems: OrderDetailItem[], raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const valid = new Set(orderItems.map((i) => i.id));
  return raw.filter((id): id is string => typeof id === "string" && valid.has(id));
}

function parseStoredReplacementProduct(entry: Record<string, unknown>): OrderProductItemData | null {
  const productId = typeof entry.productId === "string" ? entry.productId.trim() : "";
  if (!productId) return null;
  const productName = typeof entry.productName === "string" ? entry.productName.trim() : "";
  const image = typeof entry.image === "string" ? entry.image : "";
  const slug = typeof entry.slug === "string" ? entry.slug : "";
  const sellingPriceAfterTaxMinor =
    typeof entry.sellingPriceAfterTaxMinor === "number" || typeof entry.sellingPriceAfterTaxMinor === "string"
      ? entry.sellingPriceAfterTaxMinor
      : 0;
  const compareAtPriceAfterTaxMinor =
    typeof entry.compareAtPriceAfterTaxMinor === "number" || typeof entry.compareAtPriceAfterTaxMinor === "string"
      ? entry.compareAtPriceAfterTaxMinor
      : 0;
  const stockStatus = typeof entry.stockStatus === "string" ? entry.stockStatus : "";
  const variationId = typeof entry.variationId === "string" ? entry.variationId : undefined;
  const attributes = Array.isArray(entry.attributes) ? (entry.attributes as OrderProductItemData["attributes"]) : undefined;

  if (!productName) return null;

  return {
    productId,
    variationId,
    productName,
    image,
    slug,
    compareAtPriceAfterTaxMinor,
    sellingPriceAfterTaxMinor,
    stockStatus,
    attributes,
  };
}

function sanitizeReplacementProducts(catalog: OrderProductItemData[], raw: unknown): OrderProductItemData[] {
  if (!Array.isArray(raw)) return [];
  const byId = new Map(catalog.map((p) => [p.productId, p]));
  const seen = new Set<string>();
  const out: OrderProductItemData[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    const productId = typeof entry.productId === "string" ? entry.productId : "";
    if (!productId || seen.has(productId)) continue;
    const fromCatalog = byId.get(productId);
    const product = fromCatalog ?? parseStoredReplacementProduct(entry);
    if (!product) continue;
    seen.add(productId);
    out.push(product);
  }
  return out;
}

function sanitizeReplacementQuantities(products: OrderProductItemData[], raw: Record<string, unknown> | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of products) {
    out[p.productId] = sanitizeQty(raw?.[p.productId], 999);
  }
  return out;
}

function sanitizePickupAddress(raw: unknown): PickupAddressValues | undefined {
  if (!isRecord(raw)) return undefined;
  const fullName = typeof raw.fullName === "string" ? raw.fullName.trim() : "";
  const provinceName = typeof raw.provinceName === "string" ? raw.provinceName.trim() : "";
  const wardName = typeof raw.wardName === "string" ? raw.wardName.trim() : "";
  const addressLine = typeof raw.addressLine === "string" ? raw.addressLine.trim() : "";
  const phone = typeof raw.phone === "string" ? raw.phone.trim() : "";
  const provinceCode = clampInt(Number(raw.provinceCode), 0, 999_999);
  const wardCode = clampInt(Number(raw.wardCode), 0, 999_999_999);

  if (!fullName && !addressLine && !phone) return undefined;

  const normalized = normalizePickupAddressValues({
    fullName,
    provinceCode,
    provinceName,
    wardCode,
    wardName,
    addressLine,
    phone,
  });

  if (!isPickupAddressStorable(normalized)) {
    return normalized.fullName || normalized.addressLine || normalized.phone ? normalized : undefined;
  }

  return normalized;
}

function sanitizeEvidenceUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isPersistableEvidenceUrl).slice(0, ORDER_RETURN_DRAFT_MAX_EVIDENCE);
}

function sanitizeReason(raw: unknown): OrderReturnReason | "" {
  if (typeof raw !== "string" || !raw) return "";
  return isOrderReturnReason(raw) ? raw : "";
}

function clampStep(
  flow: OrderReturnDraftFlow,
  maxStep: number,
  step: number,
  selectedItemIds: string[],
  replacementProducts: OrderProductItemData[],
): number {
  let s = clampInt(step, 0, maxStep);
  if (selectedItemIds.length === 0) return 0;
  if (flow === "exchange" && s >= 2 && replacementProducts.length === 0) {
    s = 1;
  }
  if (flow === "exchange" && s >= 1 && replacementProducts.length === 0 && s > 1) {
    s = 1;
  }
  return s;
}

export function buildOrderReturnDraftStorageKey(params: {
  flow: OrderReturnDraftFlow;
  orderCode: string;
  source: string | null;
  trackingPhone: string | null;
}): string {
  const sourcePart = params.source === "tracking" ? "tracking" : "account";
  const phonePart = params.source === "tracking" ? params.trackingPhone?.trim() || "na" : "na";
  return `order_return_draft:v${ORDER_RETURN_DRAFT_VERSION}:${params.flow}:${params.orderCode}:${sourcePart}:${phonePart}`;
}

export function isOrderReturnDraftSnapshot(value: unknown): value is OrderReturnDraftSnapshot {
  if (!isRecord(value)) return false;
  return (
    value.version === ORDER_RETURN_DRAFT_VERSION &&
    (value.flow === "exchange" || value.flow === "refund") &&
    typeof value.orderCode === "string" &&
    typeof value.updatedAt === "number"
  );
}

export function sanitizeOrderReturnDraftForHydration(
  snapshot: OrderReturnDraftSnapshot,
  order: OrderDetailResponse,
  catalogProducts: OrderProductItemData[],
  maxStep: number,
): OrderReturnDraftHydration | null {
  if (snapshot.orderCode !== order.orderCode) return null;

  const selectedItemIds = sanitizeSelectedItemIds(order.items, snapshot.selectedItemIds);
  const returnQuantities = sanitizeReturnQuantities(order.items, selectedItemIds, snapshot.returnQuantities);

  const replacementProducts =
    snapshot.flow === "exchange" ? sanitizeReplacementProducts(catalogProducts, snapshot.replacementProducts) : [];
  const replacementQuantities =
    snapshot.flow === "exchange"
      ? sanitizeReplacementQuantities(replacementProducts, snapshot.replacementQuantities as Record<string, unknown>)
      : {};

  const currentStep = clampStep(snapshot.flow, maxStep, snapshot.currentStep, selectedItemIds, replacementProducts);

  return {
    currentStep,
    selectedItemIds,
    returnQuantities,
    replacementProducts,
    replacementQuantities,
    selectedReason: sanitizeReason(snapshot.selectedReason),
    note: typeof snapshot.note === "string" ? snapshot.note.slice(0, 2000) : "",
    pickupAddress: sanitizePickupAddress(snapshot.pickupAddress),
    evidenceUrls: sanitizeEvidenceUrls(snapshot.evidenceUrls),
  };
}

export function buildOrderReturnDraftSnapshot(params: {
  flow: OrderReturnDraftFlow;
  orderCode: string;
  source: string | null;
  trackingPhone: string | null;
  currentStep: number;
  selectedItemIds: string[];
  returnQuantities: Record<string, number>;
  replacementProducts?: OrderProductItemData[];
  replacementQuantities?: Record<string, number>;
  selectedReason?: OrderReturnReason | "";
  note?: string;
  pickupAddress?: PickupAddressValues;
  evidenceUrls?: string[];
}): OrderReturnDraftSnapshot {
  return {
    version: ORDER_RETURN_DRAFT_VERSION,
    flow: params.flow,
    orderCode: params.orderCode,
    source: params.source,
    trackingPhone: params.trackingPhone,
    currentStep: params.currentStep,
    selectedItemIds: params.selectedItemIds,
    returnQuantities: params.returnQuantities,
    replacementProducts: params.replacementProducts,
    replacementQuantities: params.replacementQuantities,
    selectedReason: params.selectedReason,
    note: params.note ?? "",
    pickupAddress: params.pickupAddress,
    evidenceUrls: sanitizeEvidenceUrls(params.evidenceUrls),
    updatedAt: Date.now(),
  };
}
