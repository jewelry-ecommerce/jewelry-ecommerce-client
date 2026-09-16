"use client";

import { useEffect, useRef } from "react";
import { resolveCdnVideoUrl } from "@/utils/cdn/resolve-cdn-video-url";
import { normalizeCdnMediaUrl } from "@/utils/cdn/cdn-media.util";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ComponentPropsWithoutRef } from "react";

type NativeVideoProps = Omit<ComponentPropsWithoutRef<"video">, "src" | "poster" | "children">;
const VIEWPORT_VISIBLE_THRESHOLD = 0;

export type CdnVideoProps = {
  src?: string | null;
  poster?: string | null;
  fallback?: string;
  active?: boolean;
  sx?: SxProps<Theme>;
} & NativeVideoProps;

const CdnVideoComponent = ({
  src,
  poster,
  fallback,
  active = true,
  sx,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = "metadata",
  className,
  style,
  ...rest
}: CdnVideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resolvedSrc = resolveCdnVideoUrl({ src, fallback });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay || !resolvedSrc) return;

    const playVideo = () => {
      void video.play().catch(() => undefined);
    };

    if (!active) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    playVideo();

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio > VIEWPORT_VISIBLE_THRESHOLD) {
          playVideo();
          return;
        }

        video.pause();
      },
      { threshold: VIEWPORT_VISIBLE_THRESHOLD },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [active, autoPlay, resolvedSrc]);

  if (!resolvedSrc) {
    return null;
  }

  const resolvedPoster = poster?.trim() ? normalizeCdnMediaUrl(poster) : undefined;

  const videoProps: ComponentPropsWithoutRef<"video"> = {
    src: resolvedSrc,
    poster: resolvedPoster,
    autoPlay: true,
    muted,
    loop,
    playsInline,
    preload,
    className,
    style,
    ...rest,
  };

  return <Box ref={videoRef} component="video" sx={sx} {...videoProps} />;
};

export default CdnVideoComponent;
