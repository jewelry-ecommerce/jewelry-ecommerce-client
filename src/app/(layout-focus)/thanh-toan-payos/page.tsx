import { Suspense } from "react";
import PayosStart from "./payos-start";

export default function PayosPage() {
  return (
    <Suspense fallback={<p>Đang mở thanh toán…</p>}>
      <PayosStart />
    </Suspense>
  );
}
