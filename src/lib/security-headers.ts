import { NextResponse } from "next/server";

/** SEVA-32 / SEVA-33 — security headers for storefront responses (CSP deferred). */
export const SECURITY_RESPONSE_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

export function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_RESPONSE_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}
