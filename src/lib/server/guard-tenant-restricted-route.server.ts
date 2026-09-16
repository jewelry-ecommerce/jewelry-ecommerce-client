import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { resolveTenantBranding } from "@/lib/server/resolve-tenant-branding.server";
import { isTenantAllowedForRule, TENANT_RESTRICTED_ROUTE_RULES } from "@/utils/config/tenant-restricted-routes.util";

export async function guardTenantRestrictedRoute(routePrefix: string): Promise<void> {
  const rule = TENANT_RESTRICTED_ROUTE_RULES.find((entry) => entry.prefix === routePrefix);
  if (!rule) return;

  const host = (await headers()).get("host");
  const { tenantCode } = resolveTenantBranding(host);

  if (!isTenantAllowedForRule(tenantCode, rule)) notFound();
}
