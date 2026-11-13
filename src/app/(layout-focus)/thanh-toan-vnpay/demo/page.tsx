import { Suspense } from "react";
import VnpayDemo from "./vnpay-demo";

export default function VnpayDemoPage() {
  return (
    <Suspense fallback={<p>Đang mở thanh toán thử…</p>}>
      <VnpayDemo />
    </Suspense>
  );
}
