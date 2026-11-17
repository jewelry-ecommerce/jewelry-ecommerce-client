import { Suspense } from "react";
import MomoStart from "./momo-start";

export default function MomoStartPage() {
  return (
    <Suspense fallback={<p>Đang chuyển sang MoMo…</p>}>
      <MomoStart />
    </Suspense>
  );
}
