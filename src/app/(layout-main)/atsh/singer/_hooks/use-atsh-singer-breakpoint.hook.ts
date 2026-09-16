"use client";

import { useMediaQuery, useTheme } from "@mui/material";
import { useStorefrontBreakpoint } from "@/hooks/use-storefront-breakpoint.hook";
import type { AtshSingerResponsiveImage } from "../_constants/atsh-singer.constants";

export type AtshSingerBreakpointState = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
};

/** mobile <810 | tablet 810–1199 | desktop ≥1200 | wide ≥1512 */
export const useAtshSingerBreakpoint = (): AtshSingerBreakpointState => {
  const theme = useTheme();
  const { isMobile, isTablet, isDesktop } = useStorefrontBreakpoint();
  const isWide = useMediaQuery(theme.breakpoints.up("xl"));

  return { isMobile, isTablet, isDesktop, isWide };
};

export const pickAtshSingerResponsiveImage = (image: AtshSingerResponsiveImage, { isDesktop, isTablet }: AtshSingerBreakpointState) => {
  if (isDesktop) return image.desktop ?? image.tablet;
  if (isTablet) return image.tablet;
  return image.mobile;
};
