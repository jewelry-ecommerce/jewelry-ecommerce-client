/** Tenant từ env container — đọc mỗi request, không bake qua next.config.js `env`. */
export function getRuntimeTenantCode(): string | undefined {
  const v = process.env.TENANT_CODE?.trim();
  return v || undefined;
}

export function addTenantToHeaders(headers: Record<string, string>): Record<string, string> {
  const tenantCode = getRuntimeTenantCode();
  if (!tenantCode) {
    return headers;
  }
  return { ...headers, "x-tenant-code": tenantCode };
}
