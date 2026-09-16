"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "react-toastify";

import { BreadcrumbComponent, TextFieldComponent } from "@/components";
import { ButtonComponent } from "@/components/button/button.component";
import TextFieldPhoneNumberComponent from "@/components/text-field/text-field-phone-number.component";
import MyAccountHistoryOrdersList from "@/app/(layout-main)/tai-khoan/_components/my-account-history-orders/components/my-account-history-orders-list";
import historyOrdersStyles from "@/app/(layout-main)/tai-khoan/_components/my-account-history-orders/my-account-history-orders.styles";
import OtpVerificationDialogs from "@/app/(layout-main)/dang-ky/_components/otp-verification-dialogs/otp-verification-dialogs.component";
import { useOtp } from "@/hooks/use-otp.hook";
import { AuthApi, CheckoutApi } from "@/utils/api";
import { AuthApiPath, OtpMethod } from "@/utils/api/auth/auth.enum";
import { getOrderStatusInfo } from "@/utils/api/order";
import type { OrderListItem } from "@/utils/api/checkout/checkout.interface";
import { PHONE_REGEX } from "@/utils/constants/common.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { getErrorMessage } from "@/utils/helpers/axios/axios.helpers";
import { isOtpDailyLimitError } from "@/utils/auth/otp-client.shared";
import { OTP_INCOMPLETE_CODE_MESSAGE, OTP_INVALID_CODE_MESSAGE, resolveOtpWrongAttemptError } from "@/utils/constants/otp-message.constant";
import { storageService } from "@/services";
import { StackAlignCenter } from "@/components/styled";
import {
  getRecaptchaTokenForSendOtp,
  RECAPTCHA_CLIENT_FAILURE_MESSAGE,
  SendOtpRecaptchaAction,
} from "@/utils/recaptcha/recaptcha-v3.helper";
import { buildOrderDetailNavigation } from "@/utils/order/order-detail-context.util";

const orderTrackingSchema = z
  .object({
    phone: z.string().trim(),
    orderCode: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (!values.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng nhập số điện thoại.",
        path: ["phone"],
      });
      return;
    }

    if (!PHONE_REGEX.test(values.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Số điện thoại không đúng định dạng.",
        path: ["phone"],
      });
    }
  });

type OrderTrackingFormValues = z.infer<typeof orderTrackingSchema>;

const ORDER_TRACKING_VIEW_LIST = "list";
const ORDER_TRACKING_STORAGE_KEY = "order_tracking_lookup_cache_v1";
const OTP_FALLBACK = "111111";

type OrderTrackingCache = {
  phone: string;
  orders: OrderListItem[];
  updatedAt: string;
};

const normalizeLookupOrders = (result: unknown): OrderListItem[] => {
  if (Array.isArray(result)) return result as OrderListItem[];
  if (result && typeof result === "object" && "orders" in result) {
    const orders = (result as { orders?: unknown }).orders;
    return Array.isArray(orders) ? (orders as OrderListItem[]) : [];
  }
  return [];
};

