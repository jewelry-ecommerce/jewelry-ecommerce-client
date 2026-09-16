import type {
  AddItemToCartPayload,
  AddSetToCartPayload,
  Cart,
  CartLine,
  CartSetComponent,
  CartSummary,
  UpdateCartQuantityPayload,
} from "@/utils/api/cart/cart.interface";
import type { VoucherValidationResult } from "@/utils/api/promotion/promotion.interface";
import { MockApiError, cloneDeep, withLatency } from "@/mocks/mock-transport";
import { findProductById, findVariantById } from "@/mocks/data/catalog.data";
import { findSetById } from "@/mocks/data/set.data";
import { findVoucherByCode } from "@/mocks/data/promotion.data";

/**
 * In-memory cart with localStorage persistence.
 *
 * Line identity follows the reference storefront contract exactly:
 * - loose item  → `lineId === variantId`
 * - set instance → deterministic `lineId` derived from `setId` + the sorted `(setItemId, variantId)`
 *   selection, so re-adding the same configuration merges instead of creating a duplicate line, and
 *   changing any single slot produces a genuinely different line.
 * - set component → identified by the pair (`lineId`, `setItemId`), never by `lineId` alone.
 */
const STORAGE_KEY = "jewelry-commerce.cart.v1";
const SHIPPING_FEE_STANDARD = 45000;
const FREE_SHIPPING_THRESHOLD = 5000000;

type CartState = {
  lines: CartLine[];
  appliedVoucherCode: string | null;
};

let memoryState: CartState = { lines: [], appliedVoucherCode: null };

const readState = (): CartState => {
  if (typeof window === "undefined") return memoryState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryState;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    return { lines: Array.isArray(parsed.lines) ? parsed.lines : [], appliedVoucherCode: parsed.appliedVoucherCode ?? null };
  } catch {
    // Corrupt payload from an older build: start clean rather than crashing the storefront.
    return { lines: [], appliedVoucherCode: null };
  }
};

const writeState = (state: CartState): void => {
  memoryState = state;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota or private mode: the in-memory copy still serves this session.
  }
};

/** Deterministic set-instance identity. Same configuration in, same `lineId` out. */
export const buildSetLineId = (setId: string, selections: { setItemId: string; variantId: string }[]): string => {
  const signature = selections
    .map((selection) => `${selection.setItemId.trim()}:${selection.variantId.trim()}`)
    .sort()
    .join("|");

  let hash = 0;
  const source = `${setId}::${signature}`;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(index);
    hash |= 0;
  }
  return `setline-${setId}-${Math.abs(hash).toString(36)}`;
};

const buildItemLine = (variantId: string, quantity: number): CartLine => {
  const variant = findVariantById(variantId);
  if (!variant) throw new MockApiError("VARIANT_NOT_FOUND", "That option is no longer available.", 404);
  const product = findProductById(variant.productId);
  if (!product) throw new MockApiError("PRODUCT_NOT_FOUND", "That product is no longer available.", 404);

  const isPreOrder = Boolean(product.preOrder);
  const outOfStock = !isPreOrder && variant.availableStock <= 0;

  return {
    kind: "ITEM",
    lineId: variant.id,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    variantId: variant.id,
    skuCode: variant.skuCode,
    variantLabel: [variant.metalColorLabel, variant.sizeLabel].filter(Boolean).join(" · "),
    image: variant.media[0]?.url ?? product.media[0]?.url ?? "",
    unitPrice: variant.salePrice,
    compareAtPrice: variant.listPrice > variant.salePrice ? variant.listPrice : null,
    quantity,
    lineTotal: variant.salePrice * quantity,
    stockStatus: variant.stockStatus,
    availableStock: variant.availableStock,
    isPreOrder,
    isValid: !outOfStock,
    invalidReason: outOfStock ? "This piece is currently out of stock." : null,
  };
};

const buildSetComponents = (setId: string, selections: { setItemId: string; variantId: string }[]): CartSetComponent[] => {
  const set = findSetById(setId);
  if (!set) throw new MockApiError("SET_NOT_FOUND", "That set is no longer available.", 404);

  return selections
    .map((selection) => {
      const slot = set.items.find((item) => item.setItemId === selection.setItemId);
      if (!slot) throw new MockApiError("SET_SLOT_INVALID", "This set configuration is out of date. Please reload the set.", 400);

      const variant = findVariantById(selection.variantId);
      if (!variant) throw new MockApiError("VARIANT_NOT_FOUND", "One of the selected pieces is unavailable.", 404);
      const product = findProductById(variant.productId);
      if (!product) throw new MockApiError("PRODUCT_NOT_FOUND", "One of the selected pieces is unavailable.", 404);

      return {
        setItemId: slot.setItemId,
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        skuCode: variant.skuCode,
        variantLabel: [variant.metalColorLabel, variant.sizeLabel].filter(Boolean).join(" · "),
        image: variant.media[0]?.url ?? product.media[0]?.url ?? "",
        unitPrice: variant.salePrice,
        compareAtPrice: variant.listPrice > variant.salePrice ? variant.listPrice : null,
        slotName: slot.slotName,
        isKeyPiece: slot.isKeyPiece,
        stockStatus: variant.stockStatus,
        availableStock: variant.availableStock,
      };
    })
    .sort((left, right) => {
      const leftOrder = set.items.find((item) => item.setItemId === left.setItemId)?.sortOrder ?? 0;
      const rightOrder = set.items.find((item) => item.setItemId === right.setItemId)?.sortOrder ?? 0;
      return leftOrder - rightOrder;
    });
};

