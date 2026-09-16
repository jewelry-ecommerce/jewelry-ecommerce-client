import { findFirstNavigationRootWithChildren, findNavigationPathByHref } from "@/utils/api/cms";
import type { StorefrontNavigationItem } from "@/utils/api/cms/cms.interface";

type ResolveCategoryNavigationItemsInput = {
  navigationItems: StorefrontNavigationItem[];
  pathname: string | null | undefined;
  plpRailItems: StorefrontNavigationItem[];
  currentNavigationItem: StorefrontNavigationItem | null;
  navigationPath: StorefrontNavigationItem[] | null;
  rootNavigationItem: StorefrontNavigationItem | null;
};

const findPlpRailChildrenForItem = (
  plpRailItems: StorefrontNavigationItem[],
  item: StorefrontNavigationItem | null | undefined,
): StorefrontNavigationItem[] => {
  if (!item) {
    return [];
  }

  const matchedRailItem = plpRailItems.find((railItem) => railItem.id === item.id);
  return matchedRailItem?.children?.length ? matchedRailItem.children : [];
};

export const resolveCategoryNavigationItems = ({
  navigationItems,
  pathname,
  plpRailItems,
  currentNavigationItem,
  navigationPath,
  rootNavigationItem,
}: ResolveCategoryNavigationItemsInput): StorefrontNavigationItem[] => {
  const currentRailChildren = findPlpRailChildrenForItem(plpRailItems, currentNavigationItem);
  if (currentRailChildren.length) {
    return currentRailChildren;
  }

  const hrefNavigationPath = findNavigationPathByHref(navigationItems, pathname);
  if (hrefNavigationPath && hrefNavigationPath.length > 1) {
    const parentItem = hrefNavigationPath[hrefNavigationPath.length - 2];
    const parentRailChildren = findPlpRailChildrenForItem(plpRailItems, parentItem);
    if (parentRailChildren.length) {
      return parentRailChildren;
    }

    if (parentItem.children?.length) {
      return parentItem.children;
    }
  }

  if (currentNavigationItem?.children?.length) {
    return currentNavigationItem.children;
  }

  if (plpRailItems.length) {
    return plpRailItems;
  }

  if (navigationPath && navigationPath.length > 1) {
    return navigationPath[navigationPath.length - 2]?.children ?? [];
  }

  return rootNavigationItem?.children ?? findFirstNavigationRootWithChildren(navigationItems)?.children ?? [];
};
