import { describe, expect, it } from "vitest";
import {
  API_NETWORK_ERROR_MESSAGE,
  API_RATE_LIMIT_MESSAGE,
  API_SERVER_ERROR_MESSAGE,
  OTP_DAILY_LIMIT_MESSAGE,
} from "@/utils/constants/otp-message.constant";
import { getErrorMessage, isTechnicalThrottleMessage, toUserFacingApiMessage } from "./axios.helpers";

describe("isTechnicalThrottleMessage", () => {
  it("detects NestJS ThrottlerException message", () => {
    expect(isTechnicalThrottleMessage("ThrottlerException: Too Many Requests")).toBe(true);
  });

  it("keeps Vietnamese business messages", () => {
    expect(isTechnicalThrottleMessage(OTP_DAILY_LIMIT_MESSAGE)).toBe(false);
  });
});

describe("toUserFacingApiMessage", () => {
  it("maps ThrottlerException to Vietnamese rate-limit copy", () => {
    expect(toUserFacingApiMessage("ThrottlerException: Too Many Requests", 429)).toBe(API_RATE_LIMIT_MESSAGE);
  });

  it("preserves Vietnamese OTP daily-limit message on 429", () => {
    expect(toUserFacingApiMessage(OTP_DAILY_LIMIT_MESSAGE, 429)).toBe(OTP_DAILY_LIMIT_MESSAGE);
  });

  it("maps 502 Bad Gateway / HTML error to Vietnamese server error message", () => {
    expect(toUserFacingApiMessage("<!DOCTYPE html><html><head><title>502 Bad Gateway</title>...", 502)).toBe(API_SERVER_ERROR_MESSAGE);
    expect(toUserFacingApiMessage("Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON")).toBe(API_SERVER_ERROR_MESSAGE);
  });

  it("maps network errors to Vietnamese network error message", () => {
    expect(toUserFacingApiMessage("Failed to fetch")).toBe(API_NETWORK_ERROR_MESSAGE);
    expect(toUserFacingApiMessage("Network Error")).toBe(API_NETWORK_ERROR_MESSAGE);
  });
});

describe("getErrorMessage", () => {
  it("handles SyntaxError from invalid JSON safely in Vietnamese", () => {
    const error = new SyntaxError("Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON");
    expect(getErrorMessage(error)).toBe(API_SERVER_ERROR_MESSAGE);
  });

  it("handles 502 error safely in Vietnamese", () => {
    const axiosError = {
      isAxiosError: true,
      name: "AxiosError",
      message: "Request failed with status code 502",
      response: {
        status: 502,
        data: "<!DOCTYPE html><html><body>502 Bad Gateway</body></html>",
      },
    };
    expect(getErrorMessage(axiosError)).toBe(API_SERVER_ERROR_MESSAGE);
  });
});
