"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { type OrderDetailContext, readOrderDetailContext } from "@/utils/order/order-detail-context.util";

export interface UseOrderDetailRouteResult {
  orderCode: string | null;
  source: string | null;
  trackingPhone: string | null;
  isHydrated: boolean;
}

/**
 * Resolves order identity for `/don-hang/chi-tiet` (orderCode in sessionStorage).
 * Optional `?orderCode=` query is a soft fallback for deep links / refresh edge cases.
 */
export function useOrderDetailRoute(): UseOrderDetailRouteResult {
  const searchParams = useSearchParams();
  const [context, setContext] = useState<OrderDetailContext | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setContext(readOrderDetailContext());
    setIsHydrated(true);
  }, []);

  const queryOrderCode = searchParams.get("orderCode")?.trim() || null;
  const orderCode = context?.orderCode ?? queryOrderCode;

  const sourceFromQuery = searchParams.get("source");
  const source = context?.source ?? (sourceFromQuery === "tracking" ? "tracking" : sourceFromQuery);
  const trackingPhone = context?.trackingPhone ?? searchParams.get("phone");

  return {
    orderCode,
    source,
    trackingPhone,
    isHydrated,
  };
}
