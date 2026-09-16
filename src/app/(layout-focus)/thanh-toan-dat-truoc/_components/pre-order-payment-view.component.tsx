"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Box, Button, CircularProgress, Stack, Typography, useMediaQuery, Theme } from "@mui/material";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import CheckoutAccountSection from "@/app/(layout-focus)/thanh-toan/_components/checkout-account/checkout-account.component";
import CheckoutAddressSection from "@/app/(layout-focus)/thanh-toan/_components/checkout-address/checkout-address.component";
import CheckoutPaymentSection from "@/app/(layout-focus)/thanh-toan/_components/checkout-payment/checkout-payment.component";
import CheckoutProductListSection from "@/app/(layout-focus)/thanh-toan/_components/checkout-product-list/checkout-product-list.component";
import CheckoutSpecialRequestSection from "@/app/(layout-focus)/thanh-toan/_components/checkout-special-request/checkout-special-request.component";
import CheckoutStatusModal from "@/app/(layout-focus)/thanh-toan/_components/checkout-status-modal/checkout-status-modal.component";
import CheckoutSummarySection from "@/app/(layout-focus)/thanh-toan/_components/checkout-summary/checkout-summary.component";
import { CheckoutFormValues, getCheckoutValidationSchema } from "@/app/(layout-focus)/thanh-toan/_components/checkout.constant";
import useStyles from "@/app/(layout-focus)/thanh-toan/_components/checkout.styles";
import { getPreOrderPaymentFormValues } from "@/app/(layout-focus)/thanh-toan-dat-truoc/_utils/pre-order-payment-form.util";
import { usePreOrderPayment } from "@/app/(layout-focus)/thanh-toan-dat-truoc/_hooks/use-pre-order-payment.hook";
import { StackRowAlignCenterJustEnd, StackRowAlignJustCenter } from "@/components/styled";
import useDebounce from "@/hooks/use-debounce";
import { useAppSelector } from "@/redux/hooks";
import { formatPrice } from "@/utils/constants/common.constant";

