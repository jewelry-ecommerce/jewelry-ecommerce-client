import { cache } from "react";
import {
  HOME_LCP_DESKTOP_MEDIA_QUERY,
  HOME_LCP_MOBILE_MEDIA_QUERY,
} from "@/app/(layout-main)/trang-chu/_constants/home-performance.constants";
import { fetchApiJson, fetchStorefrontPageBySlug } from "@/lib/server/storefront-metadata";
import { getCachedBannerPlacement } from "@/lib/storefront";
import { getBannerPlacementCode } from "@/app/(layout-main)/trang-chu/_utils/home.utils";
import { BlockTypeCode } from "@/utils/api/cms";
import type { PageResponse } from "@/utils/api/cms/cms.interface";
import { MediaType } from "@/utils/api/banner/banner.enum";
import { getMediaType } from "@/utils/helpers/common/common.helpers";
import { resolveCdnImageUrl } from "@/utils/cdn";
import { getApiBeUrl } from "@/utils/config/common";
import type { BannerPlacement, BaseBannerItem } from "@/utils/api/banner/banner.interface";

export type HomeInitialData = {
  page: PageResponse;
  banners: Record<string, BannerPlacement>;
};

export type HomeImagePreload = {
  href: string;
  media?: string;
};

type BannerEntry = readonly [string, BannerPlacement];

const fetchBannerPlacement = async (code: string) => {
  if (!getApiBeUrl()) return null;

  try {
    return await getCachedBannerPlacement(code);
  } catch (error) {
    console.error(`[Storefront] Fetch banner placement "${code}" failed:`, error);
    return null;
  }
};

const getHomeBannerPlacementCodes = (page: PageResponse): string[] => {
  const placementCodes = new Set<string>();

  page.blocks.forEach((block) => {
    if (block.blockTypeCode !== BlockTypeCode.BANNER) return;

    const placementCode = getBannerPlacementCode(block);
    if (placementCode) placementCodes.add(placementCode);
  });

  return [...placementCodes];
};

const resolveBannerEntry = async (code: string): Promise<BannerEntry> => {
  const placement = await fetchBannerPlacement(code);
  if (!placement) {
    throw new Error(`Banner placement "${code}" was not found`);
  }
  return [code, placement] as const;
};

const isResolvedBannerEntry = (result: PromiseSettledResult<BannerEntry>): result is PromiseFulfilledResult<BannerEntry> =>
  result.status === "fulfilled";

const fetchBannerPlacements = async (placementCodes: string[]): Promise<Record<string, BannerPlacement>> => {
  if (!placementCodes.length) return {};

  const entries = await Promise.allSettled(placementCodes.map(resolveBannerEntry));
  return Object.fromEntries(entries.filter(isResolvedBannerEntry).map((entry) => entry.value));
};

const getSortedPlacementBanners = (placement: BannerPlacement): BaseBannerItem[] =>
  placement.slots
    .slice()
    .sort((a, b) => (Number(a.layout_metadata?.order) || 0) - (Number(b.layout_metadata?.order) || 0))
    .flatMap((slot) =>
      slot.banners
        .slice()
        .sort((a, b) => Number(a.order_index) - Number(b.order_index))
        .map((entry) => entry.banner),
    );

const isImageBanner = (banner: BaseBannerItem): boolean => {
  const mediaType = banner.media_type || getMediaType(banner.media_url);
  return Boolean(banner.media_url?.trim()) && mediaType !== MediaType.VIDEO;
};

const getFirstHomeImageBanner = (initialData: HomeInitialData): BaseBannerItem | null => {
  const contentBlocks = initialData.page.blocks.slice().sort((a, b) => a.sortOrder - b.sortOrder);

  for (const block of contentBlocks) {
    if (block.blockTypeCode !== BlockTypeCode.BANNER) continue;

    const placementCode = getBannerPlacementCode(block);
    const placement = placementCode ? initialData.banners[placementCode] : undefined;
    const banner = placement ? getSortedPlacementBanners(placement).find(isImageBanner) : null;
    if (banner) return banner;
  }

  return null;
};

const buildImagePreload = (href: string, media?: string): HomeImagePreload => ({ href, media });

export const getHomeLcpImagePreloads = (initialData: HomeInitialData): HomeImagePreload[] => {
  const banner = getFirstHomeImageBanner(initialData);
  if (!banner) return [];

  const desktopHref = resolveCdnImageUrl({ src: banner.media_url, preset: "bannerFullscreen", mediaType: banner.media_type });
  const mobileHref = resolveCdnImageUrl({
    src: banner.media_mobile_url || banner.media_url,
    preset: "bannerFullscreenMobile",
    mediaType: banner.media_type,
  });

  if (!mobileHref || mobileHref === desktopHref) {
    return [buildImagePreload(desktopHref)];
  }

  return [buildImagePreload(desktopHref, HOME_LCP_DESKTOP_MEDIA_QUERY), buildImagePreload(mobileHref, HOME_LCP_MOBILE_MEDIA_QUERY)];
};

export const fetchHomeInitialData = cache(async (slug: string): Promise<HomeInitialData> => {
  const page = await fetchStorefrontPageBySlug(slug);

  return {
    page,
    banners: await fetchBannerPlacements(getHomeBannerPlacementCodes(page)),
  };
});
