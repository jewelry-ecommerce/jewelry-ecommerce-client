"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { javaVnpayReturn, javaVnpayStart, latestOrderPhone } from "@/utils/api/java/java-vnpay.api";

export default function VnpayReturn() {
  const params = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Đang kết nối VNPay Sandbox…");

  useEffect(() => {
    let cancelled = false;
    void settle(params).then((url) => {
      if (url) router.replace(url);
    }).catch((error: unknown) => {
      if (!cancelled) setMessage(error instanceof Error ? error.message : "Không hoàn tất được thanh toán VNPay.");
    });
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return <p>{message}</p>;
}

async function settle(params: URLSearchParams): Promise<string | null> {
  if (params.has("vnp_SecureHash")) {
    const result = await javaVnpayReturn(params);
    return result.redirect || statusUrl(result.success, result.orderCode);
  }
  const orderCode = params.get("orderCode") ?? "";
  if (params.get("start") !== "1" || !orderCode) throw new Error("Không có giao dịch VNPay để xử lý.");
  const link = await javaVnpayStart(orderCode, latestOrderPhone(orderCode));
  window.location.assign(link.payUrl);
  return null;
}

function statusUrl(success: boolean, orderCode: string): string {
  const query = new URLSearchParams({ status: success ? "success" : "failed", orderCode });
  return `/trang-thai-thanh-toan?${query.toString()}`;
}
