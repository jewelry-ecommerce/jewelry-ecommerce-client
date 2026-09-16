"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSWRConfig } from "swr";

import { preloadPayooLoadingImage } from "@/app/(layout-focus)/thanh-toan/_components/checkout.helpers";
import type { CheckoutFormValues } from "@/app/(layout-focus)/thanh-toan/_components/checkout.constant";
import { buildPaymentStatusUrl } from "@/app/(layout-focus)/trang-thai-thanh-toan/_utils/payment-status-url.util";
import {
  buildUpdatePreOrderShippingAddressRequest,
  buildUpdatePreOrderSpecialRequestsRequest,
  isPreOrderShippingAddressChanged,
  isPreOrderShippingAddressReady,
  isPreOrderSpecialRequestsChanged,
  mergePreOrderShippingAddressResult,
  normalizeReceiverPhone,
} from "@/app/(layout-focus)/thanh-toan-dat-truoc/_utils/pre-order-payment-form.util";
import { useCheckoutStorage } from "@/hooks/checkout/use-checkout-storage.hook";
import { buildPendingPaymentUrl } from "@/hooks/use-order-actions.hook";
import { revalidateOrderRelatedCaches } from "@/lib/swr";
import {
  getPreOrderDetailByOrderCode,
  payPreOrder,
  updatePreOrderShippingAddress,
  updatePreOrderSpecialRequests,
} from "@/utils/api/pre-order/pre-order-detail.api";
import type { PreOrderDetailResponse } from "@/utils/api/pre-order/pre-order-detail.interface";
import {
  clearPreOrderPaymentDetail,
  readPreOrderDetailOrderCode,
  readPreOrderPaymentDetail,
  savePreOrderPaymentDetail,
} from "@/utils/api/pre-order/pre-order-detail.util";
import { PaymentMethod } from "@/utils/api/order/order.enum";
import { getErrorMessage } from "@/utils/helpers/axios/axios.helpers";

function isPendingPayooSnapshot(paymentMethod?: string | null, paymentUrl?: string | null): boolean {
  if (!paymentUrl?.trim()) return false;
  return paymentMethod !== PaymentMethod.COD && paymentMethod !== "COD";
}

