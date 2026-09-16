import { describe, expect, it } from "vitest";
import {
  getOtpResendCountdownMessage,
  OTP_DAILY_LIMIT_MESSAGE,
  OTP_DAILY_LIMIT_RETRY_24H_MESSAGE,
  OTP_INCOMPLETE_CODE_MESSAGE,
  OTP_INVALID_CODE_MESSAGE,
  OTP_MAX_SEND_PER_DAY,
  OTP_MAX_WRONG_ATTEMPTS,
  OTP_MAX_WRONG_ATTEMPTS_MESSAGE,
  OTP_RESEND_SECONDS,
  resolveOtpWrongAttemptError,
} from "./otp-message.constant";

describe("otp-message.constant", () => {
  it("keeps BRD daily-limit copy and quotas", () => {
    expect(OTP_MAX_SEND_PER_DAY).toBe(5);
    expect(OTP_RESEND_SECONDS).toBe(60);
    expect(OTP_DAILY_LIMIT_MESSAGE).toBe("Đã vượt quá số lần gửi OTP trong ngày. Quý khách vẫn có thể mua hàng mà không cần đăng nhập.");
    expect(OTP_DAILY_LIMIT_RETRY_24H_MESSAGE).toBe("Quý khách đã vượt quá số lần gửi OTP trong ngày. Vui lòng thử lại sau 24 giờ.");
  });

  it("keeps OTP verify copy for incomplete and invalid codes", () => {
    expect(OTP_INCOMPLETE_CODE_MESSAGE).toBe("Vui lòng nhập đủ 6 chữ số.");
    expect(OTP_INVALID_CODE_MESSAGE).toBe("Mã OTP không chính xác");
  });

  it("locks after max wrong attempts with dedicated message", () => {
    expect(OTP_MAX_WRONG_ATTEMPTS).toBe(3);
    expect(resolveOtpWrongAttemptError(false)).toBe(OTP_INVALID_CODE_MESSAGE);
    expect(resolveOtpWrongAttemptError(true)).toBe(OTP_MAX_WRONG_ATTEMPTS_MESSAGE);
    expect(resolveOtpWrongAttemptError(false, "custom")).toBe("custom");
  });

  it("formats resend countdown text", () => {
    expect(getOtpResendCountdownMessage(45)).toBe("Mã OTP sẽ được gửi lại sau 45s.");
  });
});
