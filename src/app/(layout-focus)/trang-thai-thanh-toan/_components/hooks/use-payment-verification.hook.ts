import { useState, useEffect } from "react";
import { verifyPaymentRedirect } from "@/utils/api/checkout/checkout.api";
import { PayooRedirectParams } from "@/utils/api/checkout/checkout.interface";

export const usePaymentVerification = (payooOrderNo: string | null, searchParams: URLSearchParams) => {
  const [checksumVerified, setChecksumVerified] = useState<boolean | null>(null);
  const [syncedOrderCode, setSyncedOrderCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(!!payooOrderNo);

  useEffect(() => {
    if (!payooOrderNo) {
      setIsVerifying(false);
      return;
    }

    const params = Object.fromEntries(searchParams.entries()) as unknown as PayooRedirectParams;

    verifyPaymentRedirect(params)
      .then((res) => {
        if (typeof res?.checksumVerified === "boolean") {
          setChecksumVerified(res.checksumVerified);
        }
        if (res?.orderCode) {
          setSyncedOrderCode(res.orderCode);
        }
      })
      .catch((err) => {
        // console.error("Verify checksum failed:", err);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [payooOrderNo, searchParams]);

  return {
    checksumVerified,
    syncedOrderCode,
    isVerifying,
  };
};
