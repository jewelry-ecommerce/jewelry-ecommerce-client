type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue>;

type RouterLike = {
  push: (url: string) => void;
  replace?: (url: string) => void;
  back?: () => void;
};

type Options = {
  mergeCurrentQuery?: boolean;
  scroll?: boolean; // để sẵn nếu bạn muốn mở rộng sau
};

/**
 * Build URL từ path + query object
 */
export const buildUrl = (path: string, query?: Query, currentSearchParams?: URLSearchParams, options?: Options) => {
  const params = new URLSearchParams();

  // merge query hiện tại (nếu cần)
  if (options?.mergeCurrentQuery && currentSearchParams) {
    currentSearchParams.forEach((value, key) => {
      params.set(key, value);
    });
  }

  // apply query mới (overwrite)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
  }

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
};

/**
 * push page
 */
export const pushPage = (router: RouterLike, path: string, query?: Query, currentSearchParams?: URLSearchParams, options?: Options) => {
  if (!router?.push) return;
  const url = buildUrl(path, query, currentSearchParams, options);
  router.push(url);
};

/**
 * replace page
 */
export const replacePage = (router: RouterLike, path: string, query?: Query, currentSearchParams?: URLSearchParams, options?: Options) => {
  if (!router?.replace) return;
  const url = buildUrl(path, query, currentSearchParams, options);
  router.replace(url);
};

/**
 * Quay lại trang trước trong stack; nếu không có (mở tab mới / paste URL) thì `router.push(fallback)`.
 */
export const gotoBack = (router: RouterLike, fallback = "/") => {
  if (typeof window !== "undefined" && router.back) {
    const idx = (window.history.state as { idx?: number } | null | undefined)?.idx;
    if (typeof idx === "number" && idx > 0) {
      router.back();
      return;
    }
  }
  if (router?.push) {
    router.push(fallback);
  }
};

/**
 * alias cho push (giữ tên theo thói quen của bạn)
 */
export const gotoPage = pushPage;

/**
 * Trả về pathname + search hiện tại (client-only).
 * Dùng làm callbackUrl khi redirect sang auth pages.
 */
export const getCurrentPath = () => {
  if (typeof window === "undefined") return "/trang-chu";
  const { pathname, search } = window.location;
  return `${pathname}${search}`;
};

const AUTH_PUBLIC_ROUTES = ["/dang-nhap", "/dang-ky", "/quen-mat-khau"];

/** Trang đăng nhập / đăng ký / quên mật khẩu — không dùng làm đích sau đăng ký hoặc callbackUrl. */
export const isAuthPublicPath = (pathWithQuery: string) => {
  const p = pathWithQuery.trim();
  return AUTH_PUBLIC_ROUTES.some((r) => p === r || p.startsWith(`${r}/`) || p.startsWith(`${r}?`));
};

/**
 * Chuẩn hóa URL nội bộ (chỉ cùng origin, path tuyệt đối). Trả về pathname + search hoặc null.
 */
export const parseSafeInternalNavigateTarget = (raw: string, origin: string): string | null => {
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith("//")) return null;

  if (/^https?:\/\//i.test(t)) {
    try {
      const u = new URL(t);
      if (u.origin !== origin) return null;
      const path = `${u.pathname}${u.search}`;
      return path || "/";
    } catch {
      return null;
    }
  }

  if (!t.startsWith("/")) return null;
  return t;
};

/**
 * Đích điều hướng sau đăng nhập / đăng ký thành công: callbackUrl hợp lệ (cùng origin, không phải trang auth công khai),
 * không thì referrer nội bộ tương tự, cuối cùng `fallback`.
 */
export const getPostAuthRedirectPath = (params: { callbackUrl: string | null | undefined; fallback?: string }): string => {
  const fallback = params.fallback ?? "/";
  if (typeof window === "undefined") return fallback;
  const origin = window.location.origin;

  const accept = (candidate: string | null | undefined): string | null => {
    if (!candidate?.trim()) return null;
    const internal = parseSafeInternalNavigateTarget(candidate.trim(), origin);
    if (!internal) return null;
    if (isAuthPublicPath(internal)) return null;
    return internal;
  };

  const fromQuery = accept(params.callbackUrl ?? undefined);
  if (fromQuery) return fromQuery;

  try {
    const ref = document.referrer;
    if (!ref) return fallback;
    const u = new URL(ref);
    if (u.origin !== origin) return fallback;
    const internal = `${u.pathname}${u.search}`;
    return accept(internal) ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * Build URL tới trang auth (login / register) kèm callbackUrl tự động.
 * Nếu đang đứng ở auth page → không append callbackUrl.
 */
export const buildAuthUrl = (authPath: "/dang-nhap" | "/dang-ky", callbackUrl?: string) => {
  const cb = callbackUrl ?? getCurrentPath();
  if (isAuthPublicPath(cb)) return authPath;
  return `${authPath}?callbackUrl=${encodeURIComponent(cb)}`;
};

/**
 * URL đăng nhập, giữ `callbackUrl` an toàn (nếu có) để sau khi đăng nhập quay lại đúng trang (vd. sau quên mật khẩu).
 */
export const buildLoginUrlPreservingReturn = (
  callbackUrl: string | null | undefined,
  fallbackAfterLogin: string = "/trang-chu",
): string => {
  const safeReturn = getPostAuthRedirectPath({ callbackUrl, fallback: fallbackAfterLogin });
  return buildAuthUrl("/dang-nhap", safeReturn);
};
