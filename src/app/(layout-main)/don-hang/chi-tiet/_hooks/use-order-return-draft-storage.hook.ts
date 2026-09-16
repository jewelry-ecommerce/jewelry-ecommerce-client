"use client";

import { useCallback, useMemo, useRef } from "react";
import type { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import { destroySessionItem, getSessionItem, saveSessionItem } from "@/services/storage/storage.service";
import type { OrderProductItemData } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-product-item.interface";
import {
  ORDER_RETURN_DRAFT_MAX_AGE_MS,
  type OrderReturnDraftFlow,
  type OrderReturnDraftHydration,
  type OrderReturnDraftSnapshot,
} from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-draft.interface";
import { mergeDraftEvidenceUrls } from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-evidence.util";
import {
  buildOrderReturnDraftSnapshot,
  buildOrderReturnDraftStorageKey,
  isOrderReturnDraftSnapshot,
  sanitizeOrderReturnDraftForHydration,
} from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-draft-sanitize.util";

export interface UseOrderReturnDraftStorageParams {
  flow: OrderReturnDraftFlow;
  orderCode: string;
  source: string | null;
  trackingPhone: string | null;
  maxStep: number;
}

export function useOrderReturnDraftStorage({ flow, orderCode, source, trackingPhone, maxStep }: UseOrderReturnDraftStorageParams) {
  const storageKey = useMemo(
    () => buildOrderReturnDraftStorageKey({ flow, orderCode, source, trackingPhone }),
    [flow, orderCode, source, trackingPhone],
  );

  /** Tránh ghi đè draft bằng state rỗng trước khi hydrate xong. */
  const canPersistRef = useRef(false);

  const readRawSnapshot = useCallback((): OrderReturnDraftSnapshot | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = getSessionItem<unknown>(storageKey);
      if (!isOrderReturnDraftSnapshot(raw)) return null;
      if (raw.flow !== flow || raw.orderCode !== orderCode) return null;
      if (Date.now() - raw.updatedAt > ORDER_RETURN_DRAFT_MAX_AGE_MS) {
        destroySessionItem(storageKey);
        return null;
      }
      return raw;
    } catch {
      destroySessionItem(storageKey);
      return null;
    }
  }, [flow, orderCode, storageKey]);

  const hydrateFromStorage = useCallback(
    (order: OrderDetailResponse, catalogProducts: OrderProductItemData[]): OrderReturnDraftHydration | null => {
      const raw = readRawSnapshot();
      if (!raw) return null;
      return sanitizeOrderReturnDraftForHydration(raw, order, catalogProducts, maxStep);
    },
    [maxStep, readRawSnapshot],
  );

  const persistSnapshot = useCallback(
    (partial: Omit<Parameters<typeof buildOrderReturnDraftSnapshot>[0], "flow" | "orderCode" | "source" | "trackingPhone">) => {
      if (!canPersistRef.current || typeof window === "undefined") return;
      try {
        const existing = readRawSnapshot();
        const merged = buildOrderReturnDraftSnapshot({
          flow,
          orderCode,
          source,
          trackingPhone,
          currentStep: partial.currentStep ?? existing?.currentStep ?? 0,
          selectedItemIds: partial.selectedItemIds ?? existing?.selectedItemIds ?? [],
          returnQuantities: partial.returnQuantities ?? existing?.returnQuantities ?? {},
          replacementProducts: partial.replacementProducts ?? existing?.replacementProducts,
          replacementQuantities: partial.replacementQuantities ?? existing?.replacementQuantities,
          selectedReason: partial.selectedReason ?? existing?.selectedReason ?? "",
          note: partial.note ?? existing?.note ?? "",
          pickupAddress: partial.pickupAddress ?? existing?.pickupAddress,
          evidenceUrls: mergeDraftEvidenceUrls(partial.evidenceUrls, existing?.evidenceUrls),
        });
        saveSessionItem(storageKey, merged);
      } catch (e) {}
    },
    [flow, orderCode, readRawSnapshot, source, storageKey, trackingPhone],
  );

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    destroySessionItem(storageKey);
    canPersistRef.current = false;
  }, [storageKey]);

  const enablePersist = useCallback(() => {
    canPersistRef.current = true;
  }, []);

  const disablePersist = useCallback(() => {
    canPersistRef.current = false;
  }, []);

  return {
    hydrateFromStorage,
    persistSnapshot,
    clearDraft,
    enablePersist,
    disablePersist,
    canPersistRef,
  };
}
