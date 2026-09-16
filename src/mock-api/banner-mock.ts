import { BannerLayout, MediaType } from "@/utils/api/banner/banner.enum";
import type { BannerCollectionItem, BannerPlacement, BannerSlot, RegularBannerItem } from "@/utils/api/banner/banner.interface";
import { PlacementDisplayType } from "@/utils/api/cms/cms.enum";

const HERO_IMAGE = "/images/banner/grid-banner/01.png";
const HERO_VIDEO = "/images/banner/slider-banner/original.mp4";
const DOUBLE_BANNER_IMAGES = ["/images/banner/double-banner/01.webp", "/images/banner/double-banner/02.webp"];

const createBanner = (id: string, image: string, title: string, mediaType = MediaType.IMAGE): BannerCollectionItem => ({
  id,
  internal_name: id,
  media_type: mediaType,
  media_url: image,
  media_mobile_url: image,
  overlay_opacity: 0.15,
  status: "ACTIVE",
  title,
  subtitle: "Tinh tế trong từng thiết kế",
  title_color: "#FFFFFF",
  layout: BannerLayout.LEFT_BOTTOM,
  actions: [{ action_type: "LINK", action_target: "/san-pham", cta_text: "Khám phá ngay", cta_bg: "#FFFFFF", cta_color: "#171717" }],
});

const slot = (id: string, banner: RegularBannerItem, order: number): BannerSlot => ({
  id,
  slot_key: id,
  slot_type: "SINGLE_IMAGE",
  layout_metadata: { order, x: 0, y: 0, width: 1, height: 1 },
  banners: [{ order_index: order, banner }],
});

const collectionPlacement = (code: string, type: PlacementDisplayType, items: Array<[string, string]>): BannerPlacement => ({
  id: code.toLowerCase(),
  code,
  name: code,
  type,
  slots: items.map(([image, title], index) => slot(`${code}-${index}`, createBanner(`${code}-${index}`, image, title), index + 1)),
});

const videoPlacement = (): BannerPlacement => {
  const videoBanner: BannerCollectionItem = {
    ...createBanner("home-hero-video-0", HERO_VIDEO, "NOXARA - THE MYSTIC GARDEN", MediaType.VIDEO),
    subtitle:
      "The Jentle Garden campaign, featuring BLACKPINK’s Jennie photographed by Paris-based photographer Hugo Comte, imagines a fantasy garden.",
    layout: BannerLayout.CENTER_BOTTOM,
    actions_layout: "ROW",
    actions: [
      { action_type: "LINK", action_target: "/bo-suu-tap", cta_text: "Xem thêm", cta_bg: "transparent", cta_color: "#FFFFFF" },
      { action_type: "LINK", action_target: "/san-pham", cta_text: "Mua ngay", cta_bg: "#FFFFFF", cta_color: "#171717" },
    ],
  };
  return {
    id: "home-hero-video",
    code: "HOME_HERO_VIDEO",
    name: "HOME_HERO_VIDEO",
    type: PlacementDisplayType.SLIDER,
    slots: [slot("home-hero-video-0", videoBanner, 1)],
  };
};

/** Home uses simple image placements only; no grid configuration is required from the future BE. */
export const getMockBannerPlacement = (code: string): BannerPlacement | null => {
  if (code === "HOME_HERO_VIDEO") return videoPlacement();
  if (code === "HOME_DOUBLE")
    return collectionPlacement(code, PlacementDisplayType.DOUBLE_BANNER, [
      [DOUBLE_BANNER_IMAGES[0]!, "Vẻ đẹp của sự tối giản"],
      [DOUBLE_BANNER_IMAGES[1]!, "Dấu ấn riêng của bạn"],
    ]);
  if (code === "HOME_SLIDER") return collectionPlacement(code, PlacementDisplayType.SLIDER, [[HERO_IMAGE, "Jewelry Ecommerce"]]);
  return null;
};
