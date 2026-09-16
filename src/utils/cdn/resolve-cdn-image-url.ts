import { MediaType } from "@/utils/api/banner/banner.enum";
import { getMediaType } from "@/utils/helpers/common/common.helpers";
import { rewriteCdnImageUrlTransform, type CdnImageTransform } from "./cdn-image.util";
import type { CdnImageKind } from "./cdn-media.types";
import { normalizeCdnMediaUrl } from "./cdn-media.util";
import { CDN_IMAGE_PRESETS } from "./cdn-image.presets";

export type CdnImagePreset = keyof typeof CDN_IMAGE_PRESETS;

const EXISTING_TRANSFORM_SEGMENT = /\/w\d+_h\d+_q\d+\.[a-z0-9]+$/i;

export type ResolveCdnImageUrlOptions = {
  src?: string | null;
  preset?: CdnImagePreset;
  transform?: CdnImageTransform;
  fallback?: string;
  /** Raster transform (webp/resize). Default `IMAGE`. Use `GIF` to keep animated original. */
  kind?: CdnImageKind;
  mediaType?: MediaType;
};

function resolveCdnImageKind(kind: CdnImageKind | undefined, mediaType: MediaType | undefined, src: string): CdnImageKind {
  if (kind) return kind;
  if (mediaType === MediaType.GIF) return MediaType.GIF;
  if (getMediaType(src) === MediaType.GIF) return MediaType.GIF;
  return MediaType.IMAGE;
}

export function resolveCdnImageUrl({ src, preset, transform, fallback = "", kind, mediaType }: ResolveCdnImageUrlOptions): string {
  const raw = normalizeCdnMediaUrl(src) || normalizeCdnMediaUrl(fallback);
  const resolvedKind = resolveCdnImageKind(kind, mediaType, raw);
  const resolvedMediaType = mediaType ?? getMediaType(raw);

  if (resolvedKind === MediaType.GIF || resolvedMediaType === MediaType.VIDEO) {
    return raw;
  }

  // Explicit transform always wins (caller chose exact size).
  if (transform) {
    return rewriteCdnImageUrlTransform(raw, transform);
  }

  // Already resized (e.g. normalize* × retina) — do not downgrade with a CSS preset.
  if (EXISTING_TRANSFORM_SEGMENT.test(raw)) {
    return raw;
  }

  const resolvedTransform = preset ? CDN_IMAGE_PRESETS[preset] : undefined;
  if (!resolvedTransform) {
    return raw;
  }

  return rewriteCdnImageUrlTransform(raw, resolvedTransform);
}
