import { useCallback } from "react";
import { buildPaymentStatusUrl } from "@/app/(layout-focus)/trang-thai-thanh-toan/_utils/payment-status-url.util";
import {
  CHECKOUT_VARIANT_SNAPSHOTS_KEY,
  LATEST_ORDER_STORAGE_KEY,
  PENDING_PAYMENT_MAX_AGE_MS,
} from "@/hooks/checkout/checkout-storage.constants";

export {
  CHECKOUT_VARIANT_SNAPSHOTS_KEY,
  LATEST_ORDER_STORAGE_KEY,
  PENDING_PAYMENT_MAX_AGE_MS,
} from "@/hooks/checkout/checkout-storage.constants";

export type CheckoutVariantSnapshot = {
  variationId: string;
  details?: string;
  sizeLabel?: string;
};

type CheckoutVariantSnapshotStore = Record<string, CheckoutVariantSnapshot[]>;

export type LatestOrderSnapshot = {
  orderCode?: string;
  phone?: string;
  paymentUrl?: string;
  sessionId?: string;
  paymentMethod?: string;
  status?: string;
  guestOrderAccessToken?: string;
  guestOrderAccessExpiresAt?: string;
  timestamp?: number;
};

export const useCheckoutStorage = () => {
  const clearLatestOrderSnapshot = useCallback(() => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(LATEST_ORDER_STORAGE_KEY);
  }, []);

  const readLatestOrderSnapshot = useCallback((): LatestOrderSnapshot | null => {
    if (typeof window === "undefined") return null;

    try {
      const raw = sessionStorage.getItem(LATEST_ORDER_STORAGE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw) as LatestOrderSnapshot;

      // Check TTL
      const guestAccessExpiresAt = data.guestOrderAccessExpiresAt ? new Date(data.guestOrderAccessExpiresAt).getTime() : 0;
      const hasActiveGuestAccess =
        Boolean(data.guestOrderAccessToken) && Number.isFinite(guestAccessExpiresAt) && guestAccessExpiresAt > Date.now();
      if (!hasActiveGuestAccess && typeof data.timestamp === "number" && Date.now() - data.timestamp > PENDING_PAYMENT_MAX_AGE_MS) {
        clearLatestOrderSnapshot();
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }, [clearLatestOrderSnapshot]);

  const persistLatestOrderSnapshot = useCallback(
    (partialSnapshot: Partial<LatestOrderSnapshot>) => {
      if (typeof window === "undefined") return;

      try {
        const existingSnapshot = readLatestOrderSnapshot() || {};
        const newSnapshot: LatestOrderSnapshot = {
          ...existingSnapshot,
          ...partialSnapshot,
          timestamp: Date.now(), // làm mới timestamp mỗi khi ghi
        };

        sessionStorage.setItem(LATEST_ORDER_STORAGE_KEY, JSON.stringify(newSnapshot));
      } catch (e) {
        console.warn("[Storage] Failed to persist checkout snapshot", e);
      }
    },
    [readLatestOrderSnapshot],
  );

  const getPendingPaymentRedirect = useCallback(
    (sessionId: string | null): string | null => {
      if (!sessionId) return null;

      const latestOrder = readLatestOrderSnapshot();
      if (!latestOrder?.orderCode) return null;

      const isSameSession = latestOrder.sessionId === sessionId;
      const isPayooFlow = Boolean(latestOrder.paymentUrl) && latestOrder.paymentMethod !== "COD";
      const isRecent = typeof latestOrder.timestamp === "number" && Date.now() - latestOrder.timestamp < PENDING_PAYMENT_MAX_AGE_MS;

      if (!isSameSession || !isPayooFlow || !isRecent) return null;

      return buildPaymentStatusUrl({ sessionId });
    },
    [readLatestOrderSnapshot],
  );

  const persistCheckoutVariantSnapshots = useCallback((sessionId: string, snapshots: CheckoutVariantSnapshot[]) => {
    if (typeof window === "undefined" || !sessionId || snapshots.length === 0) return;

    try {
      const raw = sessionStorage.getItem(CHECKOUT_VARIANT_SNAPSHOTS_KEY);
      const store = raw ? (JSON.parse(raw) as CheckoutVariantSnapshotStore) : {};
      store[sessionId] = snapshots;
      sessionStorage.setItem(CHECKOUT_VARIANT_SNAPSHOTS_KEY, JSON.stringify(store));
    } catch (error) {
      console.warn("[Storage] Failed to persist checkout variant snapshots", error);
    }
  }, []);

  const readCheckoutVariantSnapshots = useCallback((sessionId: string | null): CheckoutVariantSnapshot[] => {
    if (typeof window === "undefined" || !sessionId) return [];

    try {
      const raw = sessionStorage.getItem(CHECKOUT_VARIANT_SNAPSHOTS_KEY);
      if (!raw) return [];

      const store = JSON.parse(raw) as CheckoutVariantSnapshotStore;
      return store[sessionId] ?? [];
    } catch {
      return [];
    }
  }, []);

  return {
    readLatestOrderSnapshot,
    persistLatestOrderSnapshot,
    clearLatestOrderSnapshot,
    getPendingPaymentRedirect,
    persistCheckoutVariantSnapshots,
    readCheckoutVariantSnapshots,
    PENDING_PAYMENT_MAX_AGE_MS,
  };
};
