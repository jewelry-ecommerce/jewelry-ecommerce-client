import React from "react";
import { Box, Typography } from "@mui/material";
import AppLink from "@/components/app-link/app-link.component";
import type { BreadcrumbComponentProps } from "./breadcrumb.interface";
import useStyles from "./breadcrumb.styles";

const BreadcrumbComponent = ({ items, separator = "/" }: BreadcrumbComponentProps) => {
  const { classes, cx } = useStyles();
  if (!items?.length) {
    return null;
  }

  return (
    <Box component="nav" aria-label="breadcrumb" className={classes.root}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const itemClassName = cx(classes.item, isLast && classes.currentItem);

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {item.href && !isLast ? (
              <AppLink href={item.href} className={itemClassName}>
                {item.label}
              </AppLink>
            ) : (
              <Typography component="span" className={itemClassName}>
                {item.label}
              </Typography>
            )}

            {!isLast ? (
              <Typography component="span" className={classes.separator}>
                {separator}
              </Typography>
            ) : null}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default BreadcrumbComponent;
