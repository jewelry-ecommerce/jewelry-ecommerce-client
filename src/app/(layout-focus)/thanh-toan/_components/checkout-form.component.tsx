"use client";
import React, { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { Box, useMediaQuery, type Theme, Stack, Portal, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useForm, FormProvider, type Resolver, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSWRConfig } from "swr";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectCartItems } from "@/redux/slices/cart.slice";
import { performCartMergeAndSync } from "@/hooks/cart/use-cart-sync.hook";
import { type SyncStatus } from "@/hooks/checkout/use-checkout-session.hook";
import { isShippingQuoteAddressFilled, useCheckoutShipping } from "@/hooks/checkout/use-checkout-shipping.hook";
import CheckoutAccountSection from "./checkout-account/checkout-account.component";
import CheckoutAddressSection from "./checkout-address/checkout-address.component";
import CheckoutSpecialRequestSection from "./checkout-special-request/checkout-special-request.component";
import CheckoutPaymentSection from "./checkout-payment/checkout-payment.component";
import CheckoutVoucherSection from "./checkout-voucher/checkout-voucher.component";
import type { SelectedCheckoutVoucher } from "./checkout-voucher/checkout-voucher.mapper";
import { DEFAULT_MAX_SELECTED_CART_VOUCHERS, addOrReplaceVoucher, toggleVoucher } from "./checkout-voucher/checkout-voucher.mapper";
import type { PromotionVoucherCard } from "@/utils/api/promotion/promotion.interface";
import { flattenCheckoutSessionItems, flattenLooseCheckoutSessionItems } from "@/utils/api/checkout/checkout.util";
import CheckoutSummarySection from "./checkout-summary/checkout-summary.component";
import CheckoutProductListSection from "./checkout-product-list/checkout-product-list.component";
import { useTenantBrandName, useTenantCode } from "@/components/providers.component";
import CheckoutStatusModal, { CheckoutStatusModalType } from "./checkout-status-modal/checkout-status-modal.component";
import useStyles from "./checkout.styles";
import { StackRowAlignCenterJustEnd } from "@/components/styled";
import { CheckoutFormValues, getCheckoutInitialValues, getCheckoutValidationSchema } from "./checkout.constant";
import type { AuthUser } from "@/utils/api/auth/auth.interface";
import {
  Address,
  CheckoutPriceChangeAction,
  CheckoutPriceChangeDetails,
  CheckoutSession,
  PlaceOrderPayload,
  PlaceOrderResponse,
  ShippingAddress,
  UpdatePricingContextPayload,
} from "@/utils/api/checkout/checkout.interface";
import { LocationApi } from "@/utils/api";
import { clearStoredUtmData } from "@/utils/utm/utm.util";
import { buildPreOrderReservePaymentNotice, isPreOrderReserveCheckout } from "@/utils/api/pre-order/pre-order-checkout.util";
import {
  buildCheckoutPricingContextPayload,
  buildPromotionVoucherCheckoutContext,
  getCheckoutApiError,
  isAcceptPriceChangeAction,
  preloadPayooLoadingImage,
  redirectToPayooPayment,
  filterCheckoutDisplayItems,
  enrichCheckoutSessionItemsWithVariantFallbacks,
  resolveCheckoutPriceChangeDetails,
  resolveCheckoutPricingErrorModal,
  resolveCheckoutDisplayQuantity,
  resolvePlaceOrderShippingCarrier,
  formatShippingQuoteErrorMessage,
} from "./checkout.helpers";
import { useCheckoutStorage } from "@/hooks/checkout/use-checkout-storage.hook";
import { getErrorMessage } from "@/utils/helpers/axios";
import {
  getRecaptchaTokenForSendOtp,
  RECAPTCHA_CLIENT_FAILURE_MESSAGE,
  SendOtpRecaptchaAction,
} from "@/utils/recaptcha/recaptcha-v3.helper";
import { useVisualKeyboardOpen } from "@/hooks/use-visual-keyboard-open.hook";

import CheckoutAddressSyncLogic from "./checkout-address-sync-logic.component";
import CheckoutConsentField from "./checkout-consent-field.component";
import CheckoutCollabPartnerConsentField from "./checkout-collab-partner-consent-field.component";
import CheckoutSubmitButton from "./checkout-submit-button.component";
import CheckoutStellaVoteConsent from "./checkout-stella-vote-consent.component";

