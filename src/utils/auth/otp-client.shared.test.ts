import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearOtpSendSession,
  getCooldownRemainingSeconds,
  getOtpDailyQuotaResetAtMs,
  getOtpMetaByPrefix,
  getOtpStorageKey,
  isOtpCooldownMessage,
  isOtpDailyLimitMessage,
  isOtpDailyLimitReached,
  normalizePhone,
  readOtpSendSession,
  saveOtpMetaByPrefix,
  todayIso,
  writeOtpSendSession,
} from "./otp-client.shared";
import { OTP_DAILY_LIMIT_MESSAGE, OTP_DAILY_LIMIT_RETRY_24H_MESSAGE, OTP_MAX_SEND_PER_DAY } from "@/utils/constants/otp-message.constant";

const PREFIX = "otp_test_meta";
const PHONE = "0901234567";

describe("otp-client.shared", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it("normalizes phone by trimming spaces", () => {
    expect(normalizePhone(" 0901 234 567 ")).toBe("0901234567");
  });

  it("resets meta when stored date is not today", () => {
    localStorage.setItem(getOtpStorageKey(PREFIX, PHONE), JSON.stringify({ date: "2000-01-01", sendCount: 5, blockedUntil: null }));
    expect(getOtpMetaByPrefix(PREFIX, PHONE)).toEqual({
      date: todayIso(),
      sendCount: 0,
      blockedUntil: null,
    });
  });

  it("migrates legacy zns/sms counters into unified sendCount", () => {
    localStorage.setItem(
      getOtpStorageKey(PREFIX, PHONE),
      JSON.stringify({
        date: todayIso(),
        zns: { sendCount: 3, blockedUntil: null },
        sms: { sendCount: 2, blockedUntil: null },
      }),
    );
    expect(getOtpMetaByPrefix(PREFIX, PHONE).sendCount).toBe(3);
  });

  it("treats ZNS+SMS fallback as one send count toward daily limit", () => {
    saveOtpMetaByPrefix(PREFIX, PHONE, { date: todayIso(), sendCount: 1, blockedUntil: null });
    expect(isOtpDailyLimitReached(getOtpMetaByPrefix(PREFIX, PHONE), OTP_MAX_SEND_PER_DAY)).toBe(false);

    saveOtpMetaByPrefix(PREFIX, PHONE, { date: todayIso(), sendCount: 5, blockedUntil: null });
    expect(isOtpDailyLimitReached(getOtpMetaByPrefix(PREFIX, PHONE), OTP_MAX_SEND_PER_DAY)).toBe(true);
  });

  it("blocks the 6th send after 5 successful sends in the same day", () => {
    for (let count = 1; count <= 5; count += 1) {
      saveOtpMetaByPrefix(PREFIX, PHONE, { date: todayIso(), sendCount: count, blockedUntil: null });
      expect(isOtpDailyLimitReached(getOtpMetaByPrefix(PREFIX, PHONE), OTP_MAX_SEND_PER_DAY)).toBe(count >= 5);
    }
  });

  it("detects daily-limit business message including updated BRD copy", () => {
    expect(isOtpDailyLimitMessage(OTP_DAILY_LIMIT_MESSAGE)).toBe(true);
    expect(isOtpDailyLimitMessage(OTP_DAILY_LIMIT_RETRY_24H_MESSAGE)).toBe(true);
    expect(isOtpDailyLimitMessage("Quý khách đã vượt quá số lần gửi OTP trong ngày")).toBe(true);
    expect(isOtpDailyLimitMessage("ThrottlerException: Too Many Requests")).toBe(false);
  });

  it("detects cooldown message", () => {
    expect(isOtpCooldownMessage("Vui lòng chờ 60 giây để gửi lại OTP")).toBe(true);
    expect(isOtpCooldownMessage("OTP không hợp lệ")).toBe(false);
  });

  it("keeps cooldown session for same phone and returns remaining seconds", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-12T10:00:00"));

    writeOtpSendSession("otp_session", PHONE);
    const session = readOtpSendSession("otp_session");
    expect(session?.phone).toBe(PHONE);

    vi.setSystemTime(new Date("2026-08-12T10:00:20"));
    expect(getCooldownRemainingSeconds(session!.startTime, 60)).toBe(40);

    clearOtpSendSession("otp_session");
    expect(readOtpSendSession("otp_session")).toBeNull();
  });

  it("quota reset timestamp is local midnight next day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 12, 15, 30, 0));
    const resetAt = getOtpDailyQuotaResetAtMs();
    const expected = new Date(2026, 7, 13, 0, 0, 0).getTime();
    expect(resetAt).toBe(expected);
  });
});
