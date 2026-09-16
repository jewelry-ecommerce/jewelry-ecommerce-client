"use client";

import { useEffect, useRef, useState } from "react";
import { MediaType } from "@/utils/api/banner/banner.enum";
import { getMediaType } from "@/utils/helpers/common/common.helpers";
import { resolveCdnImageUrl, type CdnImagePreset } from "@/utils/cdn/resolve-cdn-image-url";
import type { CdnImageKind } from "@/utils/cdn/cdn-media.types";
import { toCdnOriginalWebpUrl, type CdnImageTransform } from "@/utils/cdn/cdn-image.util";
import { Box, type BoxProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import Image, { type ImageProps } from "next/image";

type CdnImageBaseProps = {
  src?: string | null;
  alt: string;
  preset?: CdnImagePreset;
  transform?: CdnImageTransform;
  fallback?: string;
  /** `IMAGE` applies CDN resize; `GIF` keeps original (animated). Default `IMAGE`. */
  kind?: CdnImageKind;
  mediaType?: MediaType;
  className?: string;
  sx?: SxProps<Theme>;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

type CdnImageNativeProps = CdnImageBaseProps & {
  as?: "img";
  "aria-hidden"?: boolean;
} & Omit<BoxProps, "component" | "src" | "alt" | "children">;

type CdnImageNextProps = CdnImageBaseProps & {
  as: "next";
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
} & Omit<ImageProps, "src" | "alt">;

export type CdnImageProps = CdnImageNativeProps | CdnImageNextProps;

function isNextMode(props: CdnImageProps): props is CdnImageNextProps {
  if (props.as === "next") return true;
  if ("fill" in props && props.fill) return true;
  if ("width" in props && props.width != null && "height" in props && props.height != null) {
    return true;
  }
  return false;
}

function resolveImageKind(kind: CdnImageKind | undefined, mediaType: MediaType | undefined, src: string): CdnImageKind {
  if (kind) return kind;
  if (mediaType === MediaType.GIF) return MediaType.GIF;
  if (getMediaType(src) === MediaType.GIF) return MediaType.GIF;
  return MediaType.IMAGE;
}

/**
 * When a resized CDN URL fails (e.g. width > original → 400), switch to `/original.webp` once.
 */
function useCdnImageSrcWithOriginalFallback(resolvedSrc: string) {
  const [displaySrc, setDisplaySrc] = useState(resolvedSrc);
  const didFallbackToOriginalRef = useRef(false);

  useEffect(() => {
    setDisplaySrc(resolvedSrc);
    didFallbackToOriginalRef.current = false;
  }, [resolvedSrc]);

  function handleImageError() {
    if (didFallbackToOriginalRef.current) return;

    const originalSrc = toCdnOriginalWebpUrl(resolvedSrc);
    if (!originalSrc || originalSrc === displaySrc) return;

    didFallbackToOriginalRef.current = true;
    setDisplaySrc(originalSrc);
  }

  return { displaySrc, handleImageError };
}

const CdnImageComponent = (props: CdnImageProps) => {
  const { src, alt, preset, transform, fallback, kind, mediaType, className, sx, style, onClick, ...rest } = props;

  const resolvedKind = resolveImageKind(kind, mediaType, src?.trim() || "");
  const resolvedSrc = resolveCdnImageUrl({ src, preset, transform, fallback, kind: resolvedKind, mediaType }).trim();
  const isGif = resolvedKind === MediaType.GIF;
  const { displaySrc, handleImageError } = useCdnImageSrcWithOriginalFallback(resolvedSrc);

  if (!resolvedSrc) {
    return null;
  }

  if (isNextMode(props)) {
    const {
      as: _as,
      fill,
      width,
      height,
      sizes,
      priority,
      fetchPriority,
      loading,
      onError,
      ...imageRest
    } = rest as Omit<CdnImageNextProps, keyof CdnImageBaseProps>;

    return (
      <Image
        key={displaySrc}
        src={displaySrc}
        alt={alt || ""}
        fill={fill}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading}
        fetchPriority={fetchPriority ?? (priority ? "high" : undefined)}
        unoptimized={isGif || didUseOriginalFallback(resolvedSrc, displaySrc)}
        className={className}
        style={style}
        onClick={onClick as ImageProps["onClick"]}
        onError={(event) => {
          handleImageError();
          onError?.(event);
        }}
        {...imageRest}
      />
    );
  }

  const { as: _as, "aria-hidden": ariaHidden, onError, ...boxRest } = rest as Omit<CdnImageNativeProps, keyof CdnImageBaseProps>;

  return (
    <Box
      component="img"
      key={displaySrc}
      src={displaySrc}
      alt={alt || ""}
      className={className}
      sx={sx}
      style={style}
      onClick={onClick}
      aria-hidden={ariaHidden}
      onError={(event) => {
        handleImageError();
        if (typeof onError === "function") onError(event);
      }}
      {...boxRest}
    />
  );
};

function didUseOriginalFallback(resolvedSrc: string, displaySrc: string): boolean {
  return displaySrc !== resolvedSrc && displaySrc.endsWith("/original.webp");
}

export default CdnImageComponent;