const buildSetLine = (payload: AddSetToCartPayload): CartLine => {
  const set = findSetById(payload.setId);
  if (!set) throw new MockApiError("SET_NOT_FOUND", "That set is no longer available.", 404);

  if (payload.selections.length !== set.items.length) {
    throw new MockApiError("SET_SELECTION_INCOMPLETE", "Please choose an option for every piece in this set.", 400);
  }

  const components = buildSetComponents(payload.setId, payload.selections);
  const componentSubtotal = components.reduce((total, component) => total + component.unitPrice, 0);
  const discounted = Math.round(componentSubtotal * (1 - set.bundleDiscountPercent / 100));
  const unavailable = components.find((component) => component.availableStock <= 0);

  return {
    kind: "SET",
    lineId: buildSetLineId(payload.setId, payload.selections),
    setId: set.id,
    setCode: set.code,
    setName: set.name,
    setSlug: set.slug,
    image: set.heroImage,
    quantity: payload.quantity,
    bundleDiscountPercent: set.bundleDiscountPercent,
    components,
    lineTotal: discounted * payload.quantity,
    isValid: !unavailable,
    invalidReason: unavailable ? `${unavailable.productName} is currently out of stock.` : null,
  };
};

const recalculateLine = (line: CartLine): CartLine => {
  if (line.kind === "ITEM") {
    return { ...line, lineTotal: line.unitPrice * line.quantity };
  }
  const componentSubtotal = line.components.reduce((total, component) => total + component.unitPrice, 0);
  const discounted = Math.round(componentSubtotal * (1 - line.bundleDiscountPercent / 100));
  return { ...line, lineTotal: discounted * line.quantity };
};

const computeVoucherDiscount = (lines: CartLine[], subtotal: number, voucherCode: string | null): number => {
  if (!voucherCode) return 0;
  const voucher = findVoucherByCode(voucherCode);
  if (!voucher || voucher.status !== "ACTIVE" || subtotal < voucher.minOrderValue) return 0;

  if (voucher.discountType === "FREE_SHIPPING") return 0;
  const raw = voucher.discountType === "PERCENT" ? Math.round((subtotal * voucher.discountValue) / 100) : voucher.discountValue;
  return voucher.maxDiscountAmount ? Math.min(raw, voucher.maxDiscountAmount) : raw;
};

const buildSummary = (lines: CartLine[], voucherCode: string | null): CartSummary => {
  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
  const productDiscount = lines.reduce((total, line) => {
    if (line.kind === "ITEM") {
      return total + (line.compareAtPrice ? (line.compareAtPrice - line.unitPrice) * line.quantity : 0);
    }
    const listTotal = line.components.reduce((sum, component) => sum + component.unitPrice, 0) * line.quantity;
    return total + (listTotal - line.lineTotal);
  }, 0);

  const voucherDiscount = computeVoucherDiscount(lines, subtotal, voucherCode);
  const voucher = voucherCode ? findVoucherByCode(voucherCode) : undefined;
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || (voucher?.status === "ACTIVE" && voucher.discountType === "FREE_SHIPPING");
  const shippingFee = lines.length === 0 || freeShipping ? 0 : SHIPPING_FEE_STANDARD;

  const itemCount = lines.reduce(
    (total, line) => total + (line.kind === "SET" ? line.components.length * line.quantity : line.quantity),
    0,
  );

  return {
    subtotal,
    productDiscount,
    voucherDiscount,
    shippingFee,
    grandTotal: Math.max(0, subtotal - voucherDiscount + shippingFee),
    itemCount,
  };
};

const toCart = (state: CartState): Cart => ({
  lines: cloneDeep(state.lines),
  summary: buildSummary(state.lines, state.appliedVoucherCode),
  appliedVoucherCode: state.appliedVoucherCode,
});

export const mockGetCart = (): Promise<Cart> => withLatency(() => toCart(readState()));

