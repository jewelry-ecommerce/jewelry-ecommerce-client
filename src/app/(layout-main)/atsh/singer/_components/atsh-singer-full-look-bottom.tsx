"use client";

import AtshCtaButton from "@/app/(layout-main)/atsh/_components/atsh-cta-button.component";
import { ProductSliderComponent } from "@/components";
import useProductWishlist from "@/hooks/use-product-wishlist.hook";
import { formatCurrency } from "@/utils/api/cart";
import type { ApiProduct } from "@/utils/api/product/product.interface";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ATSH_SINGER_FULL_LOOK_CTA, ATSH_SINGER_SAVINGS_BADGE } from "../_constants/atsh-singer.constants";
import ATSHTypography from "./atsh-typography";
import useAtshSingerStyles from "./atsh-singer.styles";

const GRADIENT_TEXT_SX = {
  textShadow: "0 0 8px rgba(139, 92, 255, 0.70)",
  background: "linear-gradient(180deg, #FFF 0%, #D7C2FF 45%, #9C74FF 86%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as const;

const formatSavingsLabel = (amount: number) => `Tiết kiệm ${new Intl.NumberFormat("vi-VN").format(amount)}đ`;

type AtshSingerFullLookBottomProps = {
  title: string;
  products: ApiProduct[];
  totalPrice: number;
};

const AtshSingerFullLookBottom = ({ title, products, totalPrice }: AtshSingerFullLookBottomProps) => {
  const { classes } = useAtshSingerStyles();
  const router = useRouter();
  const { mapWishlistProducts } = useProductWishlist();

  const items = useMemo(() => mapWishlistProducts(products), [mapWishlistProducts, products]);

  const originalPrice = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.defaultDisplay?.compareAtPriceAfterTaxMinor ?? 0), 0),
    [products],
  );

  const savings = Math.max(0, originalPrice - totalPrice);

  return (
    <Box className={classes.fullLookBottom}>
      <ATSHTypography fontSize={20} lineHeight={"150%"} color="white" className={classes.fullLookTitle}>
        {title}
      </ATSHTypography>

      <Box className={classes.fullLookCarousel}>
        <ProductSliderComponent
          slidesPerView={3}
          isMobileTemplate
          items={items}
          onProductClick={(slug) => router.push(`/san-pham/${slug}`)}
        />
      </Box>

      <Box className={classes.fullLookFooter}>
        <Box className={classes.fullLookPriceBlock}>
          {originalPrice > totalPrice && (
            <ATSHTypography className={classes.fullLookOriginalPrice}>{formatCurrency(originalPrice).replace("đ", " VND")}</ATSHTypography>
          )}
          <Box className={classes.fullLookPriceTopRow}>
            <ATSHTypography fontSize={24} lineHeight={"150%"} sx={GRADIENT_TEXT_SX} className={classes.fullLookTotalPrice}>
              {formatCurrency(totalPrice).replace("đ", " VND")}
            </ATSHTypography>
            {savings > 0 && (
              <Box className={classes.fullLookSavingsBadge}>
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    backgroundImage: `url(${ATSH_SINGER_SAVINGS_BADGE})`,
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    pointerEvents: "none",
                  }}
                />
                <Typography component="span" className={classes.fullLookSavingsBadgeText}>
                  {formatSavingsLabel(savings)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <AtshCtaButton
          label={ATSH_SINGER_FULL_LOOK_CTA.label}
          href={ATSH_SINGER_FULL_LOOK_CTA.href}
          variant="contained"
          className={classes.productCta}
        />
      </Box>
    </Box>
  );
};

export default AtshSingerFullLookBottom;
