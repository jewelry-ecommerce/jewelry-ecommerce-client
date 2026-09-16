import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getOrderStatusByOrderCode, resolveGuestOrderAccess } from "@/utils/api/checkout/checkout.api";
import { useCheckoutStorage } from "@/hooks/checkout/use-checkout-storage.hook";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { performCartMergeAndSync } from "@/hooks/cart/use-cart-sync.hook";
import { getStatusInfo, hasPaymentStatusAccess, isPreOrderFulfillmentParam, DEDUPING_INTERVAL_MS, UIStatus } from "../status.constant";
import { buildPaymentStatusUrl } from "../../_utils/payment-status-url.util";

import { useStatusParams } from "./use-status-params.hook";
import { usePaymentVerification } from "./use-payment-verification.hook";
import type { GuestOrderDetailResponse, OrderStatusByOrderCodeResponse } from "@/utils/api/checkout/checkout.interface";

/** Guest (retail + pre-order lần 2 sau /pay) — luôn `orders/guest-access`. */
function mapGuestOrderToPaymentStatus(order: GuestOrderDetailResponse, paymentUrl: string): OrderStatusByOrderCodeResponse {
  const derivedDisplayState =
    order.paymentStatus === "Paid"
      ? "PAYMENT_SUCCESS"
      : order.status === "Cancelled"
        ? "ORDER_EXPIRED"
        : order.paymentMethod === "COD"
          ? "COD_CONFIRMED"
          : "AWAITING_PAYMENT";

  return {
    orderCode: order.orderCode,
    orderStatus: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    grandTotal: order.grandTotal,
    orderExpiresAt: order.orderExpiresAt ?? null,
    orderRemainingSeconds: order.orderRemainingSeconds ?? null,
    paymentLink: order.paymentLink?.trim() || paymentUrl?.trim() || null,
    paymentLinkExpiresAt: order.paymentLinkExpiresAt ?? null,
    paymentLinkStatus: order.paymentLinkStatus?.trim() || null,
    paymentRetryCount: typeof order.paymentRetryCount === "number" ? order.paymentRetryCount : null,
    maxPaymentRetries: typeof order.maxPaymentRetries === "number" ? order.maxPaymentRetries : null,
    displayState: order.displayState?.trim() || derivedDisplayState,
  };
}

