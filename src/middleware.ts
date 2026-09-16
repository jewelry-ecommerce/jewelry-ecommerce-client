import { NextRequest, NextResponse } from "next/server";
import { VIETNAMESE_ROUTE_MAP } from "@/lib/seo/app-routes";
import { withSecurityHeaders } from "@/lib/security-headers";
import { findRestrictedRouteRule, isTenantAllowedForRule, resolveRequestTenantCode } from "@/utils/config/tenant-restricted-routes.util";

const vietnameseRoutes: Record<string, string> = {
  ...VIETNAMESE_ROUTE_MAP,
  "/transaction-email": "/email-giao-dich",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const restrictedRouteRule = findRestrictedRouteRule(pathname);
  if (restrictedRouteRule) {
    const tenantCode = resolveRequestTenantCode(request.headers.get("host"));
    if (!isTenantAllowedForRule(tenantCode, restrictedRouteRule)) {
      return withSecurityHeaders(NextResponse.rewrite(new URL("/404", request.url)));
    }
  }

  // Rewrite English URLs → Vietnamese folders
  if (vietnameseRoutes[pathname]) {
    return withSecurityHeaders(NextResponse.rewrite(new URL(vietnameseRoutes[pathname], request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
