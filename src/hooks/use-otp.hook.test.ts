import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOtp } from "./use-otp.hook";
import { OTP_DAILY_LIMIT_RETRY_24H_MESSAGE, OTP_MAX_SEND_PER_DAY } from "@/utils/constants/otp-message.constant";
import { getOtpMetaByPrefix, todayIso } from "@/utils/auth/otp-client.shared";

const PREFIX = "otp_flow_test_meta";
const PHONE = "0912345678";

describe("useOtp — shared across change-phone / order-lookup flows", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it("counts each successful send once (ZNS+SMS fallback = 1) and allows 5 sends/day", () => {
    const { result } = renderHook(() => useOtp(PREFIX));

    for (let i = 1; i <= OTP_MAX_SEND_PER_DAY; i += 1) {
      act(() => {
        expect(result.current.markOtpSent(PHONE)).toBe(true);
      });
      expect(getOtpMetaByPrefix(PREFIX, PHONE).sendCount).toBe(i);
      expect(result.current.resendExceededMessage).toBe("");
      expect(result.current.canSendOtp(PHONE)).toBe(i < OTP_MAX_SEND_PER_DAY);
    }
  });

  it("on 6th send attempt: blocks send, keeps verify UI path, sets daily-limit message", () => {
    const { result } = renderHook(() => useOtp(PREFIX));

    act(() => {
      for (let i = 0; i < OTP_MAX_SEND_PER_DAY; i += 1) {
        result.current.markOtpSent(PHONE);
      }
    });

    expect(result.current.canSendOtp(PHONE)).toBe(false);

    act(() => {
      expect(result.current.markOtpSent(PHONE)).toBe(false);
      result.current.applyDailyLimitExceeded();
      result.current.setShowVerifyDialog(true);
    });

    expect(result.current.resendExceededMessage).toBe(OTP_DAILY_LIMIT_RETRY_24H_MESSAGE);
    expect(result.current.showVerifyDialog).toBe(true);
    expect(result.current.resendCounter).toBe(0);
  });

  it("within 60s cooldown: reopen same phone without counting a new send", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T10:00:00"));

    const { result } = renderHook(() => useOtp(PREFIX));

    act(() => {
      expect(result.current.markOtpSent(PHONE)).toBe(true);
      result.current.setShowVerifyDialog(false);
    });

    expect(getOtpMetaByPrefix(PREFIX, PHONE).sendCount).toBe(1);

    vi.setSystemTime(new Date("2026-08-12T10:00:15"));

    act(() => {
      expect(result.current.openExistingCooldownIfAny(PHONE)).toBe(true);
    });

    expect(result.current.showVerifyDialog).toBe(true);
    expect(result.current.resendCounter).toBe(45);
    expect(getOtpMetaByPrefix(PREFIX, PHONE).sendCount).toBe(1);
  });

  it("locks OTP input after 3 wrong attempts and unlocks after successful resend mark", () => {
    const { result } = renderHook(() => useOtp(PREFIX));

    act(() => {
      result.current.recordWrongOtpAttempt();
      result.current.recordWrongOtpAttempt();
      expect(result.current.recordWrongOtpAttempt()).toBe(true);
    });
    expect(result.current.isOtpLocked).toBe(true);

    act(() => {
      result.current.markOtpSent(PHONE);
    });
    expect(result.current.isOtpLocked).toBe(false);
  });

  it("resets daily quota after local date change (0h00 next day)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 12, 23, 50, 0));

    const { result } = renderHook(() => useOtp(PREFIX));
    act(() => {
      for (let i = 0; i < OTP_MAX_SEND_PER_DAY; i += 1) {
        result.current.markOtpSent(PHONE);
      }
    });
    expect(result.current.canSendOtp(PHONE)).toBe(false);
    expect(getOtpMetaByPrefix(PREFIX, PHONE).date).toBe(todayIso());

    vi.setSystemTime(new Date(2026, 7, 13, 0, 1, 0));
    expect(result.current.canSendOtp(PHONE)).toBe(true);
    expect(getOtpMetaByPrefix(PREFIX, PHONE).sendCount).toBe(0);
  });
});
