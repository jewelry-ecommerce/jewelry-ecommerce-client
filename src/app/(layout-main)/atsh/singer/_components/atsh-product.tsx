"use client";

import AtshCtaButton from "@/app/(layout-main)/atsh/_components/atsh-cta-button.component";
import { CdnImage } from "@/components";
import { formatCurrency } from "@/utils/api/cart";
import { ApiProduct } from "@/utils/api/product/product.interface";
import { CDN_IMAGE_RETINA_DPR, scaleCdnTransformByDevicePixelRatio } from "@/utils/cdn/cdn-image-dpr.util";
import type { AtshSingerImagePosition } from "../_constants/atsh-singer.constants";
import { Box, Typography } from "@mui/material";
import { ATSH_SINGER_PRODUCT_CTA } from "../_constants/atsh-singer.constants";
import { useAtshSingerBreakpoint } from "../_hooks/use-atsh-singer-breakpoint.hook";
import ATSHTypography from "./atsh-typography";
import useAtshSingerStyles from "./atsh-singer.styles";
import { useProductDefaultImage } from "@/components/providers.component";
import { resolveProductDefaultImageSrc } from "@/utils/config/tenant-branding.util";

interface ATSHProductProps {
  product: ApiProduct;
  index: number;
  imagePosition?: AtshSingerImagePosition;
}

function ATSHProduct({ product, index, imagePosition = "left" }: ATSHProductProps) {
  const { classes, cx } = useAtshSingerStyles();
  const { isMobile, isDesktop } = useAtshSingerBreakpoint();
  const productDefaultImage = useProductDefaultImage() || resolveProductDefaultImageSrc();
  const isTabletUp = !isMobile;

  const imageRenderSize = isDesktop ? 640 : isTabletUp ? 400 : 372;
  const imageCdnTransform = scaleCdnTransformByDevicePixelRatio(
    {
      width: imageRenderSize,
      height: imageRenderSize,
      quality: 95,
      format: "webp",
    },
    CDN_IMAGE_RETINA_DPR,
  );
  const isImageOnRight = imagePosition === "right";

  return (
    <Box className={cx(classes.productRoot, isImageOnRight && classes.productRootReverse)}>
      <Box className={classes.productImageWrap}>
        <CdnImage
          src={product.image}
          fallback={productDefaultImage}
          transform={imageCdnTransform}
          width={imageRenderSize}
          height={imageRenderSize}
          alt={product.productSlug}
          className={classes.productImage}
        />
      </Box>
      <Box className={classes.productContent}>
        <Box className={classes.productTextStack}>
          <Box className={classes.productNameRow}>
            <ATSHTypography fontSize={16} lineHeight="150%" className={cx(classes.productGradientText, classes.productIndexText)}>
              {`0${index}.`}
            </ATSHTypography>
            <ATSHTypography
              fontSize={24}
              lineHeight="150%"
              className={cx(classes.productGradientText, classes.productName, classes.productNameText)}
            >
              {product.productName}
            </ATSHTypography>
          </Box>
          <Typography className={classes.productDescription}>{product.shortDescription}</Typography>
          <Box className={classes.productPriceRow}>
            <ATSHTypography fontSize={24} lineHeight="150%" className={cx(classes.productGradientText, classes.productPriceText)}>
              {formatCurrency(Number(product.defaultDisplay?.sellingPriceAfterTaxMinor ?? 0))}
            </ATSHTypography>
          </Box>
        </Box>
        <Box className={classes.productCtaWrap}>
          <AtshCtaButton
            label={ATSH_SINGER_PRODUCT_CTA.label}
            href={`/san-pham/${product.productSlug}`}
            variant="contained"
            className={classes.productCta}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ATSHProduct;
