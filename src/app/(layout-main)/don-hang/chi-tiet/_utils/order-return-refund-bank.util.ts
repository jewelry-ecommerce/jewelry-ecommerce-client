import { PaymentMethod } from "@/utils/api/order/order.enum";

export interface OrderReturnRefundBankValues {
  refundBankAccountHolder: string;
  refundBankAccountNumber: string;
  refundBankName: string;
  refundBankBranch: string;
}

export const EMPTY_REFUND_BANK_VALUES: OrderReturnRefundBankValues = {
  refundBankAccountHolder: "",
  refundBankAccountNumber: "",
  refundBankName: "",
  refundBankBranch: "",
};

/** Danh sách ngân hàng phổ biến — value gửi BE = tên hiển thị. */
export const REFUND_BANK_OPTIONS: { label: string; value: string }[] = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Agribank",
  "Techcombank",
  "MB Bank",
  "ACB",
  "VPBank",
  "TPBank",
  "Sacombank",
  "HDBank",
  "VIB",
  "SHB",
  "SeABank",
  "MSB",
  "OCB",
  "LPBank",
  "Eximbank",
  "Bac A Bank",
  "PVcomBank",
  "VietABank",
  "Nam A Bank",
  "ABBANK",
  "NCB",
  "BaoViet Bank",
  "KienlongBank",
  "Saigonbank",
  "PGBank",
  "Public Bank Vietnam",
  "Hong Leong Bank",
  "Shinhan Bank",
  "Woori Bank",
  "UOB",
  "Standard Chartered",
  "HSBC",
  "CIMB",
].map((name) => ({ label: name, value: name }));

/** BR-08-04: không dấu, UPPERCASE. */
export function normalizeRefundBankAccountHolder(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isValidRefundBankAccountNumber(value: string): boolean {
  return /^[A-Za-z0-9]{4,25}$/.test(value.trim());
}

/** Bắt buộc bank khi Refund + đơn gốc COD. */
export function isRefundBankRequired(paymentMethod?: string | null): boolean {
  return paymentMethod === PaymentMethod.COD;
}

export function isRefundBankFormValid(values: OrderReturnRefundBankValues): boolean {
  return (
    Boolean(normalizeRefundBankAccountHolder(values.refundBankAccountHolder)) &&
    isValidRefundBankAccountNumber(values.refundBankAccountNumber) &&
    Boolean(values.refundBankName.trim()) &&
    Boolean(values.refundBankBranch.trim())
  );
}
