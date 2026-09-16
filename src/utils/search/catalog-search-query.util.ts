export function normalizeCatalogSearchQuery(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  const withoutSlashRuns = trimmed.replace(/\/{2,}/g, " ");

  return withoutSlashRuns
    .split(/\s+/)
    .filter((token) => token.replace(/\//g, "").length > 0)
    .join(" ")
    .trim();
}
