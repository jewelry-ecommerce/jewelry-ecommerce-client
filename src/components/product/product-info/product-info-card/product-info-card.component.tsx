import React from "react";
import { CdnImage } from "@/components/cdn-image";
import { CdnVideo } from "@/components/cdn-video";
import { Box, Typography, SxProps, Theme } from "@mui/material";
import Link from "next/link";
import { MediaType } from "@/utils/api/banner/banner.enum";
import { getMediaType } from "@/utils/helpers/common";
import useStyles from "./product-info-card.styles";
import { normalizeProductInfoCardImageUrl } from "./product-info-card.constants";

export interface ProductInfoCardProps {
  title: string;
  subtitle?: string;
  src?: string;
  /** Loại media từ CMS — kết hợp `getMediaType(src)` khi có. */
  mediaType?: MediaType;
  /** Ảnh poster cho video (vd. thumbnailUrl từ CMS). */
  posterSrc?: string;
  alt?: string;
  href?: string;
  width?: number | string;
  height?: number | string;
  actionLabel?: string;
  aspectRatio?: string | number;
  sx?: SxProps<Theme>;
  className?: string;
}

const CardMedia = ({
  media,
  mediaType: mediaTypeProp,
  posterSrc,
  alt = "",
  aspectRatio,
  className,
  mediaClassName,
  sx,
}: {
  media?: string;
  mediaType?: MediaType;
  posterSrc?: string;
  alt?: string;
  aspectRatio?: string | number;
  className?: string;
  mediaClassName?: string;
  sx?: SxProps<Theme>;
}) => {
  const resolvedType = getMediaType(media, mediaTypeProp);

  return (
    <Box
      className={className}
      sx={{
        ...(aspectRatio != null ? { aspectRatio } : null),
        ...sx,
      }}
    >
      {!media ? null : resolvedType === MediaType.VIDEO ? (
        <CdnVideo
          src={media}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          className={mediaClassName}
          aria-label={alt || "Video"}
          sx={
            aspectRatio != null
              ? { width: "100%", height: "100%", objectFit: "cover" }
              : { width: "100%", height: "auto", display: "block" }
          }
        />
      ) : (
        <CdnImage
          src={normalizeProductInfoCardImageUrl(media) ?? media}
          preset="infoCard"
          kind={resolvedType === MediaType.GIF ? MediaType.GIF : MediaType.IMAGE}
          mediaType={mediaTypeProp}
          alt={alt}
          className={mediaClassName}
          sx={aspectRatio != null ? { width: "100%", height: "100%", objectFit: "contain" } : undefined}
        />
      )}
    </Box>
  );
};

const ProductInfoCardComponent = ({
  title,
  subtitle,
  src,
  mediaType,
  posterSrc,
  alt,
  href,
  width,
  height,
  actionLabel,
  // Mặc định không ép 473/270 — ảnh gốc (vd. trust strip ngang) hiển thị đúng tỷ lệ, không bị cover phóng mờ.
  aspectRatio,
  sx,
  className,
}: ProductInfoCardProps) => {
  const { classes, cx } = useStyles({
    props: { width, height, isLink: !!href },
  });

  const rootProps: any = href
    ? { component: Link, href, "aria-label": `${title} - ${actionLabel || "View details"}` }
    : { component: "div" };

  return (
    <Box {...rootProps} className={cx(classes.root, className)} sx={sx}>
      <CardMedia
        media={src}
        mediaType={mediaType}
        posterSrc={posterSrc}
        alt={alt ?? title}
        aspectRatio={aspectRatio}
        className={classes.mediaWrapper}
        mediaClassName={classes.media}
      />
      <Box className={classes.contentWrapper}>
        <Box className={classes.textGroup}>
          <Typography className={classes.title}>{title}</Typography>
          {subtitle && <Typography className={classes.subtitle}>{subtitle}</Typography>}
        </Box>

        {actionLabel && (
          <Box>
            <Typography className={classes.actionLabel}>{actionLabel}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProductInfoCardComponent;
