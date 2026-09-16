import { getCmsDefaults } from "@/utils/api/cms/cms-default";
import { ActionType, BlockTypeCode } from "@/utils/api/cms/cms.enum";
import { MediaType } from "@/utils/api/banner/banner.enum";
import type { Block, PageResponse } from "@/utils/api/cms/cms.interface";
import { STOREFRONT_NAVIGATION_ITEMS } from "@/utils/config/storefront-navigation.config";

const HOME_PAGE_SLUGS = new Set(["trang-chu", "home"]);
const PRODUCT_PAGE_SLUGS = new Set(["san-pham"]);
const INFO_IMAGES = ["/images/info-card/01.webp", "/images/info-card/02.png", "/images/info-card/03.webp"];
const GALLERY_IMAGES = [
  "/images/gallery-image/01.webp",
  "/images/gallery-image/02.webp",
  "/images/gallery-image/03.webp",
  "/images/gallery-image/04.webp",
];

const productCarousel = (id: string, title: string, productIds: string[]): Block => ({
  id,
  blockTypeCode: BlockTypeCode.PRODUCT_CAROUSEL,
  sortOrder: 0,
  config: {
    header: { title, subtitle: "Thiết kế tuyển chọn từ Jewelry Ecommerce" },
    display: { limit: 8 },
    dataSource: { filterType: "MANUAL_PRODUCTS", productIds },
  },
  targetSegment: null,
});

const banner = (id: string, placementCode: string): Block => ({
  id,
  blockTypeCode: BlockTypeCode.BANNER,
  sortOrder: 0,
  config: { placementCode },
  targetSegment: null,
});

/** The homepage intentionally uses simple image placements, not a CMS-driven grid. */
const getMockHomeBlocks = (): Block[] =>
  [
    banner("home-banner-hero-video", "HOME_HERO_VIDEO"),
    productCarousel("home-carousel-1", "Thiết kế nổi bật", ["jewelry-product-1", "jewelry-product-2", "jewelry-product-3"]),
    banner("home-banner-double", "HOME_DOUBLE"),
    productCarousel("home-carousel-2", "Dành cho khoảnh khắc đặc biệt", ["jewelry-product-4", "jewelry-product-5", "jewelry-product-6"]),
    banner("home-banner-slider", "HOME_SLIDER"),
    productCarousel("home-carousel-3", "Mới tại Jewelry Ecommerce", ["jewelry-product-2", "jewelry-product-4", "jewelry-product-6"]),
    {
      id: "home-info-cards",
      blockTypeCode: BlockTypeCode.INFO_CARDS,
      sortOrder: 0,
      config: {
        header: { title: "TIN TỨC & XU HƯỚNG", subtitle: "" },
        display: { columns: 3 },
        items: INFO_IMAGES.map((imageUrl, index) => ({
          imageUrl,
          title: ["Nghệ thuật chọn trang sức", "Dấu ấn cá nhân", "Quà tặng tinh tế"][index],
          description: "Câu chuyện từ Jewelry Ecommerce",
          actionText: "Xem chi tiết",
          actionUrl: "/cam-hung",
          mediaType: MediaType.IMAGE,
        })),
      },
      targetSegment: null,
    },
    {
      id: "home-gallery",
      blockTypeCode: BlockTypeCode.IMAGE_GALLERY,
      sortOrder: 0,
      config: {
        header: { title: "JEWELRY JOURNAL", subtitle: "" },
        items: GALLERY_IMAGES.map((imageUrl) => ({
          imageUrl,
          label: "@jewelry.ecommerce",
          actionUrl: "/cam-hung",
          actionType: ActionType.LINK,
        })),
      },
      targetSegment: null,
    },
  ].map((block, index) => ({ ...block, sortOrder: index + 1 }));

const getMockProductBlocks = (): Block[] => [
  {
    id: "product-category-navigation",
    blockTypeCode: BlockTypeCode.PRODUCT_CATEGORY_NAV,
    sortOrder: 1,
    config: { display: { limit: 6 } },
    targetSegment: null,
  },
  {
    id: "product-list",
    blockTypeCode: BlockTypeCode.PRODUCT_LIST,
    sortOrder: 2,
    config: { dataSource: { filterType: "NONE" }, display: { limit: 12 } },
    targetSegment: null,
  },
  {
    id: "product-collection-showcase",
    blockTypeCode: BlockTypeCode.PRODUCT_COLLECTION_SHOWCASE,
    sortOrder: 3,
    config: {
      items: [
        { id: "showcase-1", title: "BỘ SƯU TẬP MỚI", imageUrl: "/images/product/show-case/1.png", actionUrl: "/san-pham" },
        { id: "showcase-2", title: "TRANG SỨC DÀNH CHO BẠN", imageUrl: "/images/product/show-case/2.png", actionUrl: "/san-pham" },
        { id: "showcase-3", title: "DẤU ẤN RIÊNG", imageUrl: "/images/product/show-case/3.png", actionUrl: "/san-pham" },
      ],
    },
    targetSegment: null,
  },
  {
    id: "product-expandable-description",
    blockTypeCode: BlockTypeCode.PRODUCT_EXPANDABLE_DESCRIPTION,
    sortOrder: 4,
    config: {
      title: "VỀ JEWELRY ECOMMERCE",
      description: "<p>Jewelry Ecommerce mang đến những thiết kế trang sức hiện đại, tinh tế và phù hợp cho từng khoảnh khắc của bạn.</p>",
      maxCollapsedLines: 3,
    },
    targetSegment: null,
  },
];

export const getMockStorefrontPage = (slug: string): PageResponse | null => {
  const page = getCmsDefaults("Jewelry Ecommerce").homePage as PageResponse;
  if (PRODUCT_PAGE_SLUGS.has(slug)) {
    return {
      ...page,
      page: { ...page.page, id: "mock-product-page", slug: "san-pham", name: "Sản phẩm" },
      blocks: getMockProductBlocks(),
    };
  }
  if (!HOME_PAGE_SLUGS.has(slug)) return null;
  return { ...page, blocks: getMockHomeBlocks() };
};

export const getMockStorefrontNavigation = () => ({ items: STOREFRONT_NAVIGATION_ITEMS });
export const getMockStorefrontGlobalConfig = () => ({
  header: {
    bannerName: "Jewelry Ecommerce announcement",
    bannerDisplayStyle: "TEXT",
    bannerContent: "JEWELRY ECOMMERCE — TỎA SÁNG THEO CÁCH RIÊNG CỦA BẠN ✦ KHÁM PHÁ BỘ SƯU TẬP MỚI",
    bannerBgColor: "#DCD4F7",
    bannerTextColor: "#1B1F22",
    bannerTargetUrl: "/san-pham",
    bannerAnimationStyle: "MARQUEE",
    bannerLoopIntervalSec: 18,
    bannerStartTime: "2026-01-01T00:00:00.000Z",
    bannerEndTime: null,
  },
  footer: getCmsDefaults("Jewelry Ecommerce").footer,
});
export const getMockStorefrontLogos = () => ({
  HEADER: { logoUrl: "/images/logo/header-logo.svg", logoTargetUrl: "/" },
  FOOTER: { logoUrl: "/images/logo/footer-logo.svg", logoTargetUrl: "/" },
  AUTH: { logoUrl: "/images/logo/login-logo.svg", logoTargetUrl: "/" },
  FAVICON: { logoUrl: "/images/logo/favicon.png", logoTargetUrl: "/" },
});
