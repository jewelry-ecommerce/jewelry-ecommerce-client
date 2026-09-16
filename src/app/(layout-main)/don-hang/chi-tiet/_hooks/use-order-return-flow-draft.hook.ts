"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import type { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import type { OrderReturnReason } from "@/utils/api/order/order.enum";
import type { OrderProductItemData } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-product-item.interface";
import {
  isPickupAddressStorable,
  type PickupAddressValues,
} from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-pickup.interface";
import type { OrderReturnDraftHydration } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-draft.interface";
import {
  useOrderReturnDraftStorage,
  type UseOrderReturnDraftStorageParams,
} from "@/app/(layout-main)/don-hang/chi-tiet/_hooks/use-order-return-draft-storage.hook";

const PERSIST_DEBOUNCE_MS = 400;

export interface OrderReturnFlowDraftSlice {
  currentStep: number;
  selectedItems: string[];
  returnQuantities: Record<string, number>;
  replacementProducts: OrderProductItemData[];
  replacementQuantities: Record<string, number>;
  selectedReason: OrderReturnReason | "";
  note: string;
  evidenceUrls: string[];
  pickupAddress?: PickupAddressValues;
}

export interface UseOrderReturnFlowDraftParams extends UseOrderReturnDraftStorageParams {
  order: OrderDetailResponse | null | undefined;
  catalogProducts: OrderProductItemData[];
  getDraftSlice: () => OrderReturnFlowDraftSlice;
  onRestore: (hydration: OrderReturnDraftHydration) => void;
  /** Exchange: chờ catalog load trước khi hydrate (match replacement từ catalog). */
  isCatalogReady?: boolean;
}

function buildPersistPartial(
  flow: UseOrderReturnDraftStorageParams["flow"],
  slice: OrderReturnFlowDraftSlice,
): Parameters<ReturnType<typeof useOrderReturnDraftStorage>["persistSnapshot"]>[0] {
  const includeReplacement = flow === "exchange" && (slice.currentStep >= 1 || slice.replacementProducts.length > 0);
  const onConfirmationStep = (flow === "exchange" && slice.currentStep >= 2) || (flow === "refund" && slice.currentStep >= 1);

  return {
    currentStep: slice.currentStep,
    selectedItemIds: slice.selectedItems,
    returnQuantities: slice.returnQuantities,
    replacementProducts: includeReplacement ? slice.replacementProducts : undefined,
    replacementQuantities: includeReplacement ? slice.replacementQuantities : undefined,
    selectedReason: slice.selectedReason,
    note: slice.note,
    pickupAddress: isPickupAddressStorable(slice.pickupAddress) ? slice.pickupAddress : undefined,
    evidenceUrls: slice.evidenceUrls.length > 0 ? slice.evidenceUrls : onConfirmationStep ? slice.evidenceUrls : undefined,
  };
}

export function useOrderReturnFlowDraft({
  flow,
  orderCode,
  source,
  trackingPhone,
  maxStep,
  order,
  catalogProducts,
  getDraftSlice,
  onRestore,
  isCatalogReady = true,
}: UseOrderReturnFlowDraftParams) {
  const { hydrateFromStorage, persistSnapshot, clearDraft, enablePersist } = useOrderReturnDraftStorage({
    flow,
    orderCode,
    source,
    trackingPhone,
    maxStep,
  });

  const hydratedRef = useRef(false);
  const suppressPersistRef = useRef(false);
  const notifiedRestoreRef = useRef(false);
  const onRestoreRef = useRef(onRestore);
  const getDraftSliceRef = useRef(getDraftSlice);
  onRestoreRef.current = onRestore;
  getDraftSliceRef.current = getDraftSlice;

  const persistNow = useCallback(() => {
    if (!hydratedRef.current) return;
    persistSnapshot(buildPersistPartial(flow, getDraftSliceRef.current()));
  }, [flow, persistSnapshot]);

  useEffect(() => {
    if (!order || !isCatalogReady || hydratedRef.current) return;

    const hydration = hydrateFromStorage(order, catalogProducts);
    hydratedRef.current = true;

    if (hydration) {
      suppressPersistRef.current = true;
      onRestoreRef.current(hydration);
      if (!notifiedRestoreRef.current) {
        notifiedRestoreRef.current = true;
        toast.success("Đã khôi phục tiến trình làm việc trước đó.", { autoClose: 3500 });
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          suppressPersistRef.current = false;
        });
      });
    }

    enablePersist();
  }, [catalogProducts, enablePersist, hydrateFromStorage, isCatalogReady, order]);

  useEffect(() => {
    if (!order || !hydratedRef.current || suppressPersistRef.current) return;

    const timer = window.setTimeout(() => {
      if (suppressPersistRef.current) return;
      persistSnapshot(buildPersistPartial(flow, getDraftSlice()));
    }, PERSIST_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [flow, getDraftSlice, order, persistSnapshot]);

  return { clearDraft, persistNow };
}
