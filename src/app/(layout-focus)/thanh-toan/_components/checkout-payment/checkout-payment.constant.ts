import { PaymentMethod as PaymentMethodEnum } from "@/utils/api/order/order.enum";

export interface CheckoutPaymentMethodOption {
  id: PaymentMethodEnum;
  label: string;
  icon?: string;
  icons?: string[];
}

export const PAYMENT_METHODS: CheckoutPaymentMethodOption[] = [
  {
    id: PaymentMethodEnum.QR_CODE,
    label: "QR Code",
    icon: "/image/checkout/icon-qr-code.svg",
  },
  {
    id: PaymentMethodEnum.CREDIT_CARD,
    label: "Thẻ Visa/Master/JCB",
    icons: ["/image/checkout/icon-visa.svg", "/image/checkout/icon-master-card.svg", "/image/checkout/icon-jcb.svg"],
  },
  {
    id: PaymentMethodEnum.DIGITAL_WALLET,
    label: "Apple Pay",
    // label: "Apple Pay / Samsung Pay",
    icons: ["/image/checkout/icon-apple-pay.svg"],
    // icons: ["/image/checkout/icon-apple-pay.svg", "/image/checkout/icon-samsung-pay.svg"],
  },
  {
    id: PaymentMethodEnum.MOMO_WALLET,
    label: "Ví Momo",
    icon: "/image/checkout/icon-momo.svg",
  },
  {
    id: PaymentMethodEnum.ZALO_PAY,
    label: "ZaloPay",
    icon: "/image/checkout/icon-zalo-pay.svg",
  },
  {
    id: PaymentMethodEnum.COD,
    label: "Thanh toán khi nhận hàng",
    icon: "/image/checkout/icon-payment-cod.svg",
  },
  {
    id: PaymentMethodEnum.INSTALLMENT,
    label: "Thanh toán trả góp",
    icon: "/image/checkout/icon-payment-installment.svg",
  },
];

export const COD_MAX_ORDER_AMOUNT_VND = 15_000_000;
export const INSTALLMENT_MIN_ORDER_AMOUNT_VND = 2_000_000;

export const COD_DISABLED_HINT = "Chỉ áp dụng cho đơn hàng dưới 15.000.000đ. Vui lòng chọn thanh toán trả trước.";
export const INSTALLMENT_DISABLED_HINT = "Chỉ áp dụng cho đơn hàng từ 2.000.000đ. Vui lòng chọn phương thức thanh toán khác.";
