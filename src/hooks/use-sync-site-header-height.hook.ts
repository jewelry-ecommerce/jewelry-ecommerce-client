"use client";

import { useEffect } from "react";
import { SITE_HEADER_HEIGHT_CSS_VAR, SITE_HEADER_HEIGHT_FALLBACK_PX } from "@/utils/constants/layout.constant";

/** Đồng bộ chiều cao đo `<header>` lên CSS variable; trả về `SITE_HEADER_HEIGHT_FALLBACK_PX` cho mega search. */
export function useSyncSiteHeaderHeight(headerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return;

    const syncHeight = () => {
      const height = Math.round(headerElement.getBoundingClientRect().height);
      document.documentElement.style.setProperty(SITE_HEADER_HEIGHT_CSS_VAR, `${height}px`);
    };

    syncHeight();

    const resizeObserver = new ResizeObserver(syncHeight);
    resizeObserver.observe(headerElement);
    window.addEventListener("resize", syncHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncHeight);
      document.documentElement.style.removeProperty(SITE_HEADER_HEIGHT_CSS_VAR);
    };
  }, [headerRef]);

  return SITE_HEADER_HEIGHT_FALLBACK_PX;
}
