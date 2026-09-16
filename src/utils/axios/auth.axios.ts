import axios, { AxiosRequestConfig } from "axios";
import { clearUserScopedSwrCache } from "@/lib/swr/clear-user-scoped-cache.util";
import { getApiBeUrl, getTenantCode } from "../config/common";
import { clearAuthTokens } from "../auth/access-token.util";
import { buildAuthUrl, isAuthPublicPath } from "../helpers/common/navigation";
import { isAuthStatusCode, shouldForceLoginRedirect } from "./auth-error.util";

export type AuthRequestConfig = AxiosRequestConfig & {
  /**
   * Bỏ qua chuyển hướng sang trang đăng nhập khi phiên hết hạn.
   * Lưu ý: State Redux & token vẫn được reset về guest.
   */
  skipAuthRedirect?: boolean;
  /** @deprecated Dùng `skipAuthRedirect` để đúng ngữ nghĩa hơn. */
  skipAuthLogout?: boolean;
};

const resolveBaseUrl = () => (typeof window === "undefined" ? getApiBeUrl() || "http://127.0.0.1:3100/api/mock" : "/api/mock");

const authAxios = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
  withCredentials: true,
});

authAxios.interceptors.request.use(
  (req) => {
    req.headers = req.headers ?? {};
    if (!(req.headers as Record<string, string>).Language) {
      (req.headers as Record<string, string>).Language = "en_US";
    }

    const tenantCode = getTenantCode();
    if (tenantCode) {
      (req.headers as Record<string, string>)["x-tenant-code"] = tenantCode;
    }

    return req;
  },
  (err) => Promise.reject(err),
);

const syncUnauthorizedState = async () => {
  // Dynamic import: tránh circular `authAxios → store → api → authAxios` lúc init module.
  const [{ store }, { logOut }] = await Promise.all([import("@/redux/store"), import("@/redux/slices/auth.slice")]);
  await clearUserScopedSwrCache();
  store.dispatch(logOut());
};

let hasRedirected = false;
const redirectToLogin = () => {
  if (hasRedirected || typeof window === "undefined") return;
  hasRedirected = true;
  const current = `${window.location.pathname}${window.location.search}`;
  window.location.href = isAuthPublicPath(current) ? "/dang-nhap" : buildAuthUrl("/dang-nhap", current);
};

let syncPromise: Promise<void> | null = null;

const handleSessionExpired = async (config: AuthRequestConfig) => {
  if (!syncPromise) {
    syncPromise = (async () => {
      clearAuthTokens();
      await syncUnauthorizedState();
    })().finally(() => {
      syncPromise = null;
    });
  }

  try {
    await syncPromise;
  } catch {
    // Đã cố gắng đồng bộ logout state; lỗi phụ này không nên che lỗi 401 gốc.
  }

  if (config.skipAuthRedirect || config.skipAuthLogout) {
    return;
  }

  if (typeof window !== "undefined" && shouldForceLoginRedirect(window.location.pathname)) {
    redirectToLogin();
  }
};

authAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { status, data } = err.response || {};
    const config = (err.config || {}) as AuthRequestConfig;
    const statusCode = data?.statusCode ?? status;

    if (isAuthStatusCode(status, statusCode)) {
      await handleSessionExpired(config);
      return Promise.reject(err);
    }

    return Promise.reject(err);
  },
);

export default authAxios;
