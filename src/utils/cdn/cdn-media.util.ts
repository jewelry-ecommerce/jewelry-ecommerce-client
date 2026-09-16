export function normalizeCdnMediaUrl(src?: string | null): string {
  const trimmed = src?.trim() || "";
  if (!trimmed) return "";
  return trimmed.replace(/\s/g, "").replace(/^:/, "https:");
}
