const STORAGE_KEY = "jewelry-recently-viewed-slugs";
const MAX_SLUGS = 12;

function readSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeSlugs(slugs: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs.slice(0, MAX_SLUGS)));
}

export function recordJavaRecentlyViewedSlug(productSlug: string): void {
  const slug = productSlug.trim();
  if (!slug) return;
  writeSlugs([slug, ...readSlugs().filter((item) => item !== slug)]);
}

export function listJavaRecentlyViewedSlugs(excludeSlug?: string): string[] {
  const exclude = excludeSlug?.trim();
  return readSlugs().filter((slug) => slug !== exclude).slice(0, 8);
}
