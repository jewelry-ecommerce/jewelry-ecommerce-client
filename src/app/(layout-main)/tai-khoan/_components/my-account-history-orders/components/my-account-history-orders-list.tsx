"use client";

import React, { useEffect, useRef } from "react";
import { Box, CircularProgress, Skeleton, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import EmptyComponent from "@/components/empty/empty.component";
import { formatPrice } from "@/utils/constants/common.constant";
import { OrderDetailItem, OrderListItem } from "@/utils/api/checkout/checkout.interface";
import {
  StackRowAlignCenter,
  StackRowAlignCenterJustBetween,
  StackRowAlignJustCenter,
  StackRowJustBetween,
} from "@/components/styled/stack.style";
import MyAccountHistoryOrdersActions from "./my-account-history-orders-actions";
import { getOrderDate } from "@/utils/format";
import { filterOrderDisplayItems, resolveOrderItemUnitDisplayPrice } from "@/utils/order/order-display.util";
import { getOrderSetLines, mapOrderSetLineToCheckoutItem } from "@/utils/order/order-set-line.util";
import { getPreOrderListDisplayCode, isPreOrderOrder } from "@/utils/api/pre-order/pre-order-order.util";
import { buildOrderDetailNavigation } from "@/utils/order/order-detail-context.util";
import { IS_LOYALTY_UI_ENABLED } from "@/utils/constants/commerce-feature.constant";
import { resolveCheckoutItemVariantLines } from "@/app/(layout-focus)/thanh-toan/_components/checkout.helpers";
import CheckoutSetItem from "@/app/(layout-focus)/thanh-toan/_components/checkout-product-list/components/checkout-set-item.component";
import type { OrderDetailLineAttribute } from "@/utils/api/order/order.interface";
import { StatusBadge } from "@/components/status-badge/status-badge.component";
import { useProductDefaultImage } from "@/components/providers.component";
import { resolveProductDefaultImageSrc } from "@/utils/config/tenant-branding.util";

interface StatusInfo {
  label: string;
  bg: string;
  color: string;
}

interface MyAccountHistoryOrdersListProps {
  data?: OrderListItem[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  classes: Record<string, string>;
  getStatusInfo: (order: OrderListItem) => StatusInfo;
  showActions?: boolean;
  getOrderHref?: (order: OrderListItem) => string;
  /** Chạy trước khi điều hướng — dùng cho route không mang mã đơn trên URL. */
  onSelectOrder?: (order: OrderListItem) => void;
}

type OrderProductSummaryItem = Pick<OrderListItem["items"][number], "image" | "productName" | "skuCode" | "quantity"> &
  Partial<Pick<OrderDetailItem, "variationName">>;

interface MyAccountOrderProductSummaryProps {
  item: OrderProductSummaryItem;
  classes?: Record<string, string>;
}

export const MyAccountOrderProductSummary: React.FC<MyAccountOrderProductSummaryProps> = ({ item, classes }) => {
  const secondaryText = item.variationName || item.skuCode;
  const productDefaultImage = useProductDefaultImage() || resolveProductDefaultImageSrc();

  return (
    <StackRowAlignCenter gap="16px" sx={{ flex: 1, minWidth: 0 }}>
      <Box
        component="img"
        src={item.image?.trim() || productDefaultImage}
        alt={item.productName}
        onError={(e) => {
          if (productDefaultImage && e.currentTarget.src !== productDefaultImage) {
            e.currentTarget.src = productDefaultImage;
          }
        }}
        className={classes?.productImage}
        sx={!classes ? { width: "77px", aspectRatio: "11 / 13", objectFit: "cover", borderRadius: "4px" } : undefined}
      />
      <Stack gap="8px" sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          className={classes?.productName}
          sx={!classes ? { fontSize: "16px", fontWeight: 700, lineHeight: 1.5, color: "#27251F" } : undefined}
        >
          {item.productName}
        </Typography>
        <Stack gap="4px" sx={{ width: "100%" }}>
          <Typography
            className={classes?.productVariant}
            sx={!classes ? { fontSize: "12px", lineHeight: 1.5, color: "#27272A" } : undefined}
          >
            {secondaryText}
          </Typography>
          <Typography
            className={classes?.productVariant}
            sx={!classes ? { fontSize: "12px", lineHeight: 1.5, color: "#27272A" } : undefined}
          >
            x{item.quantity}
          </Typography>
        </Stack>
      </Stack>
    </StackRowAlignCenter>
  );
};

const SectionSkeleton = () => (
  <Stack sx={{ gap: "16px" }}>
    {[1, 2].map((item) => (
      <Box key={item} sx={{ border: "1px solid #ECECEC", borderRadius: "12px", p: "16px" }}>
        <Stack sx={{ gap: "12px" }}>
          <StackRowAlignCenterJustBetween>
            <Skeleton variant="text" width={220} height={26} />
            <Skeleton variant="rounded" width={110} height={28} />
          </StackRowAlignCenterJustBetween>
          <Skeleton variant="rounded" width="100%" height={86} />
          <StackRowAlignCenterJustBetween>
            <Skeleton variant="text" width={90} height={22} />
            <Skeleton variant="text" width={120} height={28} />
          </StackRowAlignCenterJustBetween>
        </Stack>
      </Box>
    ))}
  </Stack>
);

const LoadMoreSkeleton = () => (
  <Box sx={{ border: "1px solid #ECECEC", borderRadius: "12px", p: "16px" }}>
    <Stack sx={{ gap: "12px" }}>
      <StackRowAlignCenterJustBetween>
        <Skeleton variant="text" width={220} height={26} />
        <Skeleton variant="rounded" width={110} height={28} />
      </StackRowAlignCenterJustBetween>
      <Skeleton variant="rounded" width="100%" height={86} />
    </Stack>
  </Box>
);

const MyAccountHistoryOrdersList: React.FC<MyAccountHistoryOrdersListProps> = ({
  data,
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  classes,
  getStatusInfo,
  showActions = true,
  getOrderHref,
  onSelectOrder,
}) => {
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore || !onLoadMore) return;

    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "120px", threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  if (isLoading) {
    return <SectionSkeleton />;
  }

  const loadMoreSentinel = hasMore && !isLoadingMore && <Box ref={loadMoreRef} sx={{ height: "1px", width: "100%" }} aria-hidden />;

  const loadMoreIndicator = isLoadingMore && (
    <Stack gap="16px" alignItems="center" sx={{ py: "8px" }}>
      <LoadMoreSkeleton />
      <StackRowAlignJustCenter gap="8px" sx={{ color: "#71717A" }}>
        <CircularProgress size={20} sx={{ color: "#71717A" }} />
      </StackRowAlignJustCenter>
    </Stack>
  );

  if (!data || data.length === 0) {
    return (
      <EmptyComponent
        url="/image/icons/icon-empty-product-favorite.svg"
        title="Chưa có đơn hàng"
        subtitle="Khám phá những thiết kế phản ánh phong thái và bản sắc riêng của bạn"
        buttonText="Bắt Đầu Mua Sắm"
        onClick={() => router.push("/")}
      />
    );
  }

  const handleOrderClick = (order: OrderListItem) => {
    onSelectOrder?.(order);
    if (getOrderHref) {
      router.push(getOrderHref(order));
      return;
    }
    router.push(
      buildOrderDetailNavigation({
        orderCode: order.orderCode,
        orderId: order.id,
      }),
    );
  };

  return (
    <Stack gap="16px">
      {data.map((order) => {
        const status = getStatusInfo(order);
        const displayOrderCode = isPreOrderOrder(order) ? getPreOrderListDisplayCode(order) : order.orderCode;
        return (
          <Stack key={order.id} className={classes.orderWrapper}>
            <Box onClick={() => handleOrderClick(order)} sx={{ cursor: "pointer" }}>
              <Stack className={classes.orderHeader}>
                <Box>
                  <Typography className={classes.orderId}>{displayOrderCode}</Typography>
                  <Typography className={classes.orderDate}>{getOrderDate(order.createdAt)}</Typography>
                </Box>
                <StatusBadge label={status.label} color={status.color} backgroundColor={status.bg} className={classes.statusBadge} />
              </Stack>

              <Stack className={classes.productSection}>
                {getOrderSetLines(order).map((line) => (
                  <CheckoutSetItem key={line.lineId} item={mapOrderSetLineToCheckoutItem(line)} skipSetLookup />
                ))}
                {filterOrderDisplayItems(order.items)
                  .filter((item) => !item.setLineId || !getOrderSetLines(order).some((line) => line.setLineId === item.setLineId))
                  .map((item) => {
                    const customerDisplayPrice = resolveOrderItemUnitDisplayPrice(item);

                    return (
                      <StackRowJustBetween key={item.id} className={classes.productItem}>
                        <MyAccountOrderProductSummary item={item} classes={classes} />
                        <Stack>
                          <Typography className={classes.summarySalePrice}>
                            {formatPrice(customerDisplayPrice.sellingPriceAfterTaxMinor)}
                          </Typography>
                          {customerDisplayPrice.compareAtPriceAfterTaxMinor != null ? (
                            <Typography className={classes.summaryPointText}>
                              {formatPrice(customerDisplayPrice.compareAtPriceAfterTaxMinor)}
                            </Typography>
                          ) : null}
                        </Stack>
                      </StackRowJustBetween>
                    );
                  })}
              </Stack>

              <Stack className={classes.summaryBox}>
                <StackRowAlignCenterJustBetween>
                  <Typography className={classes.summaryLabel}>Thành tiền</Typography>
                  <Typography className={classes.summaryPrice}>{formatPrice(Number(order.grandTotal || 0))}</Typography>
                </StackRowAlignCenterJustBetween>
                {IS_LOYALTY_UI_ENABLED ? (
                  <StackRowAlignCenterJustBetween>
                    <Typography className={classes.summaryLabel}>Điểm</Typography>
                    <Typography className={classes.summaryPoint}>1.000 điểm</Typography>
                  </StackRowAlignCenterJustBetween>
                ) : null}
              </Stack>
            </Box>

            {showActions && <MyAccountHistoryOrdersActions order={order} classes={classes} />}
          </Stack>
        );
      })}

      {loadMoreIndicator}
      {loadMoreSentinel}
    </Stack>
  );
};

export default MyAccountHistoryOrdersList;
