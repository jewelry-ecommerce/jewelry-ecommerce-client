import { Suspense } from "react";
import VnpayReturn from "./vnpay-return";

export default function VnpayReturnPage() {
  return (
    <Suspense fallback={<p>Đang kết nối VNPay Sandbox…</p>}>
      <VnpayReturn />
    </Suspense>
  );
}
