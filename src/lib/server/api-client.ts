import { cookies } from "next/headers";
import { getApiBeUrl } from "@/utils/config/common";
import { getRuntimeTenantCode } from "./tenant-headers";
import { getAuthTokens, type RequiredAuthCookieTokens } from "./cookies";
import { formatFetchFailureMessage } from "./fetch-error";
import { configureDevSelfSignedTls } from "./tls";

type AuthFetchOptions = RequestInit & {
  /**
   * Bật cho caller không thể ghi cookie (Server Component / render): refresh ở đó sẽ khiến BE
   * rotate refresh token trong khi token mới bị bỏ đi, làm refresh token của browser vô hiệu.
   * Khi bật, request hết hạn access token sẽ được gọi lại ở chế độ guest thay vì refresh.
   */
  skipRefresh?: boolean;
};

type AuthFetchResult<T = unknown> = {
  response: Response;
  data: T;
  refreshedTokens?: RequiredAuthCookieTokens | null;
  isAuthExpired?: boolean;
};

const AUTH_REFRESH_LOG_PREFIX = "[authFetch:refresh]";

function maskToken(token?: string | null): string {
  if (!token) return "(empty)";
  if (token.length <= 12) return "***";
  return `${token.slice(0, 6)}…${token.slice(-4)} (len=${token.length})`;
}

/** Log BE refresh payload nhưng che token thật. */
function sanitizeRefreshLogPayload(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const record = data as Record<string, unknown>;
  return {
    ...record,
    accessToken: typeof record.accessToken === "string" ? maskToken(record.accessToken) : record.accessToken,
    refreshToken: typeof record.refreshToken === "string" ? maskToken(record.refreshToken) : record.refreshToken,
    tokenId: typeof record.tokenId === "string" ? maskToken(record.tokenId) : record.tokenId,
  };
}

function logAuthRefresh(message: string, detail?: unknown) {
  if (detail !== undefined) {
    console.info(AUTH_REFRESH_LOG_PREFIX, message, detail);
    return;
  }
  console.info(AUTH_REFRESH_LOG_PREFIX, message);
}

const ACCESS_TOKEN_EXPIRED_STATUS = 777;

/** Access token hết hạn / cần refresh: BE trả 777 ở HTTP status hoặc body (kể cả HTTP 2xx), hoặc 401. */
export function shouldRefreshAuth(status: number, data: unknown): boolean {
  const statusCode =
    data && typeof data === "object" && "statusCode" in data ? Number((data as { statusCode?: unknown }).statusCode) : undefined;

  // 888 = phiên hết hoàn toàn — không refresh, để client logout.
  if (statusCode === 888) return false;
  if (status === ACCESS_TOKEN_EXPIRED_STATUS || statusCode === ACCESS_TOKEN_EXPIRED_STATUS) return true;
  return status === 401 || statusCode === 401;
}

/**
 * BE dùng status ngoài dải HTTP hợp lệ (777). `Response`/`NextResponse` sẽ ném RangeError nếu
 * nhận status đó, nên phải chuẩn hoá trước khi trả về client.
 */
export function toValidHttpStatus(status: number): number {
  if (status >= 200 && status <= 599) return status;
  return status === ACCESS_TOKEN_EXPIRED_STATUS ? 401 : 502;
}

