"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Alert, Button, CircularProgress, Container, Paper, Stack, Typography } from "@mui/material";
import useSWR from "swr";
import { javaOrderPaymentStatus } from "@/utils/api/java/java-order.api";
import { javaMomoPayment, MOMO_CHECKOUT } from "@/utils/api/java/java-momo.api";
import { OrderStatus, PaymentStatus } from "@/utils/api/order/order.enum";

function useMomoRedirect(orderCode: string, autoStart: boolean) {
  const started = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const openPayment = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      window.location.assign((await javaMomoPayment(orderCode)).paymentUrl);
    } catch {
      setError("Chưa mở được MoMo. Đơn đã được tạo; hãy kiểm tra trạng thái rồi thử lại, không cần đặt đơn mới.");
      setBusy(false);
    }
  }, [orderCode]);
  useEffect(() => {
    if (!autoStart || !orderCode || started.current) return;
    started.current = true;
    // Remove the start flag so refreshing the return page cannot redirect in a loop.
    window.history.replaceState(null, "", `${MOMO_CHECKOUT.statusPath}?${new URLSearchParams({ orderCode })}`);
    void openPayment();
  }, [autoStart, orderCode, openPayment]);
  return { busy, error, openPayment };
}

function MomoResult() {
  const params = useSearchParams();
  const orderCode = params.get("orderCode")?.trim() ?? "";
  const polls = useRef(0);
  const {
    data,
    error: statusError,
    mutate,
  } = useSWR(orderCode ? ["momo-status", orderCode] : null, () => javaOrderPaymentStatus(orderCode), {
    shouldRetryOnError: false,
    revalidateOnFocus: true,
    refreshInterval: (latest) =>
      latest?.paymentStatus === PaymentStatus.PAID || ++polls.current >= MOMO_CHECKOUT.maxPolls ? 0 : MOMO_CHECKOUT.refreshMs,
  });
  const payment = useMomoRedirect(orderCode, params.get("start") === "1");
  const paid = data?.paymentStatus === PaymentStatus.PAID;
  const cancelled = data?.orderStatus === OrderStatus.CANCELLED;
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h5">Thanh toán MoMo Sandbox</Typography>
          <Typography>Mã đơn: {orderCode || "Chưa có mã đơn"}</Typography>
          <Alert severity={paid ? "success" : "info"}>
            {paid ? "Đã thanh toán thành công." : "Đơn đang chờ xác nhận thanh toán từ MoMo."}
          </Alert>
          <Typography>Đây là thanh toán thử nghiệm, không dùng tiền thật. Kết quả được xác nhận từ hệ thống MoMo.</Typography>
          {cancelled && <Alert severity="warning">Đơn đã hủy. Nếu đã thanh toán, hãy liên hệ cửa hàng để kiểm tra hoàn tiền.</Alert>}
          {statusError && (
            <Alert severity="warning">Chưa đọc được trạng thái. Hãy đăng nhập hoặc tra cứu đơn bằng mã đơn và số điện thoại đã đặt.</Alert>
          )}
          {payment.error && <Alert severity="error">{payment.error}</Alert>}
          {payment.busy && <CircularProgress size={24} />}
          <Button variant="outlined" disabled={!orderCode || payment.busy} onClick={() => void mutate()}>
            Kiểm tra lại trạng thái
          </Button>
          {!paid && !cancelled && (
            <Button variant="contained" disabled={!data || payment.busy} onClick={() => void payment.openPayment()}>
              Mở thanh toán MoMo
            </Button>
          )}
          <Button component={Link} href="/tra-cuu-don-hang">
            Tra cứu chi tiết đơn hàng
          </Button>
          <Button component={Link} href="/lich-su-don-hang">
            Lịch sử đơn hàng
          </Button>
          <Button component={Link} href="/">
            Về trang chủ
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function MomoPage() {
  return (
    <Suspense fallback={<Container sx={{ py: 8 }}>Đang đọc kết quả thanh toán…</Container>}>
      <MomoResult />
    </Suspense>
  );
}