export const mockAddItemToCart = (payload: AddItemToCartPayload): Promise<Cart> =>
  withLatency(() => {
    const state = readState();
    const quantity = Math.max(1, Math.trunc(payload.quantity));
    const existingIndex = state.lines.findIndex((line) => line.kind === "ITEM" && line.lineId === payload.variantId);

    if (existingIndex >= 0) {
      const existing = state.lines[existingIndex];
      const nextLines = [...state.lines];
      nextLines[existingIndex] = recalculateLine({ ...existing, quantity: existing.quantity + quantity } as CartLine);
      writeState({ ...state, lines: nextLines });
    } else {
      writeState({ ...state, lines: [buildItemLine(payload.variantId, quantity), ...state.lines] });
    }

    return toCart(readState());
  });

export const mockAddSetToCart = (payload: AddSetToCartPayload): Promise<Cart> =>
  withLatency(() => {
    const state = readState();
    const quantity = Math.max(1, Math.trunc(payload.quantity));
    const line = buildSetLine({ ...payload, quantity });
    const existingIndex = state.lines.findIndex((entry) => entry.kind === "SET" && entry.lineId === line.lineId);

    if (existingIndex >= 0) {
      const existing = state.lines[existingIndex];
      const nextLines = [...state.lines];
      nextLines[existingIndex] = recalculateLine({ ...existing, quantity: existing.quantity + quantity } as CartLine);
      writeState({ ...state, lines: nextLines });
    } else {
      writeState({ ...state, lines: [line, ...state.lines] });
    }

    return toCart(readState());
  });

export const mockUpdateCartQuantity = (payload: UpdateCartQuantityPayload): Promise<Cart> =>
  withLatency(() => {
    const state = readState();
    const quantity = Math.trunc(payload.quantity);

    const nextLines =
      quantity <= 0
        ? state.lines.filter((line) => line.lineId !== payload.lineId)
        : state.lines.map((line) => (line.lineId === payload.lineId ? recalculateLine({ ...line, quantity } as CartLine) : line));

    writeState({ ...state, lines: nextLines });
    return toCart(readState());
  });

export const mockRemoveCartLine = (lineId: string): Promise<Cart> =>
  withLatency(() => {
    const state = readState();
    writeState({ ...state, lines: state.lines.filter((line) => line.lineId !== lineId) });
    return toCart(readState());
  });

/** Replaces the SKU chosen for one slot of an existing set line, preserving slot identity. */
export const mockUpdateSetSelection = (lineId: string, setItemId: string, variantId: string): Promise<Cart> =>
  withLatency(() => {
    const state = readState();
    const target = state.lines.find((line) => line.kind === "SET" && line.lineId === lineId);
    if (!target || target.kind !== "SET") throw new MockApiError("CART_LINE_NOT_FOUND", "That set is no longer in your bag.", 404);

    const selections = target.components.map((component) => ({
      setItemId: component.setItemId,
      variantId: component.setItemId === setItemId ? variantId : component.variantId,
    }));

    const replacement = buildSetLine({ setId: target.setId, quantity: target.quantity, selections });
    const remaining = state.lines.filter((line) => line.lineId !== lineId);
    const mergeIndex = remaining.findIndex((line) => line.kind === "SET" && line.lineId === replacement.lineId);

    if (mergeIndex >= 0) {
      const existing = remaining[mergeIndex];
      remaining[mergeIndex] = recalculateLine({ ...existing, quantity: existing.quantity + target.quantity } as CartLine);
      writeState({ ...state, lines: remaining });
    } else {
      writeState({ ...state, lines: [replacement, ...remaining] });
    }

    return toCart(readState());
  });

export const mockClearCart = (): Promise<Cart> =>
  withLatency(() => {
    writeState({ lines: [], appliedVoucherCode: null });
    return toCart(readState());
  });

export const mockApplyVoucher = (code: string): Promise<VoucherValidationResult> =>
  withLatency(() => {
    const state = readState();
    const voucher = findVoucherByCode(code);
    const trimmed = code.trim().toUpperCase();

    if (!voucher) return { isValid: false, code: trimmed, reason: "This code does not exist." };
    if (voucher.status === "EXPIRED") return { isValid: false, code: trimmed, reason: "This code has expired." };
    if (voucher.status !== "ACTIVE") return { isValid: false, code: trimmed, reason: "This code is not active yet." };

    const subtotal = state.lines.reduce((total, line) => total + line.lineTotal, 0);
    if (subtotal < voucher.minOrderValue) {
      return { isValid: false, code: trimmed, reason: "Your bag does not reach the minimum order value for this code." };
    }

    writeState({ ...state, appliedVoucherCode: voucher.code });
    return { isValid: true, voucher, discountAmount: computeVoucherDiscount(state.lines, subtotal, voucher.code) };
  });

export const mockRemoveVoucher = (): Promise<Cart> =>
  withLatency(() => {
    const state = readState();
    writeState({ ...state, appliedVoucherCode: null });
    return toCart(readState());
  });

/** Used by the checkout mock once an order is placed. */
export const resetCartAfterCheckout = (): void => writeState({ lines: [], appliedVoucherCode: null });

export const readCartStateForCheckout = (): Cart => toCart(readState());
