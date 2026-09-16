"use client";

import { getAuthRouteHeaders } from "@/utils/api/auth/auth-route-headers";
import { AuthApiPath } from "@/utils/api/auth/auth.enum";
import { getErrorMessage, toUserFacingApiMessage } from "@/utils/helpers/axios/axios.helpers";
import {
  clearRegisterOtpSendSession,
  getCooldownRemainingSeconds,
  getOtpMeta,
  isOtpCooldown429,
  OTP_MAX_SEND_PER_DAY,
  readPrecheckAutoSentPhone,
  readRegisterOtpSendSession,
  saveOtpMeta,
  todayIso,
  writePrecheckAutoSentPhone,
  writeRegisterOtpSendSession,
  normalizePhone,
  phoneRegex,
} from "@/app/(layout-main)/dang-ky/_components/register/register.constant";
import { OtpStorageMeta, RegisterSendOtpRouteResponse } from "@/app/(layout-main)/dang-ky/_components/register/register.type";
import { getOtpDailyQuotaResetAtMs, isOtpDailyLimitMessage, isOtpDailyLimitReached } from "@/utils/auth/otp-client.shared";
import {
  getOtpResendCountdownMessage,
  OTP_DAILY_LIMIT_MESSAGE,
  OTP_RESEND_READY_MESSAGE,
  OTP_RESEND_FAILED_MESSAGE,
  OTP_SEND_FAILED_MESSAGE,
} from "@/utils/constants/otp-message.constant";
import {
  RECAPTCHA_CLIENT_FAILURE_MESSAGE,
  SendOtpRecaptchaAction,
  getRecaptchaTokenForSendOtp,
} from "@/utils/recaptcha/recaptcha-v3.helper";
import { useOtpWrongAttempts } from "@/hooks/use-otp-wrong-attempts.hook";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

type UseRegisterOtpFlowParams = {
  entryPhone: string | null;
  requireOtpPrecheck: boolean;
  otpPrecheckPassed: boolean;
  submittedPhone: string;
  setSubmittedPhone: (value: string) => void;
};

