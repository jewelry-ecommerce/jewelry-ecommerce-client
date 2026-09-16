import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearRegisterOtpSendSession,
  getCooldownRemainingSeconds,
  getOtpMeta,
  OTP_MAX_SEND_PER_DAY,
  readRegisterOtpSendSession,
  saveOtpMeta,
  todayIso,
  writeRegisterOtpSendSession,
} from "@/app/(layout-main)/dang-ky/_components/register/register.constant";
import { isOtpDailyLimitReached } from "@/utils/auth/otp-client.shared";
import {
  clearForgotOtpSendSession,
  getOtpMeta as getForgotOtpMeta,
  OTP_MAX_SEND_PER_DAY as FORGOT_MAX,
  readForgotOtpSendSession,
  saveOtpMeta as saveForgotOtpMeta,
  writeForgotOtpSendSession,
} from "@/app/(layout-main)/quen-mat-khau/_components/forgot-password/forgot-password.constant";

const PHONE = "0987654321";

describe("OTP flow storage — đăng ký", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it("caps at 5 sends/day and keeps cooldown session for same phone", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T10:00:00"));

    saveOtpMeta(PHONE, { date: todayIso(), sendCount: 5, blockedUntil: null });
    expect(isOtpDailyLimitReached(getOtpMeta(PHONE), OTP_MAX_SEND_PER_DAY)).toBe(true);

    writeRegisterOtpSendSession(PHONE);
    vi.setSystemTime(new Date("2026-08-12T10:00:30"));
    const session = readRegisterOtpSendSession();
    expect(session?.phone).toBe(PHONE);
    expect(getCooldownRemainingSeconds(session!.startTime)).toBe(30);

    clearRegisterOtpSendSession();
    expect(readRegisterOtpSendSession()).toBeNull();
  });
});

describe("OTP flow storage — quên mật khẩu", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("shares the same daily-limit rule (5/day)", () => {
    saveForgotOtpMeta(PHONE, { date: todayIso(), sendCount: 5, blockedUntil: null });
    expect(isOtpDailyLimitReached(getForgotOtpMeta(PHONE), FORGOT_MAX)).toBe(true);

    writeForgotOtpSendSession(PHONE);
    expect(readForgotOtpSendSession()?.phone).toBe(PHONE);
    clearForgotOtpSendSession();
    expect(readForgotOtpSendSession()).toBeNull();
  });
});