export const useCheckoutStatus = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(selectIsLogin);
  const { readLatestOrderSnapshot, persistLatestOrderSnapshot } = useCheckoutStorage();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const hasSyncedCartOnSuccessRef = useRef(false);
  const hasStrippedOrderCodeFromUrlRef = useRef(false);

  const [localOrder, setLocalOrder] = useState({
    orderCode: "",
    phone: "",
    paymentUrl: "",
    guestOrderAccessToken: "",
    guestOrderAccessExpiresAt: "",
    snapshotTimestamp: 0,
  });

  useEffect(() => {
    const data = readLatestOrderSnapshot();
    if (data) {
      setLocalOrder({
        orderCode: data.orderCode || "",
        phone: data.phone || "",
        paymentUrl: data.paymentUrl || "",
        guestOrderAccessToken: data.guestOrderAccessToken || "",
        guestOrderAccessExpiresAt: data.guestOrderAccessExpiresAt || "",
        snapshotTimestamp: data.timestamp || 0,
      });
    }
  }, [readLatestOrderSnapshot]);

  const [internalChecksumVerified, setInternalChecksumVerified] = useState<boolean | null>(null);

  const { params, normalizedInitialStatus, effectiveErrorCode, searchParams } = useStatusParams(internalChecksumVerified);

  const { checksumVerified, syncedOrderCode, isVerifying } = usePaymentVerification(params.payooOrderNo, searchParams);

  // Legacy / bookmark: nếu URL còn orderCode → lưu sessionStorage rồi strip khỏi địa chỉ.
  useEffect(() => {
    if (hasStrippedOrderCodeFromUrlRef.current) return;

    const orderCodeFromUrl = searchParams.get("orderCode")?.trim() || "";
    if (!orderCodeFromUrl) {
      hasStrippedOrderCodeFromUrlRef.current = true;
      return;
    }

    hasStrippedOrderCodeFromUrlRef.current = true;
    persistLatestOrderSnapshot({ orderCode: orderCodeFromUrl });
    setLocalOrder((prev) => ({ ...prev, orderCode: orderCodeFromUrl }));

    const nextParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key === "orderCode") return;
      nextParams[key] = value;
    });
    router.replace(buildPaymentStatusUrl(nextParams));
  }, [searchParams, persistLatestOrderSnapshot, router]);

  useEffect(() => {
    if (!syncedOrderCode?.trim()) return;
    persistLatestOrderSnapshot({ orderCode: syncedOrderCode });
    setLocalOrder((prev) => (prev.orderCode === syncedOrderCode ? prev : { ...prev, orderCode: syncedOrderCode }));
  }, [syncedOrderCode, persistLatestOrderSnapshot]);

  useEffect(() => {
    if (checksumVerified !== null) setInternalChecksumVerified(checksumVerified);
    if (checksumVerified === false) {
      router.replace("/");
    }
  }, [checksumVerified, router]);

  const isPreOrderConfirmation = isPreOrderFulfillmentParam(params.fulfillment);

  const resolveAccess = useCallback(() => {
    const storedOrder = readLatestOrderSnapshot();
    // orderCode trong sessionStorage (sau place/pay) đủ để vào trang trạng thái — kể cả guest pre-order lần 2.
    if (hasPaymentStatusAccess({ payooOrderNo: params.payooOrderNo }, storedOrder?.orderCode)) return true;
    if (isPreOrderConfirmation) return false;
    return Boolean(storedOrder?.guestOrderAccessToken);
  }, [isPreOrderConfirmation, params.payooOrderNo, readLatestOrderSnapshot]);

  useEffect(() => {
    if (isVerifying) return;
    if (resolveAccess()) return;

    router.replace("/");
  }, [isVerifying, resolveAccess, router]);

  const hasAccess = useMemo(() => resolveAccess(), [resolveAccess]);

  const activeOrderCode = useMemo(() => {
    return localOrder.orderCode || syncedOrderCode || "";
  }, [syncedOrderCode, localOrder.orderCode]);

  // Pre-order lần 1: chưa có giao dịch thanh toán → không cần (và guest không thể) đọc trạng thái đơn.
  // Guest sau Payoo (retail + pre-order lần 2): luôn `orders/guest-access` với token `goa_*`.
  const { data: orderStatus, isLoading: isStatusLoading } = useSWR(
    activeOrderCode && !isVerifying && !isPreOrderConfirmation && (isLogin || localOrder.guestOrderAccessToken)
      ? `order-status/${activeOrderCode}/${refreshTrigger}`
      : null,
    async () => {
      if (isLogin) {
        return getOrderStatusByOrderCode(activeOrderCode);
      }

      if (!localOrder.guestOrderAccessToken) throw new Error("MISSING_GUEST_ORDER_ACCESS");
      const guestOrder = await resolveGuestOrderAccess(localOrder.guestOrderAccessToken);
      return mapGuestOrderToPaymentStatus(guestOrder, localOrder.paymentUrl);
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 0,
      dedupingInterval: DEDUPING_INTERVAL_MS,
    },
  );

  useEffect(() => {
    if (!orderStatus) return;

    const now = Date.now();
    const orderExpiry = orderStatus.orderExpiresAt ? new Date(orderStatus.orderExpiresAt).getTime() : null;
    const linkExpiry = orderStatus.paymentLinkExpiresAt ? new Date(orderStatus.paymentLinkExpiresAt).getTime() : null;

    const nextExpiries = [orderExpiry, linkExpiry].filter((t) => t && t > now) as number[];
    if (nextExpiries.length === 0) return;

    const delay = Math.min(...nextExpiries) - now;
    const timer = setTimeout(() => setRefreshTrigger((prev) => prev + 1), delay + 1000);

    return () => clearTimeout(timer);
  }, [orderStatus, refreshTrigger]);

  const statusInfo = useMemo(
    () => getStatusInfo(orderStatus, normalizedInitialStatus, effectiveErrorCode, new Date()),
    [orderStatus, normalizedInitialStatus, effectiveErrorCode],
  );

  useEffect(() => {
    if (statusInfo.uiStatus !== UIStatus.SUCCESS || hasSyncedCartOnSuccessRef.current) return;
    hasSyncedCartOnSuccessRef.current = true;
    void performCartMergeAndSync(dispatch, isLogin);
  }, [dispatch, isLogin, statusInfo.uiStatus]);

  return {
    isLoading: isVerifying || isStatusLoading,
    hasAccess,
    orderStatus,
    statusInfo,
    finalOrderCode: activeOrderCode,
    payooOrderNo: params.payooOrderNo,
    localOrder,
    statusParam: params.status,
    isPreOrder: isPreOrderConfirmation,
  };
};
