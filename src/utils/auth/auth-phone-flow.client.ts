"use client";

const REGISTER_PRECHECK_PHONE_KEY = "auth_register_precheck_phone";
const FORGOT_PASSWORD_PHONE_KEY = "auth_forgot_password_phone";

const canUseSessionStorage = () => typeof window !== "undefined";

const normalizeStoredPhone = (value: string | null | undefined) => (value ?? "").replace(/\s+/g, "").trim();

const writePhone = (key: string, phone: string) => {
  if (!canUseSessionStorage()) return;
  const normalized = normalizeStoredPhone(phone);
  if (!normalized) return;
  window.sessionStorage.setItem(key, normalized);
};

const readPhone = (key: string) => {
  if (!canUseSessionStorage()) return null;
  const value = normalizeStoredPhone(window.sessionStorage.getItem(key));
  return value || null;
};

const clearPhone = (key: string) => {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(key);
};

export const writeRegisterPrecheckPhone = (phone: string) => writePhone(REGISTER_PRECHECK_PHONE_KEY, phone);
export const readRegisterPrecheckPhone = () => readPhone(REGISTER_PRECHECK_PHONE_KEY);
export const clearRegisterPrecheckPhone = () => clearPhone(REGISTER_PRECHECK_PHONE_KEY);

export const writeForgotPasswordPhone = (phone: string) => writePhone(FORGOT_PASSWORD_PHONE_KEY, phone);
export const readForgotPasswordPhone = () => readPhone(FORGOT_PASSWORD_PHONE_KEY);
export const clearForgotPasswordPhone = () => clearPhone(FORGOT_PASSWORD_PHONE_KEY);
