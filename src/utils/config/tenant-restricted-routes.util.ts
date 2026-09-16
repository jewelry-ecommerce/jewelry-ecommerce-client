import { getTenantLastSegment, normalizeTenantCode, resolveTenantCodeFromHost } from "@/utils/config/tenant-branding.util";

export interface TenantRestrictedRouteRule {
  /** Prefix route, vd. "/atsh" — khớp exact hoặc nested (/atsh/singer/...) */
  prefix: string;
  /** Tenant được phép — full code hoặc segment (b1, SEVA-RETAIL-B1) */
  allowedTenantCodes: readonly string[];
}

const HEARTLOCK_ALLOWED_TENANT_CODES = ["SEVA-RETAIL-B1", "b1", "heartlock"] as const;

export const TENANT_RESTRICTED_ROUTE_RULES: readonly TenantRestrictedRouteRule[] = [
  {
    prefix: "/atsh",
    allowedTenantCodes: HEARTLOCK_ALLOWED_TENANT_CODES,
  },
  {
    prefix: "/bst-collab-tinhhasayhi",
    allowedTenantCodes: HEARTLOCK_ALLOWED_TENANT_CODES,
  },
  {
    prefix: "/sets",
    allowedTenantCodes: HEARTLOCK_ALLOWED_TENANT_CODES,
  },
];

export function resolveRequestTenantCode(host?: string | null): string | null {
  const fromEnv = process.env.TENANT_CODE?.trim();
  if (fromEnv) return fromEnv;
  return resolveTenantCodeFromHost(host);
}

export function matchesPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function findRestrictedRouteRule(pathname: string): TenantRestrictedRouteRule | undefined {
  return TENANT_RESTRICTED_ROUTE_RULES.find((rule) => matchesPathPrefix(pathname, rule.prefix));
}

export function isTenantAllowedForRule(tenantCode: string | null | undefined, rule: TenantRestrictedRouteRule): boolean {
  const code = tenantCode?.trim();
  if (!code) return false;

  const normalizedTenant = normalizeTenantCode(code);
  const lastSegment = getTenantLastSegment(code);

  return rule.allowedTenantCodes.some((allowed) => {
    const normalizedAllowed = normalizeTenantCode(allowed);
    if (normalizedTenant === normalizedAllowed) return true;

    const allowedSegment = getTenantLastSegment(allowed) ?? allowed.trim().toLowerCase();
    return lastSegment != null && lastSegment === allowedSegment;
  });
}

export function isPathAllowedForTenant(pathname: string, tenantCode: string | null | undefined): boolean {
  const rule = findRestrictedRouteRule(pathname);
  if (!rule) return true;
  return isTenantAllowedForRule(tenantCode, rule);
}
