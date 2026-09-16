"use client";
import React, { useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/slices/auth.slice";
import { useCheckoutSession } from "@/hooks/checkout/use-checkout-session.hook";
import { useCheckoutRedirect } from "@/hooks/checkout/use-checkout-redirect.hook";
import { safeTrackBeginCheckoutFromSession } from "@/lib/gtm/track-begin-checkout";
import { LocationApi } from "@/utils/api";
import CheckoutFormInner from "./checkout-form.component";
import { useCheckoutStorage } from "@/hooks/checkout/use-checkout-storage.hook";

export { PENDING_PAYMENT_MAX_AGE_MS } from "@/hooks/checkout/checkout-storage.constants";

import CheckoutSkeleton from "./skeleton/checkout-skeleton.component";

const CheckoutView = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const isLoggedIn = useAppSelector((state) => state.auth.isLogin);
  const user = useAppSelector(selectCurrentUser);
  const router = useRouter();
  const { getPendingPaymentRedirect } = useCheckoutStorage();

  const { session, isLoading, fetchError, syncStatus, syncAddress, syncPricingContext, handlePlaceOrder } = useCheckoutSession(
    sessionId || "",
  );
  const beginCheckoutTrackedSessionRef = useRef<string | null>(null);

  const isFinishedSession = useMemo(() => {
    if (!session?.status) return false;
    return session.status.toLowerCase() !== "draft";
  }, [session]);

  const restorePendingPaymentState = useCallback(() => {
    if (isFinishedSession || fetchError) return;
    const redirectUrl = getPendingPaymentRedirect(sessionId);
    if (!redirectUrl) return;
    router.replace(redirectUrl);
  }, [router, sessionId, getPendingPaymentRedirect, isFinishedSession, fetchError]);

  useEffect(() => {
    const navEntry = performance.getEntriesByType?.("navigation")?.[0] as PerformanceNavigationTiming | undefined;
    if (navEntry?.type === "back_forward") {
      restorePendingPaymentState();
    }

    window.addEventListener("pageshow", restorePendingPaymentState);
    return () => window.removeEventListener("pageshow", restorePendingPaymentState);
  }, [restorePendingPaymentState]);

  useCheckoutRedirect({ session, isLoading, sessionId, fetchError });

  /** send tracking begin checkout */
  useEffect(() => {
    if (!sessionId || isLoading || !session?.items?.length) {
      return;
    }
    if (beginCheckoutTrackedSessionRef.current === sessionId) {
      return;
    }
    beginCheckoutTrackedSessionRef.current = sessionId;
    safeTrackBeginCheckoutFromSession(session);
  }, [session, sessionId, isLoading]);
  // -------------------------------------------------
  const { data: addressRes } = useSWR(isLoggedIn ? "user/addresses" : null, () => LocationApi.getUserAddresses());
  const userAddresses = useMemo(() => addressRes?.list || [], [addressRes]);

  if (fetchError || isLoading || isFinishedSession || !session) {
    return <CheckoutSkeleton />;
  }

  return (
    <CheckoutFormInner
      session={session}
      sessionId={sessionId}
      isLoading={isLoading}
      syncStatus={syncStatus}
      syncAddress={syncAddress}
      syncPricingContext={syncPricingContext}
      handlePlaceOrder={handlePlaceOrder}
      userAddresses={userAddresses}
      isLoggedIn={isLoggedIn}
      user={user}
    />
  );
};

export default CheckoutView;
