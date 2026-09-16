import useSWR from "swr";
import { useCallback } from "react";
import axios from "axios";
import { getOrderMeByOrderCode, postOrderLookupByOrderCode, resolveGuestOrderAccess } from "@/utils/api/checkout/checkout.api";
import type { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import { useRetryOrderPayment } from "@/hooks/checkout/use-retry-order-payment.hook";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { guestOrderDetailToViewOrder } from "@/utils/order/guest-order-detail.util";
import { readStoredGuestOrderAccessToken } from "@/utils/order/guest-order-access.util";
import { useCheckoutStorage } from "@/hooks/checkout/use-checkout-storage.hook";

async function fetchConfirmPaymentOrder({
  orderCode,
  isLogin,
  snapshotPhone,
}: {
  orderCode: string;
  isLogin: boolean;
  snapshotPhone?: string;
}): Promise<OrderDetailResponse> {
  if (isLogin) {
    return getOrderMeByOrderCode(orderCode);
  }

  const guestToken = readStoredGuestOrderAccessToken();
  if (guestToken) {
    const guestOrder = await resolveGuestOrderAccess(guestToken);
    if (guestOrder.orderCode === orderCode) {
      return guestOrderDetailToViewOrder(guestOrder);
    }
  }

  if (snapshotPhone) {
    return postOrderLookupByOrderCode(orderCode, snapshotPhone);
  }

  throw new Error("MISSING_ORDER_ACCESS");
}

export const useConfirmPayment = (orderCode: string) => {
  const isLogin = useAppSelector(selectIsLogin);
  const { readLatestOrderSnapshot } = useCheckoutStorage();
  const latestOrderSnapshot = readLatestOrderSnapshot();
  const snapshotPhone = latestOrderSnapshot?.orderCode === orderCode ? latestOrderSnapshot.phone?.trim() : undefined;

  const { retryPaymentSession, isRetrying, payooLoadingOpen, closePayooLoading } = useRetryOrderPayment();

  const fetchOrder = useCallback(async () => {
    try {
      return await fetchConfirmPaymentOrder({ orderCode, isLogin, snapshotPhone });
    } catch (error) {
      if (!isLogin && snapshotPhone && axios.isAxiosError(error) && error.response?.status === 401) {
        return postOrderLookupByOrderCode(orderCode, snapshotPhone);
      }
      throw error;
    }
  }, [orderCode, isLogin, snapshotPhone]);

  const {
    data: order,
    error: fetchError,
    isLoading,
  } = useSWR(orderCode ? `confirm-payment/${orderCode}?login=${isLogin ? "1" : "0"}&phone=${snapshotPhone ?? ""}` : null, fetchOrder, {
    shouldRetryOnError: false,
  });

  const handleRetry = useCallback(
    async (paymentMethod: string) => {
      if (!orderCode) return;
      await retryPaymentSession({
        orderCode,
        paymentMethod,
        receiverPhone: order?.shippingAddressSnapshot?.receiverPhone || snapshotPhone || "",
      });
    },
    [orderCode, order, retryPaymentSession, snapshotPhone],
  );

  return {
    order,
    isLoading,
    fetchError,
    isSubmitting: isRetrying,
    handleRetry,
    payooLoadingOpen,
    closePayooLoading,
  };
};
