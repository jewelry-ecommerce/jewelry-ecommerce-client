import { AI_BUDGET_DEFAULT, AI_BUDGET_MAX, AI_BUDGET_MIN, AI_RECIPIENT_MAX_LENGTH, AI_SET_DRAFT_STORAGE_KEY } from "./ai.constant";
import type { AiPreferenceValues } from "./ai.interface";
import { isRecord, readNumber, readPositiveId, readString } from "./ai.mapper";
import type { SetBuilderLine } from "./set-builder.validation";

export type StylistSetDraft = {
  prefs: AiPreferenceValues;
  productIds: number[];
  skuIds: Array<number | null>;
  prices: Array<number | null>;
  lines: SetBuilderLine[];
};

const readNullableString = (row: Record<string, unknown>, key: string): string | null => readString(row, key) || null;

const parsePrefs = (value: unknown): AiPreferenceValues => {
  const row = isRecord(value) ? value : {};
  const budget = readNumber(row, "budget");
  const styles = Array.isArray(row.styles) ? row.styles.filter((item): item is string => typeof item === "string") : [];
  const safeBudget = budget != null && budget >= AI_BUDGET_MIN && budget <= AI_BUDGET_MAX ? budget : AI_BUDGET_DEFAULT;
  return {
    occasion: readString(row, "occasion"),
    styles,
    budget: safeBudget,
    recipient: readString(row, "recipient").slice(0, AI_RECIPIENT_MAX_LENGTH),
  };
};

const parseLine = (value: unknown): SetBuilderLine | null => {
  if (!isRecord(value)) return null;
  const productId = readPositiveId(value, "productId");
  const productName = readString(value, "productName");
  if (productId == null || !productName) return null;
  return {
    productId,
    productName,
    thumbnailUrl: readNullableString(value, "thumbnailUrl"),
    slotName: readString(value, "slotName"),
    isKeyPiece: value.isKeyPiece === true,
    skuId: readPositiveId(value, "skuId"),
    skuCode: readNullableString(value, "skuCode"),
    price: readNumber(value, "price"),
    stock: readNumber(value, "stock"),
    slug: readNullableString(value, "slug"),
    confirmedSku: value.confirmedSku === true,
  };
};

const linesFromIds = (row: Record<string, unknown>): SetBuilderLine[] => {
  const productIds = Array.isArray(row.productIds) ? row.productIds : [];
  const skuIds = Array.isArray(row.skuIds) ? row.skuIds : [];
  const prices = Array.isArray(row.prices) ? row.prices : [];
  return productIds.flatMap((value, index) => {
    const productId = typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
    if (productId == null) return [];
    const skuValue = skuIds[index];
    const priceValue = prices[index];
    return [{
      productId,
      productName: `Sản phẩm ${productId}`,
      thumbnailUrl: null,
      slotName: "",
      isKeyPiece: false,
      skuId: typeof skuValue === "number" && Number.isInteger(skuValue) && skuValue > 0 ? skuValue : null,
      skuCode: null,
      price: typeof priceValue === "number" && Number.isFinite(priceValue) ? priceValue : null,
      stock: null,
      slug: null,
      confirmedSku: false,
    }];
  });
};

export const parseStylistSetDraft = (payload: unknown): StylistSetDraft | null => {
  if (!isRecord(payload)) return null;
  const parsedLines = Array.isArray(payload.lines) ? payload.lines.flatMap((line) => {
    const mapped = parseLine(line);
    return mapped ? [mapped] : [];
  }) : [];
  const lines = parsedLines.length > 0 ? parsedLines : linesFromIds(payload);
  return { prefs: parsePrefs(payload.prefs), productIds: lines.map((line) => line.productId), skuIds: lines.map((line) => line.skuId), prices: lines.map((line) => line.price), lines };
};

export const buildStylistSetDraft = (prefs: AiPreferenceValues, lines: SetBuilderLine[]): StylistSetDraft => ({
  prefs,
  lines,
  productIds: lines.map((line) => line.productId),
  skuIds: lines.map((line) => line.skuId),
  prices: lines.map((line) => line.price),
});

export const saveStylistSetDraft = (draft: StylistSetDraft): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AI_SET_DRAFT_STORAGE_KEY, JSON.stringify(draft));
};

export const readStylistSetDraft = (): StylistSetDraft | null => {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(AI_SET_DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return parseStylistSetDraft(JSON.parse(raw));
  } catch {
    return null;
  }
};
