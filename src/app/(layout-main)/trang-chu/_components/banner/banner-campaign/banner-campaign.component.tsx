import React from "react";
import { Box, Stack, Typography, SxProps, Theme } from "@mui/material";
import { MediaType } from "@/utils/api/banner/banner.enum";
import useStyles from "./banner-campaign.styles";
import { AppLink } from "@/components";
import { BannerResponsiveMedia } from "../banner-responsive-media.component";
import { normalizeBannerCampaignImageUrl } from "./banner-campaign.constants";
import { useStorefrontBreakpoint } from "@/hooks/use-storefront-breakpoint.hook";

export interface BannerCampaignItem {
  id: string;
  src: string;
  alt?: string;
  media_mobile_url?: string;
  media_poster_url?: string | null;
  media_mobile_poster_url?: string | null;
  media_type?: MediaType;
  title?: string;
  title_color?: string;
  href?: string;
}

interface BannerCampaignProps {
  items: BannerCampaignItem[];
  sx?: SxProps<Theme>;
  priority?: boolean;
}

const hasContent = (value?: string | null) => typeof value === "string" && value.trim().length > 0;

const BannerCampaignComponent = ({ items, sx, priority = true }: BannerCampaignProps) => {
  const { classes, cx } = useStyles();
  const { isTablet } = useStorefrontBreakpoint();
  const desktopBreakpoint = isTablet ? "tablet" : "desktop";

  if (!items?.length) return null;

  const renderMedia = (item: BannerCampaignItem, index: number) => (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <BannerResponsiveMedia
        desktopSrc={item.media_type === MediaType.VIDEO ? item.src : normalizeBannerCampaignImageUrl(item.src, desktopBreakpoint)}
        mobileSrc={
          item.media_type === MediaType.VIDEO ? item.media_mobile_url : normalizeBannerCampaignImageUrl(item.media_mobile_url, "mobile")
        }
        desktopPoster={normalizeBannerCampaignImageUrl(item.media_poster_url, desktopBreakpoint)}
        mobilePoster={normalizeBannerCampaignImageUrl(item.media_mobile_poster_url, "mobile")}
        mediaType={item.media_type}
        alt={item.alt ?? item.title ?? ""}
        priority={priority && index === 0}
        imagePresetDesktop="bannerSquare"
        imagePresetTablet="bannerSquareTablet"
        imagePresetMobile="bannerSquareMobile"
        sizes="50vw"
        className={cx(classes.bannerImage, "banner-image")}
      />
    </Box>
  );

  const renderTitle = (item: BannerCampaignItem) => {
    if (!hasContent(item.title)) return null;

    return (
      <Box className={classes.titleOverlay}>
        <Box className={classes.titleBar}>
          <Typography component="h2" className={classes.title} sx={{ color: item.title_color || "#FFFFFF" }}>
            {item.title}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderItem = (item: BannerCampaignItem, index: number) => {
    const href = item.href?.trim();
    const imageContent = (
      <Box className={classes.imageWrapper}>
        {renderMedia(item, index)}
        {renderTitle(item)}
      </Box>
    );

    return (
      <Box key={item.id} className={classes.bannerItem}>
        {href ? (
          <AppLink href={href} style={{ display: "block", width: "100%", height: "100%", textDecoration: "none" }}>
            {imageContent}
          </AppLink>
        ) : (
          imageContent
        )}
      </Box>
    );
  };

  return (
    <Stack className={classes.root} sx={sx} direction={{ xs: "column", lg: "row" }}>
      {items.map(renderItem)}
    </Stack>
  );
};

export default BannerCampaignComponent;
