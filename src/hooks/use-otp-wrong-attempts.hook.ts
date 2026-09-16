"use client";

import { useCallback, useRef, useState } from "react";
import { OTP_MAX_WRONG_ATTEMPTS } from "@/utils/constants/otp-message.constant";

export function useOtpWrongAttempts() {
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);
  const wrongAttemptCountRef = useRef(0);
  const isOtpLocked = wrongAttemptCount >= OTP_MAX_WRONG_ATTEMPTS;

  const recordWrongOtpAttempt = useCallback((): boolean => {
    const next = Math.min(wrongAttemptCountRef.current + 1, OTP_MAX_WRONG_ATTEMPTS);
    wrongAttemptCountRef.current = next;
    setWrongAttemptCount(next);
    return next >= OTP_MAX_WRONG_ATTEMPTS;
  }, []);

  const resetWrongOtpAttempts = useCallback(() => {
    wrongAttemptCountRef.current = 0;
    setWrongAttemptCount(0);
  }, []);

  return {
    wrongAttemptCount,
    isOtpLocked,
    recordWrongOtpAttempt,
    resetWrongOtpAttempts,
  };
}
