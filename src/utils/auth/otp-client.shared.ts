import axios from "axios";

export type OtpStorageMeta = {
  date: string;
  sendCount: number;
  blockedUntil: number | null;
};

export type OtpSendSession = {
  phone: string;
  startTime: number;
};

export const todayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const normalizePhone = (phone: string) => phone.replace(/\s+/g, "").trim();

export const getOtpStorageKey = (prefix: string, phone: string) => `${prefix}_${normalizePhone(phone)}`;

const getDefaultOtpMeta = (): OtpStorageMeta => ({
  date: todayIso(),
  sendCount: 0,
  blockedUntil: null,
});

function normalizeStoredOtpMeta(raw: unknown): OtpStorageMeta {
  if (!raw || typeof raw !== "object") return getDefaultOtpMeta();
  const parsed = raw as {
    date?: string;
    sendCount?: number;
    blockedUntil?: number | null;
    zns?: { sendCount?: number; blockedUntil?: number | null };
    sms?: { sendCount?: number; blockedUntil?: number | null };
  };

  if (parsed.date !== todayIso()) return getDefaultOtpMeta();

  // Legacy per-method counters (zns/sms) → unified sendCount for the day.
  if (typeof parsed.sendCount !== "number" && (parsed.zns || parsed.sms)) {
    const znsCount = parsed.zns?.sendCount ?? 0;
    const smsCount = parsed.sms?.sendCount ?? 0;
    return {
      date: parsed.date,
      sendCount: Math.max(znsCount, smsCount),
      blockedUntil: parsed.zns?.blockedUntil ?? parsed.sms?.blockedUntil ?? null,
    };
  }

  return {
    date: parsed.date,
    sendCount: parsed.sendCount ?? 0,
    blockedUntil: parsed.blockedUntil ?? null,
  };
}

export const getOtpMetaByPrefix = (prefix: string, phone: string): OtpStorageMeta => {
  if (typeof window === "undefined") return getDefaultOtpMeta();
  const raw = window.localStorage.getItem(getOtpStorageKey(prefix, phone));
  if (!raw) return getDefaultOtpMeta();
  try {
    return normalizeStoredOtpMeta(JSON.parse(raw));
  } catch {
    return getDefaultOtpMeta();
  }
};

export const saveOtpMetaByPrefix = (prefix: string, phone: string, meta: OtpStorageMeta) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getOtpStorageKey(prefix, phone), JSON.stringify(meta));
};

export const readOtpSendSession = (sessionKey: string): OtpSendSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(sessionKey);
    if (!raw) return null;
    const p = JSON.parse(raw) as OtpSendSession;
    if (!p?.phone || typeof p.startTime !== "number") return null;
    return { phone: normalizePhone(p.phone), startTime: p.startTime };
  } catch {
    return null;
  }
};

export const writeOtpSendSession = (sessionKey: string, phone: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(sessionKey, JSON.stringify({ phone: normalizePhone(phone), startTime: Date.now() } satisfies OtpSendSession));
};

export const clearOtpSendSession = (sessionKey: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(sessionKey);
};

export const getCooldownRemainingSeconds = (startTime: number, resendSeconds: number) =>
  Math.max(0, resendSeconds - Math.floor((Date.now() - startTime) / 1000));

export { OTP_DAILY_LIMIT_MESSAGE } from "@/utils/constants/otp-message.constant";

export const isOtpCooldownMessage = (message?: string) => {
  const msg = (message ?? "").trim();
  return msg.includes("gửi lại OTP") || msg.includes("60 giây");
};

export const isOtpDailyLimitMessage = (message?: string) => {
  const msg = (message ?? "").trim().toLowerCase();
  if (!msg) return false;
  if (isOtpCooldownMessage(message)) return false;
  const mentionsOtp = msg.includes("otp");
  const isOverQuota = msg.includes("vượt quá") || msg.includes("quá số lần gửi");
  return mentionsOtp && isOverQuota;
};

export function isOtpDailyLimitReached(meta: Pick<OtpStorageMeta, "date" | "sendCount">, maxSendPerDay: number): boolean {
  return meta.date === todayIso() && meta.sendCount >= maxSendPerDay;
}

/** Midnight local next day — quota resets after 0h00. */
export function getOtpDailyQuotaResetAtMs(): number {
  const resetAt = new Date();
  resetAt.setHours(24, 0, 0, 0);
  return resetAt.getTime();
}

/** Đọc message daily-limit từ Axios trước khi getErrorMessage map 429 → throttle chung. */
export function isOtpDailyLimitError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;
    const raw = typeof data?.message === "string" ? data.message : "";
    if (isOtpDailyLimitMessage(raw)) return true;
  }
  if (error instanceof Error) return isOtpDailyLimitMessage(error.message);
  return false;
}
