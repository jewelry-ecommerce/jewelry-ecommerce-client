import { siteHeaderHeightCssVar } from "@/utils/constants/layout.constant";
import { useMemo } from "react";
import { useMediaQuery, useTheme } from "@mui/material";

/** `top` offset cho thanh sticky/fixed ngay dưới header site (đọc từ CSS variable). */
export const useStickyBelowHeaderTop = () => {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down(810));

  return useMemo(() => {
    if (isMobileOrTablet) {
      return `calc(${siteHeaderHeightCssVar()} + env(safe-area-inset-top, 0px))`;
    }

    return siteHeaderHeightCssVar();
  }, [isMobileOrTablet]);
};

/** @deprecated Dùng `useStickyBelowHeaderTop` hoặc `StickyBelowHeaderBar`. */
export const useStickyTop = (headerHeight: number) => {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down(810));

  return useMemo(() => {
    if (isMobileOrTablet) {
      return `calc(${headerHeight}px + env(safe-area-inset-top, 0px))`;
    }

    return `${headerHeight}px`;
  }, [headerHeight, isMobileOrTablet]);
};