const OrderTrackingView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const otp = useOtp("otp_order_tracking_meta");
  const { classes } = historyOrdersStyles();
  const [trackedOrders, setTrackedOrders] = useState<OrderListItem[]>([]);
  const [trackedPhone, setTrackedPhone] = useState<string>("");
  const [isConfirmingOtp, setIsConfirmingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const otpSendInFlightRef = useRef(false);

  const currentView = searchParams.get("view");

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<OrderTrackingFormValues>({
    resolver: zodResolver(orderTrackingSchema),
    defaultValues: {
      phone: "",
      orderCode: "",
    },
  });

  const breadcrumbItems = useMemo(() => [{ label: "Tra cứu đơn hàng", href: "/tra-cuu-don-hang" }, { label: "Danh sách đơn hàng" }], []);

  useEffect(() => {
    if (currentView !== ORDER_TRACKING_VIEW_LIST) return;
    if (trackedOrders.length > 0) return;

    const cache = storageService.getLocalItem<OrderTrackingCache | null>(ORDER_TRACKING_STORAGE_KEY);
    if (cache?.orders?.length) {
      setTrackedPhone(cache.phone);
      setTrackedOrders(cache.orders);
    }
  }, [currentView, trackedOrders.length]);

  const sendOrderLookupOtp = useCallback(async (phone: string) => {
    const recaptchaToken = await getRecaptchaTokenForSendOtp(SendOtpRecaptchaAction.ORDER_LOOKUP);
    if (!recaptchaToken) {
      toast.error(RECAPTCHA_CLIENT_FAILURE_MESSAGE);
      return false;
    }
    await AuthApi.sendOtpRegister({
      phone,
      type: AuthApiPath.ORDER_LOOKUP,
      recaptchaToken,
    });
    return true;
  }, []);

  const handleOpenTrackingList = (phone: string) => {
    setTrackedPhone(phone);
    router.push("/tra-cuu-don-hang?view=list", { scroll: false });
  };

  const persistLookupCache = (phone: string, orders: OrderListItem[]) => {
    const payload: OrderTrackingCache = {
      phone,
      orders,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveLocalItem(ORDER_TRACKING_STORAGE_KEY, payload);
  };

  const handleSubmitLookup: SubmitHandler<OrderTrackingFormValues> = async (values) => {
    const normalizedPhone = values.phone.trim();
    const normalizedOrderCode = values.orderCode.trim();

    if (normalizedPhone && normalizedOrderCode) {
      try {
        await CheckoutApi.postOrderLookup({ phone: normalizedPhone, orderCode: normalizedOrderCode });
        router.push(
          buildOrderDetailNavigation(
            { orderCode: normalizedOrderCode, source: "tracking", trackingPhone: normalizedPhone },
            { source: "tracking" },
          ),
          { scroll: false },
        );
        return;
      } catch (error) {
        toast.error(getErrorMessage(error) || "Thông tin mã đơn hoặc số điện thoại không chính xác.");
        return;
      }
    }

    otp.setSubmittedPhone(normalizedPhone);
    otp.setOtpMethod(OtpMethod.ZNS);

    if (otp.openExistingCooldownIfAny(normalizedPhone)) {
      return;
    }

    if (!otp.canSendOtp(normalizedPhone)) {
      otp.applyDailyLimitExceeded();
      otp.setShowVerifyDialog(true);
      return;
    }

    if (otpSendInFlightRef.current) return;
    otpSendInFlightRef.current = true;
    setIsSendingOtp(true);
    try {
      storageService.destroyLocalItem(ORDER_TRACKING_STORAGE_KEY);
      setTrackedOrders([]);

      const sent = await sendOrderLookupOtp(normalizedPhone);
      if (!sent) return;

      const canContinue = otp.markOtpSent(normalizedPhone, OtpMethod.ZNS);
      otp.setShowVerifyDialog(true);
      if (canContinue) {
        toast.success("Mã OTP đã được gửi!");
      }
    } catch (error) {
      if (isOtpDailyLimitError(error)) {
        otp.applyDailyLimitExceeded();
        otp.setShowVerifyDialog(true);
        return;
      }
      toast.error(getErrorMessage(error));
    } finally {
      otpSendInFlightRef.current = false;
      setIsSendingOtp(false);
    }
  };

  const handleConfirmOtp = async (code: string) => {
    if (otp.isOtpLocked) return;
    const enteredCode = code.length === 6 ? code : otp.otpValues.join("");
    const resolvedCode = enteredCode.length === 6 ? enteredCode : OTP_FALLBACK;

    if (resolvedCode.length < 6) {
      otp.setOtpError(OTP_INCOMPLETE_CODE_MESSAGE);
      return;
    }

    setIsConfirmingOtp(true);
    try {
      const { accessToken } = await AuthApi.verifyOtpOrderLookup({ phone: otp.submittedPhone, otp: resolvedCode });

      const result = await CheckoutApi.postOrderLookup({ phone: otp.submittedPhone }, accessToken);
      const orders = normalizeLookupOrders(result);
      setTrackedOrders(orders);
      persistLookupCache(otp.submittedPhone, orders);
      handleOpenTrackingList(otp.submittedPhone);
      otp.resetOtpState();
    } catch (error) {
      const locked = otp.recordWrongOtpAttempt();
      otp.setOtpError(resolveOtpWrongAttemptError(locked, getErrorMessage(error) || OTP_INVALID_CODE_MESSAGE));
    } finally {
      setIsConfirmingOtp(false);
    }
  };
  return (
    <>
      {currentView === ORDER_TRACKING_VIEW_LIST ? <BreadcrumbComponent items={breadcrumbItems} /> : null}
      <Box sx={{ maxWidth: "1392px", width: "100%", margin: "0 auto", padding: { xs: "32px 16px 56px", md: "40px 24px 60px" } }}>
        {currentView === ORDER_TRACKING_VIEW_LIST ? (
          <Stack sx={{ gap: "40px" }}>
            <Typography
              sx={{
                ...TYPOGRAPHY_STYLES["2xl"].bold,
                color: "#27251F",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              Danh sách đơn hàng
            </Typography>

            <MyAccountHistoryOrdersList
              data={trackedOrders}
              classes={classes}
              getStatusInfo={getOrderStatusInfo}
              showActions={false}
              getOrderHref={(order) =>
                buildOrderDetailNavigation(
                  {
                    orderCode: order.orderCode,
                    source: "tracking",
                    trackingPhone: trackedPhone || otp.submittedPhone,
                  },
                  { source: "tracking", from: "list" },
                )
              }
            />
          </Stack>
        ) : (
          <Stack sx={{ width: "100%", margin: "0 auto", gap: "24px" }}>
            <StackAlignCenter sx={{ gap: "16px", maxWidth: "520px", width: "100%", margin: "0 auto", textAlign: "center" }}>
              <Typography
                sx={{
                  ...TYPOGRAPHY_STYLES["2xl"].bold,
                  color: "#27251F",
                  textTransform: "uppercase",
                }}
              >
                Tra cứu đơn hàng
              </Typography>
              <Typography
                sx={{
                  ...TYPOGRAPHY_STYLES.base.regular,
                  color: "#27251F",
                }}
              >
                Vui lòng nhập mã đơn hàng và số điện thoại (có trong email xác nhận và hóa đơn) để kiểm tra trạng thái đơn hàng.
              </Typography>
            </StackAlignCenter>

            <Stack
              component="form"
              onSubmit={handleSubmit(handleSubmitLookup)}
              sx={{ gap: "24px", maxWidth: "460px", width: "100%", margin: "0 auto" }}
            >
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextFieldPhoneNumberComponent
                    required
                    label="Số điện thoại"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.phone?.message}
                  />
                )}
              />

              <Controller
                name="orderCode"
                control={control}
                render={({ field }) => (
                  <TextFieldComponent label="Mã đơn hàng" value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} />
                )}
              />

              <ButtonComponent
                type="submit"
                content="Tra cứu đơn"
                loading={isSubmitting}
                fullWidth
                sx={{
                  height: "48px",
                  backgroundColor: "#0A0A0A",
                  color: "#FFFFFF",
                  borderRadius: "0px",
                  ...TYPOGRAPHY_STYLES.md.bold,
                  "&:hover": {
                    backgroundColor: "#333333",
                  },
                }}
              />
            </Stack>
          </Stack>
        )}
      </Box>

      <OtpVerificationDialogs
        showMethodDialog={false}
        showVerifyDialog={otp.showVerifyDialog}
        otpMethod={otp.otpMethod}
        submittedPhone={otp.submittedPhone}
        otpValues={otp.otpValues}
        setOtpValues={otp.setOtpValues}
        otpError={otp.otpError}
        resendCounter={otp.resendCounter}
        resendBlockedUntil={otp.resendBlockedUntil}
        resendExceededMessage={otp.resendExceededMessage}
        resendText={otp.resendText}
        onCloseMethodDialog={() => otp.setShowMethodDialog(false)}
        onCloseVerifyDialog={() => otp.setShowVerifyDialog(false)}
        onBackToMethodDialog={() => {
          otp.setShowVerifyDialog(false);
          otp.setShowMethodDialog(false);
        }}
        onSelectMethod={() => {}}
        onOtpChange={() => {
          if (!otp.isOtpLocked) otp.setOtpError("");
        }}
        onConfirmOtp={handleConfirmOtp}
        confirmInFlight={isConfirmingOtp}
        resendInFlight={isSendingOtp}
        isOtpLocked={otp.isOtpLocked}
        confirmDisabled={otp.isOtpLocked || Boolean(otp.resendExceededMessage)}
        onResendOtp={async () => {
          const phone = getValues("phone").trim() || otp.submittedPhone;
          if (!phone) return;
          if (otpSendInFlightRef.current) return;

          if (otp.openExistingCooldownIfAny(phone)) {
            return;
          }

          if (!otp.canSendOtp(phone)) {
            otp.applyDailyLimitExceeded();
            otp.setShowVerifyDialog(true);
            return;
          }

          otpSendInFlightRef.current = true;
          setIsSendingOtp(true);
          try {
            const sent = await sendOrderLookupOtp(phone);
            if (!sent) return;
            otp.markOtpSent(phone, otp.otpMethod);
            otp.setShowVerifyDialog(true);
            toast.success("Mã OTP đã được gửi lại!");
          } catch (error) {
            if (isOtpDailyLimitError(error)) {
              otp.applyDailyLimitExceeded();
              otp.setShowVerifyDialog(true);
              return;
            }
            toast.error(getErrorMessage(error));
          } finally {
            otpSendInFlightRef.current = false;
            setIsSendingOtp(false);
          }
        }}
      />
    </>
  );
};

export default OrderTrackingView;
