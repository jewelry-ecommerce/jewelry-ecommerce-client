import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { preloadPayooLoadingImage, redirectToPayooPayment } from "@/app/(layout-focus)/thanh-toan/_components/checkout.helpers";
import { buildPaymentStatusUrl } from "@/app/(layout-focus)/trang-thai-thanh-toan/_utils/payment-status-url.util";
import { useCheckoutStorage } from "@/hooks/checkout/use-checkout-storage.hook";
import { retryPayment } from "@/utils/api/checkout/checkout.api";
import type { PlaceOrderResponse } from "@/utils/api/checkout/checkout.interface";
import { PaymentMethod } from "@/utils/api/order/order.enum";
import { getErrorMessage } from "@/utils/helpers/axios/axios.helpers";

export type RetryOrderPaymentInput = {
  orderCode: string;
  paymentMethod: string;
  receiverPhone?: string;
};

export const useRetryOrderPayment = () => {
  const router = useRouter();
  const { persistLatestOrderSnapshot } = useCheckoutStorage();
  const [isRetrying, setIsRetrying] = useState(false);
  const [payooLoadingOpen, setPayooLoadingOpen] = useState(false);

  useEffect(() => {
    preloadPayooLoadingImage();
  }, []);

  const closePayooLoading = useCallback(() => setPayooLoadingOpen(false), []);

  const retryPaymentSession = useCallback(
    async ({ orderCode, paymentMethod, receiverPhone = "" }: RetryOrderPaymentInput): Promise<PlaceOrderResponse> => {
      if (!orderCode?.trim()) {
        throw new Error("MISSING_ORDER_CODE");
      }
      if (!paymentMethod?.trim()) {
        throw new Error("MISSING_PAYMENT_METHOD");
      }

      const isPayooFlow = paymentMethod !== PaymentMethod.COD;
      if (isPayooFlow) {
        setPayooLoadingOpen(true);
      }

      setIsRetrying(true);
      let keepPayooLoadingOpen = false;

      try {
        const result: PlaceOrderResponse = await retryPayment(orderCode, {
          paymentMethod,
          returnUrl: `${window.location.origin}/trang-thai-thanh-toan`,
        });

        persistLatestOrderSnapshot({
          orderCode: result?.orderCode || orderCode,
          paymentUrl: result?.paymentUrl,
          phone: receiverPhone,
          paymentMethod,
          status: "success",
        });

        if (result?.paymentUrl) {
          keepPayooLoadingOpen = true;
          redirectToPayooPayment(result.paymentUrl);
          return result;
        }

        if (result?.paymentMethod === PaymentMethod.COD || paymentMethod === PaymentMethod.COD) {
          setPayooLoadingOpen(false);
          window.location.href = buildPaymentStatusUrl({ status: "success" });
          return result;
        }

        setPayooLoadingOpen(false);
        toast.error("Không thể tạo phiên thanh toán mới. Vui lòng thử lại.");
        throw new Error("NO_PAYMENT_URL");
      } catch (err: unknown) {
        if (!keepPayooLoadingOpen) {
          setPayooLoadingOpen(false);
        }

        const axiosErr = err as { response?: { data?: { errorCode?: string } }; message?: string };
        const errorCode = axiosErr?.response?.data?.errorCode;

        if (errorCode === "ORDER_MAX_RETRIES_EXCEEDED") {
          setPayooLoadingOpen(false);
          persistLatestOrderSnapshot({ orderCode, status: "failed" });
          router.push(buildPaymentStatusUrl({ status: "failed", errorcode: "ORDER_MAX_RETRIES_EXCEEDED" }));
        } else if (
          axiosErr?.message !== "NO_PAYMENT_URL" &&
          axiosErr?.message !== "MISSING_ORDER_CODE" &&
          axiosErr?.message !== "MISSING_PAYMENT_METHOD"
        ) {
          toast.error(getErrorMessage(err) || "Thanh toán không thành công. Vui lòng thử lại sau.");
        }

        throw err;
      } finally {
        setIsRetrying(false);
      }
    },
    [persistLatestOrderSnapshot, router],
  );

  return { retryPaymentSession, isRetrying, payooLoadingOpen, closePayooLoading };
};