export function usePreOrderPayment() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { persistLatestOrderSnapshot, readLatestOrderSnapshot } = useCheckoutStorage();
  const [order, setOrder] = useState<PreOrderDetailResponse | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShippingSyncing, setIsShippingSyncing] = useState(false);
  const [payooLoadingOpen, setPayooLoadingOpen] = useState(false);

  useEffect(() => {
    preloadPayooLoadingImage();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const stored = readPreOrderPaymentDetail();
      const snapshot = readLatestOrderSnapshot();
      const storedOrderCode = stored?.orderCode?.trim() || "";
      const snapshotOrderCode = snapshot?.orderCode?.trim() || "";

      // Chỉ về pending nếu ĐÚNG đơn pre-order này đã có link Payoo.
      // Snapshot đơn khác (vd. retail trước đó) không được chiếm form thanh toán lần 2.
      if (
        storedOrderCode &&
        snapshotOrderCode === storedOrderCode &&
        isPendingPayooSnapshot(snapshot?.paymentMethod, snapshot?.paymentUrl)
      ) {
        clearPreOrderPaymentDetail();
        router.replace(buildPendingPaymentUrl(snapshotOrderCode, false));
        return;
      }

      if (storedOrderCode) {
        if (!cancelled) {
          setOrder(stored);
          setIsHydrating(false);
        }
        return;
      }

      const fallbackOrderCode = readPreOrderDetailOrderCode();
      if (!fallbackOrderCode) {
        if (!cancelled) {
          setOrder(null);
          setIsHydrating(false);
        }
        return;
      }

      try {
        const detail = await getPreOrderDetailByOrderCode(fallbackOrderCode);
        if (cancelled) return;
        if (detail?.orderCode?.trim()) {
          savePreOrderPaymentDetail(detail);
          setOrder(detail);
        } else {
          setOrder(null);
        }
      } catch {
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [readLatestOrderSnapshot, router]);

  const closePayooLoading = useCallback(() => setPayooLoadingOpen(false), []);

  const applyOrderPatch = useCallback((next: PreOrderDetailResponse) => {
    setOrder(next);
    savePreOrderPaymentDetail(next);
  }, []);

  const orderRef = useRef(order);
  orderRef.current = order;

  /**
   * Đổi địa chỉ trên form → PUT shipping-address để BE tính lại ship,
   * rồi cập nhật shippingFee / grandTotal trên summary.
   */
  const syncShippingAddress = useCallback(
    async (values: CheckoutFormValues) => {
      const current = orderRef.current;
      if (!current?.orderCode?.trim()) return;
      if (!isPreOrderShippingAddressReady(values)) return;
      if (!isPreOrderShippingAddressChanged(current.shippingAddressSnapshot, values)) return;

      const orderCode = current.orderCode.trim();
      const lockedPhone =
        normalizeReceiverPhone(current.shippingAddressSnapshot?.receiverPhone) || normalizeReceiverPhone(values.receiverPhone);
      const paymentValues: CheckoutFormValues = {
        ...values,
        receiverPhone: lockedPhone,
      };

      setIsShippingSyncing(true);
      try {
        const shippingPayload = buildUpdatePreOrderShippingAddressRequest(current, paymentValues);
        const shippingResult = await updatePreOrderShippingAddress(orderCode, shippingPayload);
        const hasPricing = shippingResult && (shippingResult.shippingFee != null || shippingResult.grandTotal != null);
        const pricingSource = hasPricing ? shippingResult : await getPreOrderDetailByOrderCode(orderCode);
        applyOrderPatch(mergePreOrderShippingAddressResult(current, shippingPayload, pricingSource));
      } catch (error) {
        toast.error(getErrorMessage(error) || "Không thể cập nhật phí vận chuyển. Vui lòng thử lại.");
      } finally {
        setIsShippingSyncing(false);
      }
    },
    [applyOrderPatch],
  );

  const submitPayment = useCallback(
    async (values: CheckoutFormValues) => {
      if (!order?.orderCode?.trim()) {
        toast.error("Không tìm thấy mã đơn đặt trước.");
        return;
      }
      if (!values.paymentMethod?.trim()) {
        toast.error("Vui lòng chọn phương thức thanh toán.");
        return;
      }

      const orderCode = order.orderCode.trim();
      const isPayooFlow = values.paymentMethod !== PaymentMethod.COD;
      if (isPayooFlow) setPayooLoadingOpen(true);

      setIsSubmitting(true);
      let keepPayooLoadingOpen = false;
      let workingOrder = order;

      try {
        // Thanh toán pre-order lần 2: giữ SĐT gốc trên đơn, không cho đổi.
        const lockedPhone =
          normalizeReceiverPhone(workingOrder.shippingAddressSnapshot?.receiverPhone) || normalizeReceiverPhone(values.receiverPhone);
        const paymentValues: CheckoutFormValues = {
          ...values,
          receiverPhone: lockedPhone,
        };

        if (isPreOrderShippingAddressChanged(workingOrder.shippingAddressSnapshot, paymentValues)) {
          const shippingPayload = buildUpdatePreOrderShippingAddressRequest(workingOrder, paymentValues);
          const shippingResult = await updatePreOrderShippingAddress(orderCode, shippingPayload);
          const hasPricing = shippingResult && (shippingResult.shippingFee != null || shippingResult.grandTotal != null);
          const pricingSource = hasPricing ? shippingResult : await getPreOrderDetailByOrderCode(orderCode);
          workingOrder = mergePreOrderShippingAddressResult(workingOrder, shippingPayload, pricingSource);
          applyOrderPatch(workingOrder);
        }

        if (isPreOrderSpecialRequestsChanged(workingOrder, paymentValues)) {
          const specialPayload = buildUpdatePreOrderSpecialRequestsRequest(paymentValues);
          const specialResult = await updatePreOrderSpecialRequests(orderCode, specialPayload);
          workingOrder = {
            ...workingOrder,
            ...(specialResult || {}),
            orderCode,
            note: specialPayload.note ?? "",
            vatInvoice: specialPayload.vatInvoice ?? null,
          };
          applyOrderPatch(workingOrder);
        }

        if (Number(workingOrder.shippingFee || 0) <= 0) {
          throw new Error("Địa chỉ này không hỗ trợ giao hàng. Vui lòng chọn địa chỉ khác.");
        }

        const result = await payPreOrder(orderCode, {
          paymentMethod: paymentValues.paymentMethod,
          returnUrl: `${window.location.origin}/trang-thai-thanh-toan`,
        });

        const paidOrderCode = result?.orderCode || orderCode;
        const paymentUrl = result?.paymentUrl?.trim() || "";
        const selectedPaymentMethod = paymentValues.paymentMethod;
        const isCodPayment = selectedPaymentMethod === PaymentMethod.COD;
        const guestOrderAccessToken = result?.guestOrderAccess?.token?.trim();
        const guestOrderAccessExpiresAt = result?.guestOrderAccess?.expiresAt?.trim();

        persistLatestOrderSnapshot({
          orderCode: paidOrderCode,
          paymentUrl: paymentUrl || undefined,
          phone: lockedPhone,
          paymentMethod: selectedPaymentMethod,
          // Chỉ COD mới snapshot success; Payoo giữ pending để trang trạng thái không đè SUCCESS.
          status: isCodPayment ? "success" : "pending",
          // goa_* từ /pay → trang trạng thái (back Payoo) gọi orders/guest-access.
          ...(guestOrderAccessToken
            ? {
                guestOrderAccessToken,
                ...(guestOrderAccessExpiresAt ? { guestOrderAccessExpiresAt } : {}),
              }
            : {}),
        });

        await revalidateOrderRelatedCaches(mutate, orderCode);

        if (paymentUrl) {
          clearPreOrderPaymentDetail();
          keepPayooLoadingOpen = true;
          // location.replace: bỏ form khỏi history. redirect=1 → pending tự sang Payoo.
          // Back từ Payoo → trang pending (đã strip redirect), giống checkout thường.
          window.location.replace(buildPendingPaymentUrl(paidOrderCode, true));
          return;
        }

        if (isCodPayment) {
          clearPreOrderPaymentDetail();
          setPayooLoadingOpen(false);
          window.location.href = buildPaymentStatusUrl({ status: "success" });
          return;
        }

        setPayooLoadingOpen(false);
        toast.error("Không thể tạo phiên thanh toán. Vui lòng thử lại.");
      } catch (error) {
        if (!keepPayooLoadingOpen) setPayooLoadingOpen(false);
        toast.error(getErrorMessage(error) || "Thanh toán không thành công. Vui lòng thử lại sau.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [applyOrderPatch, mutate, order, persistLatestOrderSnapshot],
  );

  const goBackToDetail = useCallback(() => {
    router.push("/don-hang/dat-truoc");
  }, [router]);

  return {
    order,
    isHydrating,
    isSubmitting,
    isShippingSyncing,
    payooLoadingOpen,
    closePayooLoading,
    syncShippingAddress,
    submitPayment,
    goBackToDetail,
  };
}
