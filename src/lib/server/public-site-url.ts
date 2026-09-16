const DEVELOPMENT_FALLBACK_URL = "http://localhost:3000";

/** Hosts that must never be used as the public SEO origin (gateway, internal DNS). */
const NON_PUBLIC_SITE_HOST_FRAGMENTS = ["trading-gateway-internal"] as const;

const isNonPublicSiteHost = (hostname: string): boolean => NON_PUBLIC_SITE_HOST_FRAGMENTS.some((fragment) => hostname.includes(fragment));

const normalizeSiteUrl = (raw: string): string => {
  const trimmed = raw.trim().replace(/\/$/, "");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  return `${parsed.protocol}//${parsed.host}`;
};

/**
 * Public storefront origin for SEO (canonical, sitemap, robots, OG).
 * Set `NEXT_PUBLIC_SITE_URL` per environment — bake lúc `docker build` (GitHub `vars`).
 */
export const resolvePublicSiteUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      console.error("[SEO] Set NEXT_PUBLIC_SITE_URL to the public HTTPS storefront origin (GitHub Environment + docker build).");
    }
    return DEVELOPMENT_FALLBACK_URL;
  }

  try {
    const normalized = normalizeSiteUrl(raw);
    const host = new URL(normalized).hostname;
    if (isNonPublicSiteHost(host)) {
      console.warn(`[SEO] Ignoring non-public site URL "${normalized}" — set NEXT_PUBLIC_SITE_URL to the storefront HTTPS origin.`);
      return DEVELOPMENT_FALLBACK_URL;
    }
    return normalized;
  } catch {
    console.warn(`[SEO] Invalid NEXT_PUBLIC_SITE_URL "${raw}".`);
    return DEVELOPMENT_FALLBACK_URL;
  }
};
