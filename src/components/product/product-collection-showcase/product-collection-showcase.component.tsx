import React from "react";
import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { CdnImage } from "@/components/cdn-image";
import type { ProductCollectionShowcaseItem, ProductCollectionShowcaseProps } from "./product-collection-showcase.interface";
import useStyles from "./product-collection-showcase.styles";
import { normalizeProductCollectionShowcaseImageUrl } from "./product-collection-showcase.constants";

const ProductCollectionShowcase = ({ title, items, tags, footer, sx, onItemClick, onTagClick }: ProductCollectionShowcaseProps) => {
  const { classes } = useStyles();
  const fallbackImage = "https://cdn.shopify.com/s/files/1/0797/3637/3533/files/1_Clean_Modern_4mm_Black_Titanium.jpg";

  const handleItemClick = (item: ProductCollectionShowcaseItem) => {
    onItemClick?.(item);
  };

  return (
    <Box className={classes.root} sx={sx}>
      <Typography className={classes.title}>{title}</Typography>

      <Box className={classes.cards}>
        {items.map((item) => {
          const imageUrl = item.image || fallbackImage;
          const card = (
            <React.Fragment>
              <Box className={classes.card}>
                <CdnImage
                  as="next"
                  src={normalizeProductCollectionShowcaseImageUrl(imageUrl) ?? imageUrl}
                  preset="productCollectionShowcase"
                  alt={item.title}
                  fill
                  sizes="257px"
                  style={{ objectFit: "cover" }}
                />
              </Box>
              <Typography className={classes.cardTitle}>{item.title}</Typography>
            </React.Fragment>
          );

          const handleClick = () => handleItemClick(item);

          if (item.href) {
            return (
              <Box key={item.id} onClick={handleClick}>
                <Link href={item.href} scroll={false}>
                  {card}
                </Link>
              </Box>
            );
          }

          return (
            <Box key={item.id} onClick={handleClick}>
              {card}
            </Box>
          );
        })}
      </Box>

      {footer}

      {tags.length > 0 ? (
        <Box className={classes.tags}>
          {tags.map((tag, index) => (
            <Box key={`${tag}-${index}`} component="button" type="button" className={classes.tagButton} onClick={() => onTagClick?.(tag)}>
              {tag}
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default ProductCollectionShowcase;
