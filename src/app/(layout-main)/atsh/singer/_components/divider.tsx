"use client";

import { CdnImage } from "@/components";
import useAtshSingerStyles from "./atsh-singer.styles";
import { useAtshSingerBreakpoint } from "../_hooks/use-atsh-singer-breakpoint.hook";

function ATSHDivider() {
  const { classes } = useAtshSingerStyles();
  const { isDesktop, isTablet } = useAtshSingerBreakpoint();

  const width = isDesktop ? 1200 : isTablet ? 650 : 420;
  const height = isDesktop ? 139 : isTablet ? 75 : 48.5;

  return (
    <CdnImage
      src={
        "https://cdn-media-test.sevagoretail.jewelry/v1/img/test-external-trading/019eda9e-4dbb-723e-90c2-467f7008f379/v-666d1ad8/original.png"
      }
      width={width}
      height={height}
      alt=""
      className={classes.divider}
    />
  );
}

export default ATSHDivider;
