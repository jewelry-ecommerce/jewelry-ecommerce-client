import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { LoginResponse } from "@/utils/api/auth/auth.interface";
import { clearAuthCookies, setAuthCookies } from "@/lib/server/cookies";
import { configureDevSelfSignedTls } from "@/lib/server/tls";
import { getApiBeUrl } from "@/utils/config/common";
import { SESSION_SENSITIVE_HEADERS } from "@/lib/server/session-response-headers";
import { AuthApi } from "@/utils/api";

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
