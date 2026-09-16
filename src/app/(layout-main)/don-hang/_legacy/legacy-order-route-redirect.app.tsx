"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import OrderDetailSkeleton from "@/components/order/order-detail-view/order-detail-skeleton.component";
import { ORDER_DETAIL_BASE_PATH, buildOrderDetailPath, persistOrderDetailContext } from "@/utils/order/order-detail-context.util";

interface LegacyOrderSubRouteRedirectProps {
  subPath: string;
}

export function LegacyOrderSubRouteRedirect({ subPath }: LegacyOrderSubRouteRedirectProps) {
  const router = useRouter();
  const { orderCode } = useParams() as { orderCode: string };
  const searchParams = useSearchParams();

  useEffect(() => {
    const normalizedOrderCode = orderCode?.trim();
    if (!normalizedOrderCode) {
      router.replace("/tra-cuu-don-hang");
      return;
    }

    const source = searchParams.get("source");
    const trackingPhone = searchParams.get("phone");

    persistOrderDetailContext({
      orderCode: normalizedOrderCode,
      ...(source === "tracking" ? { source: "tracking" } : {}),
      ...(trackingPhone?.trim() ? { trackingPhone: trackingPhone.trim() } : {}),
    });

    const base = `${ORDER_DETAIL_BASE_PATH}${subPath}`;
    const query = searchParams.toString();
    router.replace(query ? `${base}?${query}` : base);
  }, [orderCode, router, searchParams, subPath]);

  return <OrderDetailSkeleton />;
}

export function LegacyOrderDetailRedirect() {
  const router = useRouter();
  const { orderCode } = useParams() as { orderCode: string };
  const searchParams = useSearchParams();

  useEffect(() => {
    const normalizedOrderCode = orderCode?.trim();
    if (!normalizedOrderCode) {
      router.replace("/tra-cuu-don-hang");
      return;
    }

    const source = searchParams.get("source");
    const trackingPhone = searchParams.get("phone");

    persistOrderDetailContext({
      orderCode: normalizedOrderCode,
      ...(source === "tracking" ? { source: "tracking" } : {}),
      ...(trackingPhone?.trim() ? { trackingPhone: trackingPhone.trim() } : {}),
    });

    router.replace(
      buildOrderDetailPath({
        source,
        from: searchParams.get("from"),
        searchQuery: searchParams.toString(),
      }),
    );
  }, [orderCode, router, searchParams]);

  return <OrderDetailSkeleton />;
}
