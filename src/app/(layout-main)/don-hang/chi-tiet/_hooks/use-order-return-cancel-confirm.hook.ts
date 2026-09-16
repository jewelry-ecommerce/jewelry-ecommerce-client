"use client";

import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";
import { toast } from "react-toastify";

import { cancelClientOrderReturn } from "@/utils/api/order/order.api";
import { getErrorMessage } from "@/utils/helpers/axios";

export interface OrderReturnCancelTarget {
  returnCode: string;
  orderCode: string;
}

export interface UseOrderReturnCancelConfirmOptions {
  onSuccess?: () => void | Promise<void>;
}

export function useOrderReturnCancelConfirm(options?: UseOrderReturnCancelConfirmOptions) {
  const { mutate: mutateSwr } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<OrderReturnCancelTarget | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const openCancelConfirm = useCallback((next: OrderReturnCancelTarget) => {
    const returnCode = next.returnCode?.trim();
    const orderCode = next.orderCode?.trim();
    if (!returnCode || !orderCode) {
      toast.error("Không tìm thấy mã yêu cầu đổi / trả.");
      return;
    }
    setTarget({ returnCode, orderCode });
    setOpen(true);
  }, []);

  const closeCancelConfirm = useCallback(() => {
    if (isCancelling) return;
    setOpen(false);
    setTarget(null);
  }, [isCancelling]);

  const confirmCancel = useCallback(async () => {
    const returnCode = target?.returnCode?.trim();
    const orderCode = target?.orderCode?.trim();
    if (!returnCode || !orderCode) return;

    setIsCancelling(true);
    try {
      await cancelClientOrderReturn(returnCode);
      toast.success("Đã hủy yêu cầu đổi / trả");

      await mutateSwr(
        (key) => {
          if (typeof key === "string") return key.startsWith(`order/${orderCode}`);
          if (!Array.isArray(key)) return false;
          if (key[0] === "orders-me" || key[0] === "orders-me-infinite") return true;
          if (key[0] === "order-return-detail") {
            const idOrCode = key[2];
            return idOrCode === returnCode || idOrCode === orderCode;
          }
          return false;
        },
        undefined,
        { revalidate: true },
      );

      setOpen(false);
      setTarget(null);
      await options?.onSuccess?.();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Không thể hủy yêu cầu. Vui lòng thử lại.");
    } finally {
      setIsCancelling(false);
    }
  }, [mutateSwr, options, target]);

  return {
    cancelConfirmOpen: open,
    openCancelConfirm,
    closeCancelConfirm,
    confirmCancel,
    isCancelling,
  };
}
