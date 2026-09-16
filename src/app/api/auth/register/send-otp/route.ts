import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AuthApi } from "@/utils/api";
import { SendOtpRegisterRequest } from "@/utils/api/auth/auth.interface";
import { OTP_SEND_FAILED_SHORT_MESSAGE } from "@/utils/constants/otp-message.constant";
import { configureDevSelfSignedTls } from "@/lib/server/tls";
import { getErrorMessage, toUserFacingApiMessage } from "@/utils/helpers/axios/axios.helpers";

export async function POST(request: NextRequest) {
  configureDevSelfSignedTls();

  let body: SendOtpRegisterRequest;
  try {
    body = (await request.json()) as SendOtpRegisterRequest;
  } catch {
    return NextResponse.json({ success: false, message: "Dữ liệu yêu cầu không hợp lệ" }, { status: 400 });
  }

  try {
    const payload = await AuthApi.sendOtpRegister(body);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502;
      const data = error.response?.data;
      let rawMsg = "";
      if (typeof data === "object" && data !== null && "message" in data && typeof (data as { message: unknown }).message === "string") {
        rawMsg = (data as { message: string }).message;
      } else if (typeof data === "string" && !data.trim().startsWith("<")) {
        rawMsg = data;
      }
      const message = toUserFacingApiMessage(rawMsg || OTP_SEND_FAILED_SHORT_MESSAGE, status);
      return NextResponse.json({ success: false, statusCode: status, message }, { status });
    }
    const message = getErrorMessage(error) || OTP_SEND_FAILED_SHORT_MESSAGE;
    return NextResponse.json({ success: false, statusCode: 502, message }, { status: 502 });
  }
}
