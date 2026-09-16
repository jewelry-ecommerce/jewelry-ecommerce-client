"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderReturnExchangeOptionType } from "@/app/(layout-main)/don-hang/chi-tiet/_components/order-return-option-modal/order-return-exchange-option-modal.component";
import { buildOrderReturnRequestHref } from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-routes.util";

/** Modal chọn đổi hàng / hoàn tiền + điều hướng form yêu cầu. */
export function useOrderReturnRequestNavigation(orderCode: string | undefined, searchQuery?: string) {
  const router = useRouter();
  const [returnExchangeModalOpen, setReturnExchangeModalOpen] = useState(false);

  const openReturnExchangeModal = useCallback(() => setReturnExchangeModalOpen(true), []);
  const closeReturnExchangeModal = useCallback(() => setReturnExchangeModalOpen(false), []);

  const handleSelectReturnOption = useCallback(
    (option: OrderReturnExchangeOptionType) => {
      setReturnExchangeModalOpen(false);
      const code = orderCode?.trim();
      if (!code) return;
      const flow = option === "exchange" ? "exchange" : "refund";
      router.push(buildOrderReturnRequestHref(code, flow, searchQuery));
    },
    [orderCode, router, searchQuery],
  );

  return {
    returnExchangeModalOpen,
    openReturnExchangeModal,
    closeReturnExchangeModal,
    handleSelectReturnOption,
  };
}
