"use client";

import { useLayoutEffect, useState, type CSSProperties } from "react";
import { PRODUCT_ZOOM_CONFIG } from "@/app/(layout-main)/san-pham/_components/hooks/pinch-zoom.constants";

export function getProductZoomViewportStyle(): CSSProperties {
  const viewport = window.visualViewport;
  if (!viewport) return {};
  const browserScale = viewport.scale || PRODUCT_ZOOM_CONFIG.minScale;
  // Cancel browser magnification locally without changing the page's zoom.
  return {
    width: viewport.width * browserScale,
    height: viewport.height * browserScale,
    transform: `translate(${viewport.offsetLeft}px, ${viewport.offsetTop}px) scale(${1 / browserScale})`,
    transformOrigin: "top left",
  };
}

export function useProductZoomViewport(enabled: boolean): CSSProperties {
  const [viewportStyle, setViewportStyle] = useState<CSSProperties>({});
  useLayoutEffect(() => {
    if (!enabled) return;
    const viewport = window.visualViewport;
    const updateViewport = () => setViewportStyle(getProductZoomViewportStyle());
    updateViewport();
    viewport?.addEventListener("resize", updateViewport);
    viewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);
    return () => {
      viewport?.removeEventListener("resize", updateViewport);
      viewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, [enabled]);
  return viewportStyle;
}
