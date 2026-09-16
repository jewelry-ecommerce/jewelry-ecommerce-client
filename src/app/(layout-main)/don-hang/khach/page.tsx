"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import useSWR from "swr";

import { BreadcrumbComponent } from "@/components";
import EmptyComponent from "@/components/empty/empty.component";
import OrderDetailView from "@/components/order/order-detail-view/order-detail-view.component";
import OrderDetailSkeleton from "@/components/order/order-detail-view/order-detail-skeleton.component";
import { useCheckoutStorage } from "@/hooks/checkout/use-checkout-storage.hook";
import { resolveGuestOrderAccess } from "@/utils/api/order/order.api";
import type { GuestOrderDetailResponse } from "@/utils/api/order/order.interface";
import { getPaymentMethodLabel } from "@/utils/api/order/order.enum";
import { formatDate } from "@/utils/format";
import { filterOrderDisplayItems, resolveOrderItemUnitDisplayPrice } from "@/utils/order/order-display.util";
import { getOrderLooseItems, getOrderSetLines, mapOrderSetLineToCheckoutItem } from "@/utils/order/order-set-line.util";
import { readGuestOrderAccessTokenFromFragment, scrubGuestOrderAccessFragment } from "@/utils/order/guest-order-access.util";
import { buildOrderDetailTimelineItems } from "../chi-tiet/_utils/order-detail-timeline.util";
import { guestOrderDetailToViewOrder } from "@/utils/order/guest-order-detail.util";

type GuestAccessErrorState = "expired" | "rate-limited" | "invalid" | "unavailable";

const resolveErrorState = (error: unknown): GuestAccessErrorState => {
  if (!axios.isAxiosError(error)) return "unavailable";
  if (error.response?.status === 410) return "expired";
  if (error.response?.status === 429) return "rate-limited";
  if (error.response?.status === 404 || error.response?.status === 400) return "invalid";
  return "unavailable";
};

export default function GuestOrderDetailPage() {
  const { readLatestOrderSnapshot, persistLatestOrderSnapshot, clearLatestOrderSnapshot } = useCheckoutStorage();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const tokenFromFragment = readGuestOrderAccessTokenFromFragment();
    const stored = readLatestOrderSnapshot();
    const token = tokenFromFragment || stored?.guestOrderAccessToken || null;
    if (tokenFromFragment) {
      persistLatestOrderSnapshot({ guestOrderAccessToken: tokenFromFragment });
      scrubGuestOrderAccessFragment();
    }
    setAccessToken(token);
    setRequestKey(token ? `guest-order-access:${crypto.randomUUID()}` : null);
    setIsHydrated(true);
  }, [persistLatestOrderSnapshot, readLatestOrderSnapshot]);

  const { data, error, isLoading } = useSWR<GuestOrderDetailResponse>(requestKey, () => resolveGuestOrderAccess(accessToken || ""), {
    shouldRetryOnError: false,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    if (!data || !accessToken) return;
    persistLatestOrderSnapshot({
      orderCode: data.orderCode,
      guestOrderAccessToken: accessToken,
      guestOrderAccessExpiresAt: data.accessExpiresAt,
    });
  }, [accessToken, data, persistLatestOrderSnapshot]);

  const viewOrder = useMemo(() => (data ? guestOrderDetailToViewOrder(data) : null), [data]);
  const errorState = error ? resolveErrorState(error) : !accessToken && isHydrated ? "invalid" : null;

  useEffect(() => {
    if (errorState === "expired" || errorState === "invalid") {
      clearLatestOrderSnapshot();
    }
  }, [clearLatestOrderSnapshot, errorState]);

  if (!isHydrated || (isLoading && !viewOrder)) return <OrderDetailSkeleton />;

  if (!accessToken || error || !viewOrder) {
    const resolvedErrorState = errorState || "unavailable";
    const content = {
      expired: {
        title: "Liên kết xem đơn hàng đã hết hạn",
        subtitle: "Vui lòng đăng nhập hoặc tra cứu đơn hàng bằng mã đơn và số điện thoại.",
      },
      "rate-limited": {
        title: "Có quá nhiều yêu cầu",
        subtitle: "Vui lòng chờ một lúc rồi thử lại.",
      },
      invalid: {
        title: "Không thể mở liên kết",
        subtitle: "Liên kết không hợp lệ hoặc bạn không có quyền xem đơn hàng này.",
      },
      unavailable: {
        title: "Chưa thể tải đơn hàng",
        subtitle: "Hệ thống đang tạm thời gián đoạn. Vui lòng thử lại sau.",
      },
    }[resolvedErrorState];

    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 6, md: 10 }, px: 2 }}>
        <EmptyComponent
          url="/image/icons/Empty_Cart.svg"
          title={content.title}
          subtitle={content.subtitle}
          buttonText="TRA CỨU ĐƠN HÀNG"
          onClick={() => (window.location.href = "/tra-cuu-don-hang")}
          sx={{ maxWidth: 520, width: "100%" }}
        />
      </Box>
    );
  }

  const infoDetails = [
    { label: "Ngày đặt hàng:", value: formatDate(viewOrder.createdAt) },
    {
      label: "Tên người nhận:",
      value:
        `${viewOrder.shippingAddressSnapshot.firstName || ""} ${viewOrder.shippingAddressSnapshot.lastName || ""}`.trim() || "Không có",
    },
    { label: "Số điện thoại:", value: viewOrder.shippingAddressSnapshot.receiverPhone || "N/A" },
    { label: "Phương thức thanh toán:", value: getPaymentMethodLabel(viewOrder.paymentMethod) },
    {
      label: "Địa chỉ giao hàng:",
      value: `${viewOrder.shippingAddressSnapshot.addressLine}, ${viewOrder.shippingAddressSnapshot.wardName}, ${viewOrder.shippingAddressSnapshot.provinceName}`,
    },
    { label: "Yêu cầu khác:", value: viewOrder.note || "Không có" },
  ];

  const productList = {
    setItems: getOrderSetLines(viewOrder).map(mapOrderSetLineToCheckoutItem),
    products: filterOrderDisplayItems(getOrderLooseItems(viewOrder)).map((item) => {
      const customerDisplayPrice = resolveOrderItemUnitDisplayPrice(item);

      return {
        id: `${item.variationId}:${item.skuCode}`,
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

  return (
    <>
      <BreadcrumbComponent
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Chi tiết đơn hàng", href: "/don-hang/khach" },
        ]}
      />
      <OrderDetailView
        order={viewOrder}
        infoDetails={infoDetails}
        timeline={{ items: buildOrderDetailTimelineItems(viewOrder.statusHistory) }}
        productList={productList}
        summary={{
          subtotal: `${parseInt(viewOrder.subtotal).toLocaleString()}đ`,
          shippingFee: `${parseInt(viewOrder.shippingFee).toLocaleString()}đ`,
          totalDiscount: `-${parseInt(viewOrder.discountTotal).toLocaleString()}đ`,
          discounts: [],
          pointsAvailable: 0,
          pointsValue: "",
          pointsUsed: 0,
          total: `${parseInt(viewOrder.grandTotal).toLocaleString()}đ`,
          earnedPointsText: "",
          isLoggedIn: false,
        }}
      />
    </>
  );
}
