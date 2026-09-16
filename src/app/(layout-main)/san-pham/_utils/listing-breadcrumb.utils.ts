import type { BreadcrumbItem } from "@/components/breadcrumb/breadcrumb.interface";
import { buildNavigationHref, buildScopedNavigationHref } from "@/utils/api/cms";
import { BlockTypeCode } from "@/utils/api/cms/cms.enum";
import type { Block, StorefrontNavigationItem } from "@/utils/api/cms/cms.interface";

export type ListingBreadcrumbHrefMode = "scoped" | "canonical";

type BuildListingBreadcrumbItemsInput = {
  baseItems: BreadcrumbItem[];
  navigationPath: StorefrontNavigationItem[] | null | undefined;
  hrefMode: ListingBreadcrumbHrefMode;
  pageBasePath?: string | null;
  sourceNavigationBasePath?: string | null;
  pageTitleFallback?: string | null;
};

const resolveBreadcrumbItemHref = (
  item: StorefrontNavigationItem,
  hrefMode: ListingBreadcrumbHrefMode,
  pageBasePath?: string | null,
  sourceNavigationBasePath?: string | null,
): string | undefined => {
  if (hrefMode === "canonical") {
    return buildNavigationHref(item) ?? undefined;
  }

  return buildScopedNavigationHref(item, pageBasePath, sourceNavigationBasePath) ?? undefined;
};

export const hasStorefrontPlpBlocks = (blocks: Block[]): boolean =>
  blocks.some((block) => block.blockTypeCode === BlockTypeCode.PRODUCT_CATEGORY_NAV || block.blockTypeCode === BlockTypeCode.PRODUCT_LIST);

export const buildListingBreadcrumbItems = ({
  baseItems,
  navigationPath,
  hrefMode,
  pageBasePath,
  sourceNavigationBasePath,
  pageTitleFallback,
}: BuildListingBreadcrumbItemsInput): BreadcrumbItem[] => {
  if (!navigationPath?.length) {
    const fallbackLabel = pageTitleFallback?.trim();
    return fallbackLabel ? [...baseItems, { label: fallbackLabel }] : baseItems;
  }

  if (navigationPath.length <= 1) {
    if (hrefMode === "canonical") {
      const currentItem = navigationPath.at(-1);
      if (currentItem) {
        return [...baseItems, { label: currentItem.label }];
      }

      const fallbackLabel = pageTitleFallback?.trim();
      if (fallbackLabel) {
        return [...baseItems, { label: fallbackLabel }];
      }
    }

    return baseItems;
  }

  return [
    ...baseItems,
    ...navigationPath.slice(1).map((item) => ({
      label: item.label,
      href: resolveBreadcrumbItemHref(item, hrefMode, pageBasePath, sourceNavigationBasePath),
    })),
  ];
};
