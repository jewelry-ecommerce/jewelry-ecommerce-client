import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { buildPaymentStatusUrl } from "@/app/(layout-focus)/trang-thai-thanh-toan/_utils/payment-status-url.util";
import { CheckoutSession } from "@/utils/api/checkout/checkout.interface";
import { useCheckoutStorage } from "@/hooks/checkout/use-checkout-storage.hook";

const CHECKOUT_SESSION_LOAD_ERROR_MESSAGE = "Phiên thanh toán của bạn đã hết hạn";

interface UseCheckoutRedirectProps {
  session: CheckoutSession | null | undefined;
  isLoading: boolean;
  sessionId: string | null;
  fetchError?: unknown;
}

export const useCheckoutRedirect = ({ session, isLoading, sessionId, fetchError }: UseCheckoutRedirectProps) => {
  const router = useRouter();
  const { readLatestOrderSnapshot, persistLatestOrderSnapshot } = useCheckoutStorage();
  const toastedFetchErrorSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    toastedFetchErrorSessionIdRef.current = null;
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      router.replace("/gio-hang");
      return;
    }

    if (fetchError) {
      if (toastedFetchErrorSessionIdRef.current !== sessionId) {
        toastedFetchErrorSessionIdRef.current = sessionId;
        toast.error(CHECKOUT_SESSION_LOAD_ERROR_MESSAGE);
      }
      router.replace("/gio-hang");
      return;
    }

    if (isLoading || !session) return;

    const status = (session.status || "").toUpperCase();
    const isDraft = status === "DRAFT";

    if (isDraft) return;

    const paymentMethod = session.paymentMethod;
    const isCOD = paymentMethod === "COD";
    const isFinished = ["PAID", "FAILED", "CANCELED", "REFUNDED"].includes(status);

    let code = session.orderCode || "";
    if (!code) {
      const data = readLatestOrderSnapshot();
      if (data?.orderCode) code = data.orderCode;
    }

    if (isCOD) {
      router.replace("/gio-hang");
      return;
    }

    if (isFinished) {
      router.replace("/gio-hang");
      return;
    }

    if (code) {
      persistLatestOrderSnapshot({
        orderCode: code,
        sessionId,
        paymentMethod: paymentMethod || undefined,
      });
    }

    router.replace(
      buildPaymentStatusUrl({
        sessionId,
        status: status === "PAID" ? "success" : undefined,
      }),
    );
  }, [session, isLoading, router, sessionId, readLatestOrderSnapshot, persistLatestOrderSnapshot, fetchError]);
};
