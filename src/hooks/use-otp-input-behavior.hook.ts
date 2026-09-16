"use client";

import { useCallback, useEffect, useRef, type ClipboardEvent, type KeyboardEvent, type RefObject } from "react";

const OTP_LENGTH = 6;
const FOCUS_RETRY_DELAY_MS = 50;
const FOCUS_MAX_RETRIES = 10;

function focusOtpInputElement(otpRefs: RefObject<Array<HTMLInputElement | null>>, index = 0) {
  const attemptFocus = (retriesLeft: number) => {
    const input = otpRefs.current?.[index];
    if (input) {
      try {
        input.focus({ preventScroll: true });
        input.select?.();
      } catch {
        // Focus can fail if element is not yet focusable.
      }
      return;
    }

    if (retriesLeft > 0) {
      window.setTimeout(() => attemptFocus(retriesLeft - 1), FOCUS_RETRY_DELAY_MS);
    }
  };

  requestAnimationFrame(() => attemptFocus(FOCUS_MAX_RETRIES));
}

export interface UseOtpInputBehaviorParams {
  submittedPhone: string;
  otpValues: string[];
  setOtpValues: React.Dispatch<React.SetStateAction<string[]>>;
  otpError: string;
  onOtpChange?: () => void;
  onConfirmOtp: (code: string) => void;
  confirmDisabled?: boolean;
  confirmInFlight?: boolean;
  /** Khóa ô OTP sau quá số lần nhập sai — không auto-submit / focus / nhập tiếp. */
  inputDisabled?: boolean;
  isActive?: boolean;
  otpRefs: RefObject<Array<HTMLInputElement | null>>;
}

export function useOtpInputBehavior({
  submittedPhone,
  otpValues,
  setOtpValues,
  otpError,
  onOtpChange,
  onConfirmOtp,
  confirmDisabled = false,
  confirmInFlight = false,
  inputDisabled = false,
  isActive = true,
  otpRefs,
}: UseOtpInputBehaviorParams) {
  const lastAutoSubmittedCodeRef = useRef<string | null>(null);
  const prevOtpErrorRef = useRef<string>("");
  const requireUserInputAfterErrorRef = useRef(false);

  const focusFirstOtpInput = useCallback(() => {
    if (inputDisabled) {
      return;
    }
    focusOtpInputElement(otpRefs, 0);
  }, [otpRefs, inputDisabled]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    setOtpValues(Array(OTP_LENGTH).fill(""));
    lastAutoSubmittedCodeRef.current = null;
    prevOtpErrorRef.current = "";
    requireUserInputAfterErrorRef.current = false;
  }, [submittedPhone, isActive, setOtpValues]);

  useEffect(() => {
    if (!isActive || inputDisabled) {
      return;
    }

    focusFirstOtpInput();
  }, [submittedPhone, isActive, inputDisabled, focusFirstOtpInput]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const previousError = prevOtpErrorRef.current;
    prevOtpErrorRef.current = otpError;

    const hasNewError = Boolean(otpError) && otpError !== previousError;
    const hasEnteredFullOtp = /^\d{6}$/.test(otpValues.join(""));
    if (!hasNewError || !hasEnteredFullOtp) {
      return;
    }

    requireUserInputAfterErrorRef.current = true;
    setOtpValues(Array(OTP_LENGTH).fill(""));
    if (!inputDisabled) {
      focusFirstOtpInput();
    }
  }, [otpError, otpValues, isActive, inputDisabled, setOtpValues, focusFirstOtpInput]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    if (confirmDisabled || confirmInFlight || inputDisabled) {
      return;
    }
    if (requireUserInputAfterErrorRef.current) {
      return;
    }

    const code = otpValues.join("");
    if (!/^\d{6}$/.test(code)) {
      return;
    }

    if (lastAutoSubmittedCodeRef.current === code) {
      return;
    }

    lastAutoSubmittedCodeRef.current = code;
    onConfirmOtp(code);
  }, [otpValues, confirmDisabled, confirmInFlight, inputDisabled, onConfirmOtp, isActive]);

  const updateOtpValue = (index: number, value: string) => {
    if (inputDisabled) {
      return;
    }
    onOtpChange?.();
    requireUserInputAfterErrorRef.current = false;
    lastAutoSubmittedCodeRef.current = null;
    setOtpValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (inputDisabled) {
      return;
    }
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) {
      return;
    }

    onOtpChange?.();
    requireUserInputAfterErrorRef.current = false;
    lastAutoSubmittedCodeRef.current = null;
    const nextValues = Array.from({ length: OTP_LENGTH }, (_, index) => text[index] ?? "");
    setOtpValues(nextValues);

    const focusIndex = Math.min(text.length, OTP_LENGTH - 1);
    otpRefs.current?.[focusIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (inputDisabled) {
      return;
    }
    const digit = otpValues[index];
    if (e.key === "Enter") {
      e.preventDefault();
      if (confirmInFlight || confirmDisabled) {
        return;
      }
      onConfirmOtp(otpValues.join(""));
      return;
    }
    if (e.key === "Backspace" && !digit && index > 0) {
      otpRefs.current?.[index - 1]?.focus();
    }
  };

  const handleOtpChange = (index: number, rawValue: string) => {
    if (inputDisabled) {
      return;
    }
    const next = rawValue.replace(/\D/g, "");
    if (!next) {
      updateOtpValue(index, "");
      return;
    }

    const digit = next.slice(-1);
    updateOtpValue(index, digit);
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current?.[index + 1]?.focus();
    }
  };

  return { handleOtpChange, handlePaste, handleKeyDown, focusFirstOtpInput };
}
