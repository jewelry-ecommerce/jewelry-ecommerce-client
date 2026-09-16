export const normalizeCmsPageBasePath = (value: string | null | undefined, fallback = "/"): string => {
  const rawValue = value?.trim();
  if (!rawValue) {
    return fallback;
  }

  const pathOnly = rawValue.split("?")[0].split("#")[0];
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || fallback;
};

export const extractScopedCategorySlug = (pathname: string | null | undefined, basePath: string | null | undefined): string | null => {
  const normalizedPathname = normalizeCmsPageBasePath(pathname, "");
  const normalizedBasePath = normalizeCmsPageBasePath(basePath, "");

  if (!normalizedPathname || !normalizedBasePath || normalizedPathname === normalizedBasePath) {
    return null;
  }

  if (!normalizedPathname.startsWith(`${normalizedBasePath}/`)) {
    return null;
  }

  const remainder = normalizedPathname.slice(normalizedBasePath.length).replace(/^\/+/, "");
  if (!remainder) {
    return null;
  }

  const segments = remainder
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .filter(Boolean);

  return segments.at(-1) || null;
};

export const extractScopedCategoryPathSlugs = (pathname: string | null | undefined, basePath: string | null | undefined): string[] => {
  const normalizedPathname = normalizeCmsPageBasePath(pathname, "");
  const normalizedBasePath = normalizeCmsPageBasePath(basePath, "");

  if (!normalizedPathname || !normalizedBasePath || normalizedPathname === normalizedBasePath) {
    return [];
  }

  if (!normalizedPathname.startsWith(`${normalizedBasePath}/`)) {
    return [];
  }

  const remainder = normalizedPathname.slice(normalizedBasePath.length).replace(/^\/+/, "");
  if (!remainder) {
    return [];
  }

  return remainder
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .filter(Boolean);
};
