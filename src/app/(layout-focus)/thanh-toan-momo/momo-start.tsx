"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { javaMomoStart, latestOrderPhone } from "@/utils/api/java/java-momo.api";

export default function MomoStart() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Đang chuyển sang MoMo…");

  useEffect(() => {
    let cancelled = false;
    void openMomo(params).catch((error: unknown) => {
      if (!cancelled) setMessage(error instanceof Error ? error.message : "Không mở được thanh toán MoMo.");
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  return <p>{message}</p>;
}

async function openMomo(params: URLSearchParams): Promise<void> {
  const orderCode = params.get("orderCode") ?? "";
  if (params.get("start") !== "1" || !orderCode) throw new Error("Không có đơn MoMo để thanh toán.");
  const link = await javaMomoStart(orderCode, latestOrderPhone(orderCode));
  window.location.assign(link.payUrl);
}
