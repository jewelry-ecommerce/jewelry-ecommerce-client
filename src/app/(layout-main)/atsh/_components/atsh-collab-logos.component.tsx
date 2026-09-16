"use client";

import { CdnImage } from "@/components/cdn-image";
import { Box, Typography } from "@mui/material";
import { Fragment, useMemo, type CSSProperties } from "react";
import { resolveAtshCollabLogos } from "../_utils/atsh-brothers.util";
import { useAtshBrothersData } from "./atsh-brothers.provider";
import useAtshStyles from "./atsh.styles";

type AtshCollabLogosProps = {
  className?: string;
};

function AtshCollabLogos({ className }: AtshCollabLogosProps) {
  const { classes, cx } = useAtshStyles();
  const brothersData = useAtshBrothersData();
  const logos = useMemo(() => resolveAtshCollabLogos(brothersData), [brothersData]);

  return (
    <Box className={cx(classes.collabLogos, className)}>
      {logos.map((logo, index) => (
        <Fragment key={logo.id || `${logo.src}-${index}`}>
          {index > 0 ? (
            <Typography component="span" className={classes.collabX}>
              x
            </Typography>
          ) : null}
          <Box
            className={classes.collabLogoItem}
            style={
              {
                "--atsh-collab-logo-w": `${logo.width}px`,
                "--atsh-collab-logo-h": `${logo.height}px`,
              } as CSSProperties
            }
          >
            <CdnImage
              as="next"
              src={logo.src}
              alt={logo.alt || "Logo"}
              width={logo.width}
              height={logo.height}
              className={classes.collabLogoImage}
              priority
            />
          </Box>
        </Fragment>
      ))}
    </Box>
  );
}

export default AtshCollabLogos;
