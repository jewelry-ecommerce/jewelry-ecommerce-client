"use client";

import {
  buildProductCardCdnTransform,
  DEFAULT_PRODUCT_CARD_CDN_TRANSFORM,
  isSameCdnTransform,
} from "@/utils/cdn/product-card-image-size.util";
import type { CdnImageTransform } from "@/utils/cdn/cdn-image.util";
import { type RefObject, useLayoutEffect, useState } from "react";

const RESIZE_DEBOUNCE_MS = 100;

/**
 * Prefer the larger positive width between ResizeObserver content box and
 * getBoundingClientRect so Chrome device-mode quirks do not undersize CDN requests
 * (blurry cards). Oversized requests are clamped; CdnImage falls back to original on 400.
 */
function readDisplayWidth(element: HTMLElement, observerWidth?: number): number {
  const rectWidth = element.getBoundingClientRect().width;
  const candidates = [observerWidth, rectWidth].filter((value): value is number => typeof value === "number" && value > 0);

  if (candidates.length === 0) return 0;

  return Math.max(...candidates);
}

/**
 * Measures a product-card image container and returns a CDN transform matching
 * its on-screen CSS size × devicePixelRatio (max 3). Updates on resize / breakpoint change.
 */
export function useProductCardCdnTransform(elementRef: RefObject<HTMLElement | null>): CdnImageTransform {
  const [transform, setTransform] = useState<CdnImageTransform>(DEFAULT_PRODUCT_CARD_CDN_TRANSFORM);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    let debounceId: ReturnType<typeof setTimeout> | undefined;
    let latestWidth = 0;

    const commit = () => {
      if (latestWidth <= 0) return;

      const next = buildProductCardCdnTransform(latestWidth);
      setTransform((prev) => (isSameCdnTransform(prev, next) ? prev : next));
    };

    const scheduleCommit = (observerWidth?: number) => {
      latestWidth = readDisplayWidth(element, observerWidth);
      if (latestWidth <= 0) return;

      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(commit, RESIZE_DEBOUNCE_MS);
    };

    // First paint: commit immediately so LCP is not stuck on the default 350×440.
    latestWidth = readDisplayWidth(element);
    if (latestWidth > 0) {
      commit();
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const contentWidth = entry?.contentRect?.width;
      scheduleCommit(contentWidth);
    });
    observer.observe(element);

    // Backup for Chrome device-toolbar drag, which sometimes skips RO mid-drag.
    const handleViewportChange = () => scheduleCommit();
    window.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("resize", handleViewportChange);

    return () => {
      if (debounceId) clearTimeout(debounceId);
      observer.disconnect();
      window.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
    };
  }, [elementRef]);

  return transform;
}
