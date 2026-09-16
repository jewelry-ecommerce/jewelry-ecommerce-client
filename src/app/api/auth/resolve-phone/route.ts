import { NextRequest, NextResponse } from "next/server";
import { getApiBeUrl } from "@/utils/config/common";
import { configureDevSelfSignedTls } from "@/lib/server/tls";
import { SESSION_SENSITIVE_HEADERS } from "@/lib/server/session-response-headers";
import { AuthApi } from "@/utils/api";

export const dynamic = "force-dynamic";

type ResolveBody = { phone?: string; recaptchaToken?: string };
type ResolveFlow = "PASSWORD" | "OTP";

const toObject = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;
const normalizeUpper = (value: unknown): string | null => (typeof value === "string" ? value.trim().toUpperCase() : null) as string | null;

/**
 * Map response `check-phone` → flow nội bộ:
 * - true/existed/registered -> PASSWORD
 * - false/not existed/new   -> REGISTER_OTP
 * Fallback an toàn: PASSWORD
 */
const mapCheckPhoneToFlow = (payload: unknown): ResolveFlow => {
  const root = toObject(payload);
  if (!root) return "PASSWORD";

  const candidates: unknown[] = [root, root.data, root.result].filter(Boolean);

  for (const candidate of candidates) {
    const obj = toObject(candidate);
    if (!obj) continue;

    // Trường hợp BE trả trực tiếp flow
    const flow = normalizeUpper(obj.flow);
    if (flow === "OTP" || flow === "PASSWORD") {
      return flow;
    }

    const existedFlags = [
      obj.exists,
      obj.existed,
      obj.isExists,
      obj.isExisted,
      obj.registered,
      obj.isRegistered,
      obj.hasCustomer,
      obj.hasAccount,
      obj.isExistingCustomer,
    ];
    const hasBooleanExistFlag = existedFlags.find((v) => typeof v === "boolean") as boolean | undefined;
    if (typeof hasBooleanExistFlag === "boolean") {
      return hasBooleanExistFlag ? "PASSWORD" : "OTP";
    }

    const needRegister = obj.needRegister ?? obj.shouldRegister ?? obj.isNewCustomer;
    if (typeof needRegister === "boolean") {
      return needRegister ? "OTP" : "PASSWORD";
    }
  }

  return "PASSWORD";
};

export async function POST(request: NextRequest) {
  configureDevSelfSignedTls();
  const body = (await request.json()) as ResolveBody;
  const phone = body.phone?.trim();
  const recaptchaToken = body.recaptchaToken?.trim();
  if (!phone) {
    return NextResponse.json({ message: "Thiếu số điện thoại" }, { status: 400, headers: SESSION_SENSITIVE_HEADERS });
  }
  if (!recaptchaToken) {
    return NextResponse.json({ message: "Thiếu mã xác thực bảo mật (reCAPTCHA)" }, { status: 400, headers: SESSION_SENSITIVE_HEADERS });
  }

  if (!getApiBeUrl()) {
    return NextResponse.json({ flow: "PASSWORD" as const }, { headers: SESSION_SENSITIVE_HEADERS });
  }

  try {
    const data = await AuthApi.checkPhone({ phone, recaptchaToken });
    const flow = mapCheckPhoneToFlow(data);
    return NextResponse.json({ flow }, { headers: SESSION_SENSITIVE_HEADERS });
  } catch (e: any) {
    const upstreamStatus = Number(e?.response?.status);
    const status = upstreamStatus >= 400 && upstreamStatus < 600 ? upstreamStatus : 502;
    const upstreamData = e?.response?.data;
    const rawMessage = upstreamData?.message ?? e?.message;
    const message = Array.isArray(rawMessage)
      ? String(rawMessage[0] || "Không kiểm tra được số điện thoại hiện tại")
      : String(rawMessage || "Không kiểm tra được số điện thoại");

    return NextResponse.json({ error: true, message }, { status, headers: SESSION_SENSITIVE_HEADERS });
  }
}
