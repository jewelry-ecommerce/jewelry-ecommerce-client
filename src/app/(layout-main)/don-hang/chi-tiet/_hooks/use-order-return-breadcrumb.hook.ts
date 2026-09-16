"use client";

import { useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { buildOrderDetailPath } from "@/utils/order/order-detail-context.util";

interface UseOrderReturnBreadcrumbParams {
  orderCode: string;
  source: string | null;
  trackingPhone: string | null;
  lastLabel: string;
}

export function useOrderReturnBreadcrumb({ orderCode, source, trackingPhone, lastLabel }: UseOrderReturnBreadcrumbParams) {
  const isLogin = useAppSelector(selectIsLogin);
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery("(max-width:810px)");

  return useMemo(() => {
    const items = [
      { label: "Trang chủ", href: "/" },
      ...(source === "tracking"
        ? [
            { label: "Tra cứu đơn hàng", href: "/tra-cuu-don-hang" },
            ...(searchParams.get("from") === "list" ? [{ label: "Danh sách đơn hàng", href: "/tra-cuu-don-hang?view=list" }] : []),
          ]
        : isLogin
          ? [{ label: "Lịch sử đơn hàng", href: "/tai-khoan?tab=lich-su-don-hang" }]
          : []),
      {
        label: "Chi tiết đơn hàng",
        href: buildOrderDetailPath({
          source,
          from: searchParams.get("from"),
        }),
      },
      { label: lastLabel, href: "#" },
    ];

    if (isMobile && items.length > 2) {
      return [items[0], { label: "...", href: "#" }, ...items.slice(-2)];
    }
    return items;
  }, [isMobile, source, isLogin, orderCode, trackingPhone, searchParams, lastLabel]);
}
