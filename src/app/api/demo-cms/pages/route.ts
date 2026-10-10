import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { readCmsDemoPages } from "@/mock-api/cms-demo/cms-demo.repository";
import { CmsDemoError, saveCmsDemoPage } from "@/mock-api/cms-demo/cms-demo.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
function requireLocalDemo(request: NextRequest): void {
  if (process.env.NODE_ENV !== "development" || !LOCAL_HOSTS.has(request.nextUrl.hostname)) {
    throw new CmsDemoError("DEMO_DISABLED", "CMS mock chỉ dùng cho demo local.", 403);
  }
  const origin = request.headers.get("origin");
  if (origin && !LOCAL_HOSTS.has(new URL(origin).hostname)) {
    throw new CmsDemoError("DEMO_ORIGIN_DENIED", "Origin không được phép dùng CMS mock.", 403);
  }
}
function errorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) return NextResponse.json({ code: "INVALID_CMS_PAGE", message: error.issues[0]?.message }, { status: 422 });
  if (error instanceof CmsDemoError) return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
  return NextResponse.json(
    { code: "CMS_STORE_FAILED", message: "Không thể đọc/lưu CMS mock. Kiểm tra quyền thư mục .demo-data." },
    { status: 500 },
  );
}
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    requireLocalDemo(request);
    return NextResponse.json(await readCmsDemoPages(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    requireLocalDemo(request);
    return NextResponse.json(await saveCmsDemoPage(await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
}
