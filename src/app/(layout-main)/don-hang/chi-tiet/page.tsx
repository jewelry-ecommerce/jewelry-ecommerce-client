"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import axios from "axios";
import useSWR from "swr";
import OrderDetailView from "@/components/order/order-detail-view/order-detail-view.component";
import OrderDetailSkeleton from "@/components/order/order-detail-view/order-detail-skeleton.component";
import EmptyComponent from "@/components/empty/empty.component";
import { useOrderDisplay } from "@/hooks/use-order-actions.hook";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { getOrderMeByOrderCode, getOrderStatusByOrderCode, postOrderLookupByOrderCode } from "@/utils/api/checkout/checkout.api";
import type { OrderDetailItem, OrderDetailResponse, OrderStatusHistoryItem } from "@/utils/api/checkout/checkout.interface";
import { formatDate } from "@/utils/format";
import { getPaymentMethodLabel, OrderStatus, PaymentMethod, PaymentStatus } from "@/utils/api/order/order.enum";
import { BreadcrumbComponent } from "@/components";
import { buildOrderDetailTimelineItems } from "./_utils/order-detail-timeline.util";
import { filterOrderDisplayItems, resolveOrderItemUnitDisplayPrice } from "@/utils/order/order-display.util";
import { getOrderLooseItems, getOrderSetLines, mapOrderSetLineToCheckoutItem } from "@/utils/order/order-set-line.util";
import { useOrderDetailRoute } from "@/hooks/order/use-order-detail-route.hook";
import { buildOrderDetailPath, persistOrderDetailContext } from "@/utils/order/order-detail-context.util";
import { isPreOrderOrder } from "@/utils/api/pre-order/pre-order-order.util";

const OrderDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = useAppSelector(selectIsLogin);
  const { orderCode, source, trackingPhone, isHydrated } = useOrderDetailRoute();
  const lastOrderRef = useRef<OrderDetailResponse | null>(null);

  useEffect(() => {
    lastOrderRef.current = null;
  }, [orderCode, source, trackingPhone]);

  const fetchOrderDetail = useCallback(async (): Promise<OrderDetailResponse | null> => {
    if (!orderCode) return null;
    try {
      if (source === "tracking") {
        return await postOrderLookupByOrderCode(orderCode, trackingPhone || "");
      }
      return await getOrderMeByOrderCode(orderCode);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }, [orderCode, source, trackingPhone]);

  const { data: order, isLoading } = useSWR<OrderDetailResponse | null>(
    orderCode && isHydrated ? `order/${orderCode}?source=${source ?? ""}&phone=${trackingPhone ?? ""}` : null,
    fetchOrderDetail,
    {
      keepPreviousData: true,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    if (order) {
      lastOrderRef.current = order;
    }
  }, [order]);

  const cachedOrder = order ?? lastOrderRef.current;
  const shouldFetchRealtimePaymentStatus =
    isLogin &&
    Boolean(orderCode) &&
    cachedOrder?.status === OrderStatus.PENDING &&
    cachedOrder?.paymentMethod !== PaymentMethod.COD &&
    cachedOrder?.paymentStatus !== PaymentStatus.PAID;
  const { data: orderPaymentStatus } = useSWR(
    shouldFetchRealtimePaymentStatus ? `order-payment-status/${orderCode}` : null,
    () => getOrderStatusByOrderCode(orderCode!),
    {
      shouldRetryOnError: false,
      refreshInterval: 0,
    },
  );
  const { resolvedOrder } = useOrderDisplay(cachedOrder, orderPaymentStatus);

  useEffect(() => {
    if (!cachedOrder?.orderCode) return;
    persistOrderDetailContext({
      orderCode: cachedOrder.orderCode,
      orderId: cachedOrder.id,
      ...(source === "tracking" ? { source: "tracking", ...(trackingPhone?.trim() ? { trackingPhone: trackingPhone.trim() } : {}) } : {}),
    });
  }, [cachedOrder?.orderCode, cachedOrder?.id, source, trackingPhone]);

  if (!isHydrated || (!cachedOrder && isLoading)) {
    return <OrderDetailSkeleton />;
  }

  if (!orderCode || !cachedOrder) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 6, md: 10 }, px: 2 }}>
        <EmptyComponent
          url="/image/icons/Empty_Cart.svg"
          title="Không tìm thấy đơn hàng"
          subtitle="Đơn hàng không tồn tại hoặc bạn không có quyền xem đơn hàng này."
          buttonText="Bắt Đầu Mua Sắm"
          onClick={() => router.push(isLogin ? "/tai-khoan?tab=lich-su-don-hang" : "/tra-cuu-don-hang")}
          sx={{ maxWidth: 480, width: "100%" }}
        />
      </Box>
    );
  }

  const orderDisplay = resolvedOrder ?? cachedOrder;

  const infoDetails = [
    { label: "Ngày đặt hàng:", value: formatDate(orderDisplay.createdAt) },
    { label: "Tên người nhận:", value: `${orderDisplay.shippingAddressSnapshot.firstName || ""}`.trim() || "Không có" },
    ...(isPreOrderOrder(orderDisplay) ? [{ label: "Địa chỉ email:", value: orderDisplay.contactEmail?.trim() || "Không có" }] : []),
    { label: "Số điện thoại:", value: orderDisplay.shippingAddressSnapshot.receiverPhone || "N/A" },
    { label: "Phương thức thanh toán:", value: getPaymentMethodLabel(orderDisplay.paymentMethod) },
    {
      label: "Địa chỉ giao hàng:",
      value: `${orderDisplay.shippingAddressSnapshot.addressLine}, ${orderDisplay.shippingAddressSnapshot.wardName}, ${orderDisplay.shippingAddressSnapshot.provinceName}`,
    },
    ...(orderDisplay.vatInvoice
      ? [
          { label: "Yêu cầu xuất VAT:", value: "" },
          { label: "\u00A0\u00A0\u2022 Tên công ty:", value: orderDisplay.vatInvoice.companyName },
          { label: "\u00A0\u00A0\u2022 Địa chỉ công ty:", value: orderDisplay.vatInvoice.companyAddress },
          { label: "\u00A0\u00A0\u2022 Mã số thuế:", value: orderDisplay.vatInvoice.taxCode },
          { label: "\u00A0\u00A0\u2022 Email:", value: orderDisplay.vatInvoice.email },
        ]
      : []),
    { label: "Yêu cầu khác:", value: orderDisplay.note || "Không có" },
  ];

  const timeline = {
    items: buildOrderDetailTimelineItems((orderDisplay.statusHistory ?? []) as OrderStatusHistoryItem[]),
  };

  const productList = {
    setItems: getOrderSetLines(orderDisplay).map(mapOrderSetLineToCheckoutItem),
    products: filterOrderDisplayItems(getOrderLooseItems(orderDisplay) as OrderDetailItem[]).map((item: OrderDetailItem) => {
      const customerDisplayPrice = resolveOrderItemUnitDisplayPrice(item);

      return {
        id: item.id,
        image: item.image,
        name: item.productName,
        variationName: item.variationName,
        variantDetails: item.variationName,
        attributes: item.attributes ?? [],
        quantity: item.quantity,
        price: `${customerDisplayPrice.sellingPriceAfterTaxMinor.toLocaleString()}đ`,
        originalPrice:
          customerDisplayPrice.compareAtPriceAfterTaxMinor != null
            ? `${customerDisplayPrice.compareAtPriceAfterTaxMinor.toLocaleString()}đ`
            : undefined,
        isGift: false,
      };
    }),
  };

  const summary = {
    subtotal: `${parseInt(orderDisplay.subtotal).toLocaleString()}đ`,
    shippingFee: `${parseInt(orderDisplay.shippingFee).toLocaleString()}đ`,
    totalDiscount: `-${parseInt(orderDisplay.discountTotal).toLocaleString()}đ`,
    discounts: [],
    pointsAvailable: 0,
    pointsValue: "",
    pointsUsed: 0,
    total: `${parseInt(orderDisplay.grandTotal).toLocaleString()}đ`,
    earnedPointsText: "",
    isLoggedIn: isLogin,
  };

  const breadcrumbItems = [
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
      href: buildOrderDetailPath({ source, from: searchParams.get("from") }),
    },
  ];

  return (
    <>
      <BreadcrumbComponent items={breadcrumbItems} />
      <OrderDetailView
        order={orderDisplay}
        realtimePaymentStatus={orderPaymentStatus}
        infoDetails={infoDetails}
        timeline={timeline}
        productList={productList}
        summary={summary}
      />
    </>
  );
};

export default OrderDetailPage;
