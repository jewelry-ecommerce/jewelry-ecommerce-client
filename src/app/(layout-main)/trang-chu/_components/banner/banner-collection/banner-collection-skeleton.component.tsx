import React from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import useStyles from "./banner-collection.styles";
import { StackAlignJustCenter, StackRowAlignJustCenter } from "@/components/styled";

interface BannerCollectionSkeletonProps {
  height?: string | number;
}

const BannerCollectionSkeletonComponent = ({ height }: BannerCollectionSkeletonProps) => {
  const { classes, cx } = useStyles();

  return (
    <Box className={classes.root} sx={height ? { height } : undefined} bgcolor={"#FFFFFF !important"}>
      <Box className={classes.slideContainer}>
        <Box className={classes.media}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Box>

        <Box className={classes.overlay} />

        <StackAlignJustCenter className={classes.contentOverlay}>
          <Typography className={classes.title} sx={{ width: { xs: "80%", md: "50%" } }}>
            <Skeleton variant="text" />
          </Typography>

          <Typography className={classes.subtitle} sx={{ width: { xs: "60%", md: "30%" } }}>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" sx={{ mx: "auto" }} />
          </Typography>

          <StackRowAlignJustCenter className={cx(classes.actions)}>
            <Skeleton variant="rectangular" className={classes.button} />
            <Skeleton variant="rectangular" className={classes.button} />
          </StackRowAlignJustCenter>
        </StackAlignJustCenter>
      </Box>
    </Box>
  );
};

export default BannerCollectionSkeletonComponent;
