import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { normalizePayooStatus } from "../status.constant";

export interface StatusParams {
  status: string | null;
  errorCode: string | null;
  payooOrderNo: string | null;
  /** `pre-order` → xác nhận đặt trước lần 1, không có giao dịch thanh toán. */
  fulfillment: string | null;
}

export const useStatusParams = (checksumVerified: boolean | null) => {
  const searchParams = useSearchParams();

  const [params] = useState<StatusParams>(() => ({
    status: searchParams.get("status"),
    errorCode: searchParams.get("errorcode"),
    payooOrderNo: searchParams.get("order_no"),
    fulfillment: searchParams.get("fulfillment"),
  }));

  const normalizedInitialStatus = useMemo(() => {
    if (checksumVerified === false) return null;
    return normalizePayooStatus(params.status, params.errorCode);
  }, [checksumVerified, params.status, params.errorCode]);

  const effectiveErrorCode = useMemo(() => {
    return checksumVerified === false ? null : params.errorCode;
  }, [checksumVerified, params.errorCode]);

  return {
    params,
    normalizedInitialStatus,
    effectiveErrorCode,
    searchParams,
  };
};
