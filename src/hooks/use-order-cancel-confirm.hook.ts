"use client";

import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";
import { toast } from "react-toastify";

import { cancelOrder } from "@/utils/api/order/order.api";
import { getOrderCancellationReasonLabel, type OrderCancellationReason } from "@/utils/api/order/order.enum";
import { cancelPreOrder } from "@/utils/api/pre-order/pre-order-detail.api";
import { getErrorMessage } from "@/utils/helpers/axios";
import { revalidateOrderRelatedCaches } from "@/lib/swr/clear-user-scoped-cache.util";

export interface OrderCancelTarget {
  orderId: string;
  orderCode: string;
  /** Dùng API pre-order cancel khi hủy đơn đặt trước. */
  isPreOrder?: boolean;
}

export interface UseOrderCancelConfirmOptions {
  onSuccess?: () => void | Promise<void>;
}

export function useOrderCancelConfirm(options?: UseOrderCancelConfirmOptions) {
  const { mutate: mutateSwr } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<OrderCancelTarget | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const openCancelOrderConfirm = useCallback((next: OrderCancelTarget) => {
    const orderCode = next.orderCode?.trim();
    // Cancel API chỉ cần orderCode; guest không có order id.
    if (!orderCode) {
      toast.error("Không tìm thấy thông tin đơn hàng.");
      return;
    }
    const orderId = next.orderId?.trim() || orderCode;
    setTarget({ orderId, orderCode, isPreOrder: Boolean(next.isPreOrder) });
    setOpen(true);
  }, []);

  const closeCancelOrderConfirm = useCallback(() => {
    if (isCancelling) return;
    setOpen(false);
    setTarget(null);
  }, [isCancelling]);

  const confirmCancelOrder = useCallback(
    async (cancellationReason: OrderCancellationReason) => {
      const orderCode = target?.orderCode?.trim();
      if (!orderCode) return;

      setIsCancelling(true);
      try {
        if (target?.isPreOrder) {
          await cancelPreOrder(orderCode, {
            reason: getOrderCancellationReasonLabel(cancellationReason),
          });
          toast.success("Đã hủy đơn đặt trước");
        } else {
          await cancelOrder(orderCode, { cancellationReason });
          toast.success("Đã hủy đơn hàng");
        }

        await revalidateOrderRelatedCaches(mutateSwr, orderCode);

        setOpen(false);
        setTarget(null);
        await options?.onSuccess?.();
      } catch (err) {
        toast.error(getErrorMessage(err) || "Không thể hủy đơn hàng. Vui lòng thử lại.");
      } finally {
        setIsCancelling(false);
      }
    },
    [mutateSwr, options, target],
  );

  return {
    cancelOrderConfirmOpen: open,
    openCancelOrderConfirm,
    closeCancelOrderConfirm,
    confirmCancelOrder,
    isCancellingOrder: isCancelling,
  };
}
