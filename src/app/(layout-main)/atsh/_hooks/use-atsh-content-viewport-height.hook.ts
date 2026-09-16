"use client";

import { useHeaderHeight } from "@/app/(layout-main)/san-pham/_components/hooks/use-header-height.hook";
import { useEffect, useState } from "react";

function measureAtshContentViewportHeight(headerHeight: number) {
  if (typeof window === "undefined") return 0;

  const measuredHeader = document.querySelector("header")?.getBoundingClientRect().height ?? headerHeight;
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

  return Math.max(0, Math.round(viewportHeight - measuredHeader));
}

/** Chiều cao vùng nội dung dưới header — dùng visualViewport để tránh gap trắng trên iOS Safari. */
export function useAtshContentViewportHeight() {
  const headerHeight = useHeaderHeight();
  const [contentHeightPx, setContentHeightPx] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      setContentHeightPx(measureAtshContentViewportHeight(headerHeight));
    };

    update();

    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    const header = document.querySelector("header");
    const resizeObserver = header ? new ResizeObserver(update) : null;
    if (header) resizeObserver?.observe(header);

    return () => {
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver?.disconnect();
    };
  }, [headerHeight]);

  const contentViewportHeight =
    contentHeightPx != null ? `${contentHeightPx}px` : headerHeight > 0 ? `calc(100dvh - ${headerHeight}px)` : "100dvh";

  return { contentViewportHeight, contentHeightPx, headerHeight };
}
