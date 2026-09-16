import { NextResponse } from "next/server";
import { authFetch, toValidHttpStatus } from "@/lib/server/api-client";
import { clearAuthCookies, setAuthCookies } from "@/lib/server/cookies";
import { SESSION_SENSITIVE_HEADERS } from "@/lib/server/session-response-headers";
import { getApiBeUrl } from "@/utils/config/common";

export const dynamic = "force-dynamic";

const logProfileFailure = (detail: Record<string, unknown>) => {
  console.warn("[auth/me] không lấy được profile → client sẽ bị coi là guest", detail);
};

const resolveMessage = (data: unknown) =>
  data && typeof data === "object" && "message" in data ? (data as { message?: unknown }).message : undefined;

export async function GET() {
  if (!getApiBeUrl()) {
    return NextResponse.json({ success: false, isAuthenticated: false, user: null }, { status: 200, headers: SESSION_SENSITIVE_HEADERS });
  }

  const { response, data, refreshedTokens, isAuthExpired } = await authFetch("iam/customer/profile");

  if (!response.ok) {
    logProfileFailure({
      httpStatus: response.status,
      isAuthExpired: Boolean(isAuthExpired),
      message: resolveMessage(data),
    });

    if (isAuthExpired || response.status === 401) {
      const unauthorizedResponse = NextResponse.json(
        { success: false, isAuthenticated: false, user: null },
        { status: 200, headers: SESSION_SENSITIVE_HEADERS },
      );
      clearAuthCookies(unauthorizedResponse.cookies);
      return unauthorizedResponse;
    }

    return NextResponse.json(data ?? { message: "Unauthorized" }, {
      status: toValidHttpStatus(response.status),
      headers: SESSION_SENSITIVE_HEADERS,
    });
  }

  // BE trả 2xx nhưng body rỗng/không parse được: đừng im lặng coi là guest, vì cookie phiên vẫn hợp lệ.
  if (!data || typeof data !== "object") {
    logProfileFailure({ httpStatus: response.status, reason: "body profile rỗng hoặc không phải JSON object" });
    return NextResponse.json(
      { success: false, message: "Không đọc được profile từ backend" },
      { status: 502, headers: SESSION_SENSITIVE_HEADERS },
    );
  }

  const nextResponse = NextResponse.json({ success: true, user: data }, { headers: SESSION_SENSITIVE_HEADERS });

  if (refreshedTokens?.accessToken && refreshedTokens.refreshToken) {
    setAuthCookies(nextResponse.cookies, refreshedTokens);
  }

  return nextResponse;
}
