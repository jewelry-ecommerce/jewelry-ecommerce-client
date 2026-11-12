import {
  AI_BUDGET_OVER_MESSAGE,
  AI_CONFIRM_SKU_MESSAGE,
  AI_DUPLICATE_PRODUCT_MESSAGE,
  AI_MISSING_PRICE_MESSAGE,
  AI_OUT_OF_STOCK_MESSAGE,
  AI_SET_MAX_ITEMS,
  AI_SET_MAX_MESSAGE,
  AI_SET_MIN_ITEMS,
  AI_SET_SIZE_MESSAGE,
} from "./ai.constant";
import type { AiSetBuilderItem, CatalogPick } from "./ai.interface";

export type SetBuilderLine = {
  productId: number;
  productName: string;
  thumbnailUrl: string | null;
  slotName: string;
  isKeyPiece: boolean;
  skuId: number | null;
  skuCode: string | null;
  price: number | null;
  stock: number | null;
  slug: string | null;
  confirmedSku: boolean;
};

export type SetLineChange = { ok: true; lines: SetBuilderLine[] } | { ok: false; message: string };

export const lineFromSetItem = (item: AiSetBuilderItem): SetBuilderLine => ({
  productId: item.productId,
  productName: item.productName,
  thumbnailUrl: item.thumbnailUrl,
  slotName: item.slotName,
  isKeyPiece: item.isKeyPiece,
  skuId: item.skuId,
  skuCode: item.skuCode,
  price: item.price,
  stock: item.stock,
  slug: item.slug,
  confirmedSku: false,
});

export const lineFromCatalogPick = (pick: CatalogPick): SetBuilderLine => ({
  productId: pick.productId,
  productName: pick.name,
  thumbnailUrl: pick.thumbnailUrl,
  slotName: "",
  isKeyPiece: false,
  skuId: pick.skuId,
  skuCode: pick.skuCode,
  price: pick.price,
  stock: pick.stock,
  slug: pick.slug,
  confirmedSku: false,
});

export const setBuilderTotal = (lines: SetBuilderLine[]): number =>
  lines.reduce((sum, line) => sum + (line.price ?? 0), 0);

export const budgetOverMessage = (total: number, budget: number | null): string | null =>
  budget != null && total > budget ? AI_BUDGET_OVER_MESSAGE : null;

const hasDuplicate = (lines: SetBuilderLine[], productId: number) => lines.some((line) => line.productId === productId);

export const appendSetLine = (lines: SetBuilderLine[], next: SetBuilderLine): SetLineChange => {
  if (lines.length >= AI_SET_MAX_ITEMS) return { ok: false, message: AI_SET_MAX_MESSAGE };
  if (hasDuplicate(lines, next.productId)) return { ok: false, message: AI_DUPLICATE_PRODUCT_MESSAGE };
  return { ok: true, lines: [...lines, next] };
};

export const replaceSetLine = (lines: SetBuilderLine[], productId: number, next: SetBuilderLine): SetLineChange => {
  const duplicate = lines.some((line) => line.productId === next.productId && line.productId !== productId);
  if (duplicate) return { ok: false, message: AI_DUPLICATE_PRODUCT_MESSAGE };
  return { ok: true, lines: lines.map((line) => (line.productId === productId ? next : line)) };
};

export const removeSetLine = (lines: SetBuilderLine[], productId: number): SetBuilderLine[] =>
  lines.filter((line) => line.productId !== productId);

export const confirmSetLine = (lines: SetBuilderLine[], productId: number): SetBuilderLine[] =>
  lines.map((line) => {
    if (line.productId !== productId || line.skuId == null || (line.stock ?? 0) <= 0) return line;
    return { ...line, confirmedSku: true };
  });

const lineBlockMessage = (line: SetBuilderLine): string | null => {
  if (line.price == null) return AI_MISSING_PRICE_MESSAGE;
  if (line.skuId == null || !line.confirmedSku) return AI_CONFIRM_SKU_MESSAGE;
  if ((line.stock ?? 0) <= 0) return AI_OUT_OF_STOCK_MESSAGE;
  return null;
};

export const setBuilderBlockMessage = (lines: SetBuilderLine[], budget: number | null): string | null => {
  if (lines.length < AI_SET_MIN_ITEMS || lines.length > AI_SET_MAX_ITEMS) return AI_SET_SIZE_MESSAGE;
  const lineMessage = lines.map(lineBlockMessage).find((message) => message != null) ?? null;
  return lineMessage ?? budgetOverMessage(setBuilderTotal(lines), budget);
};
