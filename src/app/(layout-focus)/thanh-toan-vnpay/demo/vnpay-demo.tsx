"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import { javaVnpayDemoConfirm } from "@/utils/api/java/java-vnpay.api";
import { demoConfirmBody, demoStatusPath, formatDemoAmount } from "./vnpay-demo.util";

type DemoPay = {
  message: string;
  pending: boolean;
  payable: boolean;
  pay: (success: boolean) => Promise<void>;
};

export default function VnpayDemo() {
  const params = useSearchParams();
  const demo = useDemoPay(params);
  return (
    <DemoCard
      orderCode={params.get("orderCode") ?? ""}
      amountLabel={formatDemoAmount(params.get("amount"))}
      message={demo.message}
      pending={demo.pending}
      payable={demo.payable}
      onPay={(success) => { void demo.pay(success); }}
    />
  );
}

function useDemoPay(params: URLSearchParams): DemoPay {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function pay(success: boolean) {
    const body = demoConfirmBody(params, success);
    if (!body || pending) return;
    setPending(true);
    setMessage("");
    try {
      const result = await javaVnpayDemoConfirm(body);
      router.replace(demoStatusPath(result.success, result.orderCode, result.redirect));
    } catch (error: unknown) {
      setPending(false);
      setMessage(error instanceof Error ? error.message : "Không xác nhận được thanh toán thử.");
    }
  }

  return { message, pending, payable: demoConfirmBody(params, true) !== null, pay };
}

function DemoCard({ orderCode, amountLabel, message, pending, payable, onPay }: {
  orderCode: string;
  amountLabel: string;
  message: string;
  pending: boolean;
  payable: boolean;
  onPay: (success: boolean) => void;
}) {
  const disabled = !payable || pending;
  return (
    <Box component="section" sx={{ maxWidth: 480, mx: "auto", px: 2, py: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Thanh toán thử</Typography>
      <Typography sx={{ mb: 3, color: "text.secondary" }}>
        Trang demo nội bộ. Không chuyển tiền và không gọi VNPay.
      </Typography>
      <Typography>Mã đơn: {orderCode || "—"}</Typography>
      <Typography sx={{ mb: 3 }}>Số tiền: {amountLabel || "—"}</Typography>
      {message ? <Typography sx={{ mb: 2, color: "error.main" }}>{message}</Typography> : null}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button variant="contained" disabled={disabled} onClick={() => onPay(true)}>Thanh toán thử</Button>
        <Button variant="outlined" disabled={disabled} onClick={() => onPay(false)}>Hủy</Button>
      </Box>
    </Box>
  );
}
