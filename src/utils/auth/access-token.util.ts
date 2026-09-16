import { AuthUser } from "@/utils/api/auth/auth.interface";

export const getAccessToken = (): string | null => {
  return null;
};

export const hasAccessToken = (): boolean => Boolean(getAccessToken());

export const AUTH_TOKEN_CHANGED_EVENT = "auth-token-changed";

export const setAuthTokens = (accessToken: string, refreshToken: string, AuthUser: AuthUser | undefined, tokenId?: string) => {
  if (typeof window === "undefined") return;

  AuthUser && localStorage.setItem("user_info", JSON.stringify(AuthUser));
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
};

export const clearAuthTokens = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("user_info");
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
};
