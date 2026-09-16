export type CdnImageFormat = "webp" | "avif" | "jpg" | "png";

export type CdnImageTransform = {
  width: number;
  height: number;
  quality?: number;
  format?: CdnImageFormat;
};

/**
 * CDN media API rejects transforms larger than the original (`MEDIA_IMAGE_TRANSFORM_INVALID_WIDTH`).
 * Cap request size so CSS×DPR never upscales past typical marketing/product uploads.
 * `CdnImage` falls back to `/original.webp` when a request still exceeds the asset.
 */
export const CDN_IMAGE_MAX_TRANSFORM_WIDTH = 2400;
export const CDN_IMAGE_MAX_TRANSFORM_HEIGHT = 3200;

/**
 * Scale down width/height uniformly so neither exceeds CDN max (keeps aspect ratio).
 * Never upscales.
 */
export function clampCdnImageTransformSize(transform: CdnImageTransform): CdnImageTransform {
  const width = Math.max(1, Math.round(transform.width));
  const height = Math.max(1, Math.round(transform.height));
  const scale = Math.min(1, CDN_IMAGE_MAX_TRANSFORM_WIDTH / width, CDN_IMAGE_MAX_TRANSFORM_HEIGHT / height);

  if (scale >= 1) {
    return width === transform.width && height === transform.height ? transform : { ...transform, width, height };
  }

  return {
    ...transform,
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

const ORIGINAL_SEGMENT = /\/original\.[a-z0-9]+$/i;
const TRANSFORMED_SEGMENT = /\/w\d+_h\d+_q\d+\.[a-z0-9]+$/i;

const DEFAULT_CDN_MEDIA_DOMAINS = ["sevagoretail.jewelry"];

const configuredCdnDomain = process.env.NEXT_PUBLIC_CDN_MEDIA_DOMAIN?.trim().toLowerCase();

function getCdnMediaDomains(): string[] {
  if (configuredCdnDomain) {
    return [configuredCdnDomain];
  }
  return DEFAULT_CDN_MEDIA_DOMAINS;
}

function isLocalOrStaticSrc(src: string): boolean {
  const trimmed = src.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//");
}

function hostBelongsToDomain(hostname: string, domain: string): boolean {
  const host = hostname.toLowerCase();
  const normalizedDomain = domain.toLowerCase();
  return host === normalizedDomain || host.endsWith(`.${normalizedDomain}`);
}

function isCdnMediaHost(hostname: string): boolean {
  return getCdnMediaDomains().some((domain) => hostBelongsToDomain(hostname, domain));
}

export function isCdnTransformableUrl(src: string): boolean {
  const trimmed = src.trim();
  if (!trimmed || isLocalOrStaticSrc(trimmed) || TRANSFORMED_SEGMENT.test(trimmed)) {
    return false;
  }

  if (!ORIGINAL_SEGMENT.test(trimmed)) {
    return false;
  }

  try {
    const url = new URL(trimmed.startsWith("//") ? `https:${trimmed}` : trimmed);
    return isCdnMediaHost(url.hostname);
  } catch {
    return false;
  }
}

function buildCdnTransformFilename(transform: CdnImageTransform): string {
  const { width, height, quality = 95, format = "webp" } = transform;
  return `w${width}_h${height}_q${quality}.${format}`;
}

export function buildCdnImageUrl(src: string, transform: CdnImageTransform): string {
  const trimmed = src.trim();
  if (!trimmed || !isCdnTransformableUrl(trimmed)) {
    return trimmed;
  }

  const safeTransform = clampCdnImageTransformSize(transform);
  return trimmed.replace(ORIGINAL_SEGMENT, `/${buildCdnTransformFilename(safeTransform)}`);
}

/** Force CDN image URL to `/original.webp` (zoom / full-res). Leaves non-CDN and video paths unchanged. */
export function toCdnOriginalWebpUrl(src: string): string {
  const trimmed = src.trim();
  if (!trimmed || trimmed.includes("/video/")) return trimmed;

  if (TRANSFORMED_SEGMENT.test(trimmed)) {
    return trimmed.replace(TRANSFORMED_SEGMENT, "/original.webp");
  }

  if (ORIGINAL_SEGMENT.test(trimmed)) {
    return trimmed.replace(ORIGINAL_SEGMENT, "/original.webp");
  }

  return trimmed;
}

/** Replace an existing CDN transform segment, or apply transform to `/original.*` URLs. */
export function rewriteCdnImageUrlTransform(src: string, transform: CdnImageTransform): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;

  if (trimmed.includes("/video/")) return trimmed;

  const safeTransform = clampCdnImageTransformSize(transform);
  const filename = buildCdnTransformFilename(safeTransform);

  if (TRANSFORMED_SEGMENT.test(trimmed)) {
    return trimmed.replace(TRANSFORMED_SEGMENT, `/${filename}`);
  }

  return buildCdnImageUrl(trimmed, safeTransform);
}