function PreOrderPaymentView() {
  const { classes } = useStyles();
  const isLoggedIn = useAppSelector((state) => state.auth.isLogin);
  const currentUser = useAppSelector((state) => state.auth.user);
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up(1199));

  const {
    order,
    isHydrating,
    isSubmitting,
    isShippingSyncing,
    payooLoadingOpen,
    closePayooLoading,
    syncShippingAddress,
    submitPayment,
    goBackToDetail,
  } = usePreOrderPayment();

  const methods = useForm<CheckoutFormValues>({
    defaultValues: getPreOrderPaymentFormValues({ orderCode: "" }),
    resolver: yupResolver(getCheckoutValidationSchema(isLoggedIn, false)) as any,
  });

  const { control, handleSubmit, setValue, reset, getValues } = methods;
  const [showVat, showNote] = useWatch({ control, name: ["showVat", "showNote"] });
  const [provinceCode, provinceName, wardCode, wardName, addressLine, firstName, lastName] = useWatch({
    control,
    name: ["provinceCode", "provinceName", "wardCode", "wardName", "addressLine", "firstName", "lastName"],
  });

  const hydratedOrderCodeRef = useRef<string | null>(null);

  // Hydrate form một lần theo orderCode — không reset khi chỉ cập nhật shippingFee.
  useEffect(() => {
    if (!order) return;
    const orderCode = order.orderCode?.trim() || "";
    if (!orderCode || hydratedOrderCodeRef.current === orderCode) return;
    hydratedOrderCodeRef.current = orderCode;
    reset(getPreOrderPaymentFormValues(order));
  }, [order, reset]);

  const shippingQuoteAddress = useMemo(
    () => ({
      provinceCode: Number(provinceCode || 0),
      provinceName: provinceName || "",
      wardCode: Number(wardCode || 0),
      wardName: wardName || "",
      addressLine: (addressLine || "").trim(),
      firstName: firstName || "",
      lastName: lastName || "",
    }),
    [provinceCode, provinceName, wardCode, wardName, addressLine, firstName, lastName],
  );

  const debouncedShippingQuoteAddress = useDebounce({ value: shippingQuoteAddress, delay: 600 });

  useEffect(() => {
    if (!order?.orderCode || isHydrating) return;
    void syncShippingAddress(getValues());
  }, [debouncedShippingQuoteAddress, getValues, isHydrating, order?.orderCode, syncShippingAddress]);

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

  const productItems = useMemo(
    () =>
      (order?.items || []).map((item) => ({
        variationId: item.variationId,
        productId: item.productId,
        productName: item.productName,
        variationName: item.variationName,
        attributes: item.attributes,
        skuCode: item.skuCode,
        image: item.image,
        unitPrice: item.unitPrice,
        salePrice: item.salePrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        discountAmount: item.discountAmount,
        finalAmount: item.finalAmount,
      })),
    [order?.items],
  );

  const totalQuantity = useMemo(() => productItems.reduce((acc, item) => acc + (item.quantity || 0), 0), [productItems]);

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
        name: order.shippingAddressSnapshot?.firstName?.trim() || "",
        email: order.contactEmail,
      };
    }
    return undefined;
  }, [isLoggedIn, currentUser, order]);

  if (isHydrating) {
    return (
      <StackRowAlignJustCenter sx={{ height: "100vh" }}>
        <CircularProgress color="inherit" size={32} />
      </StackRowAlignJustCenter>
    );
  }

  if (!order?.orderCode) {
    return (
      <StackRowAlignJustCenter sx={{ height: "100vh", px: 2 }}>
        <Stack spacing={2} alignItems="center" maxWidth={420}>
          <Typography align="center" variant="h6" component="h1">
            Không tìm thấy đơn đặt trước
          </Typography>
          <Typography align="center" variant="body1">
            Vui lòng mở lại từ chi tiết đơn đặt trước rồi chọn Hoàn tất thanh toán.
          </Typography>
          <Button variant="contained" onClick={goBackToDetail}>
            Về chi tiết đơn
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
      onClick={handleSubmit(submitPayment)}
      disabled={isSubmitting || isShippingSyncing}
    >
      {isSubmitting || isShippingSyncing ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} color="inherit" />
          <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit" }}>
            {isShippingSyncing ? "Đang cập nhật phí ship..." : "Đang Xử Lý..."}
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
              items={productItems as any}
              totalQuantity={totalQuantity}
              totalPrice={Number(order.subtotal || 0)}
              totalSavings={Number(order.discountTotal || 0)}
            />
          </Box>
        )}

        <Box className={classes.leftColumn}>
          <CheckoutAccountSection user={accountUser} readOnly />

          <CheckoutAddressSection isSaved={false} isLoggedIn={isLoggedIn} lockReceiverPhone />

          <CheckoutSpecialRequestSection
            showVatSection={!!showVat}
            showNoteSection={!!showNote}
            onVatSectionToggle={(val) => {
              setValue("showVat", val, { shouldDirty: true, shouldValidate: true });
            }}
            onNoteSectionToggle={(val) => {
              setValue("showNote", val, { shouldDirty: true, shouldValidate: true });
            }}
          />

          {!isDesktop && summaryData && (
            <CheckoutSummarySection
              {...(summaryData as any)}
              hidePointsBalance
              forceShowPointsRow
              showTitle
              isLoggedIn={isLoggedIn}
              isLoading={isShippingSyncing}
            />
          )}

          <CheckoutPaymentSection isLoggedIn={isLoggedIn} orderPayableAmountVnd={Number(order.grandTotal || 0)} />

          {isDesktop && renderSubmitButton()}
        </Box>

        {isDesktop && (
          <Box className={classes.rightColumn}>
            <Box className={classes.summaryCard}>
              <CheckoutProductListSection
                items={productItems as any}
                totalPrice={Number(order.subtotal || 0)}
                totalQuantity={totalQuantity}
                totalSavings={Number(order.discountTotal || 0)}
              />

              {summaryData && (
                <CheckoutSummarySection
                  {...(summaryData as any)}
                  hidePointsBalance
                  showTitle={false}
                  forceShowPointsRow
                  isLoggedIn={isLoggedIn}
                  isLoading={isShippingSyncing}
                />
              )}
            </Box>
          </Box>
        )}

        {!isDesktop && (
          <StackRowAlignCenterJustEnd className={classes.mobileStickyFooter}>
            <Stack className={classes.mobileStickyLeft}>
              <Box className={classes.mobileStickyTotal}>
                <Typography component="span">Tổng cộng</Typography>
                <Typography component="span">{isShippingSyncing ? "..." : summaryData?.total}</Typography>
              </Box>
              <Box className={classes.mobileStickySavings}>
                <Typography component="span">Tiết kiệm</Typography>
                <Typography component="span">{isShippingSyncing ? "..." : summaryData?.totalDiscount}</Typography>
              </Box>
            </Stack>
            {renderSubmitButton(true)}
          </StackRowAlignCenterJustEnd>
        )}
      </Box>

      <CheckoutStatusModal open={payooLoadingOpen} type="payoo_loading" onClose={closePayooLoading} />
    </FormProvider>
  );
}

export default PreOrderPaymentView;
