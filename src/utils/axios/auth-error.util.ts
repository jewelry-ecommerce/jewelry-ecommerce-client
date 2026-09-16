import type { AxiosError } from "axios";

const SESSION_EXPIRED_STATUS_CODES = new Set([401, 888]);

/** Routes where losing session should redirect to login (not silent guest on browse). */
const LOGIN_REQUIRED_ROUTE_PREFIXES = ["/don-hang", "/san-pham-yeu-thich", "/tai-khoan", "/thanh-toan", "/gio-hang"] as const;

export const isAuthStatusCode = (status?: number, statusCode?: number) => {
  const code = statusCode ?? status;
  return code != null && SESSION_EXPIRED_STATUS_CODES.has(code);
};

export const isSessionExpiredError = (error: unknown) => {
  const axiosError = error as AxiosError<{ statusCode?: number; message?: string }>;
  const status = axiosError?.response?.status;
  const statusCode = axiosError?.response?.data?.statusCode;
  return isAuthStatusCode(status, statusCode);
};

export const shouldForceLoginRedirect = (pathname: string) =>
  LOGIN_REQUIRED_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export const getBackendErrorMessage = (data: { message?: string } | undefined) =>
  typeof data?.message === "string" && data.message.trim() ? data.message.trim() : undefined;
