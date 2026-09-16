"use client";

import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { BreadcrumbComponent } from "@/components";
import OrderReturnDetailView from "@/components/order/order-return-detail/order-return-detail-view.component";
import OrderReturnDetailSkeleton from "@/components/order/order-return-detail/order-return-detail-skeleton.component";
import { getClientOrderReturnByOrderCode, getClientOrderReturnDetail } from "@/utils/api/order/order.api";
import { getErrorMessage } from "@/utils/helpers/axios";
import { useOrderReturnBreadcrumb } from "@/app/(layout-main)/don-hang/chi-tiet/_hooks/use-order-return-breadcrumb.hook";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { mapOrderReturnDetailViewModel } from "../_utils/order-return-detail.mapper";
import { useOrderDetailRoute } from "@/hooks/order/use-order-detail-route.hook";

function OrderReturnExchangeDetailPage() {
  const searchParams = useSearchParams();
  const isLogin = useAppSelector(selectIsLogin);
  const { orderCode, source, trackingPhone, isHydrated } = useOrderDetailRoute();
  const orderReturnIdFromQuery = searchParams.get("orderReturnId");
  const orderReturnCodeFromQuery = searchParams.get("orderReturnCode");
  const returnDetailFetchCode = orderReturnCodeFromQuery || orderCode;
  const resolvedOrderCode = orderCode ?? "";

  const breadcrumbItems = useOrderReturnBreadcrumb({
    orderCode: resolvedOrderCode,
    source,
    trackingPhone,
    lastLabel: "Chi tiết đổi trả - hoàn tiền",
  });

  const swrKey =
    isHydrated && resolvedOrderCode && (orderReturnIdFromQuery || returnDetailFetchCode)
      ? ["order-return-detail", orderReturnIdFromQuery ? "id" : "code", orderReturnIdFromQuery ?? returnDetailFetchCode, isLogin]
      : null;

  const {
    data: returnRequest,
    isLoading,
    error,
  } = useSWR(swrKey, () =>
    orderReturnIdFromQuery ? getClientOrderReturnDetail(orderReturnIdFromQuery) : getClientOrderReturnByOrderCode(returnDetailFetchCode!),
  );

  const viewModel = useMemo(() => {
    if (!returnRequest) return null;
    return mapOrderReturnDetailViewModel(returnRequest);
  }, [returnRequest]);

  return (
    <>
      <BreadcrumbComponent items={breadcrumbItems} />
      {isHydrated && isLoading ? (
        <OrderReturnDetailSkeleton />
      ) : error || !viewModel ? (
        <Box sx={{ textAlign: "center", py: 10, px: 2 }}>
          <Typography variant="h6">Không tải được chi tiết yêu cầu đổi / trả</Typography>
          <Typography sx={{ mt: 1, color: "#71717A" }}>{getErrorMessage(error) || "Vui lòng thử lại sau."}</Typography>
        </Box>
      ) : (
        <OrderReturnDetailView viewModel={viewModel} />
      )}
    </>
  );
}

export default OrderReturnExchangeDetailPage;
