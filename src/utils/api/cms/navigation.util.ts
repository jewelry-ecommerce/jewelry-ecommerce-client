import type { StorefrontNavigationItem } from "./cms.interface";

const FILTER_NAVIGATION_FALLBACK_PATH = "/";

export const isExternalNavigationHref = (href: string): boolean => /^https?:\/\//i.test(href);

const appendQueryParams = (url: string, queryParams?: Record<string, unknown> | null): string => {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return url;
  }

  const [base, hash = ""] = url.split("#");
  const [path, search = ""] = base.split("?");
  const params = new URLSearchParams(search);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null || typeof value === "object") {
      return;
    }
    params.set(key, String(value));
  });

  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
};

export const normalizeNavigationPath = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value, "http://local");
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return value.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  }
};

export const getNavigationCategoryId = (item: StorefrontNavigationItem): string | null => {
  if (item.linkTarget.kind === "category") {
    return item.linkTarget.targetId;
  }
  if (item.type === "CATEGORY") {
    return item.targetId;
  }
  return null;
};

export const buildNavigationHref = (item: StorefrontNavigationItem): string | null => {
  if (item.url) {
    return appendQueryParams(item.url, item.queryParams);
  }

  switch (item.linkTarget.kind) {
    case "category": {
      if (item.linkTarget.url) {
        return appendQueryParams(item.linkTarget.url, item.linkTarget.queryParams);
      }
      return null;
    }
    case "page":
      return item.linkTarget.url ? appendQueryParams(item.linkTarget.url, item.linkTarget.queryParams) : null;
    case "url":
      return appendQueryParams(item.linkTarget.url, item.linkTarget.queryParams);
    case "filter":
      return appendQueryParams(FILTER_NAVIGATION_FALLBACK_PATH, item.linkTarget.queryParams);
    default:
      return null;
  }
};

