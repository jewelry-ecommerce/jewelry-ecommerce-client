import React, { useEffect, useRef } from "react";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import useSWR from "swr";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import CheckoutSectionHeaderComponent from "../checkout-header/checkout-header.component";
import { StackRowAlignCenter, StackRowAlignJustCenter } from "@/components/styled";
import useStyles from "./checkout-payment.styles";
import { CheckoutFormValues } from "../checkout.constant";
import { PaymentMethod as PaymentMethodEnum } from "@/utils/api/order/order.enum";
import { getOrdersMe } from "@/utils/api/order/order.api";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/slices/auth.slice";
import {
  COD_DISABLED_HINT,
  COD_MAX_ORDER_AMOUNT_VND,
  INSTALLMENT_DISABLED_HINT,
  INSTALLMENT_MIN_ORDER_AMOUNT_VND,
  PAYMENT_METHODS,
} from "./checkout-payment.constant";
import {
  getFirstPaymentMethodId,
  getFirstSelectablePaymentMethodId,
  isCheckoutPaymentMethodDisabled,
  resolvePreferredPaymentMethodFromOrders,
  resolveSelectablePaymentMethodId,
} from "./checkout-payment-smart-select.util";

export { PAYMENT_METHODS } from "./checkout-payment.constant";
export type { CheckoutPaymentMethodOption as PaymentMethod } from "./checkout-payment.constant";

interface CheckoutPaymentSectionProps {
  title?: string;
  description?: string;
  orderPayableAmountVnd?: number;
  isLoggedIn?: boolean;
  /** AC1 pre-order lần 1: ẩn list PTTT, hiện notice deferred payment. */
  deferredPaymentNotice?: string | null;
}