const buildUrl = (path: string) => {
  const normalizedBaseUrl = (getApiBeUrl() || "").replace(/\/$/, "");
  const normalizedPath = path.replace(/^\//, "");
  return `${normalizedBaseUrl}/${normalizedPath}`;
};

const parseJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const withAuthHeaders = (headers: HeadersInit | undefined, accessToken?: string) => {
  const nextHeaders = new Headers(headers);
  const tenantCode = getRuntimeTenantCode();
  if (tenantCode) {
    nextHeaders.set("x-tenant-code", tenantCode);
  }
  if (accessToken) {
    nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  }
  return nextHeaders;
};

/**
 * BE trả access token hết hạn bằng HTTP status 777 — ngoài dải 200–599 hợp lệ. `fetch` của Next
 * dựng lại Response với status đó nên ném RangeError trước khi ta đọc được body, khiến request
 * biến thành lỗi mạng và refresh không bao giờ chạy. Nhận diện lỗi này để xử lý như 777.
 */
const isOutOfRangeStatusError = (error: unknown) => /must be in the range of 200 to 599/.test(formatFetchFailureMessage(error));

type RequestOutcome =
  | { kind: "response"; response: Response; data: unknown }
  | { kind: "expiredStatus" }
  | { kind: "failure"; response: Response; data: unknown };

const runRequest = async (send: () => Promise<Response>): Promise<RequestOutcome> => {
  try {
    const response = await send();
    return { kind: "response", response, data: await parseJson(response) };
  } catch (error) {
    if (isOutOfRangeStatusError(error)) {
      return { kind: "expiredStatus" };
    }
    const payload = { message: formatFetchFailureMessage(error) };
    return {
      kind: "failure",
      response: new Response(JSON.stringify(payload), { status: 502, headers: { "Content-Type": "application/json" } }),
      data: payload,
    };
  }
};

const buildAuthExpiredResult = <T>(originalData: unknown): AuthFetchResult<T> => {
  const originalMessage =
    originalData && typeof originalData === "object" && "message" in originalData
      ? (originalData as { message?: unknown }).message
      : undefined;
  const payload = {
    ...(originalData && typeof originalData === "object" ? originalData : null),
    statusCode: 888,
    message: typeof originalMessage === "string" && originalMessage.trim() ? originalMessage : "Session expired",
  };
  const response = new Response(JSON.stringify(payload), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
  return { response, data: payload as T, isAuthExpired: true };
};

const refreshPromiseByToken = new Map<string, Promise<RequiredAuthCookieTokens | null>>();

/**
 * BE rotate refresh token mỗi lần refresh, nhưng cookie mới chỉ tới browser khi response đầu tiên
 * về. Request nào được gửi trong khoảng đó vẫn mang refresh token cũ (đã bị BE huỷ) và sẽ bị coi là
 * hết phiên. Giữ lại token mới trong thời gian ngắn, khoá theo token cũ, để những request đó dùng lại.
 */
const REFRESH_GRACE_WINDOW_MS = 30_000;

type RotatedTokensEntry = {
  tokens: RequiredAuthCookieTokens;
  expiresAt: number;
};

const rotatedTokensByConsumedToken = new Map<string, RotatedTokensEntry>();

const rememberRotatedTokens = (consumedRefreshToken: string, tokens: RequiredAuthCookieTokens) => {
  const now = Date.now();
  rotatedTokensByConsumedToken.forEach((entry, key) => {
    if (entry.expiresAt <= now) rotatedTokensByConsumedToken.delete(key);
  });
  rotatedTokensByConsumedToken.set(consumedRefreshToken, { tokens, expiresAt: now + REFRESH_GRACE_WINDOW_MS });
};

const getRotatedTokens = (consumedRefreshToken: string): RequiredAuthCookieTokens | undefined => {
  const entry = rotatedTokensByConsumedToken.get(consumedRefreshToken);
  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    rotatedTokensByConsumedToken.delete(consumedRefreshToken);
    return undefined;
  }

  return entry.tokens;
};

const refreshAuthTokens = async (refreshToken: string, tokenId?: string): Promise<RequiredAuthCookieTokens | null> => {
  configureDevSelfSignedTls();

  const body: { refreshToken: string; tokenId?: string } = { refreshToken };
  if (tokenId) body.tokenId = tokenId;

  logAuthRefresh("Calling BE iam/customer/refresh", {
    hasRefreshToken: Boolean(refreshToken),
    refreshToken: maskToken(refreshToken),
    hasTokenId: Boolean(tokenId),
    tokenId: maskToken(tokenId),
  });

  const outcome = await runRequest(() =>
    fetch(buildUrl("iam/customer/refresh"), {
      method: "POST",
      headers: withAuthHeaders(
        {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        undefined,
      ),
      body: JSON.stringify(body),
      cache: "no-store",
    }),
  );

  if (outcome.kind !== "response") {
    logAuthRefresh("Refresh FAILED — không nhận được response hợp lệ", { kind: outcome.kind });
    return null;
  }

  const { response } = outcome;
  const data = outcome.data as (Partial<RequiredAuthCookieTokens> & { statusCode?: number; message?: string }) | null;

  logAuthRefresh("BE refresh response", {
    httpStatus: response.status,
    ok: response.ok,
    body: sanitizeRefreshLogPayload(data),
  });

  if (!response.ok) {
    logAuthRefresh("Refresh FAILED — HTTP not ok");
    return null;
  }

  if (!data?.accessToken || !data?.refreshToken) {
    logAuthRefresh("Refresh FAILED — missing accessToken/refreshToken in body");
    return null;
  }

  logAuthRefresh("Refresh SUCCESS", {
    accessToken: maskToken(data.accessToken),
    refreshToken: maskToken(data.refreshToken),
    tokenId: maskToken(data.tokenId || tokenId),
  });

  // Một số response refresh không trả lại tokenId — giữ tokenId hiện có để lần refresh sau.
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    tokenId: data.tokenId || tokenId,
  };
};

const runRefreshOnce = async (refreshToken: string, tokenId?: string) => {
  const rotatedTokens = getRotatedTokens(refreshToken);
  if (rotatedTokens) {
    logAuthRefresh("Reuse tokens rotated within grace window (request mang refresh cookie cũ)");
    return rotatedTokens;
  }

  const refreshKey = `${refreshToken}:${tokenId ?? ""}`;
  const existingPromise = refreshPromiseByToken.get(refreshKey);
  if (existingPromise) {
    logAuthRefresh("Reuse in-flight refresh promise (dedupe)");
    return existingPromise;
  }

  const nextPromise = refreshAuthTokens(refreshToken, tokenId)
    .then((tokens) => {
      if (tokens) rememberRotatedTokens(refreshToken, tokens);
      return tokens;
    })
    .finally(() => {
      refreshPromiseByToken.delete(refreshKey);
    });
  refreshPromiseByToken.set(refreshKey, nextPromise);
  return nextPromise;
};

export async function authFetch<T = unknown>(path: string, options: AuthFetchOptions = {}): Promise<AuthFetchResult<T>> {
  configureDevSelfSignedTls();

  if (!getApiBeUrl()) {
    const payload = { message: "Missing server api form fe configuration" };
    const response = new Response(JSON.stringify(payload), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
    return { response, data: payload as T };
  }

  const cookieStore = await cookies();
  const currentTokens = getAuthTokens(cookieStore);

  let activeAccessToken = currentTokens.accessToken;
  let refreshedTokens: RequiredAuthCookieTokens | null | undefined;

  // Cookie access hết hạn/mất nhưng vẫn còn refresh → refresh trước khi gọi API.
  if (!options.skipRefresh && !activeAccessToken && currentTokens.refreshToken) {
    logAuthRefresh("Proactive refresh — access cookie missing, refresh cookie present", { path });
    refreshedTokens = await runRefreshOnce(currentTokens.refreshToken, currentTokens.tokenId);
    if (!refreshedTokens?.accessToken) {
      logAuthRefresh("Proactive refresh failed → treat as session expired", { path });
      return buildAuthExpiredResult<T>(null);
    }
    activeAccessToken = refreshedTokens.accessToken;
  }

  const execute = (accessToken?: string) =>
    fetch(buildUrl(path), {
      ...options,
      headers: withAuthHeaders(options.headers, accessToken),
      cache: options.cache ?? "no-store",
    });

  const executeAsGuest = () => {
    const guestHeaders = withAuthHeaders(options.headers, undefined);
    guestHeaders.delete("Authorization");
    return fetch(buildUrl(path), {
      ...options,
      headers: guestHeaders,
      cache: options.cache ?? "no-store",
    });
  };

  const initial = await runRequest(() => execute(activeAccessToken));
  if (initial.kind === "failure") {
    return { response: initial.response, data: initial.data as T, refreshedTokens };
  }

  const originalData = initial.kind === "response" ? initial.data : null;
  // Quan trọng: phải check statusCode 777 cả khi HTTP 2xx — không return sớm vì response.ok.
  const needsRefresh = initial.kind === "expiredStatus" ? true : shouldRefreshAuth(initial.response.status, initial.data);

  // Caller không ghi được cookie: thay vì refresh (sẽ mất token rotate), gọi lại như guest
  // để endpoint public vẫn trả dữ liệu thật thay vì payload 777.
  if (options.skipRefresh && activeAccessToken && needsRefresh) {
    logAuthRefresh("skipRefresh + access token hết hạn → gọi lại ở chế độ guest", { path });
    const guest = await runRequest(executeAsGuest);
    if (guest.kind === "expiredStatus") {
      return buildAuthExpiredResult<T>(originalData);
    }
    return { response: guest.response, data: guest.data as T };
  }

  // skipRefresh mà không đọc được response: không refresh ở đây, để client tự xử lý phiên.
  if (options.skipRefresh && initial.kind === "expiredStatus") {
    return buildAuthExpiredResult<T>(null);
  }

  if (initial.kind === "response" && !needsRefresh) {
    const bodyStatusCode =
      initial.data && typeof initial.data === "object" && "statusCode" in initial.data
        ? Number((initial.data as { statusCode?: unknown }).statusCode)
        : undefined;
    // 888 hoặc 401 khi không còn refresh → xóa cookie phiên.
    const isAuthExpired =
      bodyStatusCode === 888 ||
      ((!currentTokens.refreshToken || options.skipRefresh) && (initial.response.status === 401 || bodyStatusCode === 401));

    return { response: initial.response, data: initial.data as T, refreshedTokens, isAuthExpired: isAuthExpired || undefined };
  }

  if (initial.kind === "response" && options.skipRefresh) {
    return { response: initial.response, data: initial.data as T, refreshedTokens };
  }

  logAuthRefresh("Trigger refresh after API response", {
    path,
    httpStatus: initial.kind === "response" ? initial.response.status : "777 (out of HTTP range)",
    hasRefreshToken: Boolean(refreshedTokens?.refreshToken ?? currentTokens.refreshToken),
    originalBody: sanitizeRefreshLogPayload(originalData),
  });

  const refreshTokenToUse = refreshedTokens?.refreshToken ?? currentTokens.refreshToken;
  const tokenIdToUse = refreshedTokens?.tokenId ?? currentTokens.tokenId;

  if (!refreshTokenToUse) {
    logAuthRefresh("Cannot refresh — no refreshToken in cookies", { path });
    return buildAuthExpiredResult<T>(originalData);
  }

  const nextTokens = await runRefreshOnce(refreshTokenToUse, tokenIdToUse);
  if (!nextTokens?.accessToken) {
    logAuthRefresh("Refresh returned null → session expired", { path });
    return buildAuthExpiredResult<T>(originalData);
  }

  refreshedTokens = nextTokens;

  logAuthRefresh("Retry original request with new access token", { path });
  const retry = await runRequest(() => execute(nextTokens.accessToken));
  if (retry.kind === "failure") {
    return { response: retry.response, data: retry.data as T, refreshedTokens };
  }

  // Retry vẫn báo hết hạn access → coi như session hết, tránh trả 777 về client.
  if (retry.kind === "expiredStatus") {
    logAuthRefresh("Retry still returns out-of-range status → session expired", { path });
    return buildAuthExpiredResult<T>(originalData);
  }

  logAuthRefresh("Retry result", {
    path,
    httpStatus: retry.response.status,
    ok: retry.response.ok,
    bodyStatusCode:
      retry.data && typeof retry.data === "object" && "statusCode" in retry.data
        ? Number((retry.data as { statusCode?: unknown }).statusCode)
        : undefined,
  });

  if (shouldRefreshAuth(retry.response.status, retry.data)) {
    logAuthRefresh("Retry still needs refresh → session expired", { path });
    return buildAuthExpiredResult<T>(retry.data);
  }

  return { response: retry.response, data: retry.data as T, refreshedTokens };
}
