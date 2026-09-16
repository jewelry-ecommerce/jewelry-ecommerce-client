import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useOtpWrongAttempts } from "./use-otp-wrong-attempts.hook";
import { OTP_MAX_WRONG_ATTEMPTS } from "@/utils/constants/otp-message.constant";

describe("useOtpWrongAttempts", () => {
  it("locks after 3 wrong attempts and resets on request", () => {
    const { result } = renderHook(() => useOtpWrongAttempts());

    expect(result.current.isOtpLocked).toBe(false);

    act(() => {
      expect(result.current.recordWrongOtpAttempt()).toBe(false);
    });
    act(() => {
      expect(result.current.recordWrongOtpAttempt()).toBe(false);
    });
    act(() => {
      expect(result.current.recordWrongOtpAttempt()).toBe(true);
    });

    expect(result.current.wrongAttemptCount).toBe(OTP_MAX_WRONG_ATTEMPTS);
    expect(result.current.isOtpLocked).toBe(true);

    act(() => {
      result.current.resetWrongOtpAttempts();
    });

    expect(result.current.isOtpLocked).toBe(false);
    expect(result.current.wrongAttemptCount).toBe(0);
  });
});