import {
  normalizeVoucherCodes,
  buildAddressPayload,
  buildAddressBookPayload,
  buildPlaceOrderPayload,
} from "../_utils/checkout-place-order-payload.util";
import { resolveOrderRedirect } from "../_utils/checkout-order-redirect.util";
import { useCheckoutVoucherPricingSync, type PendingPriceChangeRetry } from "../_utils/use-checkout-voucher-pricing-sync.hook";
import { useCheckoutAddressPrefill } from "../_utils/use-checkout-address-prefill.hook";
import { useCheckoutVoucherHydration } from "../_utils/use-checkout-voucher-hydration.hook";
import { useCheckoutPricingContextAutoSync } from "../_utils/use-checkout-pricing-context-auto-sync.hook";
import { useCheckoutSummaryData } from "../_utils/use-checkout-summary-data.hook";
import { isStellaVoteEligibleCheckout } from "../_utils/checkout-stella-vote.util";

export type CheckoutFormInnerProps = {
  session: CheckoutSession;
  sessionId: string | null;
  isLoading: boolean;
  syncStatus: Record<"address" | "pricing" | "order", SyncStatus>;
  syncAddress: (data: ShippingAddress, addressId?: string, options?: { acceptPriceChanges?: boolean }) => Promise<CheckoutSession>;
  syncPricingContext: (payload: UpdatePricingContextPayload) => Promise<CheckoutSession>;
  handlePlaceOrder: (payload: PlaceOrderPayload) => Promise<PlaceOrderResponse>;
  userAddresses: Address[];
  isLoggedIn: boolean;
  user: AuthUser | null;
};

