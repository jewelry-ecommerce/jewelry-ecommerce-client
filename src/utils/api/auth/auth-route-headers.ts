import { getTenantCode } from "@/utils/config/common";

/** Header cho `fetch` browser → Next `/api/auth/*`, khớp `commonAxios` (`x-tenant-code`). */
export function getAuthRouteHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const tenantCode = getTenantCode();
  if (!tenantCode) {
    return extra;
  }
  return { ...extra, "x-tenant-code": tenantCode };
}
