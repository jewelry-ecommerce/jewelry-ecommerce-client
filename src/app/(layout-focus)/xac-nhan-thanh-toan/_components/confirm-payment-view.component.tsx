"use client";
import React, { useMemo, useEffect, useCallback, useRef, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography, useMediaQuery, Theme } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter, useSearchParams } from "next/navigation";

// Hooks
import { useAppSelector } from "@/redux/hooks";
import { useConfirmPayment } from "@/hooks/checkout/use-confirm-payment.hook";
import { useTenantCode } from "@/components/providers.component";

// Components from Checkout
import CheckoutAccountSection from "../../thanh-toan/_components/checkout-account/checkout-account.component";
import CheckoutAddressSection from "../../thanh-toan/_components/checkout-address/checkout-address.component";
import CheckoutSpecialRequestSection from "../../thanh-toan/_components/checkout-special-request/checkout-special-request.component";
import CheckoutPaymentSection from "../../thanh-toan/_components/checkout-payment/checkout-payment.component";
import CheckoutSummarySection from "../../thanh-toan/_components/checkout-summary/checkout-summary.component";
import CheckoutProductListSection from "../../thanh-toan/_components/checkout-product-list/checkout-product-list.component";
import CheckoutVoucherSection from "../../thanh-toan/_components/checkout-voucher/checkout-voucher.component";
import CheckoutStatusModal from "../../thanh-toan/_components/checkout-status-modal/checkout-status-modal.component";
import CheckoutStellaVoteConsent from "../../thanh-toan/_components/checkout-stella-vote-consent.component";

// Styles & Constants
import useStyles from "../../thanh-toan/_components/checkout.styles";
import { StackRowAlignCenterJustEnd, StackRowAlignJustCenter } from "@/components/styled";
import { formatPrice } from "@/utils/constants/common.constant";
import { CheckoutFormValues, getCheckoutInitialValues, getCheckoutValidationSchema } from "../../thanh-toan/_components/checkout.constant";
import { OrderStatus, PaymentStatus, PaymentMethod } from "@/utils/api/order/order.enum";
import { useCheckoutStorage } from "@/hooks/checkout/use-checkout-storage.hook";
import { buildPaymentStatusUrl } from "@/app/(layout-focus)/trang-thai-thanh-toan/_utils/payment-status-url.util";
import { getOrderLooseItems, getOrderSetLines, mapOrderSetLineToCheckoutItem } from "@/utils/order/order-set-line.util";
import { isStellaVoteEligibleCheckout } from "../../thanh-toan/_utils/checkout-stella-vote.util";

