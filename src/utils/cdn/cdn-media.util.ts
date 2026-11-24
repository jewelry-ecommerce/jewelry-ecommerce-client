const DEFAULT_CLOUDINARY_CLOUD = "dcvr6sf2";
const CLOUDINARY_FETCH_TRANSFORM = "f_auto,q_auto,w_900";

/** Origin of the Java BE used to absolutize local upload paths like `/api/v1/storefront/files/...`. */
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

function resolveCloudinaryCloudName(): string {
  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    DEFAULT_CLOUDINARY_CLOUD
  );
}

function isStorefrontFileUrl(url: string): boolean {
  return /\/api\/v1\/storefront\/files\//i.test(url) || /\/storefront\/files\//i.test(url);
}

/** Serve BE-hosted files through Cloudinary fetch (auto format/quality, width cap). */
function viaCloudinaryFetch(absoluteUrl: string): string {
  if (!absoluteUrl || absoluteUrl.includes("res.cloudinary.com")) return absoluteUrl;
  if (!isStorefrontFileUrl(absoluteUrl)) return absoluteUrl;
  const cloud = resolveCloudinaryCloudName();
  if (!cloud) return absoluteUrl;
  return `https://res.cloudinary.com/${cloud}/image/fetch/${CLOUDINARY_FETCH_TRANSFORM}/${encodeURIComponent(absoluteUrl)}`;
}

/**
 * Normalize media URLs from CMS/catalog.
 * Relative storefront file paths must point at the Java BE, not the Next.js origin
 * (otherwise Vercel returns HTML and images appear broken).
 * Absolute BE file URLs are rewritten through Cloudinary fetch for light/fast CDN delivery.
 */
export function normalizeCdnMediaUrl(src?: string | null): string {
  const trimmed = src?.trim() || "";
  if (!trimmed) return "";
  const cleaned = trimmed.replace(/\s/g, "").replace(/^:/, "https:");
  if (cleaned.startsWith("data:") || cleaned.startsWith("blob:")) {
    return cleaned;
  }
  if (/^https?:\/\//i.test(cleaned)) {
    return viaCloudinaryFetch(cleaned);
  }
  if (cleaned.startsWith("/api/v1/storefront/files/") || cleaned.startsWith("/storefront/files/")) {
    const origin = resolveMediaOrigin();
    if (!origin) return cleaned;
    const path = cleaned.startsWith("/api/") ? cleaned : `/api/v1${cleaned}`;
    return viaCloudinaryFetch(`${origin}${path}`);
  }
  return cleaned;
}
