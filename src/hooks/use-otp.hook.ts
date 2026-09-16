import { useState, useEffect, useMemo, useCallback } from "react";
import { OtpMethod } from "@/utils/api/auth/auth.enum";
import {
  clearOtpSendSession,
  getCooldownRemainingSeconds,
  getOtpDailyQuotaResetAtMs,
  getOtpMetaByPrefix,
  isOtpDailyLimitReached,
  readOtpSendSession,
  saveOtpMetaByPrefix,
  todayIso,
  writeOtpSendSession,
  type OtpStorageMeta,
} from "@/utils/auth/otp-client.shared";
import {
  getOtpResendCountdownMessage,
  OTP_DAILY_LIMIT_RETRY_24H_MESSAGE,
  OTP_MAX_SEND_PER_DAY,
  OTP_RESEND_READY_MESSAGE,
  OTP_RESEND_SECONDS,
} from "@/utils/constants/otp-message.constant";
import { useOtpWrongAttempts } from "@/hooks/use-otp-wrong-attempts.hook";

const OTP_LENGTH = 6;

const normalizePhone = (phone: string) => phone.replace(/\s+/g, "").trim();

export const useOtp = (storageKeyPrefix: string = "otp_storage_meta") => {
  const sessionKey = `${storageKeyPrefix}_last_send`;
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [otpMethod, setOtpMethod] = useState<OtpMethod>(OtpMethod.ZNS);
  const [otpValues, setOtpValues] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [resendCounter, setResendCounter] = useState(0);
  const [resendBlockedUntil, setResendBlockedUntil] = useState<number | null>(null);
  const [resendExceededMessage, setResendExceededMessage] = useState("");
  const { isOtpLocked, recordWrongOtpAttempt, resetWrongOtpAttempts } = useOtpWrongAttempts();

  const getOtpMeta = useCallback((phone: string): OtpStorageMeta => getOtpMetaByPrefix(storageKeyPrefix, phone), [storageKeyPrefix]);

  const saveOtpMeta = useCallback(
    (phone: string, meta: OtpStorageMeta) => {
      saveOtpMetaByPrefix(storageKeyPrefix, phone, meta);
    },
    [storageKeyPrefix],
  );

  const applyDailyLimitExceeded = useCallback(() => {
    setResendBlockedUntil(getOtpDailyQuotaResetAtMs());
    setResendExceededMessage(OTP_DAILY_LIMIT_RETRY_24H_MESSAGE);
    setResendCounter(0);
    clearOtpSendSession(sessionKey);
  }, [sessionKey]);

  const syncDailyLimitStatus = useCallback(
    (phoneNumber: string) => {
      const meta = getOtpMeta(phoneNumber);
      if (isOtpDailyLimitReached(meta, OTP_MAX_SEND_PER_DAY)) {
        applyDailyLimitExceeded();
        return true;
      }
      setResendBlockedUntil(meta.blockedUntil && meta.blockedUntil > Date.now() ? meta.blockedUntil : null);
      setResendExceededMessage("");
      return false;
    },
    [applyDailyLimitExceeded, getOtpMeta],
  );

  const canSendOtp = useCallback(
    (phoneNumber: string): boolean => {
      const meta = getOtpMeta(phoneNumber);
      return !isOtpDailyLimitReached(meta, OTP_MAX_SEND_PER_DAY);
    },
    [getOtpMeta],
  );

  /** Trong cooldown 60s cùng SĐT → chỉ mở lại popup, không gửi OTP mới. */
  const openExistingCooldownIfAny = useCallback(
    (phoneNumber: string): boolean => {
      const targetPhone = normalizePhone(phoneNumber);
      const session = readOtpSendSession(sessionKey);
      if (!session || session.phone !== targetPhone) return false;
      const remaining = getCooldownRemainingSeconds(session.startTime, OTP_RESEND_SECONDS);
      if (remaining <= 0) return false;
      setSubmittedPhone(targetPhone);
      setResendCounter(remaining);
      setShowVerifyDialog(true);
      return true;
    },
    [sessionKey],
  );

  const syncMethodStatus = useCallback(
    (phoneNumber: string, _method?: OtpMethod) => {
      syncDailyLimitStatus(phoneNumber);
    },
    [syncDailyLimitStatus],
  );

  const markOtpSent = useCallback(
    (phoneNumber: string, _method?: OtpMethod): boolean => {
      const current = getOtpMeta(phoneNumber);
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
      saveOtpMeta(phoneNumber, nextMeta);
      writeOtpSendSession(sessionKey, phoneNumber);
      setResendBlockedUntil(nextMeta.blockedUntil);
      setResendExceededMessage("");
      setResendCounter(OTP_RESEND_SECONDS);
      resetWrongOtpAttempts();
      setOtpError("");
      return true;
    },
    [applyDailyLimitExceeded, getOtpMeta, resetWrongOtpAttempts, saveOtpMeta, sessionKey],
  );

  useEffect(() => {
    const tick = () => {
      const session = readOtpSendSession(sessionKey);
      if (!session) {
        setResendCounter(0);
        return;
      }
      setResendCounter(getCooldownRemainingSeconds(session.startTime, OTP_RESEND_SECONDS));
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [sessionKey]);

  const resendText = useMemo(() => {
    if (resendExceededMessage) return "";
    if (resendCounter > 0) return getOtpResendCountdownMessage(resendCounter);
    return OTP_RESEND_READY_MESSAGE;
  }, [resendCounter, resendExceededMessage]);

  const handleOtpValueChange = (index: number, rawValue: string) => {
    const next = rawValue.replace(/\D/g, "").slice(-1);
    setOtpValues((prev) => {
      const values = [...prev];
      values[index] = next;
      return values;
    });
    setOtpError("");
  };

  const resetOtpState = () => {
    setOtpValues(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setResendCounter(0);
    setResendBlockedUntil(null);
    setResendExceededMessage("");
    setShowMethodDialog(false);
    setShowVerifyDialog(false);
    resetWrongOtpAttempts();
  };

  return {
    showMethodDialog,
    setShowMethodDialog,
    showVerifyDialog,
    setShowVerifyDialog,
    otpMethod,
    setOtpMethod,
    otpValues,
    setOtpValues,
    otpError,
    setOtpError,
    submittedPhone,
    setSubmittedPhone,
    resendCounter,
    setResendCounter,
    resendBlockedUntil,
    resendExceededMessage,
    setResendExceededMessage,
    resendText,
    isOtpLocked,
    recordWrongOtpAttempt,
    resetWrongOtpAttempts,
    handleOtpValueChange,
    markOtpSent,
    canSendOtp,
    openExistingCooldownIfAny,
    syncDailyLimitStatus,
    applyDailyLimitExceeded,
    resetOtpState,
    syncMethodStatus,
  };
};
