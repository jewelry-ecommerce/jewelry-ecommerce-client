import type { ProductBannerConfig } from "@/components";
import type { BreadcrumbItem } from "@/components/breadcrumb/breadcrumb.interface";

export const LISTING_BANNER_CONFIGS: ProductBannerConfig[] = [
  {
    id: "banner-1",
    enabled: true,
    position: "left",
    type: "link",
    content: {
      image: "/images/banner/product-banner/1.webp",
      title: "MIX & MATCH",
    },
    link: "/san-pham",
  },
  {
    id: "banner-2",
    enabled: true,
    position: "right",
    type: "product",
    content: {
      image: "/images/banner/product-banner/2.webp",
      title: "NEW DROP",
    },
  },
];

export const LISTING_BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Tất cả", href: "/san-pham" },
];

const LISTING_SHOWCASE_ITEM_SPECS = [
  {
    id: "best-sellers",
    title: "BEST SELLERS",
    href: "/san-pham?collection=best-sellers",
  },
  {
    id: "new-collection",
    title: "NEW COLLECTION",
    href: "/san-pham?collection=new-collection",
  },
  {
    id: "leaving-soon",
    title: "LEAVING SOON",
    href: "/san-pham?collection=leaving-soon",
  },
] as const;

const LISTING_SHOWCASE_IMAGES = ["/images/product/show-case/1.png", "/images/product/show-case/2.png", "/images/product/show-case/3.png"];

export const buildListingShowcaseItems = (_productDefaultImage = "") =>
  LISTING_SHOWCASE_ITEM_SPECS.map((item, index) => ({
    ...item,
    image: LISTING_SHOWCASE_IMAGES[index],
  }));

/** @deprecated Dùng `buildListingShowcaseItems` trên server với `resolveTenantBranding`. */
export const LISTING_SHOWCASE_ITEMS = buildListingShowcaseItems();

export const LISTING_SHOWCASE_TAGS = ["Title", "Title", "Title", "Title", "Title", "Title", "Title", "Title"];
