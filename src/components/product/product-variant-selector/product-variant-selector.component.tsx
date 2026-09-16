import { Box, Button, Stack, Typography } from "@mui/material";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import useStyles from "./product-variant-selector.styles";
import { CdnImage } from "@/components/cdn-image";
import Image from "next/image";
import type { IVariantSelector } from "@/utils/api/product/product.interface";
import { isTextAttributeDisplayType } from "@/utils/constants/attribute-display-type.enum";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { resolveSizeGuideAttributeCode } from "@/utils/product/size-variant-attribute.util";

type ProductVariantSelectorProps = {
  variantSelectors: IVariantSelector[];
  selectedAttributes: Record<string, string>;
  onAttributeSelect: (attrCode: string, valueCode: string) => void;
  onOpenSizeGuide?: () => void;
  showSizeGuideFallback?: boolean;
};

const ProductVariantSelector = ({
  variantSelectors,
  selectedAttributes,
  onAttributeSelect,
  onOpenSizeGuide,
  showSizeGuideFallback = false,
}: ProductVariantSelectorProps) => {
  const { classes, cx } = useStyles();
  const sizeGuideAttributeCode =
    resolveSizeGuideAttributeCode(variantSelectors) ?? (showSizeGuideFallback ? variantSelectors[0]?.attribute.code : undefined);

  return (
    <Stack gap={1.5}>
      {variantSelectors.map((selector, selectorIndex) => {
        const { attribute, options } = selector;
        const isText = isTextAttributeDisplayType(attribute.displayType);
        const showSizeGuide = Boolean(onOpenSizeGuide && sizeGuideAttributeCode && sizeGuideAttributeCode === attribute.code);
        const selectedOption = options.find((o) => o.code === selectedAttributes[attribute.code]);
        const sectionKey = attribute.code || attribute.id || `selector-${selectorIndex}`;

        return (
          <Box key={sectionKey} className={classes.section}>
            {/* Header Row */}
            <StackRowAlignCenterJustBetween sx={{ flexWrap: "wrap", gap: 1 }}>
              <StackRowAlignCenter gap={1}>
                <Typography className={classes.sectionLabel}>{attribute.name}:</Typography>
                {selectedOption && <Typography className={classes.labelBold}>{selectedOption.value}</Typography>}
              </StackRowAlignCenter>
              {showSizeGuide && (
                <StackRowAlignCenter sx={{ cursor: "pointer" }} gap={1} onClick={onOpenSizeGuide}>
                  <Image src="/image/icons/icon-guide-size.svg" alt="size guide" width={16} height={16} />
                  <Typography className={classes.guideLink}>Hướng dẫn chọn size</Typography>
                </StackRowAlignCenter>
              )}
            </StackRowAlignCenterJustBetween>

            {/* Options */}
            <Box className={isText ? classes.sizes : classes.swatches}>
              {options.map((option, optionIndex) => {
                const isActive = selectedAttributes[attribute.code] === option.code;
                const isDisabled = !option.available;
                const usesCompactSwatch = !isText && Boolean(option.thumbnail);
                const optionKey = option.code || option.id || `${sectionKey}-option-${optionIndex}`;

                return (
                  <Button
                    key={optionKey}
                    type="button"
                    className={cx(
                      usesCompactSwatch ? classes.swatchButton : classes.sizeButton,
                      isActive && (usesCompactSwatch ? classes.swatchActive : classes.sizeActive),
                      isDisabled && (usesCompactSwatch ? classes.swatchDisabled : classes.sizeDisabled),
                    )}
                    onClick={() => onAttributeSelect(attribute.code, option.code)}
                    variant="text"
                  >
                    {usesCompactSwatch ? (
                      <CdnImage src={option.thumbnail!} preset="variantSwatch" alt={option.value} className={classes.swatchImage} />
                    ) : (
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#27251F", whiteSpace: "nowrap" }}>
                        {option.value}
                      </Typography>
                    )}
                  </Button>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

export default ProductVariantSelector;
