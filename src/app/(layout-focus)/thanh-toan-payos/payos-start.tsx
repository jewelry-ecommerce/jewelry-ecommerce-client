"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { javaPayosStart, latestOrderPhone } from "@/utils/api/java/java-payos.api";

export default function PayosStart() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Đang chuyển sang PayOS…");

  useEffect(() => {
    let cancelled = false;
    void openPayos(params).catch((error: unknown) => {
      if (!cancelled) setMessage(error instanceof Error ? error.message : "Không mở được thanh toán PayOS.");
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  return <p>{message}</p>;
}

async function openPayos(params: URLSearchParams): Promise<void> {
  const orderCode = params.get("orderCode") ?? "";
  if (params.get("start") !== "1" || !orderCode) throw new Error("Không có đơn PayOS để thanh toán.");
  const link = await javaPayosStart(orderCode, latestOrderPhone(orderCode));
  window.location.assign(link.payUrl);
}
