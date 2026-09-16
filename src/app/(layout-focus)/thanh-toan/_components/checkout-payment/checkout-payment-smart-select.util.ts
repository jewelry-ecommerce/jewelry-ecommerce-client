import { OrderStatus, PaymentMethod, PaymentStatus } from "@/utils/api/order/order.enum";
import { PAYMENT_METHODS } from "./checkout-payment.constant";

interface SuccessfulPaymentOrderLike {
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  paymentMethod: PaymentMethod | string;
}

function isListedPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHODS.some((method) => method.id === value);
}

export function getFirstPaymentMethodId(): PaymentMethod {
  return PAYMENT_METHODS[0].id;
}

export function getFirstSelectablePaymentMethodId(
  isCodDisabledOrOptions: boolean | { isCodDisabled: boolean; isInstallmentDisabled: boolean } = false,
): PaymentMethod {
  const options =
    typeof isCodDisabledOrOptions === "boolean"
      ? { isCodDisabled: isCodDisabledOrOptions, isInstallmentDisabled: false }
      : isCodDisabledOrOptions;
  const match = PAYMENT_METHODS.find((method) => {
    if (options.isCodDisabled && method.id === PaymentMethod.COD) return false;
    if (options.isInstallmentDisabled && method.id === PaymentMethod.INSTALLMENT) return false;
    return true;
  });
  return match?.id ?? getFirstPaymentMethodId();
}

function isSuccessfulPaymentOrder(order: SuccessfulPaymentOrderLike): boolean {
  if (order.status === OrderStatus.CANCELLED) return false;
  if (!order.paymentMethod) return false;
  if (order.paymentMethod === PaymentMethod.COD) return true;
  return order.paymentStatus === PaymentStatus.PAID || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COMPLETED;
}

export function isSuccessfulOrderForPaymentPref(order: SuccessfulPaymentOrderLike): boolean {
  return isSuccessfulPaymentOrder(order);
}

export function resolvePreferredPaymentMethodFromOrders(
  orders: SuccessfulPaymentOrderLike[] | undefined,
  fallback: PaymentMethod,
): PaymentMethod {
  const match = orders?.find((order) => isSuccessfulPaymentOrder(order) && isListedPaymentMethod(order.paymentMethod));
  if (!match || !isListedPaymentMethod(match.paymentMethod)) return fallback;
  return match.paymentMethod;
}

export function isCheckoutPaymentMethodDisabled(
  methodId: string,
  options: { isCodDisabled: boolean; isInstallmentDisabled: boolean },
): boolean {
  if (options.isCodDisabled && methodId === PaymentMethod.COD) return true;
  if (options.isInstallmentDisabled && methodId === PaymentMethod.INSTALLMENT) return true;
  return false;
}

export function resolveSelectablePaymentMethodId(
  methodId: string,
  options: { isCodDisabled: boolean; isInstallmentDisabled: boolean },
): PaymentMethod {
  if (!isListedPaymentMethod(methodId) || isCheckoutPaymentMethodDisabled(methodId, options)) {
    return getFirstSelectablePaymentMethodId(options);
  }
  return methodId;
}
