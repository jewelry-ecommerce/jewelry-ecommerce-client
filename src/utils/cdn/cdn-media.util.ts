/**
 * Normalize media URLs for display.
 * Matches trading-fe: FE only cleans the URL — no Cloudinary image/fetch wrap.
 * Absolute CDN / Cloudinary / Seva URLs are shown as-is.
 * Relative storefront file paths are absolutized against the Java BE origin when configured.
 */
export function normalizeCdnMediaUrl(src?: string | null): string {
  const trimmed = src?.trim() || "";
  if (!trimmed) return "";
  const cleaned = trimmed.replace(/\s/g, "").replace(/^:/, "https:");
  if (cleaned.startsWith("data:") || cleaned.startsWith("blob:")) {
    return cleaned;
  }
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }
  if (cleaned.startsWith("/api/v1/storefront/files/") || cleaned.startsWith("/storefront/files/")) {
    const origin = resolveMediaOrigin();
    if (!origin) return cleaned;
    const path = cleaned.startsWith("/api/") ? cleaned : `/api/v1${cleaned}`;
    return `${origin}${path}`;
  }
  return cleaned;
}

function resolveMediaOrigin(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_CONTENT_API_URL,
    process.env.NEXT_PUBLIC_API_BE_URL,
    process.env.API_BE_URL,
  ];
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (!trimmed) continue;
    try {
      const url = new URL(trimmed);
      return `${url.protocol}//${url.host}`;
    } catch {
      // ignore invalid env
    }
  }
  return "";
}
