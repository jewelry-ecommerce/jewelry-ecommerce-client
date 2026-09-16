import { resolvePublicSiteUrl } from "@/lib/server/public-site-url";

export type CanonicalPath = `/${string}` | "/";

/**
 * Always emit canonical URLs on the public site origin (`NEXT_PUBLIC_SITE_URL`).
 * Rewrites CMS/backend hosts (e.g. trading-gateway-internal) and mismatched schemes.
 */
export function normalizeCanonicalUrl(url?: string | null, path: CanonicalPath = "/", siteUrl: string = resolvePublicSiteUrl()): string {
  const fallback = path === "/" ? siteUrl : `${siteUrl}${path}`;
  const trimmed = url?.trim();
  if (!trimmed) return fallback;

  try {
    const parsed = /^https?:\/\//i.test(trimmed) ? new URL(trimmed) : new URL(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, siteUrl);

    return `${siteUrl}${parsed.pathname}${parsed.search}`;
  } catch {
    return fallback;
  }
}
