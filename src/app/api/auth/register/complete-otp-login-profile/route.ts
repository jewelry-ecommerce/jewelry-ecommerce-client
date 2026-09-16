import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AuthApi } from "@/utils/api";
import { CompleteOtpLoginProfileRequest } from "@/utils/api/auth/auth.interface";
import { clearAuthCookies, setAuthCookies } from "@/lib/server/cookies";
import { configureDevSelfSignedTls } from "@/lib/server/tls";
import { SESSION_SENSITIVE_HEADERS } from "@/lib/server/session-response-headers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  configureDevSelfSignedTls();

  const body = (await request.json()) as CompleteOtpLoginProfileRequest;

  if (!body?.profileSetupToken || !body?.firstName || !body?.password) {
    return NextResponse.json(
      { success: false, message: "Thiếu thông tin hoàn tất đăng ký." },
      { status: 400, headers: SESSION_SENSITIVE_HEADERS },
    );
  }

  try {
    const payload = await AuthApi.completeOtpLoginProfile(body);
    const response = NextResponse.json({ success: true, user: payload.user }, { headers: SESSION_SENSITIVE_HEADERS });
    clearAuthCookies(response.cookies);
    setAuthCookies(response.cookies, {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      tokenId: payload.tokenId,
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502;
      const payload = (error.response?.data as { message?: string } | undefined) ?? { message: "Không thể hoàn tất đăng ký" };
      return NextResponse.json(
        { success: false, message: payload.message || "Không thể hoàn tất đăng ký" },
        { status, headers: SESSION_SENSITIVE_HEADERS },
      );
    }
    return NextResponse.json(
      { success: false, message: "Không thể hoàn tất đăng ký" },
      { status: 502, headers: SESSION_SENSITIVE_HEADERS },
    );
  }
}
