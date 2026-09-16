import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AuthApi } from "@/utils/api";
import { ResetPasswordRequest } from "@/utils/api/auth/auth.interface";
import { clearAuthCookies, setAuthCookies } from "@/lib/server/cookies";
import { configureDevSelfSignedTls } from "@/lib/server/tls";
import { SESSION_SENSITIVE_HEADERS } from "@/lib/server/session-response-headers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  configureDevSelfSignedTls();

  const body = (await request.json()) as ResetPasswordRequest;

  if (!body?.resetToken || !body?.newPassword) {
    return NextResponse.json(
      { success: false, message: "Thiếu thông tin đặt lại mật khẩu." },
      { status: 400, headers: SESSION_SENSITIVE_HEADERS },
    );
  }

  try {
    const payload = await AuthApi.resetPassword(body);

    const response = NextResponse.json(
      {
        success: payload.success === true,
        message: payload.message,
        user: payload?.user,
      },
      { headers: SESSION_SENSITIVE_HEADERS },
    );
    if (payload.success && payload.accessToken && payload.refreshToken && payload.tokenId) {
      clearAuthCookies(response.cookies);
      setAuthCookies(response.cookies, {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        tokenId: payload?.tokenId,
      });
    }

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const payload = (error.response?.data as { message?: string } | undefined) ?? { message: "Đặt lại mật khẩu thất bại" };
      return NextResponse.json(
        { success: false, message: payload.message || "Đặt lại mật khẩu thất bại" },
        { status, headers: SESSION_SENSITIVE_HEADERS },
      );
    }

    return NextResponse.json({ success: false, message: "Đặt lại mật khẩu thất bại" }, { status: 500, headers: SESSION_SENSITIVE_HEADERS });
  }
}
