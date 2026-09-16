// set term
"use client";

import AppLink from "@/components/app-link/app-link.component";
import { CdnImage } from "@/components/cdn-image";
import { useProductDefaultImage } from "@/components/providers.component";
import ProductSizeGuideDrawer from "@/components/product/product-size-guide-drawer/product-size-guide-drawer.component";
import ProductVariantSelector from "@/components/product/product-variant-selector/product-variant-selector.component";
import { StackRowAlignCenter } from "@/components/styled";
import type { SetIncludedProduct, SetVariant } from "@/utils/api/sets/sets.interface";
import { buildContextualVariantSelectors, getVariationAttributeMap } from "@/utils/product/variant-availability.util";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { useMemo, useState } from "react";
import useStyles from "./set-detail.styles";

type SetDetailProductProps = {
  item: SetIncludedProduct;
  selectedVariationId: string | undefined;
  onVariationChange: (itemId: string, variation: SetVariant) => Promise<void>;
  showSizeGuideAtKey?: boolean;
};

const orderVariantSelectors = (item: SetIncludedProduct) => {
  const order = new Map(item.product.variantAttributeOrder.map((id, index) => [id, index]));
  return item.variantSelectors
    .slice()
    .sort(
      (left, right) =>
        (order.get(left.attribute.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(right.attribute.id) ?? Number.MAX_SAFE_INTEGER),
    );
};

const toVariantSelectors = (item: SetIncludedProduct, variations: SetVariant[], selectedAttributes: Record<string, string>) =>
  buildContextualVariantSelectors(
    orderVariantSelectors(item).map((selector) => ({
      attribute: selector.attribute,
      options: selector.options.map((value) => ({
        id: value.code,
        code: value.code,
        label: value.value,
        value: value.value,
        thumbnail: value.thumbnail,
        selected: selectedAttributes[selector.attribute.code] === value.code,
        available: true,
        variationIds: [],
      })),
    })),
    variations,
    selectedAttributes,
  );

const findVariationByAttributes = (variations: SetVariant[], attributes: Readonly<Record<string, string>>) =>
  variations.find((variation) => {
    const variationAttributes = getVariationAttributeMap(variation);
    return Object.entries(attributes).every(([attributeCode, valueCode]) => variationAttributes[attributeCode] === valueCode);
  });

const SetDetailProduct = ({ item, selectedVariationId, onVariationChange, showSizeGuideAtKey = false }: SetDetailProductProps) => {
  const { classes } = useStyles();
  const productDefaultImage = useProductDefaultImage();
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const variations = item.variants;
  const selectedVariation = variations.find((variation) => variation.id === selectedVariationId) ?? variations[0];
  const selectedAttributes = useMemo(() => (selectedVariation ? getVariationAttributeMap(selectedVariation) : {}), [selectedVariation]);
  const selectors = useMemo(() => toVariantSelectors(item, variations, selectedAttributes), [item, selectedAttributes, variations]);
  const productHref = !item.isKey && item.product.slug ? `/san-pham/${item.product.slug}` : undefined;
  const shouldShowSizeGuide = item.isKey && showSizeGuideAtKey;

  const handleAttributeSelect = (attributeCode: string, valueCode: string) => {
    const nextAttributes = { ...selectedAttributes, [attributeCode]: valueCode };
    const nextVariation = findVariationByAttributes(variations, nextAttributes);
    if (!nextVariation) return;
    void onVariationChange(item.itemId, nextVariation);
  };

  return (
    <Box className={`${classes.product} ${item.isKey ? classes.keyProduct : ""}`}>
      {item.isKey ? (
        // set term
        <StackRowAlignCenter className={classes.keyProductHeader} gap={1}>
          <Typography className={classes.keyProductTitle}>Signature Piece</Typography>
        </StackRowAlignCenter>
      ) : null}
      {productHref ? (
        <AppLink href={productHref} className={classes.productImage}>
          <CdnImage
            as="next"
            fill
            src={selectedVariation?.image}
            fallback={productDefaultImage}
            alt={item.product.name}
            preset="cartLineItem"
            sizes="80px"
            style={{ objectFit: "cover" }}
          />
        </AppLink>
      ) : (
        <Box className={classes.productImage}>
          <CdnImage
            as="next"
            fill
            src={selectedVariation?.image}
            fallback={productDefaultImage}
            alt={item.product.name}
            preset="cartLineItem"
            sizes="80px"
            style={{ objectFit: "cover" }}
          />
        </Box>
      )}
      <Stack className={classes.productBody}>
        {productHref ? (
          <AppLink href={productHref}>
            <Typography className={classes.productName}>{item.product.name}</Typography>
          </AppLink>
        ) : (
          <Typography className={classes.productName}>{item.product.name}</Typography>
        )}
        <Typography className={classes.productMeta}>SKU: {selectedVariation?.sku}</Typography>
        {selectors.length > 0 ? (
          <ProductVariantSelector
            variantSelectors={selectors}
            selectedAttributes={selectedAttributes}
            onAttributeSelect={handleAttributeSelect}
            onOpenSizeGuide={shouldShowSizeGuide ? () => setIsSizeGuideOpen(true) : undefined}
            showSizeGuideFallback={shouldShowSizeGuide}
          />
        ) : null}
      </Stack>
      {shouldShowSizeGuide ? (
        <ProductSizeGuideDrawer
          open={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
          onCloseAll={() => setIsSizeGuideOpen(false)}
        />
      ) : null}
    </Box>
  );
};

export default SetDetailProduct;
