"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import useSWR from "swr";

import { BreadcrumbComponent } from "@/components";
import EmptyComponent from "@/components/empty/empty.component";
import OrderDetailView from "@/components/order/order-detail-view/order-detail-view.component";
import OrderDetailSkeleton from "@/components/order/order-detail-view/order-detail-skeleton.component";
import { useCheckoutStorage } from "@/hooks/checkout/use-checkout-storage.hook";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { getPaymentMethodLabel } from "@/utils/api/order/order.enum";
import { getPreOrderDetailByOrderCode, resolvePreOrderAccess } from "@/utils/api/pre-order/pre-order-detail.api";
import type { PreOrderAccessResponse } from "@/utils/api/pre-order/pre-order-detail.interface";
import {
  PRE_ORDER_DETAIL_ROUTE,
  clearPreOrderAccessToken,
  preOrderDetailToViewOrder,
  readPreOrderAccessToken,
  readPreOrderDetailOrderCode,
  savePreOrderAccessToken,
  savePreOrderDetailOrderCode,
} from "@/utils/api/pre-order/pre-order-detail.util";
import { formatDate } from "@/utils/format";
import { filterOrderDisplayItems, resolveOrderItemUnitDisplayPrice } from "@/utils/order/order-display.util";
import { readGuestOrderAccessTokenFromFragment, scrubGuestOrderAccessFragment } from "@/utils/order/guest-order-access.util";

const ORDER_HISTORY_HREF = "/tai-khoan?tab=lich-su-don-hang";

type GuestAccessErrorState = "expired" | "rate-limited" | "invalid" | "unavailable";

const resolveErrorState = (error: unknown): GuestAccessErrorState => {
  if (!axios.isAxiosError(error)) return "unavailable";
  if (error.response?.status === 410) return "expired";
  if (error.response?.status === 429) return "rate-limited";
  if (error.response?.status === 404 || error.response?.status === 400) return "invalid";
  return "unavailable";
};