function CheckoutPaymentSection({
  title = "THANH TOÁN",
  description = "Tất cả các giao dịch đều an toàn và được mã hóa.",
  orderPayableAmountVnd = 0,
  isLoggedIn = false,
  deferredPaymentNotice = null,
}: CheckoutPaymentSectionProps) {
  const { classes } = useStyles();
  const { control, setValue } = useFormContext<CheckoutFormValues>();
  const { dirtyFields } = useFormState({ control, name: "paymentMethod" });
  const userId = useAppSelector(selectCurrentUser)?.id;
  const smartSelectAppliedRef = useRef(false);

  const selectedId = useWatch({ control, name: "paymentMethod" });
  const isAllowCheck = useWatch({ control, name: "isAllowCheck" });
  const isPaymentMethodDirty = Boolean(dirtyFields.paymentMethod);
  const isDeferredPayment = Boolean(deferredPaymentNotice);

  const isCodDisabledByAmount = orderPayableAmountVnd >= COD_MAX_ORDER_AMOUNT_VND;
  const isCodDisabled = isCodDisabledByAmount || Boolean(isAllowCheck);
  const isInstallmentDisabledByAmount = orderPayableAmountVnd < INSTALLMENT_MIN_ORDER_AMOUNT_VND;
  const amountLockOptions = {
    isCodDisabled,
    isInstallmentDisabled: isInstallmentDisabledByAmount,
  };
  const fallbackPaymentMethodId = getFirstSelectablePaymentMethodId(amountLockOptions);

  const { data: memberPreferredPaymentMethod, isLoading: isLoadingMemberPreferred } = useSWR(
    isLoggedIn && !isDeferredPayment && userId ? (["checkout-smart-select-payment", userId] as const) : null,
    async () => {
      const result = await getOrdersMe({
        orderType: "DESC",
        orderBy: "createdAt",
        page: 1,
        take: 20,
      });
      return resolvePreferredPaymentMethodFromOrders(result.list, getFirstPaymentMethodId());
    },
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  useEffect(() => {
    if (isDeferredPayment) {
      if (selectedId) setValue("paymentMethod", "", { shouldDirty: false, shouldValidate: true });
      smartSelectAppliedRef.current = false;
      return;
    }

    if (smartSelectAppliedRef.current) return;
    if (isPaymentMethodDirty) {
      smartSelectAppliedRef.current = true;
      return;
    }

    if (isLoggedIn) {
      if (isLoadingMemberPreferred) return;
      const preferred = memberPreferredPaymentMethod || getFirstPaymentMethodId();
      const nextId = resolveSelectablePaymentMethodId(preferred, amountLockOptions);
      if (selectedId !== nextId) {
        setValue("paymentMethod", nextId, { shouldDirty: false, shouldValidate: true });
      }
      smartSelectAppliedRef.current = true;
      return;
    }

    if (!selectedId || selectedId !== fallbackPaymentMethodId) {
      setValue("paymentMethod", fallbackPaymentMethodId, { shouldDirty: false, shouldValidate: true });
    }
    smartSelectAppliedRef.current = true;
  }, [
    fallbackPaymentMethodId,
    isCodDisabled,
    isDeferredPayment,
    isInstallmentDisabledByAmount,
    isLoadingMemberPreferred,
    isLoggedIn,
    isPaymentMethodDirty,
    memberPreferredPaymentMethod,
    selectedId,
    setValue,
  ]);

  useEffect(() => {
    if (isDeferredPayment || !smartSelectAppliedRef.current) return;
    if (
      !isCheckoutPaymentMethodDisabled(selectedId, {
        isCodDisabled,
        isInstallmentDisabled: isInstallmentDisabledByAmount,
      })
    ) {
      return;
    }
    setValue("paymentMethod", fallbackPaymentMethodId, { shouldDirty: true, shouldValidate: true });
  }, [fallbackPaymentMethodId, isCodDisabled, isDeferredPayment, isInstallmentDisabledByAmount, selectedId, setValue]);

  const onSelect = (id: string) => {
    setValue("paymentMethod", id, { shouldDirty: true });
  };

  return (
    <Stack className={classes.root}>
      {!isDeferredPayment ? (
        <Stack className={classes.header}>
          <CheckoutSectionHeaderComponent title={title} />
          <Typography className={classes.subtitle}>{description}</Typography>
        </Stack>
      ) : null}

      {isDeferredPayment ? (
        <Box className={classes.deferredPaymentNotice} role="status">
          <Typography className={classes.deferredPaymentNoticeText}>{deferredPaymentNotice}</Typography>
        </Box>
      ) : (
        <Box className={classes.paymentList}>
          {PAYMENT_METHODS.map((method) => {
            const isActive = selectedId === method.id;
            const isCodRow = method.id === PaymentMethodEnum.COD;
            const isInstallmentRow = method.id === PaymentMethodEnum.INSTALLMENT;
            const isDisabled = isCheckoutPaymentMethodDisabled(method.id, {
              isCodDisabled,
              isInstallmentDisabled: isInstallmentDisabledByAmount,
            });

            return (
              <Box key={method.id} className={classes.paymentRow}>
                <StackRowAlignCenter
                  className={`${classes.paymentItem}${isDisabled ? ` ${classes.paymentItemDisabled}` : ""}`}
                  onClick={() => {
                    if (isDisabled) return;
                    onSelect(method.id);
                  }}
                  aria-disabled={isDisabled ? true : undefined}
                >
                  <StackRowAlignJustCenter>
                    <CheckboxComponent
                      checked={isActive}
                      disabled={isDisabled}
                      onChange={() => {
                        if (isDisabled) return;
                        onSelect(method.id);
                      }}
                      shape="circle"
                      iconType="dot"
                      size="medium"
                      sxCheckbox={{
                        backgroundColor: isActive ? "#171717" : "transparent",
                        borderColor: isActive ? "#171717" : "#DEDEDE",
                        color: isActive ? "#FFFFFF" : "#DEDEDE",
                      }}
                    />
                  </StackRowAlignJustCenter>

                  <Typography className={classes.label}>{method.label}</Typography>

                  {method.icon && (
                    <StackRowAlignCenter className={classes.iconGroup}>
                      <Image
                        src={method.icon}
                        alt={method.label}
                        width={40}
                        height={24}
                        className={classes.paymentIcon}
                        style={{ height: "auto" }}
                      />
                    </StackRowAlignCenter>
                  )}

                  {method?.icons && (
                    <StackRowAlignJustCenter className={classes.iconGroup}>
                      {method.icons.map((icon, index) => (
                        <StackRowAlignJustCenter key={index}>
                          <Image
                            src={icon}
                            alt="payment-icon"
                            width={40}
                            height={24}
                            className={classes.paymentIcon}
                            style={{ height: "auto" }}
                          />
                        </StackRowAlignJustCenter>
                      ))}
                    </StackRowAlignJustCenter>
                  )}
                </StackRowAlignCenter>

                {isCodRow && isCodDisabledByAmount ? (
                  <Typography component="p" className={classes.codWarning}>
                    {COD_DISABLED_HINT}
                  </Typography>
                ) : null}

                {isInstallmentRow && isInstallmentDisabledByAmount ? (
                  <Typography component="p" className={classes.codWarning}>
                    {INSTALLMENT_DISABLED_HINT}
                  </Typography>
                ) : null}
              </Box>
            );
          })}
        </Box>
      )}
    </Stack>
  );
}

export default CheckoutPaymentSection;
