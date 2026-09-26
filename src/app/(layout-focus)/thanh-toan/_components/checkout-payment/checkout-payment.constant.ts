import { PaymentMethod } from "@/utils/api/order/order.enum";

export interface CheckoutPaymentMethodOption {
  id: PaymentMethod;
  label: string;
  icon?: string;
  icons?: string[];
}

export const PAYMENT_METHODS: CheckoutPaymentMethodOption[] = [
  { id: PaymentMethod.COD, label: "Thanh toán khi nhận hàng", icon: "/images/checkout/icon-payment-cod.svg" },
];

export const COD_MAX_ORDER_AMOUNT_VND = Number.POSITIVE_INFINITY;
export const INSTALLMENT_MIN_ORDER_AMOUNT_VND = Number.POSITIVE_INFINITY;
export const COD_DISABLED_HINT = "";
export const INSTALLMENT_DISABLED_HINT = "";
