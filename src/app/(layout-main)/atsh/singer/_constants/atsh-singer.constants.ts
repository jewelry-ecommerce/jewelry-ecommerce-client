import { ATSH_HEARTLOCK_LOGO } from "@/app/(layout-main)/atsh/_constants/atsh.constants";
import type { ApiProduct } from "@/utils/api/product/product.interface";

export const ATSH_SINGER_IMAGE_BASE = "/image/atsh/singer";
export const ATSH_SINGER_DEFAULT_SLUG = "quang-hung-masterd";

/** Align theme breakpoints — md 810, lg 1200, xl 1512 */
export const ATSH_SINGER_BREAKPOINT = {
  mobileMax: 809,
  tabletMin: 810,
  tabletMax: 1199,
  desktopMin: 1200,
  wideMin: 1512,
} as const;

export type AtshSingerResponsiveImage = {
  mobile: string;
  tablet: string;
  desktop?: string;
};

/**
 * Main section background — Figma:
 * - desktop: 20673:326100
 * - tablet: 20189:205976
 * - mobile: 20189:197026
 */
export const ATSH_SINGER_MAIN_BG: AtshSingerResponsiveImage = {
  mobile:
    "https://cdn-media-test.sevagoretail.jewelry/v1/img/test-external-trading/019f21ca-f99b-73f0-8a8b-b4789cd5b08f/v-96512e0f/original.jpg",
  tablet:
    "https://cdn-media-test.sevagoretail.jewelry/v1/img/test-external-trading/019f21ca-a0ff-724f-beac-646bfa76c313/v-0a074f54/original.jpg",
  desktop:
    "https://cdn-media-test.sevagoretail.jewelry/v1/img/test-external-trading/019f21c7-ea69-7498-a69c-34220a093f3c/v-a3b523fd/original.jpg",
};

/** Page content shell — cố định 1512px, màn rộng hơn chỉ giãn margin 2 bên */
export const ATSH_SINGER_PAGE_MAX_WIDTH = 1512;

/** Product row frame — Figma desktop: 1160px trong shell 1512px */
export const ATSH_SINGER_PRODUCT_FRAME = {
  width: 1160,
  imageSize: 640,
  contentWidth: 440,
  gap: 80,
  tabletGap: 40,
  tabletImageMaxWidth: 480,
} as const;

/** Full-look body — Figma desktop */
export const ATSH_SINGER_FULL_LOOK_FRAME = {
  heroWidth: 575,
  bodyGap: 40,
  carouselItemGap: 16,
} as const;

/** Full-look savings badge background — Figma 23421:215739 */
export const ATSH_SINGER_SAVINGS_BADGE = `${ATSH_SINGER_IMAGE_BASE}/savings-badge.svg`;

/** Full-look hero composite — tablet fallback local; mobile/desktop dùng CDN trong pageData */
export const ATSH_SINGER_FULL_LOOK_HERO_TABLET = `${ATSH_SINGER_IMAGE_BASE}/full-look-hero-tablet.png`;

export type AtshSingerImagePosition = "left" | "right";

export type AtshSingerDiscoverCard = {
  title: string;
  description: string;
  image: string;
  href: string;
};

export type AtshSingerGallerySection = {
  title: string;
  description: string;
  images: string[];
  /** 2 = desktop row (2 cols) + mobile stack; 4 = desktop row (4 cols) + mobile carousel */
  imageCount?: 2 | 4;
};

/** Brother gallery image frame — Figma 708×772 */
export const ATSH_SINGER_GALLERY_IMAGE_FRAME = {
  width: 708,
  height: 772,
} as const;

export type AtshSingerFeaturedProduct = {
  product: ApiProduct;
  imagePosition: AtshSingerImagePosition;
};

export type AtshSingerPageData = {
  slug: string;
  /** Collab hero composite — ảnh anh trai + logo overlay, per singer (Figma 20227:179727 / mobile / desktop 22723:192725) */
  heroBanner: AtshSingerResponsiveImage;
  singerName: string;
  pageTitle: string;
  introDescription: string;
  fullLookDescription: string;
  /** Sản phẩm showcase — cấu hình trong atsh-brothers.json */
  featuredProducts: AtshSingerFeaturedProduct[];
  /** Sản phẩm full-look carousel — fetch từ API catalog theo collectionSlug = slug */
  collectionProducts: ApiProduct[];
  fullLookProductSlug: string;
  fullLookTotalPrice: number;
  fullLookOriginalPrice: number;
  fullLookTitle: string;
  singerGallery: AtshSingerGallerySection;
  discoverSectionTitle: string;
  discoverCards: AtshSingerDiscoverCard[];
  fullLookImg: AtshSingerResponsiveImage;
};

const PRODUCT_DESCRIPTION_DEFAULT = "Thiết kế lấy cảm hứng từ vũ trụ Tinh Hà — chi tiết tinh xảo, toả sáng dưới ánh đèn sân khấu.";

export const ATSH_SINGER_PRODUCT_DESCRIPTION = PRODUCT_DESCRIPTION_DEFAULT;

export const ATSH_SINGER_PRODUCT_CTA = {
  label: "Mua ngay",
} as const;

export const ATSH_SINGER_FULL_LOOK_CTA = {
  label: "Mua trọn bộ",
  href: "/san-pham",
} as const;

/** Section header phía trên full-look body (Figma) */
export const ATSH_SINGER_FULL_LOOK_SECTION = {
  title: "SỞ HỮU FULL-LOOK",
} as const;

export const ATSH_SINGER_DISCOVER_ACTION_LABEL = "Xem chi tiết" as const;

export const ATSH_SINGER_DATA = {
  HEARTLOCK_LOGO: ATSH_HEARTLOCK_LOGO,
  ATSH_LOGO:
    "https://cdn-media-test.sevagoretail.jewelry/v1/img/test-external-trading/019eda62-7362-7439-bb41-655e148d9586/v-075a0905/original.png",
};
