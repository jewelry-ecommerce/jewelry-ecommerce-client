import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { VerifyOtpRegisterRequest } from "@/utils/api/auth/auth.interface";
import { clearAuthCookies, setAuthCookies } from "@/lib/server/cookies";
import { configureDevSelfSignedTls } from "@/lib/server/tls";
import { SESSION_SENSITIVE_HEADERS } from "@/lib/server/session-response-headers";
import { AuthApi } from "@/utils/api";
import { OTP_VERIFY_FAILED_MESSAGE } from "@/utils/constants/otp-message.constant";
import { isJavaBackend } from "@/utils/config/java-backend.config";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  configureDevSelfSignedTls();

  const body = (await request.json()) as VerifyOtpRegisterRequest & { phone?: string };

  try {
    if (isJavaBackend()) {
      if (!body.phone || !body.otp) return NextResponse.json({ success: false, message: "Thiếu số điện thoại/OTP." }, { status: 400, headers: SESSION_SENSITIVE_HEADERS });
      const payload = await AuthApi.verifyOtpRegisterPrecheck({ phone: body.phone, otp: body.otp });
      return NextResponse.json(payload, { headers: SESSION_SENSITIVE_HEADERS });
    }
    const payload = await AuthApi.verifyOtpRegister(body);
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
      const payload = (error.response?.data as { message?: string } | undefined) ?? { message: OTP_VERIFY_FAILED_MESSAGE };
      return NextResponse.json(payload, { status, headers: SESSION_SENSITIVE_HEADERS });
    }
    return NextResponse.json({ message: OTP_VERIFY_FAILED_MESSAGE }, { status: 502, headers: SESSION_SENSITIVE_HEADERS });
  }
}
