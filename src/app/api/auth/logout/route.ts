import { NextResponse } from "next/server";
import { authFetch } from "@/lib/server/api-client";
import { isJavaBackend } from "@/utils/config/java-backend.config";
import { getApiBeUrl } from "@/utils/config/common";
import { clearAuthCookies, getTokens } from "@/lib/server/cookies";
import { configureDevSelfSignedTls } from "@/lib/server/tls";
import { SESSION_SENSITIVE_HEADERS } from "@/lib/server/session-response-headers";
import { AuthApi } from "@/utils/api";
import { IS_JEWELRY_DEMO_MODE } from "@/mock-api/demo-mode";
import { DEMO_AUTH_COOKIE_NAME } from "@/mock-api/demo-account";

export const dynamic = "force-dynamic";

export async function POST() {
  if (IS_JEWELRY_DEMO_MODE) {
    const response = NextResponse.json({ success: true }, { headers: SESSION_SENSITIVE_HEADERS });
    response.cookies.delete(DEMO_AUTH_COOKIE_NAME);
    return response;
  }

  configureDevSelfSignedTls();

  const { accessToken, refreshToken } = await getTokens();
  if (isJavaBackend()) {
    if (refreshToken) {
      const result = await authFetch("auth/logout", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }), skipRefresh: true });
      if (!result.response.ok) console.warn("[auth/logout] Java logout failed", { status: result.response.status });
    }
    const response = NextResponse.json({ success: true }, { headers: SESSION_SENSITIVE_HEADERS });
    clearAuthCookies(response.cookies);
    return response;
  }

  // Best effort backend logout; cookie clear still proceeds even if backend call fails.
  if (getApiBeUrl() && accessToken) {
    try {
      await AuthApi.logoutByAccessToken(accessToken);
    } catch {
      // ignore backend logout failure in local/dev scenarios
    }
  }

  const response = NextResponse.json({ success: true }, { headers: SESSION_SENSITIVE_HEADERS });
  clearAuthCookies(response.cookies);
  return response;
}
