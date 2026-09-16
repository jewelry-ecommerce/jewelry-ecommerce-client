import { useMediaQuery, useTheme } from "@mui/material";

export type StorefrontBreakpoint = "desktop" | "tablet" | "mobile";

export const useStorefrontBreakpoint = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));
  const isTablet = useMediaQuery(theme.breakpoints.between(810, 1200));
  const isDesktop = !isMobile && !isTablet;

  const breakpoint: StorefrontBreakpoint = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

  return { isMobile, isTablet, isDesktop, breakpoint };
};
