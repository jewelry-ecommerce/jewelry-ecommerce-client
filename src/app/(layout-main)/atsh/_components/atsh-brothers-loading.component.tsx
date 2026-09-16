"use client";

import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import { isAtshLandingPath } from "@/app/(layout-main)/atsh/_constants/atsh.constants";
import { ATSH_PAGE_BACKGROUND } from "@/app/(layout-main)/atsh/_constants/atsh-loading.constants";
import { siteHeaderHeightCssVar } from "@/utils/constants/layout.constant";

const ATSH_SINGER_LOADING_BACKGROUND = "#0d0618";

function resolveAtshLoadingBackground(pathname: string | null): string {
  if (pathname?.startsWith("/atsh/singer")) {
    return ATSH_SINGER_LOADING_BACKGROUND;
  }

  return ATSH_PAGE_BACKGROUND;
}

export function AtshBrothersLoadingShell() {
  const pathname = usePathname();
  const isLanding = isAtshLandingPath(pathname);
  const backgroundColor = resolveAtshLoadingBackground(pathname);

  return (
    <Box
      aria-busy="true"
      aria-live="polite"
      sx={{
        width: "100%",
        backgroundColor,
        ...(isLanding
          ? {
              position: "fixed",
              top: siteHeaderHeightCssVar(),
              left: 0,
              right: 0,
              bottom: 0,
            }
          : {
              minHeight: `calc(100dvh - ${siteHeaderHeightCssVar()})`,
            }),
      }}
    />
  );
}
