"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import useSWR from "swr";

import { ProductApi } from "@/utils/api";
import ProductVariantSelector from "@/components/product/product-variant-selector/product-variant-selector.component";
import ProductSizeGuideDrawer from "@/components/product/product-size-guide-drawer/product-size-guide-drawer.component";
import DialogComponent from "@/components/dialog/dialog.component";
import useStyles from "./order-product-item-variation.styles";
import { StackRowAlignJustCenter } from "@/components/styled";
import { normalizeAttributeDisplayType } from "@/utils/constants/attribute-display-type.enum";
import { buildContextualVariantSelectors } from "@/utils/product/variant-availability.util";

export interface OrderProductItemVariationProps {
  open: boolean;
  onClose: () => void;
  slug: string;
  onSelect: (variation: any, product: any) => void;
}

const OrderProductItemVariation = ({ open, onClose, slug, onSelect }: OrderProductItemVariationProps) => {
  const { classes } = useStyles();
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const initializedForOpenRef = useRef(false);

  const { data, isLoading } = useSWR(open && slug ? ["product-variations", slug] : null, ([_, slugParam]) =>
    ProductApi.getProductVariationsBySlug(slugParam),
  );

  const variations = useMemo(() => data?.variations ?? [], [data]);
  const attributes = useMemo(() => data?.attributes ?? [], [data]);
  const product = useMemo(() => data?.product, [data]);

  const baseVariantSelectors = useMemo(() => {
    return attributes.map((attr) => ({
      attribute: {
        id: attr.id,
        name: attr.name,
        code: attr.code,
        index: attr.index,
        displayType: normalizeAttributeDisplayType(attr.displayType),
      },
      options: attr.values.map((v) => ({
        id: v.code,
        code: v.code,
        label: v.value,
        value: v.value,
        thumbnail: v.image ?? null,
        selected: false,
        available: true,
        variationIds: variations
          .filter((variation) => variation.attributeValues.some((av) => av.attributeCode === attr.code && av.valueCode === v.code))
          .map((variation) => variation.id),
      })),
    }));
  }, [attributes, variations]);

  const variantSelectors = useMemo(
    () => buildContextualVariantSelectors(baseVariantSelectors, variations, selectedAttributes),
    [baseVariantSelectors, variations, selectedAttributes],
  );

  useEffect(() => {
    if (!open) {
      initializedForOpenRef.current = false;
      return;
    }

    if (!variations.length || initializedForOpenRef.current) return;

    const initialAttrs: Record<string, string> = {};
    variations[0].attributeValues.forEach((av) => {
      initialAttrs[av.attributeCode] = av.valueCode;
    });
    setSelectedAttributes(initialAttrs);
    initializedForOpenRef.current = true;
  }, [open, variations]);

  const currentVariation = useMemo(() => {
    if (!variations.length) return undefined;

    return variations.find((v) => v.attributeValues.every((av) => selectedAttributes[av.attributeCode] === av.valueCode)) || variations[0];
  }, [variations, selectedAttributes]);

  const handleConfirmSelect = () => {
    if (!currentVariation || !product) return;

    const resolvedAttributes =
      currentVariation.attributeValues?.map((av: any) => {
        const attrDef = attributes.find((a: any) => a.code === av.attributeCode);
        const valDef = attrDef?.values?.find((v: any) => v.code === av.valueCode);
        return {
          attributeCode: av.attributeCode,
          attributeName: attrDef?.name || av.attributeCode,
          value: valDef?.value || av.valueCode,
        };
      }) || [];

    onSelect({ ...currentVariation, resolvedAttributes }, product);
    onClose();
  };

  return (
    <React.Fragment>
      <DialogComponent
        open={open}
        onClose={onClose}
        title="Thông tin sản phẩm"
        sx={{
          width: "100%",
          maxWidth: { xs: "calc(100% - 10px)", sm: 460 },
          margin: "20px !important",
          borderRadius: "0px !important",
          padding: "20px !important",
          "& .MuiPaper-root": {
            borderRadius: "0px !important",
          },
        }}
      >
        <Stack className={classes.root}>
          <Box className={classes.body}>
            {isLoading ? (
              <Typography sx={{ p: 2 }}>Đang tải...</Typography>
            ) : !product || !currentVariation ? (
              <Typography sx={{ p: 2 }}>Không tìm thấy dữ liệu sản phẩm.</Typography>
            ) : (
              <Stack className={classes.productWrapper}>
                <Box className={classes.topSection}>
                  <StackRowAlignJustCenter className={classes.thumb}>
                    <Box
                      component="img"
                      src={currentVariation.image || product.image}
                      alt={product.name}
                      width="100%"
                      height="100%"
                      style={{ objectFit: "cover" }}
                    />
                  </StackRowAlignJustCenter>

                  <Stack className={classes.productInfo}>
                    <Typography className={classes.productName}>{product.name}</Typography>
                    <Box className={classes.priceRow}>
                      <Typography className={classes.salePrice}>
                        {Number(currentVariation.sellingPriceAfterTaxMinor).toLocaleString()}đ
                      </Typography>
                      {currentVariation.compareAtPriceAfterTaxMinor !== currentVariation.sellingPriceAfterTaxMinor && (
                        <Typography className={classes.originalPrice}>
                          {Number(currentVariation.compareAtPriceAfterTaxMinor).toLocaleString()}đ
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>

                <ProductVariantSelector
                  variantSelectors={variantSelectors}
                  selectedAttributes={selectedAttributes}
                  onAttributeSelect={(attrCode: string, valueCode: string) =>
                    setSelectedAttributes((prev) => ({ ...prev, [attrCode]: valueCode }))
                  }
                  onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                />

                <Box className={classes.footer}>
                  <Button
                    className={classes.selectButton}
                    onClick={handleConfirmSelect}
                    variant="contained"
                    disabled={currentVariation.stock <= 0}
                  >
                    {currentVariation.stock > 0 ? "Chọn" : "Hết hàng"}
                  </Button>
                </Box>
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogComponent>

      <ProductSizeGuideDrawer
        open={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        onCloseAll={() => setIsSizeGuideOpen(false)}
      />
    </React.Fragment>
  );
};

export default OrderProductItemVariation;
