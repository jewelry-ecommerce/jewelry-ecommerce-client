import { NextRequest, NextResponse } from "next/server";
import { authFetch, toValidHttpStatus } from "@/lib/server/api-client";
import { clearAuthCookies, setAuthCookies } from "@/lib/server/cookies";
import { SESSION_SENSITIVE_HEADERS } from "@/lib/server/session-response-headers";
import { isSameOriginRequest } from "@/lib/server/same-origin.util";
import { isJavaBackend, javaApiPath } from "@/utils/config/java-backend.config";

export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ path: string[] }> };

function resolvePath(segments: string[]): string | null {
  if (segments.some(segment => !/^[a-zA-Z0-9_-]+$/.test(segment))) return null;
  const path = javaApiPath(segments.join("/"));
  return path.startsWith("storefront/") && !path.startsWith("storefront/auth/") ? path : null;
}

function forwardedHeaders(request: NextRequest): Headers {
  const headers = new Headers({ Accept: "application/json" });
  for (const name of ["Content-Type", "X-Guest-Cart-Id", "x-guest-id", "Language", "Idempotency-Key"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

function invalidRequest(request: NextRequest, path: string | null): NextResponse | null {
  if (!isJavaBackend()) return NextResponse.json({ code: "JAVA_DISABLED", message: "Java provider is disabled." }, { status: 404 });
  if (!path) return NextResponse.json({ code: "UNSUPPORTED_API", message: "API chưa được nối với Java." }, { status: 404 });
  if (request.method === "GET") return null;
  const origin = request.headers.get("origin");
  if (!isSameOriginRequest(origin, request.headers.get("host"), request.nextUrl.protocol))
    return NextResponse.json({ code: "INVALID_ORIGIN", message: "Request origin is not allowed." }, { status: 403 });
  return null;
}

async function forward(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const path = resolvePath((await context.params).path);
  const invalid = invalidRequest(request, path);
  if (invalid) return invalid;
  const body = request.method === "GET" ? undefined : await request.text();
  const result = await authFetch(path + request.nextUrl.search, {
    method: request.method, headers: forwardedHeaders(request), body: body || undefined
  });
  const status = toValidHttpStatus(result.response.status);
  const response = status === 204 ? new NextResponse(null, { status, headers: SESSION_SENSITIVE_HEADERS })
    : NextResponse.json(result.data, { status, headers: SESSION_SENSITIVE_HEADERS });
  if (result.isAuthExpired) clearAuthCookies(response.cookies);
  else if (result.refreshedTokens) setAuthCookies(response.cookies, result.refreshedTokens);
  return response;
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
