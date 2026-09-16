import type { ReadonlyRequestCookies, ResponseCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { resolvePublicSiteUrl } from "@/lib/server/public-site-url";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAMES = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  tokenId: "token_id",
} as const;

export type AuthCookieTokens = {
  accessToken?: string;
  refreshToken?: string;
  tokenId?: string;
};

export type RequiredAuthCookieTokens = {
  accessToken: string;
  refreshToken: string;
  tokenId?: string;
};

const resolveSecureCookieFlag = () => {
  const secureOverride = process.env.AUTH_COOKIE_SECURE;
  if (secureOverride === "true") return true;
  if (secureOverride === "false") return false;

  try {
    return new URL(resolvePublicSiteUrl()).protocol === "https:";
  } catch {
    // Ignore invalid URL and fallback to NODE_ENV heuristic.
  }

  return process.env.NODE_ENV === "production";
};

const cookieOptions = {
  httpOnly: true,
  secure: resolveSecureCookieFlag(),
  sameSite: "lax" as const,
  path: "/",
};

export const setAuthCookies = (cookieStore: ResponseCookies, tokens: RequiredAuthCookieTokens) => {
  cookieStore.set(AUTH_COOKIE_NAMES.accessToken, tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60,
  });
  cookieStore.set(AUTH_COOKIE_NAMES.refreshToken, tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });

  if (tokens.tokenId) {
    cookieStore.set(AUTH_COOKIE_NAMES.tokenId, tokens.tokenId, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60,
    });
  }
  // Không xóa token_id khi payload không có tokenId (vd. refresh response thiếu field) —
  // giữ cookie hiện có để lần refresh sau vẫn gửi được tokenId.
};

export const getAuthTokens = (cookieStore: ReadonlyRequestCookies): AuthCookieTokens => {
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  return {
    accessToken,
    refreshToken,
    tokenId: cookieStore.get(AUTH_COOKIE_NAMES.tokenId)?.value,
  };
};

export const clearAuthCookies = (cookieStore: ResponseCookies) => {
  Object.values(AUTH_COOKIE_NAMES).forEach((name) => cookieStore.delete(name));
};

export const getTokens = async () => {
  const cookieStore = await cookies();
  return getAuthTokens(cookieStore);
};
