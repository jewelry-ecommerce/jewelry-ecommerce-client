import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { LoginResponse } from "@/utils/api/auth/auth.interface";
import { clearAuthCookies, setAuthCookies } from "@/lib/server/cookies";
import { configureDevSelfSignedTls } from "@/lib/server/tls";
import { getApiBeUrl } from "@/utils/config/common";
import { SESSION_SENSITIVE_HEADERS } from "@/lib/server/session-response-headers";
import { AuthApi } from "@/utils/api";
import { IS_JEWELRY_DEMO_MODE } from "@/mock-api/demo-mode";
import { DEMO_AUTH_COOKIE_NAME, DEMO_AUTH_COOKIE_VALUE, DEMO_CUSTOMER, isDemoCredential } from "@/mock-api/demo-account";

export const dynamic = "force-dynamic";

type LoginBody = {
  phone?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  configureDevSelfSignedTls();

  const body = (await request.json()) as LoginBody;

  if (!body.phone || !body.password) {
    return NextResponse.json({ message: "Thiếu thông tin đăng nhập." }, { status: 400, headers: SESSION_SENSITIVE_HEADERS });
  }

  if (IS_JEWELRY_DEMO_MODE) {
    if (!isDemoCredential(body.phone, body.password)) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu demo không đúng." },
        { status: 401, headers: SESSION_SENSITIVE_HEADERS },
      );
    }
    const response = NextResponse.json({ success: true, user: DEMO_CUSTOMER }, { headers: SESSION_SENSITIVE_HEADERS });
    response.cookies.set(DEMO_AUTH_COOKIE_NAME, DEMO_AUTH_COOKIE_VALUE, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  if (!getApiBeUrl()) {
    return NextResponse.json({ message: "Missing API_BE_URL configuration" }, { status: 500, headers: SESSION_SENSITIVE_HEADERS });
  }

  try {
    const successPayload = (await AuthApi.login({ phone: body.phone, password: body.password })) as LoginResponse;
    if (!successPayload?.accessToken || !successPayload?.refreshToken || !successPayload?.user) {
      return NextResponse.json({ message: "Invalid backend response" }, { status: 502, headers: SESSION_SENSITIVE_HEADERS });
    }
    const response = NextResponse.json({ success: true, user: successPayload.user }, { headers: SESSION_SENSITIVE_HEADERS });
    clearAuthCookies(response.cookies);
    setAuthCookies(response.cookies, {
      accessToken: successPayload.accessToken,
      refreshToken: successPayload.refreshToken,
      tokenId: successPayload.tokenId,
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const payload = (error.response?.data as { message?: string } | undefined) ?? { message: "Đăng nhập thất bại" };
      return NextResponse.json(payload, { status, headers: SESSION_SENSITIVE_HEADERS });
    }
    return NextResponse.json({ message: "Đăng nhập thất bại" }, { status: 500, headers: SESSION_SENSITIVE_HEADERS });
  }
}
