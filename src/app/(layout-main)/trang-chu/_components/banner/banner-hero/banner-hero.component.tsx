"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import { BannerLayout, MediaType, MobileOddFullWidthItem } from "@/utils/api/banner/banner.enum";
import Autoplay from "embla-carousel-autoplay";
import useStyles from "./banner-hero.styles";
import { buildHeroGridCdnTransform, buildHeroSlotAspectRatio } from "./banner-hero.constants";
import { BannerPlacement, BannerItem } from "@/utils/api/banner/banner.interface";
import { AppLink } from "@/components";
import { StackAlignJustCenter, StackRowAlignJustCenter } from "@/components/styled";
import { BannerResponsiveMedia, useBannerMobileMd } from "../banner-responsive-media.component";

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
    top: "8%",
    left: "5%",
    bottom: "auto",
    right: "auto",
    transform: "none",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    textAlign: "left",
  },
  [BannerLayout.CENTER_TOP]: {
    top: "8%",
    left: "50%",
    bottom: "auto",
    right: "auto",
    transform: "translateX(-50%)",
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "center",
  },
  [BannerLayout.RIGHT_TOP]: {
    top: "8%",
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

const hasContent = (value?: string | null) => typeof value === "string" && value.trim().length > 0;

type BannerSlotEntry = BannerPlacement["slots"][number]["banners"][number];

interface BannerHeroProps {
  data: BannerPlacement;
  priority?: boolean;
}

const BannerHeroComponent = ({ data, priority = true }: BannerHeroProps) => {
  const { classes } = useStyles();
  const isMobile = useBannerMobileMd();

  const filteredSlots = useMemo(() => {
    if (!isMobile) return data.slots;
    return data.slots
      .filter((slot) => slot.banners?.some((b) => b.banner.media_mobile_url))
      .map((slot) => ({
        ...slot,
        banners: slot.banners.filter((b) => b.banner.media_mobile_url),
      }));
  }, [data.slots, isMobile]);

  if (!filteredSlots || filteredSlots.length === 0) return null;

  const oddFullWidthIndex = data.settings?.mobileOddFullWidthItem === MobileOddFullWidthItem.FIRST ? 0 : filteredSlots.length - 1;

  return (
    <Box className={classes.root}>
      <Box className={classes.gridContainer}>
        {filteredSlots.map((slot, index) => {
          const isLastOdd = isMobile && filteredSlots.length % 2 !== 0 && index === oddFullWidthIndex;

          const slotWidth = Number(slot.layout_metadata?.width) || 1;
          const slotHeight = Number(slot.layout_metadata?.height) || 1;
          const mobileSpanWidth = isLastOdd ? 2 : 1;

          const gridStyle: React.CSSProperties = isMobile
            ? {
                gridColumn: isLastOdd ? "span 2" : "span 1",
                aspectRatio: buildHeroSlotAspectRatio(mobileSpanWidth, 1),
              }
            : {
                gridColumn: `${slot.layout_metadata.x + 1} / span ${slotWidth}`,
                gridRow: `${slot.layout_metadata.y + 1} / span ${slotHeight}`,
                aspectRatio: buildHeroSlotAspectRatio(slotWidth, slotHeight),
              };

          return (
            <Box key={slot.id} className={classes.gridItem} style={gridStyle}>
              {slot.slot_type === "MULTIPLE_IMAGE" ? (
                <BannerSlider
                  banners={slot.banners}
                  priority={priority && index === 0}
                  colSpan={slotWidth}
                  rowSpan={slotHeight}
                  mobileSpanWidth={mobileSpanWidth}
                />
              ) : (
                <BannerItemView
                  banner={slot.banners[0]?.banner}
                  priority={priority && index === 0}
                  colSpan={slotWidth}
                  rowSpan={slotHeight}
                  mobileSpanWidth={mobileSpanWidth}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const BannerSlider = ({
  banners,
  priority: slotPriority,
  colSpan,
  rowSpan,
  mobileSpanWidth,
}: {
  banners: BannerSlotEntry[];
  priority?: boolean;
  colSpan: number;
  rowSpan: number;
  mobileSpanWidth: number;
}) => {
  const { classes, cx } = useStyles();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <Box className={classes.carousel} ref={emblaRef}>
      <Box className={classes.carouselContainer}>
        {banners.map((item, index) => (
          <Box key={index} className={classes.carouselSlide}>
            <BannerItemView
              banner={item.banner}
              priority={slotPriority && index === 0}
              colSpan={colSpan}
              rowSpan={rowSpan}
              mobileSpanWidth={mobileSpanWidth}
            />
          </Box>
        ))}
      </Box>
      {banners.length > 1 && (
        <Box className={classes.dots}>
          {banners.map((_, i) => (
            <Box key={i} className={cx(classes.dot, { [classes.activeDot]: i === currentIndex })} onClick={() => emblaApi?.scrollTo(i)} />
          ))}
        </Box>
      )}
    </Box>
  );
};

const BannerItemView = ({
  banner,
  priority,
  colSpan,
  rowSpan,
  mobileSpanWidth,
}: {
  banner: BannerItem;
  priority?: boolean;
  colSpan: number;
  rowSpan: number;
  mobileSpanWidth: number;
}) => {
  const { classes, cx } = useStyles();
  if (!banner) return null;

  const alt = banner.title?.trim() || banner.internal_name || "Banner";
  const hasTitle = hasContent(banner.title);
  const hasSubtitle = hasContent(banner.subtitle);
  const hasActions = banner.actions?.some((action) => hasContent(action.cta_text));
  const hasOverlayContent = hasTitle || hasSubtitle || hasActions;

  const renderContentOverlay = () => {
    if (!hasOverlayContent) return null;

    return (
      <StackAlignJustCenter
        className={classes.contentOverlay}
        sx={banner.layout ? LAYOUT_STYLE_MAP[banner.layout] : LAYOUT_STYLE_MAP[BannerLayout.LEFT_BOTTOM]}
      >
        {hasTitle && (
          <Typography component="h2" className={classes.title} sx={{ color: banner.title_color || "#FFFFFF" }}>
            {banner.title}
          </Typography>
        )}

        {hasSubtitle && (
          <Typography component="p" className={classes.subtitle} sx={{ color: banner.title_color || "#FFFFFF" }}>
            {banner.subtitle}
          </Typography>
        )}

        {hasActions && (
          <StackRowAlignJustCenter className={cx(classes.actions, banner.actions_layout === "STACK" && classes.actionsStack)}>
            {banner.actions?.map((action, actionIdx) => {
              if (!hasContent(action.cta_text)) return null;

              return (
                <Button
                  component={AppLink}
                  key={`${banner.id}-btn-${actionIdx}`}
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
    );
  };

  const mediaLinkUrl = banner.media_link_url?.trim();
  const isLinkableMediaType = banner.media_type === MediaType.IMAGE || banner.media_type === MediaType.GIF;
  const canLinkImage = isLinkableMediaType && Boolean(mediaLinkUrl) && mediaLinkUrl !== "#";

  const media = (
    <BannerResponsiveMedia
      desktopSrc={banner.media_url}
      mobileSrc={banner.media_mobile_url}
      desktopPoster={banner.media_poster_url}
      mobilePoster={banner.media_mobile_poster_url}
      mediaType={banner.media_type}
      alt={alt}
      priority={priority}
      imagePresetDesktop="bannerHeroGrid"
      imagePresetTablet="bannerHeroGrid"
      imagePresetMobile="bannerHeroGrid"
      imageTransform={buildHeroGridCdnTransform(colSpan, rowSpan)}
      imageTransformMobile={buildHeroGridCdnTransform(mobileSpanWidth, 1)}
      sizes="100vw"
    />
  );

  return (
    <Box className={classes.mediaWrapper}>
      {canLinkImage ? (
        <AppLink href={mediaLinkUrl!} style={{ width: "100%", height: "100%", display: "block", position: "relative" }}>
          {media}
        </AppLink>
      ) : (
        media
      )}
      {(banner.overlay_opacity ?? 0) > 0 && <Box className={classes.overlay} sx={{ opacity: banner.overlay_opacity }} />}
      {renderContentOverlay()}
    </Box>
  );
};

export default BannerHeroComponent;