export const useRegisterOtpFlow = ({
  entryPhone,
  requireOtpPrecheck,
  otpPrecheckPassed,
  submittedPhone,
  setSubmittedPhone,
}: UseRegisterOtpFlowParams) => {
  const [showOtpVerifyDialog, setShowOtpVerifyDialog] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCounter, setResendCounter] = useState(0);
  const [resendBlockedUntil, setResendBlockedUntil] = useState<number | null>(null);
  const [resendExceededMessage, setResendExceededMessage] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const { isOtpLocked, recordWrongOtpAttempt, resetWrongOtpAttempts } = useOtpWrongAttempts();

  const precheckEntryPhoneRef = useRef<string | null>(null);
  const otpSendInFlightRef = useRef(false);

  const postRegisterSendOtp = useCallback(async (targetPhone: string) => {
    const recaptchaToken = await getRecaptchaTokenForSendOtp(SendOtpRecaptchaAction.REGISTER);
    if (!recaptchaToken) {
      toast.error(RECAPTCHA_CLIENT_FAILURE_MESSAGE);
      return null;
    }
    const response = await fetch("/api/auth/register/send-otp", {
      method: "POST",
      headers: getAuthRouteHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify({ phone: targetPhone, type: AuthApiPath.REGISTER, recaptchaToken }),
    });

    let result: RegisterSendOtpRouteResponse & { message?: string };
    try {
      const text = await response.text();
      try {
        result = JSON.parse(text) as RegisterSendOtpRouteResponse & { message?: string };
      } catch {
        result = {
          success: false,
          statusCode: response.status,
          message: toUserFacingApiMessage(text, response.status) || OTP_SEND_FAILED_MESSAGE,
        };
      }
    } catch (err) {
      result = {
        success: false,
        statusCode: response.status,
        message: getErrorMessage(err) || OTP_SEND_FAILED_MESSAGE,
      };
    }

    return { response, result };
  }, []);

  const applyDailyLimitExceeded = useCallback(() => {
    setResendBlockedUntil(getOtpDailyQuotaResetAtMs());
    setResendExceededMessage(OTP_DAILY_LIMIT_MESSAGE);
    setResendCounter(0);
    clearRegisterOtpSendSession();
  }, []);

  const markOtpSent = useCallback(
    (phone: string) => {
      const current = getOtpMeta(phone);
      const now = Date.now();

      if (isOtpDailyLimitReached(current, OTP_MAX_SEND_PER_DAY)) {
        applyDailyLimitExceeded();
        return false;
      }

      const nextSendCount = current.sendCount + 1;
      const nextMeta: OtpStorageMeta = {
        date: todayIso(),
        sendCount: nextSendCount,
        blockedUntil: current.blockedUntil && current.blockedUntil > now ? current.blockedUntil : null,
      };

      saveOtpMeta(phone, nextMeta);
      setResendBlockedUntil(nextMeta.blockedUntil);
      setResendExceededMessage("");
      resetWrongOtpAttempts();
      setOtpError("");
      return true;
    },
    [applyDailyLimitExceeded, resetWrongOtpAttempts],
  );

  const applyOtp429OpenDialog = useCallback((targetPhone: string, serverMessage?: string) => {
    const existing = readRegisterOtpSendSession();
    if (!existing || existing.phone !== targetPhone) {
      writeRegisterOtpSendSession(targetPhone);
    }
    const s = readRegisterOtpSendSession();
    if (s) setResendCounter(getCooldownRemainingSeconds(s.startTime));
    setShowOtpVerifyDialog(true);
    if (serverMessage?.trim()) {
      toast.info(serverMessage.trim());
    }
  }, []);

  const openOtpVerify = useCallback(
    async (phoneOverride?: string) => {
      if (otpSendInFlightRef.current) return;
      setOtpError("");
      const targetPhone = normalizePhone(phoneOverride || submittedPhone);

      if (isOtpDailyLimitReached(getOtpMeta(targetPhone), OTP_MAX_SEND_PER_DAY)) {
        applyDailyLimitExceeded();
        setShowOtpVerifyDialog(true);
        return;
      }

      const sessionSend = readRegisterOtpSendSession();
      const samePhoneCooldown = sessionSend && sessionSend.phone === targetPhone && getCooldownRemainingSeconds(sessionSend.startTime) > 0;
      if (samePhoneCooldown) {
        setResendCounter(getCooldownRemainingSeconds(sessionSend.startTime));
        setShowOtpVerifyDialog(true);
        return;
      }

      try {
        otpSendInFlightRef.current = true;
        setIsSendingOtp(true);
        const pack = await postRegisterSendOtp(targetPhone);
        if (!pack) {
          setOtpError(RECAPTCHA_CLIENT_FAILURE_MESSAGE);
          setShowOtpVerifyDialog(true);
          return;
        }
        const { response, result } = pack;

        if (isOtpCooldown429(response, result)) {
          applyOtp429OpenDialog(targetPhone, result.message);
          return;
        }

        if (!response.ok || result.success === false) {
          const status = result.statusCode ?? response.status;
          const rawMsg = result.message?.trim() || OTP_SEND_FAILED_MESSAGE;
          const msg = toUserFacingApiMessage(rawMsg, status) || rawMsg;
          if (isOtpDailyLimitMessage(rawMsg)) {
            applyDailyLimitExceeded();
            setShowOtpVerifyDialog(true);
            return;
          }
          toast.error(msg);
          setOtpError(msg);
          setShowOtpVerifyDialog(true);
          return;
        }

        writeRegisterOtpSendSession(targetPhone);
        markOtpSent(targetPhone);
        setResendCounter(getCooldownRemainingSeconds(Date.now()));
        setShowOtpVerifyDialog(true);
      } catch (err) {
        const msg = getErrorMessage(err) || OTP_SEND_FAILED_MESSAGE;
        toast.error(msg);
        setOtpError(msg);
        setShowOtpVerifyDialog(true);
      } finally {
        setIsSendingOtp(false);
        otpSendInFlightRef.current = false;
      }
    },
    [applyDailyLimitExceeded, applyOtp429OpenDialog, markOtpSent, postRegisterSendOtp, submittedPhone],
  );

  const showExistingCooldownDialog = useCallback((phone: string) => {
    const sessionSend = readRegisterOtpSendSession();
    const samePhoneCooldown = sessionSend && sessionSend.phone === phone && getCooldownRemainingSeconds(sessionSend.startTime) > 0;
    if (!samePhoneCooldown) return false;
    setOtpError("");
    setResendCounter(getCooldownRemainingSeconds(sessionSend.startTime));
    setShowOtpVerifyDialog(true);
    return true;
  }, []);

  const handleResendOtp = useCallback(async () => {
    if (otpSendInFlightRef.current) return;

    if (isOtpDailyLimitReached(getOtpMeta(submittedPhone), OTP_MAX_SEND_PER_DAY)) {
      applyDailyLimitExceeded();
      setShowOtpVerifyDialog(true);
      return;
    }

    try {
      otpSendInFlightRef.current = true;
      setIsSendingOtp(true);
      const pack = await postRegisterSendOtp(submittedPhone);
      if (!pack) {
        setOtpError(RECAPTCHA_CLIENT_FAILURE_MESSAGE);
        return;
      }
      const { response, result } = pack;
      if (!response.ok || result.success === false) {
        if (isOtpCooldown429(response, result)) {
          applyOtp429OpenDialog(submittedPhone, result.message);
          return;
        }
        const status = result.statusCode ?? response.status;
        const rawMsg = result.message?.trim() || OTP_RESEND_FAILED_MESSAGE;
        const msg = toUserFacingApiMessage(rawMsg, status) || rawMsg;
        if (isOtpDailyLimitMessage(rawMsg)) {
          applyDailyLimitExceeded();
          return;
        }
        toast.error(msg);
        setOtpError(msg);
        return;
      }

      writeRegisterOtpSendSession(submittedPhone);
      markOtpSent(submittedPhone);
      setResendCounter(getCooldownRemainingSeconds(Date.now()));
    } catch (err) {
      const msg = getErrorMessage(err) || OTP_RESEND_FAILED_MESSAGE;
      toast.error(msg);
      setOtpError(msg);
    } finally {
      setIsSendingOtp(false);
      otpSendInFlightRef.current = false;
    }
  }, [applyDailyLimitExceeded, applyOtp429OpenDialog, markOtpSent, postRegisterSendOtp, submittedPhone]);

  useEffect(() => {
    const normalized = normalizePhone(entryPhone ?? "");
    if (!phoneRegex.test(normalized)) return;
    setSubmittedPhone(normalized);
  }, [entryPhone, setSubmittedPhone]);

  useEffect(() => {
    const tick = () => {
      const s = readRegisterOtpSendSession();
      if (!s) {
        setResendCounter(0);
        return;
      }
      setResendCounter(getCooldownRemainingSeconds(s.startTime));
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!requireOtpPrecheck || otpPrecheckPassed) return;
    const normalized = normalizePhone(entryPhone ?? "");
    if (!phoneRegex.test(normalized)) return;

    setSubmittedPhone(normalized);
    const prev = precheckEntryPhoneRef.current;
    precheckEntryPhoneRef.current = normalized;

    const autoSentPhone = readPrecheckAutoSentPhone();
    if (autoSentPhone === normalized) return;

    const shouldAutoSend = prev === null || prev !== normalized;
    if (!shouldAutoSend) return;

    writePrecheckAutoSentPhone(normalized);
    void openOtpVerify(normalized);
  }, [entryPhone, openOtpVerify, otpPrecheckPassed, requireOtpPrecheck, setSubmittedPhone]);

  const resendText = useMemo(() => {
    if (resendExceededMessage) return "";
    if (resendCounter > 0) {
      return getOtpResendCountdownMessage(resendCounter);
    }
    return OTP_RESEND_READY_MESSAGE;
  }, [resendCounter, resendExceededMessage]);

  return {
    showOtpVerifyDialog,
    setShowOtpVerifyDialog,
    otpError,
    setOtpError,
    resendCounter,
    setResendCounter,
    resendBlockedUntil,
    resendExceededMessage,
    isSendingOtp,
    resendText,
    isOtpLocked,
    recordWrongOtpAttempt,
    resetWrongOtpAttempts,
    openOtpVerify,
    handleResendOtp,
    showExistingCooldownDialog,
  };
};
