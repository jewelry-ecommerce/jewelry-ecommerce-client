"use client";

import { useNavigation } from "@/hooks/use-navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthResolved, selectIsLogin } from "@/redux/slices/auth.slice";
import { clearRegisterPrecheckPhone, readRegisterPrecheckPhone, writeRegisterPrecheckPhone } from "@/utils/auth/auth-phone-flow.client";
import { getPostAuthRedirectPath } from "@/utils/helpers/common/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { normalizePhone, phoneRegex } from "@/app/(layout-main)/dang-ky/_components/register/register.constant";

export const useRegisterEntryGuard = () => {
  const { gotoPage } = useNavigation();
  const isLogin = useAppSelector(selectIsLogin);
  const isAuthResolved = useAppSelector(selectIsAuthResolved);
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl");
  const entryPhoneFromQuery = searchParams.get("phone");
  const entryPhone = entryPhoneFromQuery || readRegisterPrecheckPhone();
  const fromFlow = (searchParams.get("from") || "").trim().toLowerCase();
  const requireOtpPrecheck = fromFlow === "otp";

  const hasValidEntryPhone = useMemo(() => phoneRegex.test(normalizePhone(entryPhone ?? "")), [entryPhone]);
  const canAccessRegisterPage = requireOtpPrecheck && hasValidEntryPhone;

  useEffect(() => {
    if (!isAuthResolved || !isLogin) return;
    clearRegisterPrecheckPhone();
    gotoPage(getPostAuthRedirectPath({ callbackUrl, fallback: "/trang-chu" }));
  }, [callbackUrl, gotoPage, isAuthResolved, isLogin]);

  useEffect(() => {
    if (!entryPhoneFromQuery) return;
    const normalized = normalizePhone(entryPhoneFromQuery);
    if (!phoneRegex.test(normalized)) return;
    writeRegisterPrecheckPhone(normalized);
  }, [entryPhoneFromQuery]);

  useEffect(() => {
    if (canAccessRegisterPage) return;
    clearRegisterPrecheckPhone();
    gotoPage(callbackUrl ? `/dang-nhap?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/dang-nhap");
  }, [callbackUrl, canAccessRegisterPage, gotoPage]);

  return {
    callbackUrl,
    entryPhone,
    requireOtpPrecheck,
    canAccessRegisterPage,
  };
};