export default function PreOrderDetailPage() {
  const router = useRouter();
  const isLogin = useAppSelector(selectIsLogin);
  const { persistLatestOrderSnapshot, clearLatestOrderSnapshot } = useCheckoutStorage();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [guestRequestKey, setGuestRequestKey] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const tokenFromFragment = readGuestOrderAccessTokenFromFragment();
    const storedToken = readPreOrderAccessToken();
    const storedOrderCode = readPreOrderDetailOrderCode();

    if (tokenFromFragment) {
      savePreOrderAccessToken(tokenFromFragment);
      persistLatestOrderSnapshot({ guestOrderAccessToken: tokenFromFragment });
      scrubGuestOrderAccessFragment();
      // Deep-link ZNS / guest `#access=` → luôn dùng POST .../access.
      setAccessToken(tokenFromFragment);
      setGuestRequestKey(`pre-order-guest-access:${crypto.randomUUID()}`);
      setOrderCode(null);
      setIsHydrated(true);
      return;
    }

    // Member (đã login + có orderCode từ lịch sử): GET client/:orderCode.
    // Không để token gpa_* cũ trong session chiếm chỗ → gọi access nhầm.
    if (isLogin && storedOrderCode) {
      if (storedToken) clearPreOrderAccessToken();
      setAccessToken(null);
      setGuestRequestKey(null);
      setOrderCode(storedOrderCode);
      setIsHydrated(true);
      return;
    }

    if (storedToken) {
      // Guest reload: giữ access token trong session.
      setAccessToken(storedToken);
      setGuestRequestKey(`pre-order-guest-access:${crypto.randomUUID()}`);
      setOrderCode(null);
    } else if (storedOrderCode) {
      setAccessToken(null);
      setGuestRequestKey(null);
      setOrderCode(storedOrderCode);
    } else {
      setAccessToken(null);
      setGuestRequestKey(null);
      setOrderCode(null);
    }

    setIsHydrated(true);
  }, [isLogin, persistLatestOrderSnapshot]);

  const {
    data: guestData,
    error: guestError,
    isLoading: isGuestLoading,
  } = useSWR<PreOrderAccessResponse>(
    guestRequestKey && accessToken ? guestRequestKey : null,
    () => resolvePreOrderAccess(accessToken || ""),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: true,
    },
  );

  const {
    data: memberData,
    error: memberError,
    isLoading: isMemberLoading,
  } = useSWR(
    !accessToken && orderCode ? `order/${orderCode}/pre-order-detail` : null,
    () => getPreOrderDetailByOrderCode(orderCode || ""),
    {
      shouldRetryOnError: false,
      keepPreviousData: true,
      revalidateOnMount: true,
    },
  );

  useEffect(() => {
    if (!guestData || !accessToken) return;
    const code = guestData.orderCode?.trim() || guestData.preOrderCode?.trim();
    if (code) savePreOrderDetailOrderCode(code);
    savePreOrderAccessToken(accessToken);
    persistLatestOrderSnapshot({
      orderCode: code || undefined,
      guestOrderAccessToken: accessToken,
      guestOrderAccessExpiresAt: guestData.accessExpiresAt,
    });
  }, [accessToken, guestData, persistLatestOrderSnapshot]);

  const order = useMemo(() => {
    if (guestData) return preOrderDetailToViewOrder(guestData);
    if (memberData) return preOrderDetailToViewOrder(memberData);
    return null;
  }, [guestData, memberData]);

  const isFetching = accessToken ? isGuestLoading : isMemberLoading;
  const fetchError = accessToken ? guestError : memberError;
  const guestErrorState = accessToken && !isGuestLoading && !guestData ? (guestError ? resolveErrorState(guestError) : "invalid") : null;

  useEffect(() => {
    if (!accessToken) return;
    if (guestErrorState === "expired" || guestErrorState === "invalid") {
      clearPreOrderAccessToken();
      clearLatestOrderSnapshot();
    }
  }, [accessToken, clearLatestOrderSnapshot, guestErrorState]);

  if (!isHydrated || (isFetching && !order)) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    const isMissingEntry = !accessToken && !orderCode;
    if (accessToken && guestErrorState) {
      const content = {
        expired: {
          title: "Liên kết xem đơn đặt trước đã hết hạn",
          subtitle: "Vui lòng đăng nhập hoặc mở lại liên kết từ tin nhắn ZNS mới nhất.",
        },
        "rate-limited": {
          title: "Có quá nhiều yêu cầu",
          subtitle: "Vui lòng chờ một lúc rồi thử lại.",
        },
        invalid: {
          title: "Không thể mở liên kết",
          subtitle: "Liên kết không hợp lệ hoặc bạn không có quyền xem đơn đặt trước này.",
        },
        unavailable: {
          title: "Chưa thể tải đơn đặt trước",
          subtitle: "Hệ thống đang tạm thời gián đoạn. Vui lòng thử lại sau.",
        },
      }[guestErrorState];

      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 6, md: 10 }, px: 2 }}>
          <EmptyComponent
            url="/image/icons/Empty_Cart.svg"
            title={content.title}
            subtitle={content.subtitle}
            buttonText={isLogin ? "VỀ LỊCH SỬ ĐƠN HÀNG" : "TRA CỨU ĐƠN HÀNG"}
            onClick={() => router.push(isLogin ? ORDER_HISTORY_HREF : "/tra-cuu-don-hang")}
            sx={{ maxWidth: 520, width: "100%" }}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 6, md: 10 }, px: 2 }}>
        <EmptyComponent
          url="/image/icons/Empty_Cart.svg"
          title={isMissingEntry ? "Không tìm thấy đơn đặt trước" : "Chưa thể tải đơn đặt trước"}
          subtitle={
            isMissingEntry
              ? "Vui lòng mở lại đơn từ tab Đặt trước hoặc từ liên kết trong tin nhắn."
              : fetchError
                ? "Hệ thống đang tạm thời gián đoạn hoặc đơn không còn hiệu lực. Vui lòng thử lại sau."
                : "Hệ thống đang tạm thời gián đoạn hoặc đơn không còn hiệu lực. Vui lòng thử lại sau."
          }
          buttonText={isLogin ? "VỀ LỊCH SỬ ĐƠN HÀNG" : "BẮT ĐẦU MUA SẮM"}
          onClick={() => router.push(isLogin ? ORDER_HISTORY_HREF : "/")}
          sx={{ maxWidth: 520, width: "100%" }}
        />
      </Box>
    );
  }

  const { shippingAddressSnapshot: address } = order;
  const shippingAddressValue = [address.addressLine, address.wardName, address.provinceName].filter(Boolean).join(", ");

  const infoDetails = [
    { label: "Ngày đặt hàng:", value: order.createdAt ? formatDate(order.createdAt) : "Không có" },
    { label: "Tên người nhận:", value: `${address.firstName || ""} ${address.lastName || ""}`.trim() || "Không có" },
    { label: "Địa chỉ email:", value: order.contactEmail?.trim() || "Không có" },
    { label: "Số điện thoại:", value: address.receiverPhone || "N/A" },
    ...(order.paymentMethod ? [{ label: "Phương thức thanh toán:", value: getPaymentMethodLabel(order.paymentMethod) }] : []),
    { label: "Địa chỉ giao hàng:", value: shippingAddressValue || "Không có" },
    { label: "Yêu cầu khác:", value: order.note || "Không có" },
  ];

  const productList = {
    products: filterOrderDisplayItems(order.items).map((item, index) => {
      const customerDisplayPrice = resolveOrderItemUnitDisplayPrice(item);

      return {
        id: item.id || `${item.variationId || "item"}:${item.skuCode || index}:${index}`,
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

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    ...(isLogin ? [{ label: "Lịch sử đơn hàng", href: ORDER_HISTORY_HREF }] : []),
    { label: "Chi tiết đơn đặt trước", href: PRE_ORDER_DETAIL_ROUTE },
  ];

  return (
    <>
      <BreadcrumbComponent items={breadcrumbItems} />
      <OrderDetailView
        order={order}
        infoDetails={infoDetails}
        timeline={{ items: [] }}
        productList={productList}
        summary={{
          subtotal: `${parseInt(order.subtotal || "0").toLocaleString()}đ`,
          shippingFee: `${parseInt(order.shippingFee || "0").toLocaleString()}đ`,
          totalDiscount: `-${parseInt(order.discountTotal || "0").toLocaleString()}đ`,
          discounts: [],
          pointsAvailable: 0,
          pointsValue: "",
          pointsUsed: 0,
          total: `${parseInt(order.grandTotal || "0").toLocaleString()}đ`,
          earnedPointsText: "",
          isLoggedIn: isLogin,
        }}
      />
    </>
  );
}