const getHrefSuffix = (href: string): string => {
  try {
    const url = new URL(href, "http://local");
    return `${url.search}${url.hash}`;
  } catch {
    const suffixStart = href.search(/[?#]/);
    return suffixStart >= 0 ? href.slice(suffixStart) : "";
  }
};

const inferSourceBasePathFromPath = (path: string): string => {
  const firstSegment = path.split("/").filter(Boolean)[0];
  return firstSegment ? `/${firstSegment}` : "";
};

export const getNavigationRelativePath = (item: StorefrontNavigationItem, sourceBasePath?: string | null): string | null => {
  const href = buildNavigationHref(item);
  if (!href || isExternalNavigationHref(href)) {
    return null;
  }

  const itemPath = normalizeNavigationPath(href);
  if (!itemPath || itemPath === "/") {
    return "";
  }

  const normalizedSourceBasePath = normalizeNavigationPath(sourceBasePath) || inferSourceBasePathFromPath(itemPath);
  if (normalizedSourceBasePath && (itemPath === normalizedSourceBasePath || itemPath.startsWith(`${normalizedSourceBasePath}/`))) {
    return itemPath.slice(normalizedSourceBasePath.length).replace(/^\/+/, "");
  }

  return null;
};

export const buildScopedNavigationHref = (
  item: StorefrontNavigationItem,
  basePath?: string | null,
  sourceBasePath?: string | null,
): string | null => {
  const href = buildNavigationHref(item);
  if (!href || !basePath || isExternalNavigationHref(href)) {
    return href;
  }

  const normalizedBasePath = normalizeNavigationPath(basePath);
  if (!normalizedBasePath) {
    return href;
  }

  const relativePath = getNavigationRelativePath(item, sourceBasePath);
  if (relativePath === null) {
    return href;
  }

  const itemPath = normalizeNavigationPath(href);
  if (!relativePath && itemPath !== normalizedBasePath) {
    return href;
  }

  const scopedPath = relativePath ? `${normalizedBasePath}/${relativePath}` : normalizedBasePath;
  return `${scopedPath}${getHrefSuffix(href)}`;
};

export const getNavigationSlugFromHref = (item: StorefrontNavigationItem): string | null => {
  const href = buildNavigationHref(item);
  const path = normalizeNavigationPath(href);
  if (!path || path === "/") {
    return null;
  }

  const segments = path
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .filter(Boolean);

  return segments[segments.length - 1] || null;
};

export const flattenNavigationItems = (items: StorefrontNavigationItem[]): StorefrontNavigationItem[] =>
  items.flatMap((item) => [item, ...flattenNavigationItems(item.children || [])]);

export const findNavigationPathByHref = (
  items: StorefrontNavigationItem[],
  pathname: string | null | undefined,
  path: StorefrontNavigationItem[] = [],
): StorefrontNavigationItem[] | null => {
  const normalizedPathname = normalizeNavigationPath(pathname);
  if (!normalizedPathname) {
    return null;
  }

  for (const item of items) {
    const nextPath = [...path, item];
    const itemPath = normalizeNavigationPath(buildNavigationHref(item));

    if (itemPath && itemPath === normalizedPathname) {
      return nextPath;
    }

    const childPath = findNavigationPathByHref(item.children || [], pathname, nextPath);
    if (childPath) {
      return childPath;
    }
  }

  return null;
};

export const findNavigationPathByScopedHref = (
  items: StorefrontNavigationItem[],
  pathname: string | null | undefined,
  basePath: string | null | undefined,
  sourceBasePath?: string | null,
  path: StorefrontNavigationItem[] = [],
): StorefrontNavigationItem[] | null => {
  const normalizedPathname = normalizeNavigationPath(pathname);
  if (!normalizedPathname || !basePath) {
    return null;
  }

  for (const item of items) {
    const nextPath = [...path, item];
    const itemPath = normalizeNavigationPath(buildScopedNavigationHref(item, basePath, sourceBasePath));

    if (itemPath && itemPath === normalizedPathname) {
      return nextPath;
    }

    const childPath = findNavigationPathByScopedHref(item.children || [], pathname, basePath, sourceBasePath, nextPath);
    if (childPath) {
      return childPath;
    }
  }

  return null;
};

export const findNavigationItemByHref = (
  items: StorefrontNavigationItem[],
  pathname: string | null | undefined,
): StorefrontNavigationItem | null => findNavigationPathByHref(items, pathname)?.at(-1) ?? null;

export const findNavigationItemById = (
  items: StorefrontNavigationItem[],
  id: string | null | undefined,
): StorefrontNavigationItem | null => {
  if (!id) {
    return null;
  }

  for (const item of items) {
    if (item.id === id) {
      return item;
    }

    const child = findNavigationItemById(item.children || [], id);
    if (child) {
      return child;
    }
  }

  return null;
};

const doesNavigationPathMatchPathname = (
  path: StorefrontNavigationItem[] | null | undefined,
  pathname: string | null | undefined,
  pageBasePath?: string | null,
  sourceNavigationBasePath?: string | null,
): boolean => {
  if (!path?.length) {
    return false;
  }

  const leaf = path.at(-1)!;
  const href =
    pageBasePath != null
      ? (buildScopedNavigationHref(leaf, pageBasePath, sourceNavigationBasePath) ?? buildNavigationHref(leaf))
      : buildNavigationHref(leaf);

  return normalizeNavigationPath(href) === normalizeNavigationPath(pathname);
};

type ResolveStorefrontNavigationPathInput = {
  menuItems: StorefrontNavigationItem[];
  plpRailItems: StorefrontNavigationItem[];
  pathname: string | null | undefined;
  pageBasePath?: string | null;
  sourceNavigationBasePath?: string | null;
};

/** Menu tree hides showOnMenuPopup=false nodes; PLP rail keeps them — fallback when URL does not match menu leaf. */
export const resolveStorefrontNavigationPath = ({
  menuItems,
  plpRailItems,
  pathname,
  pageBasePath,
  sourceNavigationBasePath,
}: ResolveStorefrontNavigationPathInput): StorefrontNavigationItem[] | null => {
  const menuPath =
    findNavigationPathByScopedHref(menuItems, pathname, pageBasePath, sourceNavigationBasePath) ??
    findNavigationPathByHref(menuItems, pathname);

  if (doesNavigationPathMatchPathname(menuPath, pathname, pageBasePath, sourceNavigationBasePath)) {
    return menuPath;
  }

  const plpPath = findNavigationPathByHref(plpRailItems, pathname);
  if (!plpPath?.length) {
    return menuPath;
  }

  const listingRoot = menuPath?.[0] ?? findNavigationRootByPath(menuItems, pageBasePath);
  if (listingRoot && plpPath[0]?.id !== listingRoot.id) {
    return [listingRoot, ...plpPath];
  }

  return plpPath;
};

export const getActiveNavigationChildren = (
  currentItem: StorefrontNavigationItem | null,
  railItems: StorefrontNavigationItem[],
): StorefrontNavigationItem[] => {
  if (!currentItem) {
    return [];
  }

  const railItem = findNavigationItemById(railItems, currentItem.id);
  if (railItem?.children?.length) {
    return railItem.parentId ? [railItem, ...railItem.children] : railItem.children;
  }

  const railChildren = railItems.filter((item) => item.parentId === currentItem.id);
  if (currentItem.parentId && railChildren.length) {
    return [currentItem, ...railChildren];
  }

  if (railItems.length > 0) {
    return [];
  }

  return currentItem.children || [];
};

export const isNavigationItemPathPrefixActive = (item: StorefrontNavigationItem, pathname: string): boolean => {
  const href = buildNavigationHref(item);
  if (!href || isExternalNavigationHref(href)) {
    return false;
  }

  const itemPath = normalizeNavigationPath(href);
  const normalizedPathname = normalizeNavigationPath(pathname);
  return itemPath !== "/" && normalizedPathname.startsWith(`${itemPath}/`);
};

export const isNavigationItemActive = (
  item: StorefrontNavigationItem,
  options: {
    pathname: string;
    basePath?: string | null;
    sourceBasePath?: string | null;
    activeNavigationItemId?: string | null;
    activeCategoryId?: string | null;
    checkChildren?: boolean;
  },
): boolean => {
  const { pathname, basePath, sourceBasePath, activeNavigationItemId, activeCategoryId, checkChildren } = options;

  if (activeNavigationItemId && item.id === activeNavigationItemId) {
    return true;
  }

  const itemCategoryId = getNavigationCategoryId(item);
  if (activeCategoryId && itemCategoryId && itemCategoryId === activeCategoryId) {
    return true;
  }

  const normalizedPathname = normalizeNavigationPath(pathname);
  const href = buildScopedNavigationHref(item, basePath, sourceBasePath) ?? buildNavigationHref(item);
  const itemPath = href && !isExternalNavigationHref(href) ? normalizeNavigationPath(href) : "";

  if (itemPath && itemPath === normalizedPathname) {
    return true;
  }

  if (checkChildren && item.children && item.children.length > 0) {
    return item.children.some((child) => isNavigationItemActive(child, options));
  }

  return false;
};

export const findFirstNavigationRootWithChildren = (items: StorefrontNavigationItem[]): StorefrontNavigationItem | null =>
  items.find((item) => item.children?.length) ?? items[0] ?? null;

const hasDescendantPathUnderRoot = (item: StorefrontNavigationItem, rootPath: string): boolean =>
  flattenNavigationItems(item.children || []).some((child) => {
    const childPath = normalizeNavigationPath(buildNavigationHref(child));
    return childPath === rootPath || childPath.startsWith(`${rootPath}/`);
  });

export const findNavigationRootByPath = (
  items: StorefrontNavigationItem[],
  pathname: string | null | undefined,
): StorefrontNavigationItem | null => {
  const normalizedPathname = normalizeNavigationPath(pathname);
  if (!normalizedPathname) {
    return findFirstNavigationRootWithChildren(items);
  }

  const descendantRoot = items.find((item) => hasDescendantPathUnderRoot(item, normalizedPathname));
  if (descendantRoot) {
    return descendantRoot;
  }

  const exactRootWithChildren = items.find(
    (item) => normalizeNavigationPath(buildNavigationHref(item)) === normalizedPathname && item.children?.length,
  );
  if (exactRootWithChildren) {
    return exactRootWithChildren;
  }

  const exactRoot = items.find((item) => normalizeNavigationPath(buildNavigationHref(item)) === normalizedPathname);
  if (exactRoot) {
    return exactRoot;
  }

  const matchedPath = findNavigationPathByHref(items, normalizedPathname);
  if (matchedPath?.[0]) {
    return matchedPath[0];
  }

  return findFirstNavigationRootWithChildren(items);
};
