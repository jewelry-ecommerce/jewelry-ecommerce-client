"use client";

import AppLink from "@/components/app-link/app-link.component";
import type { StorefrontNavigationItem } from "@/utils/api/cms";
import { buildScopedNavigationHref } from "@/utils/api/cms";
import { Box } from "@mui/material";
import useStyles from "../product-collection-showcase/product-collection-showcase.styles";

type ProductCategoryNavigationTagsProps = {
  navigationItems: StorefrontNavigationItem[];
  basePath?: string;
  sourceBasePath?: string | null;
};

const ProductCategoryNavigationTags = ({ navigationItems, basePath, sourceBasePath }: ProductCategoryNavigationTagsProps) => {
  const { classes } = useStyles();

  if (!navigationItems.length) {
    return null;
  }

  return (
    <Box className={classes.tags}>
      {navigationItems.map((item) => {
        const href = buildScopedNavigationHref(item, basePath, sourceBasePath) ?? item.url;
        if (!href) {
          return null;
        }

        return (
          <AppLink key={item.id} href={href} className={classes.tagButton}>
            {item.label}
          </AppLink>
        );
      })}
    </Box>
  );
};

export default ProductCategoryNavigationTags;
