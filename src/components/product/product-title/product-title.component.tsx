import React from "react";
import { Box, Skeleton, SxProps, Theme, Typography } from "@mui/material";
import AppLink from "@/components/app-link/app-link.component";
import { StackRowAlignCenterJustBetween } from "@/components/styled";
import useStyles from "./product-title.styles";

interface ProductTitleProps {
  title?: string;
  subtitle?: string;
  seeMore?: { enabled?: boolean; text?: string; url?: string };
  sx?: SxProps<Theme>;
}

const ProductTitleComponent = ({ title, subtitle, seeMore, sx }: ProductTitleProps) => {
  const { classes } = useStyles();

  if (!title && !subtitle) return null;

  return (
    <StackRowAlignCenterJustBetween className={classes.root} sx={{ ...sx }}>
      <Box className={classes.titles}>
        {title && <Typography className={classes.mainTitle}>{title}</Typography>}
        {subtitle && <Typography className={classes.subTitle}>{subtitle}</Typography>}
      </Box>
      {seeMore?.enabled ? (
        <AppLink href={seeMore?.url} className={classes.seeMoreLink}>
          {seeMore?.text}
        </AppLink>
      ) : null}
    </StackRowAlignCenterJustBetween>
  );
};

export const ProductTitleSkeletonComponent = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.root}>
      <Typography className={classes.mainTitle}>
        <Skeleton width="30%" />
      </Typography>
      <Typography className={classes.subTitle}>
        <Skeleton width="20%" />
      </Typography>
    </Box>
  );
};

export default ProductTitleComponent;
