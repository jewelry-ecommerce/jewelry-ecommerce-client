import axios from "axios";
import {
  API_NETWORK_ERROR_MESSAGE,
  API_RATE_LIMIT_MESSAGE,
  API_SERVER_ERROR_MESSAGE,
  API_UNKNOWN_ERROR_MESSAGE,
} from "@/utils/constants/otp-message.constant";

const isRecordWithMessage = (data: unknown): data is { message: string } =>
  typeof data === "object" && data !== null && "message" in data && typeof (data as { message: unknown }).message === "string";

const isAbortLikeRecord = (error: Record<string, unknown>) => {
  const name = error.name;
  const code = error.code;
  const message = error.message;

  if (name === "AbortError" || code === "ERR_CANCELED") return true;
  if (typeof message === "string" && /^(Aborted|canceled)$/i.test(message.trim())) return true;

  return false;
};

/** Request bị cancel chủ động (AbortController / axios signal) — không phải lỗi nghiệp vụ. */
export function isRequestAborted(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof Error && error.name === "AbortError") return true;
  if (axios.isAxiosError(error) && error.code === "ERR_CANCELED") return true;

  if (error && typeof error === "object") {
    return isAbortLikeRecord(error as Record<string, unknown>);
  }

  return false;
}

/** NestJS Throttler / gateway trả message kỹ thuật tiếng Anh — không hiện nguyên văn cho user. */
export const isTechnicalThrottleMessage = (message?: string | null): boolean => {
  const msg = (message ?? "").trim().toLowerCase();
  if (!msg) return false;
  return (
    msg.includes("throttlerexception") || msg.includes("too many requests") || msg.includes("rate limit") || msg.includes("rate-limit")
  );
};

export const isTechnicalNetworkMessage = (message?: string | null): boolean => {
  const msg = (message ?? "").trim().toLowerCase();
  if (!msg) return false;
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network error") ||
    msg.includes("load failed") ||
    msg.includes("econnrefused") ||
    msg.includes("etimedout") ||
    msg.includes("enotfound") ||
    msg.includes("err_connection_refused")
  );
};

export const isTechnicalServerOrJsonMessage = (message?: string | null): boolean => {
  const msg = (message ?? "").trim().toLowerCase();
  if (!msg) return false;
  return (
    msg.includes("unexpected token") ||
    msg.includes("is not valid json") ||
    msg.includes("json.parse") ||
    msg.includes("<!doctype") ||
    msg.includes("<html") ||
    msg.includes("<body") ||
    msg.includes("502 bad gateway") ||
    msg.includes("bad gateway") ||
    msg.includes("gateway timeout") ||
    msg.includes("504 gateway") ||
    msg.includes("503 service unavailable") ||
    msg.includes("service unavailable") ||
    msg.includes("internal server error") ||
    msg.includes("500 internal") ||
    msg.includes("request failed with status code 5") ||
    msg.includes("status code 502") ||
    msg.includes("status code 503") ||
    msg.includes("status code 504") ||
    msg.includes("status code 500")
  );
};

export const toUserFacingApiMessage = (message: string, statusCode?: number): string => {
  const trimmed = message.trim();
  if (!trimmed) {
    if (statusCode === 429) return API_RATE_LIMIT_MESSAGE;
    if (statusCode && statusCode >= 500) return API_SERVER_ERROR_MESSAGE;
    return "";
  }
  if (isTechnicalThrottleMessage(trimmed)) return API_RATE_LIMIT_MESSAGE;
  if (isTechnicalNetworkMessage(trimmed)) return API_NETWORK_ERROR_MESSAGE;
  if (isTechnicalServerOrJsonMessage(trimmed)) return API_SERVER_ERROR_MESSAGE;
  return trimmed;
};

/**
 * Ưu tiên `response.data.message` từ Axios (tránh hiện "Request failed with status code 400").
 * Trả về chuỗi rỗng khi request bị cancel chủ động.
 */
export const getErrorMessage = (e: unknown) => {
  if (isRequestAborted(e)) return "";

  if (axios.isAxiosError(e)) {
    const status = e.response?.status;
    const data = e.response?.data;
    if (isRecordWithMessage(data)) {
      const msg = data.message.trim();
      if (msg) return toUserFacingApiMessage(msg, status);
    }
    if (status === 429) return API_RATE_LIMIT_MESSAGE;
    if (status && status >= 500) return API_SERVER_ERROR_MESSAGE;
  }
  if (e instanceof Error && e.message) {
    return toUserFacingApiMessage(e.message);
  }
  return API_UNKNOWN_ERROR_MESSAGE;
};
