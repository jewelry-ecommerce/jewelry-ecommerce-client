"use client";

import { useMediaQuery, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { CdnImage } from "@/components/cdn-image";
import { CdnVideo } from "@/components/cdn-video";
import { MediaType } from "@/utils/api/banner/banner.enum";
import type { CdnImageTransform } from "@/utils/cdn/cdn-image.util";
import { resolveCdnImageUrl, type CdnImagePreset } from "@/utils/cdn/resolve-cdn-image-url";
import { getMediaType } from "@/utils/helpers/common";
import { useStorefrontBreakpoint } from "@/hooks/use-storefront-breakpoint.hook";

export const useBannerMobileMd = (): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("md"));
};

type BannerResponsiveMediaProps = {
  desktopSrc?: string | null;
  mobileSrc?: string | null;
  desktopPoster?: string | null;
  mobilePoster?: string | null;
  mediaType?: MediaType;
  alt: string;
  priority?: boolean;
  active?: boolean;
  imagePresetDesktop: CdnImagePreset;
  imagePresetTablet?: CdnImagePreset;
  imagePresetMobile: CdnImagePreset;
  imageTransform?: CdnImageTransform;
  imageTransformMobile?: CdnImageTransform;
  sizes: string;
  className?: string;
  sx?: SxProps<Theme>;
  loop?: boolean;
};

export const BannerResponsiveMedia = ({
  desktopSrc,
  mobileSrc,
  desktopPoster,
  mobilePoster,
  mediaType,
  alt,
  priority,
  active = true,
  imagePresetDesktop,
  imagePresetTablet,
  imagePresetMobile,
  imageTransform,
  imageTransformMobile,
  sizes,
  className,
  sx,
  loop = true,
}: BannerResponsiveMediaProps) => {
  const { isMobile, isTablet } = useStorefrontBreakpoint();

  const imagePreset = isMobile ? imagePresetMobile : isTablet ? (imagePresetTablet ?? imagePresetDesktop) : imagePresetDesktop;

  const resolvedImageTransform = isMobile ? (imageTransformMobile ?? imageTransform) : imageTransform;

  const src = isMobile ? mobileSrc || desktopSrc : desktopSrc;
  if (!src) return null;

  const poster = isMobile ? mobilePoster || desktopPoster : desktopPoster;
  const resolvedMediaType = mediaType || getMediaType(src);
  const resolvedPoster = poster
    ? resolveCdnImageUrl({
        src: poster,
        preset: resolvedImageTransform ? undefined : imagePreset,
        transform: resolvedImageTransform,
        mediaType: MediaType.IMAGE,
      })
    : undefined;

  if (resolvedMediaType === MediaType.VIDEO) {
    return (
      <CdnVideo
        src={src}
        poster={resolvedPoster}
        autoPlay
        active={active}
        muted
        loop={loop}
        playsInline
        preload="metadata"
        aria-label={alt}
        className={className}
        sx={sx ?? { width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }

  const imageKind = resolvedMediaType === MediaType.GIF ? MediaType.GIF : MediaType.IMAGE;

  return (
    <CdnImage
      as="next"
      src={src}
      preset={resolvedImageTransform ? undefined : imagePreset}
      transform={resolvedImageTransform}
      kind={imageKind}
      mediaType={resolvedMediaType}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      style={{ objectFit: "cover" }}
    />
  );
};