const ConfirmPaymentView = () => {
  const { classes } = useStyles();
  const { readLatestOrderSnapshot, PENDING_PAYMENT_MAX_AGE_MS } = useCheckoutStorage();

  // null = chưa resolve (đợi mount để đọc sessionStorage), "" = không tìm thấy mã đơn hàng.
  const [resolvedOrderCode, setResolvedOrderCode] = useState<string | null>(null);
  const orderCode = resolvedOrderCode || "";

  useEffect(() => {
    setResolvedOrderCode(readLatestOrderSnapshot()?.orderCode?.trim() || "");
  }, [readLatestOrderSnapshot]);

  const getPendingPaymentRedirectByOrderCode = useCallback(
    (orderCode: string) => {
      if (!orderCode) return null;
      const latestOrder = readLatestOrderSnapshot();
      if (!latestOrder?.orderCode) return null;

      const isSameOrder = latestOrder.orderCode === orderCode;
      const isRecent = typeof latestOrder.timestamp === "number" && Date.now() - latestOrder.timestamp < PENDING_PAYMENT_MAX_AGE_MS;

      if (!isSameOrder || !isRecent) {
        return null;
      }

      if (latestOrder.paymentMethod === PaymentMethod.COD) {
        return "/gio-hang";
      }

      return buildPaymentStatusUrl({ status: "pending" });
    },
    [readLatestOrderSnapshot, PENDING_PAYMENT_MAX_AGE_MS],
  );
  const isLoggedIn = useAppSelector((state) => state.auth.isLogin);
  const currentUser = useAppSelector((state) => state.auth.user);
  const tenantCode = useTenantCode();
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up(1199));
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromValue = searchParams.get("from");
  const fromPendingChangeMethod = fromValue === "update-payment-method";
  // Đánh dấu đã bấm thanh toán (đi Payoo). Ref sống sót qua bfcache restore,
  // dùng để bỏ qua guard `from=update-payment-method` khi user bấm back từ Payoo.
  const hasStartedPaymentRetryRef = useRef(false);

  const { order, isLoading, fetchError, isSubmitting, handleRetry, payooLoadingOpen, closePayooLoading } = useConfirmPayment(orderCode);

  const initialValues = useMemo(() => {
    if (!order) return null;
    const addr = order.shippingAddressSnapshot;
    return {
      lastName: "",
      firstName: `${addr.lastName || ""} ${addr.firstName || ""}`.trim(),
      provinceCode: addr.provinceCode || 0,
      provinceName: addr.provinceName || "",
      wardCode: addr.wardCode || 0,
      wardName: addr.wardName || "",
      addressLine: addr.addressLine || "",
      receiverPhone: addr.receiverPhone || "",
      paymentMethod: order.paymentMethod || PaymentMethod.COD,
      note: order.note || "",
      showNote: !!order.note,
      //VAT
      showVat: !!order.vatInvoice,
      companyName: order.vatInvoice?.companyName || "",
      companyAddress: order.vatInvoice?.companyAddress || "",
      taxCode: order.vatInvoice?.taxCode || "",
      vatEmail: order.vatInvoice?.email || "",
      consent: true,
      isAllowCheck: Boolean(order.isAllowCheck),
      consentCollabPartnerSharing: false,
      saveAddress: false,
      email: "",
    } as CheckoutFormValues;
  }, [order]);

  const methods = useForm<CheckoutFormValues>({
    defaultValues: useMemo(() => getCheckoutInitialValues(null, isLoggedIn), [isLoggedIn]),
    values: initialValues || undefined,
    resolver: yupResolver(getCheckoutValidationSchema(isLoggedIn, false)) as any,
  });

  const { handleSubmit } = methods;

  const summaryData = useMemo(() => {
    if (!order) return null;

    return {
      subtotal: formatPrice(Number(order.subtotal || 0)),
      shippingFee: formatPrice(Number(order.shippingFee || 0)),
      totalDiscount: formatPrice(Number(order.discountTotal || 0)),
      total: formatPrice(Number(order.grandTotal || 0)),
      pointsUsed: 0,
      pointsDiscount: "0đ",
    };
  }, [order]);

  const setItems = useMemo(() => {
    return order ? getOrderSetLines(order).map(mapOrderSetLineToCheckoutItem) : [];
  }, [order]);

  const productItems = useMemo(() => {
    return getOrderLooseItems({ items: order?.items || [], lines: order?.lines }).map((item) => ({
      variationId: item.variationId,
      productId: item.productId,
      productName: item.productName,
      variationName: item.variationName,
      attributes: item.attributes,
      skuCode: item.skuCode,
      image: item.image,
      unitPrice: item.unitPrice,
      salePrice: item.salePrice,
      customerDisplayPrice: item.customerDisplayPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      discountAmount: item.discountAmount,
      finalAmount: item.finalAmount,
      lineType: item.lineType,
      parentCheckoutItemId: item.parentOrderItemId,
      packagingRelationId: item.packagingRelationId,
      isKey: item.isKey,
    }));
  }, [order]);

  const checkoutLines = useMemo(() => [...setItems, ...productItems], [productItems, setItems]);

  const totalQuantity = useMemo(() => {
    return (order?.items || []).reduce((total, item) => total + (item.quantity || 0), 0);
  }, [order]);

  const showStellaVoteConsent = isStellaVoteEligibleCheckout(tenantCode, checkoutLines);

  const accountUser = useMemo(() => {
    if (isLoggedIn && currentUser) {
      return {
        name: currentUser.firstName?.trim() || "",
        email: currentUser.email || "chuacoemail@gmail.com",
        avatar: currentUser.url || undefined,
      };
    }
    if (order?.contactEmail) {
      return {
        name: order.shippingAddressSnapshot.firstName?.trim() || "",
        email: order.contactEmail,
      };
    }
    return undefined;
  }, [isLoggedIn, currentUser, order]);

  const onSubmit = async (values: CheckoutFormValues) => {
    try {
      if (fromValue === "update-payment-method") {
        try {
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.delete("from");
          window.history.replaceState(window.history.state, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
        } catch {
          // no-op
        }
      }
      hasStartedPaymentRetryRef.current = true;
      await handleRetry(values.paymentMethod);
    } catch {
      hasStartedPaymentRetryRef.current = false;
      // Toast / redirect handled in useRetryOrderPayment
    }
  };

  const isFinished = useMemo(() => {
    if (!order) return false;

    const pStatus = (order.paymentStatus || "").toUpperCase();
    if (pStatus === PaymentStatus.PAID.toUpperCase() || pStatus === PaymentStatus.REFUNDED.toUpperCase()) {
      return true;
    }

    const oStatus = (order.status || "").toUpperCase();
    if (
      oStatus === OrderStatus.CANCELLED.toUpperCase() ||
      oStatus === OrderStatus.REFUNDED.toUpperCase() ||
      oStatus === OrderStatus.COMPLETED.toUpperCase()
    ) {
      return true;
    }

    if (order.paymentMethod === PaymentMethod.COD) {
      return true;
    }

    return false;
  }, [order]);

  useEffect(() => {
    if (isFinished) {
      router.replace("/gio-hang");
    }
  }, [isFinished, router]);

  const restorePendingPaymentState = useCallback(
    (bypassChangeMethodGuard = false) => {
      if (fromPendingChangeMethod && !bypassChangeMethodGuard) return;
      const redirectUrl = getPendingPaymentRedirectByOrderCode(orderCode);
      if (!redirectUrl || isSubmitting) return;

      router.replace(redirectUrl);
    },
    [fromPendingChangeMethod, router, orderCode, isSubmitting, getPendingPaymentRedirectByOrderCode],
  );

  useEffect(() => {
    restorePendingPaymentState();

    // Back từ Payoo: trang được khôi phục từ bfcache nên `useSearchParams` vẫn giữ
    // `from=update-payment-method` cũ (dù đã xóa khỏi URL bằng replaceState trước khi redirect).
    // Nếu đã bấm thanh toán thì bỏ qua guard để đưa user về trang chờ thanh toán (URL không có orderCode).
    const handlePageShow = (event: PageTransitionEvent) => {
      restorePendingPaymentState(event.persisted && hasStartedPaymentRetryRef.current);
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [restorePendingPaymentState]);

  if (resolvedOrderCode === null || isLoading) {
    return (
      <StackRowAlignJustCenter sx={{ height: "100vh" }}>
        <CircularProgress color="inherit" size={32} />
      </StackRowAlignJustCenter>
    );
  }

  if (!orderCode) {
    return (
      <StackRowAlignJustCenter sx={{ height: "100vh", px: 2 }}>
        <Stack spacing={2} alignItems="center" maxWidth={420}>
          <Typography align="center" variant="h6" component="h1">
            Không tìm thấy mã đơn hàng
          </Typography>
          <Typography align="center" variant="body1">
            Vui lòng kiểm tra lại đường dẫn hoặc tra cứu đơn hàng.
          </Typography>
          <Button variant="contained" onClick={() => router.push("/tra-cuu-don-hang")}>
            Tra cứu đơn hàng
          </Button>
        </Stack>
      </StackRowAlignJustCenter>
    );
  }

  if (fetchError || !order) {
    return (
      <StackRowAlignJustCenter sx={{ height: "100vh", px: 2 }}>
        <Stack spacing={2} alignItems="center" maxWidth={420}>
          <Typography align="center" variant="body1">
            Không thể tải thông tin đơn hàng. Vui lòng thử lại hoặc tra cứu đơn hàng.
          </Typography>
          <Button variant="contained" onClick={() => router.push("/tra-cuu-don-hang")}>
            Tra cứu đơn hàng
          </Button>
        </Stack>
      </StackRowAlignJustCenter>
    );
  }

  const renderSubmitButton = (isMobileFooter = false) => (
    <Button
      variant="contained"
      fullWidth={!isMobileFooter}
      className={classes.submitButton}
      onClick={handleSubmit(onSubmit)}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} color="inherit" />
          <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit" }}>
            Đang Xử Lý...
          </Typography>
        </Stack>
      ) : (
        "Hoàn Tất Thanh Toán"
      )}
    </Button>
  );

  return (
    <FormProvider {...methods}>
      <Box className={classes.root}>
        {!isDesktop && (
          <Box className={classes.mobileHeader} sx={{ mb: 2 }}>
            <CheckoutProductListSection
              items={checkoutLines}
              looseItems={productItems}
              totalQuantity={totalQuantity}
              totalPrice={Number(order.subtotal)}
              totalSavings={Number(order.discountTotal)}
            />
          </Box>
        )}

        <Box className={classes.leftColumn}>
          <CheckoutAccountSection user={accountUser} readOnly />

          <CheckoutAddressSection readOnly isSaved={false} isLoggedIn={isLoggedIn} />

          <CheckoutSpecialRequestSection readOnly showNoteSection={!!order.note} showVatSection={!!order.vatInvoice} />

          {showStellaVoteConsent ? <CheckoutStellaVoteConsent disabled /> : null}

          {!isDesktop && (
            <React.Fragment>
              <CheckoutVoucherSection readOnly selectedVouchers={[]} onToggleVoucher={() => {}} onApplyValidatedVoucher={() => {}} />
              <CheckoutSummarySection
                {...(summaryData as any)}
                hidePointsBalance
                forceShowPointsRow
                showTitle={true}
                isLoggedIn={isLoggedIn}
              />
            </React.Fragment>
          )}

          <CheckoutPaymentSection isLoggedIn={isLoggedIn} orderPayableAmountVnd={Number(order.grandTotal || 0)} />

          {isDesktop && renderSubmitButton()}
        </Box>

        {/* Right Column */}
        {isDesktop && (
          <Box className={classes.rightColumn}>
            <Box className={classes.summaryCard}>
              <CheckoutProductListSection
                items={checkoutLines}
                looseItems={productItems}
                totalPrice={Number(order.subtotal)}
                totalQuantity={totalQuantity}
                totalSavings={Number(order.discountTotal)}
              />

              <CheckoutVoucherSection
                showTitle={false}
                readOnly
                selectedVouchers={[]}
                onToggleVoucher={() => {}}
                onApplyValidatedVoucher={() => {}}
              />

              <CheckoutSummarySection
                {...(summaryData as any)}
                hidePointsBalance
                showTitle={false}
                forceShowPointsRow
                isLoggedIn={isLoggedIn}
              />
            </Box>
          </Box>
        )}

        {/* Mobile View */}
        {!isDesktop && (
          <React.Fragment>
            <StackRowAlignCenterJustEnd className={classes.mobileStickyFooter}>
              <Stack className={classes.mobileStickyLeft}>
                <Box className={classes.mobileStickyTotal}>
                  <Typography component="span">Tổng cộng</Typography>
                  <Typography component="span">{summaryData?.total}</Typography>
                </Box>
                <Box className={classes.mobileStickySavings}>
                  <Typography component="span">Tiết kiệm</Typography>
                  <Typography component="span">{summaryData?.totalDiscount}</Typography>
                </Box>
              </Stack>
              {renderSubmitButton(true)}
            </StackRowAlignCenterJustEnd>
          </React.Fragment>
        )}
      </Box>

      <CheckoutStatusModal open={payooLoadingOpen} type="payoo_loading" onClose={closePayooLoading} />
    </FormProvider>
  );
};

export default ConfirmPaymentView;
