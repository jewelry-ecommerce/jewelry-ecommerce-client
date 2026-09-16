"use client";

import axios from "axios";
import {
  clearOtpSendSession,
  getCooldownRemainingSeconds as getCooldownRemainingSecondsShared,
  getOtpMetaByPrefix,
  getOtpStorageKey as getOtpStorageKeyShared,
  isOtpCooldownMessage,
  isOtpDailyLimitMessage,
  normalizePhone as normalizePhoneShared,
  readOtpSendSession,
  saveOtpMetaByPrefix,
  todayIso as todayIsoShared,
  writeOtpSendSession,
} from "@/utils/auth/otp-client.shared";

export type OtpStorageMeta = {
  date: string;
  sendCount: number;
  blockedUntil: number | null;
};

export type ForgotOtpSendSession = {
  phone: string;
  startTime: number;
};

export const OTP_RESEND_SECONDS = 60;
export const OTP_MAX_SEND_PER_DAY = 5;
export const OTP_LOCAL_KEY_PREFIX = "otp_forgot_meta";
export const FORGOT_OTP_SEND_SESSION_KEY = "forgot_otp_last_send";
export { OTP_DAILY_LIMIT_MESSAGE } from "@/utils/constants/otp-message.constant";

export const todayIso = todayIsoShared;
export const normalizePhone = normalizePhoneShared;
export const getOtpStorageKey = (phone: string) => getOtpStorageKeyShared(OTP_LOCAL_KEY_PREFIX, phone);

export const getOtpMeta = (phone: string): OtpStorageMeta => {
  return getOtpMetaByPrefix(OTP_LOCAL_KEY_PREFIX, phone);
};

export const saveOtpMeta = (phone: string, meta: OtpStorageMeta) => {
  saveOtpMetaByPrefix(OTP_LOCAL_KEY_PREFIX, phone, meta);
};

export const readForgotOtpSendSession = (): ForgotOtpSendSession | null => {
  return readOtpSendSession(FORGOT_OTP_SEND_SESSION_KEY);
};

export const writeForgotOtpSendSession = (phone: string) => {
  writeOtpSendSession(FORGOT_OTP_SEND_SESSION_KEY, phone);
};

export const clearForgotOtpSendSession = () => {
  clearOtpSendSession(FORGOT_OTP_SEND_SESSION_KEY);
};

export const getCooldownRemainingSeconds = (startTime: number) => getCooldownRemainingSecondsShared(startTime, OTP_RESEND_SECONDS);

export const isAxiosOtpCooldown429 = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false;
  const data = error.response?.data as { message?: string; statusCode?: number } | undefined;
  const status = data?.statusCode ?? error.response?.status;
  if (status !== 429) return false;
  return isOtpCooldownMessage(data?.message);
};

export const getAxiosOtpDailyLimit429Message = (error: unknown) => {
  if (!axios.isAxiosError(error)) return "";
  const data = error.response?.data as { message?: string; statusCode?: number } | undefined;
  const status = data?.statusCode ?? error.response?.status;
  if (status !== 429) return "";
  const msg = (data?.message ?? "").trim();
  if (!msg) return "";
  return isOtpDailyLimitMessage(msg) ? msg : "";
};
