import { normalizeCdnMediaUrl } from "./cdn-media.util";

export type ResolveCdnVideoUrlOptions = {
  src?: string | null;
  fallback?: string;
};

export function resolveCdnVideoUrl({ src, fallback }: ResolveCdnVideoUrlOptions): string {
  return normalizeCdnMediaUrl(src) || normalizeCdnMediaUrl(fallback) || "";
}
