import type { AuthUser } from "@/utils/api/auth/auth.interface";

export const DEMO_ACCOUNT_PHONE = "0796406514";
export const DEMO_ACCOUNT_PASSWORD = "123456";
export const DEMO_AUTH_COOKIE_NAME = "jewelry_demo_auth";
export const DEMO_AUTH_COOKIE_VALUE = "phone-demo-session";

export const DEMO_CUSTOMER: AuthUser = {
  id: "demo-customer",
  createdByType: null,
  updatedByType: null,
  deletedByType: null,
  createdById: null,
  updatedById: null,
  deletedById: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
  status: "ACTIVE",
  email: "client@example.test",
  phone: DEMO_ACCOUNT_PHONE,
  firstName: "Khách Hàng",
  lastName: "Demo",
  type: "CUSTOMER",
  birthday: null,
  url: null,
  gender: null,
};

export const isDemoCredential = (phone?: string, password?: string): boolean =>
  phone?.trim() === DEMO_ACCOUNT_PHONE && password === DEMO_ACCOUNT_PASSWORD;

export const isDemoSession = (cookieValue?: string): boolean => cookieValue === DEMO_AUTH_COOKIE_VALUE;
