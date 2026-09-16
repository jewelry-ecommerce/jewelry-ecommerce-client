import type { StorefrontNavigationItem } from "@/utils/api/cms/cms.interface";

type NavigationDefinition = Pick<StorefrontNavigationItem, "id" | "label" | "url" | "sortOrder">;

const MENU_ITEMS: NavigationDefinition[] = [
  { id: "products", label: "SẢN PHẨM", url: "/san-pham", sortOrder: 1 },
  { id: "collections", label: "BỘ SƯU TẬP", url: "/bo-suu-tap", sortOrder: 2 },
  { id: "inspiration", label: "CẢM HỨNG", url: "/cam-hung", sortOrder: 3 },
  { id: "gifts", label: "QUÀ TẶNG", url: "/qua-tang", sortOrder: 4 },
  { id: "stella-set", label: "STELLA SET", url: "/sets", sortOrder: 5 },
];

const createMenuItem = (item: NavigationDefinition): StorefrontNavigationItem => ({
  ...item,
  type: "LINK",
  targetId: null,
  queryParams: null,
  icon: null,
  image: null,
  openInNewTab: false,
  parentId: null,
  showOnMenuPopup: true,
  showOnPlp: false,
  linkTarget: { kind: "url", url: item.url ?? "/" },
  badge: null,
  hasChildren: false,
  expandOnly: false,
  viewAllLabel: null,
  parentEffectivelyHidden: false,
  children: [],
});

export const STOREFRONT_NAVIGATION_ITEMS = MENU_ITEMS.map(createMenuItem);
