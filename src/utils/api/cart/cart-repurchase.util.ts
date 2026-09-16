import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { buildCartViewItem } from "@/utils/api/cart/cart-view-item-builder.util";
import type { OrderDetailLineAttribute } from "@/utils/api/order/order.interface";
import { filterOrderDisplayItems, type OrderDisplayLine } from "@/utils/order/order-display.util";
import type { PostCartLine } from "./cart.util";
import { buildPostCartLine } from "./cart.util";

export type RepurchaseOrderLine = OrderDisplayLine & {
  id?: string;
  variationId?: string;
  productId?: string;
  productName?: string;
  variationName?: string;
  productSlug?: string;
  image?: string;
  unitPrice?: string;
  quantity?: number;
  stock?: number;
  attributes?: OrderDetailLineAttribute[];
  lineType?: string | null;
  parentOrderItemId?: string | null;
  packagingRelationId?: string | null;
};

export type RepurchasePostItem = {
  variationId: string;
  quantity: number;
  selectedPackagingRelationIds?: string[];
};

const normalizeLineType = (lineType?: string | null) => (lineType || "").toUpperCase();

const isPackagingOptionalLine = (line: RepurchaseOrderLine) => normalizeLineType(line.lineType) === "PACKAGING_OPTIONAL";

/** Gom `selectedPackagingRelationIds` từ dòng PACKAGING_OPTIONAL con theo parent order item. */
export const resolveRepurchasePackagingIdsByParent = (lines: RepurchaseOrderLine[]) => {
  const map = new Map<string, string[]>();

  for (const line of lines) {
    if (!isPackagingOptionalLine(line)) {
      continue;
    }

    const parentId = line.parentOrderItemId?.trim();
    const relationId = line.packagingRelationId?.trim();
    if (!parentId || !relationId) {
      continue;
    }

    const existing = map.get(parentId) ?? [];
    if (!existing.includes(relationId)) {
      map.set(parentId, [...existing, relationId]);
    }
  }

  return map;
};

const resolveOrderLineAttributeDetails = (attributes?: OrderDetailLineAttribute[]) =>
  attributes
    ?.map((attr) => String(attr.value ?? "").trim())
    .filter(Boolean)
    .join(", ") || undefined;

const mergeRepurchasePostItems = (items: RepurchasePostItem[]): RepurchasePostItem[] => {
  const merged = new Map<string, RepurchasePostItem>();

  for (const item of items) {
    const existing = merged.get(item.variationId);
    if (!existing) {
      merged.set(item.variationId, { ...item });
      continue;
    }

    const packagingIds = new Set([...(existing.selectedPackagingRelationIds ?? []), ...(item.selectedPackagingRelationIds ?? [])]);
    merged.set(item.variationId, {
      variationId: item.variationId,
      quantity: existing.quantity + item.quantity,
      ...(packagingIds.size > 0 ? { selectedPackagingRelationIds: Array.from(packagingIds) } : {}),
    });
  }

  return Array.from(merged.values());
};

/** Payload postCart khi mua lại — chỉ SP chính, kèm bao bì optional đã chọn (relationId, không gửi variation bao bì). */
export const buildRepurchasePostItems = (lines: RepurchaseOrderLine[]): RepurchasePostItem[] => {
  const packagingByParent = resolveRepurchasePackagingIdsByParent(lines);

  const items = filterOrderDisplayItems(lines)
    .filter((line) => line.variationId && Number(line.quantity || 0) > 0)
    .map((line) => {
      const selectedPackagingRelationIds = line.id ? packagingByParent.get(line.id) : undefined;

      return {
        variationId: String(line.variationId),
        quantity: Number(line.quantity || 0),
        ...(selectedPackagingRelationIds?.length ? { selectedPackagingRelationIds } : {}),
      };
    });

  return mergeRepurchasePostItems(items);
};

const buildOptimisticCartItemFromOrderLine = (
  line: RepurchaseOrderLine,
  absoluteQuantity: number,
  selectedPackagingRelationIds?: string[],
): CartViewItem => {
  const unitPrice = Number(line.salePrice ?? line.unitPrice ?? 0);
  const compareAtPrice = Number(line.unitPrice ?? line.salePrice ?? 0);

  return buildCartViewItem({
    variationId: String(line.variationId),
    productId: line.productId,
    productSlug: line.productSlug || String(line.variationId),
    name: line.productName || line.variationName || "",
    imageSrc: line.image || "",
    imageAlt: line.productName || line.variationName,
    sellingPriceAfterTaxMinor: unitPrice,
    compareAtPriceAfterTaxMinor: compareAtPrice,
    stock: line.stock,
    details: resolveOrderLineAttributeDetails(line.attributes),
    quantity: absoluteQuantity,
    selected: true,
    selectedPackagingRelationIds,
  });
};

const resolveRepurchaseSourceLine = (lines: RepurchaseOrderLine[], variationId: string) =>
  filterOrderDisplayItems(lines).find((line) => String(line.variationId) === variationId);

export const buildRepurchaseOptimisticCartItems = (lines: RepurchaseOrderLine[], existingCartItems: CartViewItem[]): CartViewItem[] => {
  return buildRepurchasePostItems(lines).map((postItem) => {
    const sourceLine = resolveRepurchaseSourceLine(lines, postItem.variationId);
    const existingItem = existingCartItems.find((item) => String(item.id) === postItem.variationId);
    const absoluteQuantity = (existingItem?.quantity ?? 0) + postItem.quantity;

    if (existingItem) {
      return {
        ...existingItem,
        quantity: absoluteQuantity,
        selected: existingItem.selected ?? true,
        ...(postItem.selectedPackagingRelationIds?.length ? { selectedPackagingRelationIds: postItem.selectedPackagingRelationIds } : {}),
      };
    }

    if (!sourceLine) {
      return buildCartViewItem({
        variationId: postItem.variationId,
        productSlug: postItem.variationId,
        name: "",
        imageSrc: "",
        sellingPriceAfterTaxMinor: 0,
        quantity: absoluteQuantity,
        selected: true,
        selectedPackagingRelationIds: postItem.selectedPackagingRelationIds,
      });
    }

    return buildOptimisticCartItemFromOrderLine(sourceLine, absoluteQuantity, postItem.selectedPackagingRelationIds);
  });
};

export const buildRepurchasePostLines = (lines: RepurchaseOrderLine[], existingCartItems: CartViewItem[]): PostCartLine[] =>
  buildRepurchasePostItems(lines).map((item) =>
    buildPostCartLine({
      variationId: item.variationId,
      quantity: (existingCartItems.find((cartItem) => String(cartItem.id) === String(item.variationId))?.quantity ?? 0) + item.quantity,
      selectedPackagingRelationIds: item.selectedPackagingRelationIds,
    }),
  );
