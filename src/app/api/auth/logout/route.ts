import { NextResponse } from "next/server";
import { getApiBeUrl } from "@/utils/config/common";
import { clearAuthCookies, getTokens } from "@/lib/server/cookies";
import { configureDevSelfSignedTls } from "@/lib/server/tls";
import { SESSION_SENSITIVE_HEADERS } from "@/lib/server/session-response-headers";
import { AuthApi } from "@/utils/api";

export const dynamic = "force-dynamic";

export async function POST() {
  configureDevSelfSignedTls();

  const { accessToken } = await getTokens();

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
