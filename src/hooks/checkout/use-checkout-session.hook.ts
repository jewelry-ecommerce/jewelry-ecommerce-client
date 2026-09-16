import useSWR, { useSWRConfig } from "swr";
import { useState, useCallback, useRef, useEffect } from "react";
import { getCheckoutSession, placeOrder, updatePricingContext, updateShippingAddress } from "@/utils/api/checkout/checkout.api";
import { CheckoutSession, PlaceOrderPayload, ShippingAddress, UpdatePricingContextPayload } from "@/utils/api/checkout/checkout.interface";
import { getErrorMessage } from "@/utils/helpers/axios/axios.helpers";

export type SyncStatus = "idle" | "loading" | "success" | "error";

export type CheckoutSection = "address" | "pricing" | "order";

export const useCheckoutSession = (sessionId: string) => {
  const { mutate } = useSWRConfig();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const {
    data: session,
    error: fetchError,
    isLoading,
  } = useSWR(sessionId ? `checkout/${sessionId}` : null, () => getCheckoutSession(sessionId), {
    shouldRetryOnError: false,
  });

  const [syncStatus, setSyncStatus] = useState<Record<CheckoutSection, SyncStatus>>({
    address: "idle",
    pricing: "idle",
    order: "idle",
  });

  const requestCounters = useRef<Record<string, number>>({});

  const performSync = useCallback(
    async (section: CheckoutSection, syncFn: () => Promise<CheckoutSession>) => {
      const requestId = (requestCounters.current[section] || 0) + 1;
      requestCounters.current[section] = requestId;

      setSyncStatus((prev) => ({ ...prev, [section]: "loading" }));

      try {
        const updatedSession = await syncFn();

        if (isMounted.current && requestCounters.current[section] === requestId) {
          setSyncStatus((prev) => ({ ...prev, [section]: "success" }));

          if (section === "address") {
            const freshSession = await getCheckoutSession(sessionId);
            mutate(`checkout/${sessionId}`, freshSession, { revalidate: false });
            return freshSession;
          }

          if (updatedSession && typeof updatedSession === "object") {
            mutate(`checkout/${sessionId}`, updatedSession, { revalidate: false });
          }
        }
        return updatedSession;
      } catch (err: unknown) {
        if (isMounted.current && requestCounters.current[section] === requestId) {
          const errorMsg = getErrorMessage(err);

          if (
            typeof err === "object" &&
            err !== null &&
            "response" in err &&
            typeof (err as { response?: { status?: number } }).response?.status === "number" &&
            (err as { response?: { status?: number } }).response?.status === 400 &&
            errorMsg.includes("DRAFT")
          ) {
            mutate(`checkout/${sessionId}`);
            setSyncStatus((prev) => ({ ...prev, [section]: "idle" }));
          } else {
            setSyncStatus((prev) => ({ ...prev, [section]: "error" }));
          }
        }
        throw err;
      }
    },
    [sessionId, mutate],
  );

  const syncAddress = useCallback(
    (data: ShippingAddress, addressId?: string, options?: { acceptPriceChanges?: boolean }) => {
      const status = session?.status?.toLowerCase();
      const hasOrder = session?.orderCode;

      if (status !== "draft" || syncStatus.order === "loading" || hasOrder) {
        return Promise.resolve(session as CheckoutSession);
      }

      const payload = {
        ...(addressId ? { addressId } : { shippingAddress: data }),
        ...(options?.acceptPriceChanges ? { acceptPriceChanges: true } : {}),
      };
      return performSync("address", () => updateShippingAddress(sessionId, payload));
    },
    [session, sessionId, syncStatus.order, performSync],
  );

  const syncPricingContext = useCallback(
    (payload: UpdatePricingContextPayload) => {
      const status = session?.status?.toLowerCase();
      const hasOrder = session?.orderCode;
      if (status !== "draft" || syncStatus.order === "loading" || hasOrder) {
        return Promise.resolve(session as CheckoutSession);
      }
      return performSync("pricing", () => updatePricingContext(sessionId, payload));
    },
    [session, sessionId, syncStatus.order, performSync],
  );

  const handlePlaceOrder = useCallback(
    async (payload: PlaceOrderPayload) => {
      setSyncStatus((prev) => ({ ...prev, order: "loading" }));

      try {
        const result = await placeOrder(sessionId, payload);
        if (isMounted.current) {
          setSyncStatus((prev) => ({ ...prev, order: "success" }));
        }
        return result;
      } catch (err) {
        if (isMounted.current) {
          setSyncStatus((prev) => ({ ...prev, order: "error" }));
        }
        throw err;
      }
    },
    [sessionId],
  );

  return {
    session: fetchError ? undefined : session,
    isLoading,
    fetchError,
    syncStatus,
    syncAddress,
    syncPricingContext,
    handlePlaceOrder,
  };
};