const CheckoutFormInner = ({
  session,
  sessionId,
  isLoading,
  syncStatus,
  syncAddress,
  syncPricingContext,
  handlePlaceOrder,
  userAddresses,
  isLoggedIn,
  user,
}: CheckoutFormInnerProps) => {
  const { classes } = useStyles();
  const { persistLatestOrderSnapshot, readCheckoutVariantSnapshots } = useCheckoutStorage();
  const brandName = useTenantBrandName();
  const tenantCode = useTenantCode();
  const dispatch = useAppDispatch();
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up(1199), { noSsr: true });
  const isMobile = !isDesktop;
  const isKeyboardOpen = useVisualKeyboardOpen(isMobile);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [selectedVouchers, setSelectedVouchers] = useState<SelectedCheckoutVoucher[]>([]);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    type: CheckoutStatusModalType;
    productName?: string;
    priceChangeDetails?: CheckoutPriceChangeDetails;
  }>({
    open: false,
    type: "payoo_loading",
    productName: "",
  });
  const [priceChangeLoadingActionId, setPriceChangeLoadingActionId] = useState<string | null>(null);
  const pendingPriceChangeRetry = useRef<PendingPriceChangeRetry | null>(null);
  const acceptedPriceChangesRef = useRef(false);
  /** Bật ngay khi bấm Hoàn tất (trước reCAPTCHA + place-order); `syncStatus.order` chỉ loading sau khi gọi API. */
  const [isPlaceOrderSubmitting, setIsPlaceOrderSubmitting] = useState(false);

  useEffect(() => {
    preloadPayooLoadingImage();
  }, []);

  const activeIsAddressSaved = isLoggedIn && !isManualEntry && userAddresses.length > 0;
  const isPreOrderReserve = isPreOrderReserveCheckout(session);
  const preOrderDeferredPaymentNotice = isPreOrderReserve ? buildPreOrderReservePaymentNotice(brandName) : null;
  const submitButtonLabel = isPreOrderReserve ? "Xác Nhận Đặt Trước" : "Hoàn Tất Thanh Toán";

  const validationSchema = useMemo(
    () => getCheckoutValidationSchema(isLoggedIn, activeIsAddressSaved, !isPreOrderReserve, isPreOrderReserve),
    [isLoggedIn, activeIsAddressSaved, isPreOrderReserve],
  );

  const methods = useForm<CheckoutFormValues>({
    defaultValues: useMemo(() => getCheckoutInitialValues(session, isLoggedIn, user), [session, isLoggedIn, user]),
    resolver: yupResolver(validationSchema) as unknown as Resolver<CheckoutFormValues>,
    mode: "all",
  });

  const { control, handleSubmit, setValue, reset, getValues } = methods;

  const [showVat, showNote] = useWatch({ control, name: ["showVat", "showNote"] });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  const watchedShippingValues = useWatch({
    control,
    name: ["provinceCode", "provinceName", "wardCode", "wardName", "addressLine", "receiverPhone"],
  });
  const [shippingProvinceCode, shippingProvinceName, shippingWardCode, shippingWardName, shippingAddressLine, shippingReceiverPhone] =
    watchedShippingValues || [];

  const shippingAddressForApi = useMemo(
    () => ({
      provinceCode: Number(shippingProvinceCode || 0),
      provinceName: shippingProvinceName || "",
      wardCode: Number(shippingWardCode || 0),
      wardName: shippingWardName || "",
      addressLine: shippingAddressLine || "",
      receiverPhone: shippingReceiverPhone || "",
    }),
    [shippingProvinceCode, shippingProvinceName, shippingWardCode, shippingWardName, shippingAddressLine, shippingReceiverPhone],
  );

  const {
    warehouse: nearestWarehouse,
    service: shippingService,
    shippingFee: dynamicShippingFee,
    serviceId: shippingServiceId,
    isLoading: isShippingLoading,
    error: shippingQuoteError,
  } = useCheckoutShipping({
    session,
    shippingAddress: shippingAddressForApi,
    skipNearestAndCalculate: isPreOrderReserve,
  });

  const lastShippingQuoteToastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!shippingQuoteError || isShippingLoading) {
      if (!shippingQuoteError) lastShippingQuoteToastKeyRef.current = null;
      return;
    }

    const toastKey = `${shippingAddressForApi.wardCode}:${shippingQuoteError}`;
    if (lastShippingQuoteToastKeyRef.current === toastKey) return;

    lastShippingQuoteToastKeyRef.current = toastKey;
    toast.error(formatShippingQuoteErrorMessage(shippingQuoteError), { toastId: "shipping-quote-error" });
  }, [shippingQuoteError, isShippingLoading, shippingAddressForApi.wardCode]);

  const checkoutLines = useMemo(() => session?.items || [], [session]);
  const items = useMemo(() => flattenCheckoutSessionItems(checkoutLines), [checkoutLines]);
  const looseCheckoutItems = useMemo(() => flattenLooseCheckoutSessionItems(checkoutLines), [checkoutLines]);
  const cartItems = useAppSelector(selectCartItems);
  const variantSnapshots = useMemo(() => readCheckoutVariantSnapshots(sessionId), [readCheckoutVariantSnapshots, sessionId]);
  const displayItems = useMemo(() => {
    const fallbacks = [
      ...cartItems.map((item) => ({
        variationId: String(item.id),
        details: item.details,
        sizeLabel: item.sizeLabel,
      })),
      ...variantSnapshots,
    ];

    return enrichCheckoutSessionItemsWithVariantFallbacks(filterCheckoutDisplayItems(looseCheckoutItems), fallbacks);
  }, [looseCheckoutItems, cartItems, variantSnapshots]);
  const canonicalSessionShippingFee = useMemo(() => Number(session?.pricing?.shippingFee ?? 0), [session?.pricing?.shippingFee]);
  const promotionVoucherCheckoutContext = useMemo(
    () =>
      buildPromotionVoucherCheckoutContext(session, selectedVouchers, {
        customerId: user?.id ?? null,
        segmentIds: user?.segmentIds ?? [],
      }),
    [session, selectedVouchers, user?.id, user?.segmentIds],
  );
  const normalizedSessionCouponCodes = useMemo(() => normalizeVoucherCodes(session?.couponCodes), [session?.couponCodes]);
  const normalizedSelectedCouponCodes = useMemo(
    () => normalizeVoucherCodes(selectedVouchers.map((voucher) => voucher.code)),
    [selectedVouchers],
  );
  const sessionCouponCodesKey = normalizedSessionCouponCodes.join("|");
  const selectedCouponCodesKey = normalizedSelectedCouponCodes.join("|");
  const resolvedPricingShippingFee = useMemo(() => {
    if (!items.length) return canonicalSessionShippingFee;
    if (isPreOrderReserve) {
      // Pre-order: chờ with-leadtime lấy service xong mới cho pricing chạy
      // Fee = 0 vì giá ship thực tế lấy từ pricing response
      if (!isShippingQuoteAddressFilled(shippingAddressForApi)) return 0;
      if (isShippingLoading || !shippingService) return undefined;
      return 0;
    }
    if (!isShippingQuoteAddressFilled(shippingAddressForApi)) return canonicalSessionShippingFee;
    if (isShippingLoading || !shippingService) return undefined;
    const fee = Math.round(Number(dynamicShippingFee) || 0);
    if (fee <= 0) return undefined;
    return fee;
  }, [
    items.length,
    canonicalSessionShippingFee,
    isPreOrderReserve,
    shippingAddressForApi,
    isShippingLoading,
    shippingService,
    dynamicShippingFee,
  ]);
  const resolvedPricingShippingCarrier = useMemo(
    () => (shippingService ? resolvePlaceOrderShippingCarrier(shippingService) : undefined),
    [shippingService],
  );
  const resolvedPricingCarrierServiceId = shippingServiceId;
  const shippingQuoteBlocked = useMemo(() => {
    if (items.length === 0) return false;
    const pricingShippingFee = Number(session?.pricing?.shippingFee || 0);
    if (isPreOrderReserve) return syncStatus.pricing === "loading" || pricingShippingFee <= 0;
    if (!isShippingQuoteAddressFilled(shippingAddressForApi)) return true;
    if (isShippingLoading || !shippingService) return true;
    const fee = Number(dynamicShippingFee) || 0;
    if (fee <= 0 || pricingShippingFee <= 0) return true;
    return syncStatus.pricing === "loading";
  }, [
    items.length,
    isPreOrderReserve,
    shippingAddressForApi,
    isShippingLoading,
    shippingService,
    dynamicShippingFee,
    syncStatus.pricing,
    session?.pricing?.shippingFee,
  ]);

  const isSubmissionLock = useRef(false);
  const openCheckoutErrorModal = useCallback((error: unknown, retry?: PendingPriceChangeRetry) => {
    const responseData = getCheckoutApiError(error);
    const errorCode = responseData?.errorCode;
    const details = responseData?.details;
    const modalType = resolveCheckoutPricingErrorModal(errorCode);
    if (!modalType) return false;

    const item = details?.unavailableItems?.[0] || details?.outOfStockItems?.[0] || details?.priceChangedItems?.[0] || details?.items?.[0];
    pendingPriceChangeRetry.current = modalType === "price_change" || modalType === "shipping_fee_unavailable" ? (retry ?? null) : null;
    setStatusModal({
      open: true,
      type: modalType,
      productName: item?.productName || item?.variationName || "",
      priceChangeDetails: modalType === "price_change" ? resolveCheckoutPriceChangeDetails(details) : undefined,
    });
    return true;
  }, []);

  const voucherHydrationPendingRef = useRef<string | null>(null);
  const voucherHydrationCompleteRef = useRef<string | null>(null);
  const selectedVouchersRef = useRef(selectedVouchers);
  selectedVouchersRef.current = selectedVouchers;

  const pricingPaymentMethod = isPreOrderReserve ? undefined : String(paymentMethod ?? "").trim() || undefined;

  const canSchedulePricingContextSync = resolvedPricingShippingFee !== undefined && (Boolean(pricingPaymentMethod) || isPreOrderReserve);
  const hasPendingCouponPricingSync = canSchedulePricingContextSync && sessionCouponCodesKey !== selectedCouponCodesKey;
  const isPricingContextReady = syncStatus.pricing !== "loading" && (!hasPendingCouponPricingSync || syncStatus.pricing === "error");

  const { scheduleVoucherPricingSync, flushVoucherPricingSync } = useCheckoutVoucherPricingSync({
    session,
    isSubmissionLock,
    voucherHydrationCompleteRef,
    voucherHydrationPendingRef,
    sessionCouponCodesKey,
    selectedCouponCodesKey,
    pricingPaymentMethod,
    resolvedPricingShippingFee,
    user,
    resolvedPricingShippingCarrier,
    resolvedPricingCarrierServiceId,
    syncPricingContext,
    openCheckoutErrorModal,
  });

  useCheckoutAddressPrefill({
    session,
    isLoggedIn,
    user,
    userAddresses,
    selectedAddressId,
    isManualEntry,
    reset,
    setValue,
    getValues,
    setSelectedAddressId,
  });

  useCheckoutVoucherHydration({
    session,
    isSubmissionLock,
    sessionCouponCodesKey,
    selectedCouponCodesKey,
    normalizedSessionCouponCodes,
    user,
    voucherHydrationPendingRef,
    voucherHydrationCompleteRef,
    setSelectedVouchers,
  });

  useCheckoutPricingContextAutoSync({
    session,
    isSubmissionLock,
    resolvedPricingShippingFee,
    pricingPaymentMethod,
    sessionCouponCodesKey,
    selectedCouponCodesKey,
    voucherHydrationCompleteRef,
    resolvedPricingShippingCarrier,
    resolvedPricingCarrierServiceId,
    canonicalSessionShippingFee,
    selectedVouchersRef,
    user,
    syncPricingContext,
    openCheckoutErrorModal,
  });

  const handleSelectAddress = useCallback(
    (addr: Address, options?: { silent?: boolean }) => {
      const addressPayload: ShippingAddress = {
        lastName: addr.lastName || "",
        firstName: addr.firstName || "",
        provinceCode: addr.provinceCode || 0,
        provinceName: addr.provinceName || "",
        wardCode: addr.wardCode || 0,
        wardName: addr.wardName || "",
        addressLine: addr.addressLine || "",
        receiverPhone: addr.receiverPhone || "",
      };
      Object.entries(addressPayload).forEach(([key, value]) => {
        setValue(key as keyof CheckoutFormValues, value as string | number, { shouldDirty: false, shouldValidate: true });
      });
      const isDraft = session?.status?.toLowerCase() === "draft";
      const hasOrder = Boolean(session?.orderCode);
      if (!isDraft || isSubmissionLock.current || hasOrder) return;
      const syncPromise = syncAddress(addressPayload, addr.id);
      void syncPromise.catch((error) => {
        if (openCheckoutErrorModal(error, { kind: "address", address: addressPayload, addressId: addr.id })) return;
        if (!options?.silent) {
          toast.error(getErrorMessage(error) || "Không thể cập nhật địa chỉ giao hàng. Vui lòng thử lại.");
        }
      });
      setSelectedAddressId(addr.id);
      setIsManualEntry(false);
    },
    [openCheckoutErrorModal, setValue, syncAddress, session, isSubmissionLock],
  );

  const handleAddressSyncError = useCallback(
    (error: unknown) => {
      openCheckoutErrorModal(error, { kind: "address", address: buildAddressPayload(getValues()) });
    },
    [getValues, openCheckoutErrorModal],
  );

  const saveAddressIfNeeded = async (values: CheckoutFormValues) => {
    if (!isLoggedIn || !values.saveAddress) return;

    try {
      await LocationApi.addUserAddress(buildAddressBookPayload(values));
    } catch (error) {
      toast.error(getErrorMessage(error) || "Không thể lưu địa chỉ vào sổ địa chỉ");
    }
  };

  const onPlaceOrder = async (values: CheckoutFormValues) => {
    if (isSubmissionLock.current) return;
    isSubmissionLock.current = true;
    setIsPlaceOrderSubmitting(true);
    try {
      const requiresShippingQuote = items.length > 0 && isShippingQuoteAddressFilled(shippingAddressForApi);
      if (requiresShippingQuote && !isPreOrderReserve) {
        if (isShippingLoading) {
          toast.info("Đang tính phí vận chuyển, vui lòng đợi giây lát.");
          isSubmissionLock.current = false;
          setIsPlaceOrderSubmitting(false);
          return;
        }
        const fee = Number(dynamicShippingFee) || 0;
        if (!shippingService) {
          toast.error(
            formatShippingQuoteErrorMessage(shippingQuoteError) ||
              "Không thể tính phí vận chuyển. Vui lòng kiểm tra lại địa chỉ nhận hàng.",
          );
          isSubmissionLock.current = false;
          setIsPlaceOrderSubmitting(false);
          return;
        }
        if (fee <= 0) {
          toast.error("Phí vận chuyển không hợp lệ. Vui lòng thử lại hoặc kiểm tra lại địa chỉ nhận hàng.");
          isSubmissionLock.current = false;
          setIsPlaceOrderSubmitting(false);
          return;
        }
      }

      if (Number(session?.pricing?.shippingFee || 0) <= 0) {
        toast.error("Địa chỉ này không hỗ trợ giao hàng. Vui lòng thử địa chỉ khác.");
        isSubmissionLock.current = false;
        setIsPlaceOrderSubmitting(false);
        return;
      }

      const addressPayload = buildAddressPayload(values);
      const pricingPayload = buildCheckoutPricingContextPayload(
        selectedVouchers,
        isPreOrderReserveCheckout(session) ? undefined : values.paymentMethod,
        resolvedPricingShippingFee ?? canonicalSessionShippingFee,
        user?.segmentIds ?? [],
        resolvedPricingShippingCarrier,
        resolvedPricingCarrierServiceId,
      );
      const acceptPriceChanges = acceptedPriceChangesRef.current;
      try {
        await syncAddress(addressPayload, undefined, acceptPriceChanges ? { acceptPriceChanges: true } : undefined);
      } catch (error) {
        if (openCheckoutErrorModal(error, { kind: "address", address: addressPayload })) {
          isSubmissionLock.current = false;
          setIsPlaceOrderSubmitting(false);
          return;
        }
        throw error;
      }
      let syncedPricingSession: CheckoutSession;
      try {
        syncedPricingSession = await syncPricingContext({
          ...pricingPayload,
          ...(acceptPriceChanges ? { acceptPriceChanges: true } : {}),
        });
      } catch (error) {
        if (openCheckoutErrorModal(error, { kind: "pricing", payload: pricingPayload })) {
          isSubmissionLock.current = false;
          setIsPlaceOrderSubmitting(false);
          return;
        }
        throw error;
      }

      let recaptchaToken: string | null = null;
      if (!isLoggedIn) {
        recaptchaToken = await getRecaptchaTokenForSendOtp(SendOtpRecaptchaAction.PLACE_ORDER);
        if (!recaptchaToken) {
          toast.error(RECAPTCHA_CLIENT_FAILURE_MESSAGE);
          isSubmissionLock.current = false;
          setIsPlaceOrderSubmitting(false);
          return;
        }
      }
      const result = await handlePlaceOrder({
        ...buildPlaceOrderPayload({
          values,
          recaptchaToken,
          checkoutSession: syncedPricingSession,
          isLoggedIn,
          shippingService,
          shippingServiceId,
          nearestWarehouse,
          isAllowCheck: isStellaVoteEligibleCheckout(tenantCode, checkoutLines) ? values.isAllowCheck : undefined,
        }),
        ...(acceptPriceChanges ? { acceptPriceChanges: true } : {}),
      });
      acceptedPriceChangesRef.current = false;

      clearStoredUtmData();

      await saveAddressIfNeeded(values);

      persistLatestOrderSnapshot({
        orderCode: result?.orderCode || "",
        phone: values.receiverPhone || "",
        paymentUrl: result?.paymentUrl,
        sessionId: sessionId || "",
        paymentMethod: values.paymentMethod,
        guestOrderAccessToken: result?.guestOrderAccess?.token,
        guestOrderAccessExpiresAt: result?.guestOrderAccess?.expiresAt,
      });

      await performCartMergeAndSync(dispatch, isLoggedIn);

      const redirect = resolveOrderRedirect({
        result,
        session,
        syncedPricingSession,
        sessionId,
        paymentMethod: values.paymentMethod,
      });

      if (redirect.type === "payoo_payment") {
        setStatusModal({ open: true, type: "payoo_loading" });
        redirectToPayooPayment(redirect.paymentUrl);
        return;
      }

      if (redirect.type === "error") {
        isSubmissionLock.current = false;
        setIsPlaceOrderSubmitting(false);
        toast.error(redirect.message);
        return;
      }

      router.push(redirect.url);
    } catch (err: unknown) {
      isSubmissionLock.current = false;
      setIsPlaceOrderSubmitting(false);
      const responseData = getCheckoutApiError(err);
      const rawMessage = responseData?.message;
      const messageText = Array.isArray(rawMessage) ? rawMessage.join(" | ") : String(rawMessage || "");
      if (
        openCheckoutErrorModal(err, {
          kind: "place-order",
          payload: buildPlaceOrderPayload({
            values,
            recaptchaToken: null,
            checkoutSession: session,
            isLoggedIn,
            shippingService,
            shippingServiceId,
            nearestWarehouse,
            isAllowCheck: isStellaVoteEligibleCheckout(tenantCode, checkoutLines) ? values.isAllowCheck : undefined,
          }),
        })
      ) {
        return;
      }

      // hard code cho môi trường dev
      if (messageText.includes("paymentMethod must be one of the following values")) {
        toast.error("Phương thức thanh toán chưa được hỗ trợ.");
        return;
      }

      toast.error(Array.isArray(rawMessage) ? rawMessage[0] : rawMessage || "Đặt hàng không thành công. Vui lòng thử lại sau.");
    }
  };

  const onSubmitHandler = async () => {
    if (
      isSubmissionLock.current ||
      isPlaceOrderSubmitting ||
      syncStatus.order === "loading" ||
      isLoading ||
      syncStatus.address === "loading" ||
      isShippingLoading ||
      shippingQuoteBlocked
    )
      return;
    await handleSubmit(onPlaceOrder)();
  };

  const confirmPriceChanges = useCallback(async () => {
    const retry = pendingPriceChangeRetry.current;
    if (!retry) {
      await mutate(`checkout/${sessionId}`);
      acceptedPriceChangesRef.current = true;
      return;
    }

    if (retry.kind === "address") {
      await syncAddress(retry.address, retry.addressId, { acceptPriceChanges: true });
    } else if (retry.kind === "pricing") {
      await syncPricingContext({ ...retry.payload, acceptPriceChanges: true });
    } else {
      await syncAddress(buildAddressPayload(getValues()), undefined, { acceptPriceChanges: true });
    }
    acceptedPriceChangesRef.current = true;
  }, [getValues, mutate, sessionId, syncAddress, syncPricingContext]);

  const handlePriceChangeAction = async (action: CheckoutPriceChangeAction) => {
    if (priceChangeLoadingActionId) return;

    const shouldPayNow = isAcceptPriceChangeAction(action);

    try {
      setPriceChangeLoadingActionId(action.id);
      await confirmPriceChanges();
      pendingPriceChangeRetry.current = null;

      if (shouldPayNow) {
        // Giữ popup + loading tới khi place-order xong hoặc chuyển sang popup khác (vd. Payoo).
        await handleSubmit(onPlaceOrder)();
        setStatusModal((prev) => (prev.type === "price_change" ? { ...prev, open: false } : prev));
        return;
      }

      setStatusModal((prev) => ({ ...prev, open: false }));
    } catch (error) {
      toast.error(getErrorMessage(error) || "Không thể xác nhận giá mới. Vui lòng thử lại.");
    } finally {
      setPriceChangeLoadingActionId(null);
    }
  };

  const handleVoucherToggle = (card: PromotionVoucherCard) => {
    setSelectedVouchers((prev) => {
      const nextSelected = toggleVoucher(prev, card, DEFAULT_MAX_SELECTED_CART_VOUCHERS);
      scheduleVoucherPricingSync(nextSelected);
      return nextSelected;
    });
  };

  const handleVoucherApply = (card: PromotionVoucherCard) => {
    setSelectedVouchers((prev) => {
      const nextSelected = addOrReplaceVoucher(prev, card, DEFAULT_MAX_SELECTED_CART_VOUCHERS);
      scheduleVoucherPricingSync(nextSelected);
      return nextSelected;
    });
  };

  const summaryData = useCheckoutSummaryData(session, pointsUsed, dynamicShippingFee, selectedVouchers);

  const pricing = useMemo(() => session?.pricing, [session]);
  const totalPrice = Number(pricing?.subtotal || 0);
  const totalSavings = Number(pricing?.totalPromotionSpend || 0);
  const totalQuantity = useMemo(() => resolveCheckoutDisplayQuantity(checkoutLines), [checkoutLines]);

  const isPlacingOrder = syncStatus.order === "loading" || isPlaceOrderSubmitting;

  return (
    <FormProvider {...methods}>
      <CheckoutAddressSyncLogic
        session={session}
        isLoggedIn={isLoggedIn}
        userAddresses={userAddresses}
        syncAddress={syncAddress}
        handleSelectAddress={handleSelectAddress}
        isSubmissionLock={isSubmissionLock}
        isLoading={isLoading}
        onAddressSyncError={handleAddressSyncError}
      />

      <Box className={classes.root}>
        {!isDesktop && (
          <Box className={classes.mobileHeader}>
            <CheckoutProductListSection
              items={checkoutLines}
              looseItems={displayItems}
              totalQuantity={totalQuantity}
              totalPrice={totalPrice}
              totalSavings={totalSavings}
              fulfillmentSummary={session?.fulfillmentSummary}
            />
          </Box>
        )}

        <Box className={classes.leftColumn}>
          <CheckoutAccountSection
            user={
              isLoggedIn && user
                ? { name: user.firstName?.trim() || "Khách hàng", email: user.email || "chuacoemail@gmail.com" }
                : undefined
            }
          />

          <CheckoutAddressSection
            isSaved={activeIsAddressSaved}
            address={
              isLoggedIn && selectedAddressId ? userAddresses.find((addr) => addr.id === selectedAddressId) : session?.shippingAddress
            }
            addresses={userAddresses}
            onSelectAddress={handleSelectAddress}
            onUpdateAddress={() => toast.info("Tính năng đang phát triển")}
            onAddAddress={() => {
              setSelectedAddressId(null);
              setIsManualEntry(true);
              reset(getCheckoutInitialValues(session, isLoggedIn, user));
            }}
            isSyncing={syncStatus.address === "loading"}
            selectedAddressId={selectedAddressId || undefined}
            isLoggedIn={isLoggedIn}
            showEmail={isPreOrderReserve}
          />

          {!isPreOrderReserve ? (
            <CheckoutSpecialRequestSection
              showVatSection={showVat}
              onVatSectionToggle={(val) => {
                setValue("showVat", val, { shouldDirty: true, shouldValidate: true });
                const vatFields: (keyof CheckoutFormValues)[] = ["companyName", "companyAddress", "taxCode", "vatEmail"];
                if (!val) vatFields.forEach((f) => methods.resetField(f, { defaultValue: "" }));
                methods.clearErrors(vatFields);
              }}
              showNoteSection={showNote}
              onNoteSectionToggle={(val) => {
                setValue("showNote", val, { shouldDirty: true, shouldValidate: true });
                if (!val) methods.resetField("note", { defaultValue: "" });
                methods.clearErrors("note");
              }}
            />
          ) : null}

          {isStellaVoteEligibleCheckout(tenantCode, checkoutLines) ? <CheckoutStellaVoteConsent /> : null}

          {!isDesktop && (
            <React.Fragment>
              <CheckoutVoucherSection
                selectedVouchers={selectedVouchers}
                onToggleVoucher={handleVoucherToggle}
                onApplyValidatedVoucher={handleVoucherApply}
                onDialogClose={flushVoucherPricingSync}
                showTitle={isMobile}
                checkoutContext={promotionVoucherCheckoutContext}
                isPricingContextReady={isPricingContextReady}
              />
              <CheckoutSummarySection
                {...summaryData}
                pointsUsed={pointsUsed}
                onPointsChange={setPointsUsed}
                isLoggedIn={isLoggedIn}
                isLoading={syncStatus.address === "loading" || syncStatus.pricing === "loading" || isShippingLoading}
              />
            </React.Fragment>
          )}

          <CheckoutPaymentSection
            orderPayableAmountVnd={summaryData.finalTotalAmount}
            deferredPaymentNotice={preOrderDeferredPaymentNotice}
            isLoggedIn={isLoggedIn}
          />

          {!isLoggedIn || isPreOrderReserve ? (
            <Stack spacing={2}>
              {!isLoggedIn ? <CheckoutConsentField /> : null}
              {isPreOrderReserve ? <CheckoutCollabPartnerConsentField /> : null}
            </Stack>
          ) : null}

          {isDesktop && (
            <CheckoutSubmitButton
              submitButtonClass={classes.submitButton}
              onSubmit={onSubmitHandler}
              isPlacingOrder={isPlacingOrder}
              isLoading={isLoading}
              isAddressSyncing={syncStatus.address === "loading"}
              isShippingLoading={isShippingLoading}
              shippingQuoteBlocked={shippingQuoteBlocked}
              label={submitButtonLabel}
            />
          )}
        </Box>

        {isDesktop && (
          <Box className={classes.rightColumn}>
            <Box className={classes.summaryCard}>
              <CheckoutProductListSection
                items={checkoutLines}
                looseItems={displayItems}
                totalPrice={totalPrice}
                totalQuantity={totalQuantity}
                totalSavings={totalSavings}
                fulfillmentSummary={session?.fulfillmentSummary}
              />
              <CheckoutVoucherSection
                selectedVouchers={selectedVouchers}
                onToggleVoucher={handleVoucherToggle}
                onApplyValidatedVoucher={handleVoucherApply}
                onDialogClose={flushVoucherPricingSync}
                showTitle={isMobile}
                checkoutContext={promotionVoucherCheckoutContext}
                isPricingContextReady={isPricingContextReady}
              />
              <CheckoutSummarySection
                {...summaryData}
                pointsUsed={pointsUsed}
                onPointsChange={setPointsUsed}
                showTitle={isMobile}
                isLoggedIn={isLoggedIn}
                isLoading={syncStatus.pricing === "loading" || isShippingLoading}
              />
            </Box>
          </Box>
        )}
      </Box>

      {!isDesktop && !isKeyboardOpen && (
        <Portal>
          <StackRowAlignCenterJustEnd className={classes.mobileStickyFooter}>
            <Stack className={classes.mobileStickyLeft}>
              <Box className={classes.mobileStickyTotal}>
                <Typography component="span">Tổng cộng</Typography>
                <Typography component="span">{summaryData.total}</Typography>
              </Box>
              <Box className={classes.mobileStickySavings}>
                <Typography component="span">Tiết kiệm</Typography>
                <Typography component="span">{summaryData.totalDiscount}</Typography>
              </Box>
            </Stack>
            <CheckoutSubmitButton
              submitButtonClass={classes.submitButton}
              isMobileFooter
              onSubmit={onSubmitHandler}
              isPlacingOrder={isPlacingOrder}
              isLoading={isLoading}
              isAddressSyncing={syncStatus.address === "loading"}
              isShippingLoading={isShippingLoading}
              shippingQuoteBlocked={shippingQuoteBlocked}
              label={submitButtonLabel}
            />
          </StackRowAlignCenterJustEnd>
        </Portal>
      )}

      <CheckoutStatusModal
        open={statusModal.open}
        type={statusModal.type}
        productName={statusModal.productName}
        priceChangeDetails={statusModal.priceChangeDetails}
        isActionLoading={Boolean(priceChangeLoadingActionId)}
        onClose={() => {
          if (priceChangeLoadingActionId) return;
          setStatusModal((prev) => ({ ...prev, open: false }));
        }}
        onPrimaryAction={() => {
          if (statusModal.type === "price_change") {
            void handlePriceChangeAction({
              id: "accept_price_changes",
              action_type: "REQUEST_PATCH",
              cta_text: "Đồng Ý",
              action_payload: { request_patch: { acceptPriceChanges: true } },
            });
            return;
          }
          if (statusModal.type === "shipping_fee_unavailable") {
            setStatusModal((prev) => ({ ...prev, open: false }));
            void confirmPriceChanges();
            return;
          }
          if (statusModal.type === "shipping_fee_mismatch") {
            setStatusModal((prev) => ({ ...prev, open: false }));
            void mutate(`checkout/${sessionId}`);
            return;
          }
          setStatusModal((prev) => ({ ...prev, open: false }));
        }}
        onSecondaryAction={() => {
          if (priceChangeLoadingActionId) return;
          setStatusModal((prev) => ({ ...prev, open: false }));
          router.push("/gio-hang");
        }}
        onPriceChangeAction={handlePriceChangeAction}
      />
    </FormProvider>
  );
};

export default CheckoutFormInner;
