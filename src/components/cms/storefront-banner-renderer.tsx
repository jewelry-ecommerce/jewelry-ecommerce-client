"use client";

import useSWR from "swr";
import { BannerApi } from "@/utils/api";
import { BannerCollectionItem, BannerPlacement, BannerSlot } from "@/utils/api/banner/banner.interface";
import { PlacementDisplayType } from "@/utils/api/cms";
import BannerCampaignComponent from "@/app/(layout-main)/trang-chu/_components/banner/banner-campaign/banner-campaign.component";
import BannerCollectionComponent from "@/app/(layout-main)/trang-chu/_components/banner/banner-collection/banner-collection.component";
import BannerCollectionSkeletonComponent from "@/app/(layout-main)/trang-chu/_components/banner/banner-collection/banner-collection-skeleton.component";
import BannerHeroComponent from "@/app/(layout-main)/trang-chu/_components/banner/banner-hero/banner-hero.component";

export const isValidBannerPlacementCode = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

interface StorefrontBannerRendererProps {
  placementCode: string;
  initialPlacement?: BannerPlacement;
  priority?: boolean;
}

const StorefrontBannerRenderer = ({ placementCode, initialPlacement, priority = true }: StorefrontBannerRendererProps) => {
  const { data: placementData, isLoading } = useSWR(
    `banner/placements/${placementCode}`,
    () => BannerApi.getPlacementByCodeApi(placementCode),
    {
      fallbackData: initialPlacement,
      revalidateOnMount: initialPlacement ? false : undefined,
    },
  );

  if (isLoading && !placementData) {
    return <BannerCollectionSkeletonComponent />;
  }

  if (!placementData) {
    return null;
  }
  switch (placementData.type) {
    case PlacementDisplayType.GRID:
      return <BannerHeroComponent data={placementData as BannerPlacement} priority={priority} />;

    case PlacementDisplayType.SLIDER:
    case PlacementDisplayType.CAROUSEL:
      return <BannerCollectionComponent slots={(placementData as BannerPlacement<BannerCollectionItem>).slots} priority={priority} />;

    case PlacementDisplayType.DOUBLE_BANNER: {
      const doubleBannerSlots = [...(placementData.slots as BannerSlot<BannerCollectionItem>[])].sort((slotA, slotB) => {
        const orderA = Number(slotA.layout_metadata?.order) || 0;
        const orderB = Number(slotB.layout_metadata?.order) || 0;
        return orderA - orderB;
      });

      return (
        <BannerCampaignComponent
          priority={priority}
          items={doubleBannerSlots
            .map((slot) => {
              const banner = slot.banners[0]?.banner;
              if (!banner) return null;

              return {
                id: slot.id,
                src: banner.media_url || "",
                media_mobile_url: banner.media_mobile_url,
                media_poster_url: banner.media_poster_url,
                media_mobile_poster_url: banner.media_mobile_poster_url,
                media_type: banner.media_type,
                alt: banner.title || banner.internal_name || "",
                title: banner.title,
                title_color: banner.title_color,
                href: banner.actions?.[0]?.action_target,
              };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)}
        />
      );
    }

    default:
      return null;
  }
};

export default StorefrontBannerRenderer;
