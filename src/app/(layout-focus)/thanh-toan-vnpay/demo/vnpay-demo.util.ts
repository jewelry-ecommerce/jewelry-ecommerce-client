import type { VnpayDemoConfirm } from "@/utils/api/java/java-vnpay.api";

export function formatDemoAmount(raw: string | null): string {
  const amount = Number(raw);
  if (!Number.isSafeInteger(amount) || amount <= 0) return "";
  return `${amount.toLocaleString("vi-VN")}đ`;
}

export function demoConfirmBody(params: URLSearchParams, success: boolean): VnpayDemoConfirm | null {
  const orderCode = params.get("orderCode")?.trim() ?? "";
  const txnRef = params.get("txnRef")?.trim() ?? "";
  const sig = params.get("sig")?.trim() ?? "";
  const amount = Number(params.get("amount"));
  if (!orderCode || !txnRef || !sig || !Number.isSafeInteger(amount) || amount <= 0) return null;
  return { orderCode, txnRef, amount, success, sig };
}

export function demoStatusPath(success: boolean, orderCode: string, redirect?: string): string {
  if (redirect?.startsWith("/trang-thai-thanh-toan")) return redirect;
  const query = new URLSearchParams({ status: success ? "success" : "failed", orderCode });
  return `/trang-thai-thanh-toan?${query.toString()}`;
}
