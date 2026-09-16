import React from "react";
import { Box, Typography, Button, SxProps, Theme } from "@mui/material";
import { AppLink, SliderComponent } from "@/components";
import { DEFAULT_AUTOPLAY_SPEED } from "@/components/slider/slider.types";
import { MediaType } from "@/utils/api/banner/banner.enum";
import useStyles from "./banner-collection.styles";
import { StackAlignJustCenter, StackRowAlignJustCenter } from "@/components/styled";
import { BannerCollectionItem, BannerSlot } from "@/utils/api/banner/banner.interface";
import { BannerLayout } from "@/utils/api/banner/banner.enum";
import { getMediaType } from "@/utils/helpers/common";
import { BannerResponsiveMedia } from "../banner-responsive-media.component";
import { normalizeBannerCollectionImageUrl } from "./banner-collection.constants";
import { useStorefrontBreakpoint } from "@/hooks/use-storefront-breakpoint.hook";

type LayoutStyle = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform?: string;
  alignItems?: string;
  justifyContent?: string;
  textAlign?: "left" | "center" | "right";
};

const LAYOUT_STYLE_MAP: Record<BannerLayout, LayoutStyle> = {
  [BannerLayout.LEFT_TOP]: {
    top: "10%",
    left: "5%",
    bottom: "auto",
    right: "auto",
    transform: "none",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    textAlign: "left",
  },
  [BannerLayout.CENTER_TOP]: {
    top: "10%",
    left: "50%",
    bottom: "auto",
    right: "auto",
    transform: "translateX(-50%)",
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "center",
  },
  [BannerLayout.RIGHT_TOP]: {
    top: "10%",
    right: "5%",
    bottom: "auto",
    left: "auto",
    transform: "none",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    textAlign: "right",
  },
  [BannerLayout.LEFT_CENTER]: {
    top: "50%",
    left: "5%",
    bottom: "auto",
    right: "auto",
    transform: "translateY(-50%)",
    alignItems: "flex-start",
    justifyContent: "center",
    textAlign: "left",
  },
  [BannerLayout.CENTER]: {
    top: "50%",
    left: "50%",
    bottom: "auto",
    right: "auto",
    transform: "translate(-50%, -50%)",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  [BannerLayout.RIGHT_CENTER]: {
    top: "50%",
    right: "5%",
    bottom: "auto",
    left: "auto",
    transform: "translateY(-50%)",
    alignItems: "flex-end",
    justifyContent: "center",
    textAlign: "right",
  },
  [BannerLayout.LEFT_BOTTOM]: {
    bottom: "8%",
    left: "5%",
    top: "auto",
    right: "auto",
    transform: "none",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    textAlign: "left",
  },
  [BannerLayout.CENTER_BOTTOM]: {
    bottom: "8%",
    left: "50%",
    top: "auto",
    right: "auto",
    transform: "translateX(-50%)",
    alignItems: "center",
    justifyContent: "flex-end",
    textAlign: "center",
  },
  [BannerLayout.RIGHT_BOTTOM]: {
    bottom: "8%",
    right: "5%",
    top: "auto",
    left: "auto",
    transform: "none",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    textAlign: "right",
  },
};

interface BannerCollectionProps {
  slots?: BannerSlot<BannerCollectionItem>[];
  showArrows?: boolean;
  height?: string | number;
  sx?: SxProps<Theme>;
  priority?: boolean;
}

const BannerCollectionComponent = ({ slots, sx, showArrows = false, height, priority = true }: BannerCollectionProps) => {
  const { classes, cx } = useStyles();
  const { isTablet } = useStorefrontBreakpoint();
  const desktopBreakpoint = isTablet ? "tablet" : "desktop";
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const hasContent = (value?: string | null) => typeof value === "string" && value.trim().length > 0;
  const resolvedHeight = height ?? "100%";

  const items = React.useMemo(() => {
    if (!slots?.length) return [];

    const sortedSlots = [...slots].sort((a, b) => {
      const orderA = Number(a.layout_metadata?.order) || 0;
      const orderB = Number(b.layout_metadata?.order) || 0;
      return orderA - orderB;
    });

    return sortedSlots.flatMap((slot) => slot.banners.map((b) => b.banner));
  }, [slots]);

  const showProgress = React.useMemo(() => {
    const item = items[currentSlide];
    if (!item) return true;
    const mediaType = item.media_type || getMediaType(item.media_url);
    return mediaType !== MediaType.IMAGE;
  }, [items, currentSlide]);

  if (!items.length) return null;

  const renderMedia = (item: BannerCollectionItem, index: number) => (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <BannerResponsiveMedia
        desktopSrc={
          item.media_type === MediaType.VIDEO ? item.media_url : normalizeBannerCollectionImageUrl(item.media_url, desktopBreakpoint)
        }
        mobileSrc={
          item.media_type === MediaType.VIDEO ? item.media_mobile_url : normalizeBannerCollectionImageUrl(item.media_mobile_url, "mobile")
        }
        desktopPoster={normalizeBannerCollectionImageUrl(item.media_poster_url, desktopBreakpoint)}
        mobilePoster={normalizeBannerCollectionImageUrl(item.media_mobile_poster_url, "mobile")}
        mediaType={item.media_type}
        alt={item.title}
        priority={priority && index === 0}
        active={index === currentSlide}
        loop={false}
        imagePresetDesktop="bannerFullscreen"
        imagePresetTablet="bannerFullscreenTablet"
        imagePresetMobile="bannerFullscreenMobile"
        sizes="100vw"
        className={classes.media}
      />
    </Box>
  );

  return (
    <Box className={classes.root} sx={{ ...sx, ...(height != null ? { height } : undefined) }}>
      <SliderComponent
        type="progress"
        itemsToShow={1}
        autoplay={true}
        autoplaySpeed={DEFAULT_AUTOPLAY_SPEED}
        height={resolvedHeight}
        className={classes.slider}
        showArrows={showArrows}
        showProgress={showProgress}
        onSlideChange={setCurrentSlide}
      >
        {items.map((item, index) => (
          <Box key={`${item.id}-${index}`} className={classes.slideContainer}>
            {renderMedia(item, index)}
            <Box
              className={classes.overlay}
              sx={{
                opacity: item.overlay_opacity ?? 0.3,
              }}
            />

            <StackAlignJustCenter className={classes.contentOverlay} sx={item.layout ? LAYOUT_STYLE_MAP[item.layout] : undefined}>
              {hasContent(item.title) && (
                <Typography component="h1" className={classes.title} sx={{ color: item.title_color || "#FFFFFF" }}>
                  {item.title}
                </Typography>
              )}

              {hasContent(item.subtitle) && (
                <Typography component="p" className={classes.subtitle} sx={{ color: item.title_color || "#FFFFFF" }}>
                  {item.subtitle}
                </Typography>
              )}

              {item.actions?.some((action) => hasContent(action.cta_text)) && (
                <StackRowAlignJustCenter className={cx(classes.actions, item.actions_layout === "STACK" && classes.actionsStack)}>
                  {item.actions.map((action, actionIdx) => {
                    if (!hasContent(action.cta_text)) {
                      return null;
                    }

                    return (
                      <Button
                        component={AppLink}
                        key={`${item.id}-btn-${actionIdx}`}
                        variant="contained"
                        href={action.action_target || "#"}
                        className={classes.button}
                        sx={{
                          backgroundColor: action.cta_bg || "#FFFFFF",
                          color: action.cta_color || "#000000",
                          "&:hover": {
                            backgroundColor: action.cta_bg || "#FFFFFF",
                            color: action.cta_color || "#000000",
                          },
                        }}
                      >
                        {action.cta_text}
                      </Button>
                    );
                  })}
                </StackRowAlignJustCenter>
              )}
            </StackAlignJustCenter>
          </Box>
        ))}
      </SliderComponent>
    </Box>
  );
};

export default BannerCollectionComponent;
