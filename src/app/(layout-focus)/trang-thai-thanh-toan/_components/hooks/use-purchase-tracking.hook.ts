import { useEffect, useRef } from "react";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { safeTrackPurchaseFromOrderCode } from "@/lib/gtm/track-purchase";
import type { OrderStatusByOrderCodeResponse } from "@/utils/api/checkout/checkout.interface";
import { UIStatus } from "../status.constant";

interface UsePurchaseTrackingParams {
  uiStatus: UIStatus;
  orderCode: string;
  orderStatus?: OrderStatusByOrderCodeResponse;
}

/** GTM purchase — chỉ khi BE xác nhận đơn, không chặn UI. */
export function usePurchaseTracking({ uiStatus, orderCode, orderStatus }: UsePurchaseTrackingParams): void {
  const isLogin = useAppSelector(selectIsLogin);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredRef.current) {
      return;
    }

    if (uiStatus !== UIStatus.SUCCESS) {
      return;
    }

    const transactionId = orderCode.trim() || orderStatus?.orderCode?.trim() || "";
    if (!transactionId || !orderStatus?.orderCode?.trim()) {
      return;
    }

    hasTriggeredRef.current = true;
    safeTrackPurchaseFromOrderCode({ orderCode: transactionId, isLogin });
  }, [uiStatus, orderCode, orderStatus, isLogin]);
}
