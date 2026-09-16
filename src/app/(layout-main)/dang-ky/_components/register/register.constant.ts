import { OtpStorageMeta, RegisterOtpSendSession, RegisterSendOtpRouteResponse } from "./register.type";
import {
  clearOtpSendSession,
  getCooldownRemainingSeconds as getCooldownRemainingSecondsShared,
  getOtpMetaByPrefix,
  getOtpStorageKey as getOtpStorageKeyShared,
  isOtpCooldownMessage,
  normalizePhone as normalizePhoneShared,
  readOtpSendSession,
  saveOtpMetaByPrefix,
  todayIso as todayIsoShared,
  writeOtpSendSession,
} from "@/utils/auth/otp-client.shared";

const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 60;
const OTP_MAX_SEND_PER_DAY = 5;
const OTP_LOCAL_KEY_PREFIX = "otp_register_meta";
const REGISTER_OTP_SEND_SESSION_KEY = "register_otp_last_send";
const REGISTER_PRECHECK_AUTO_SENT_PHONE_KEY = "register_precheck_auto_sent_phone";

const todayIso = todayIsoShared;

const normalizePhone = normalizePhoneShared;

const getOtpStorageKey = (phone: string) => getOtpStorageKeyShared(OTP_LOCAL_KEY_PREFIX, phone);

const phoneRegex = /^(?:0|\+84)\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getOtpMeta = (phone: string): OtpStorageMeta => {
  return getOtpMetaByPrefix(OTP_LOCAL_KEY_PREFIX, phone);
};

const saveOtpMeta = (phone: string, meta: OtpStorageMeta) => {
  saveOtpMetaByPrefix(OTP_LOCAL_KEY_PREFIX, phone, meta);
};

const readRegisterOtpSendSession = (): RegisterOtpSendSession | null => {
  return readOtpSendSession(REGISTER_OTP_SEND_SESSION_KEY);
};

const writeRegisterOtpSendSession = (phone: string) => {
  writeOtpSendSession(REGISTER_OTP_SEND_SESSION_KEY, phone);
};

const clearRegisterOtpSendSession = () => {
  clearOtpSendSession(REGISTER_OTP_SEND_SESSION_KEY);
};

const readPrecheckAutoSentPhone = () => {
  if (typeof window === "undefined") return "";
  return normalizePhone(sessionStorage.getItem(REGISTER_PRECHECK_AUTO_SENT_PHONE_KEY) ?? "");
};

const writePrecheckAutoSentPhone = (phone: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(REGISTER_PRECHECK_AUTO_SENT_PHONE_KEY, normalizePhone(phone));
};

const getCooldownRemainingSeconds = (startTime: number) => getCooldownRemainingSecondsShared(startTime, OTP_RESEND_SECONDS);

/** BE trả 429 + message kiểu “chờ 60s” — vẫn mở popup để nhập OTP đã gửi trước đó. */
const isOtpCooldown429 = (response: Response, result: RegisterSendOtpRouteResponse) => {
  const status = result.statusCode ?? response.status;
  if (status !== 429) return false;
  return isOtpCooldownMessage(result.message);
};

export {
  OTP_LENGTH,
  OTP_RESEND_SECONDS,
  OTP_MAX_SEND_PER_DAY,
  OTP_LOCAL_KEY_PREFIX,
  REGISTER_OTP_SEND_SESSION_KEY,
  REGISTER_PRECHECK_AUTO_SENT_PHONE_KEY,
  todayIso,
  normalizePhone,
  getOtpStorageKey,
  phoneRegex,
  emailRegex,
  getOtpMeta,
  saveOtpMeta,
  readRegisterOtpSendSession,
  writeRegisterOtpSendSession,
  clearRegisterOtpSendSession,
  readPrecheckAutoSentPhone,
  writePrecheckAutoSentPhone,
  getCooldownRemainingSeconds,
  isOtpCooldown429,
};
