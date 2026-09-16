"use client";

import { Box, Stack, Typography } from "@mui/material";
import { useHeaderHeight } from "@/app/(layout-main)/san-pham/_components/hooks/use-header-height.hook";
import {
  ATSH_SINGER_DATA,
  ATSH_SINGER_FULL_LOOK_SECTION,
  ATSH_SINGER_MAIN_BG,
  type AtshSingerPageData,
} from "../_constants/atsh-singer.constants";
import { pickAtshSingerResponsiveImage, useAtshSingerBreakpoint } from "../_hooks/use-atsh-singer-breakpoint.hook";
import useAtshSingerStyles from "./atsh-singer.styles";
import { CdnImage } from "@/components";
import ATSHTypography from "./atsh-typography";
import ATSHProduct from "./atsh-product";
import ATSHDivider from "./divider";
import AtshSingerFullLookBottom from "./atsh-singer-full-look-bottom";
import AtshSingerBrotherGallery from "./atsh-singer-brother-gallery";
import AtshSingerDiscover from "./atsh-singer-discover";
import AtshSingerNewsletter from "./atsh-singer-newsletter";

type AtshSingerAppProps = {
  pageData: AtshSingerPageData;
};

const AtshSingerApp = ({ pageData }: AtshSingerAppProps) => {
  const { classes } = useAtshSingerStyles();
  const headerHeight = useHeaderHeight();
  const breakpoint = useAtshSingerBreakpoint();
  const { isMobile, isTablet, isDesktop } = breakpoint;

  const heroSrc = pickAtshSingerResponsiveImage(pageData.heroBanner, breakpoint);
  const mainBgSrc = pickAtshSingerResponsiveImage(ATSH_SINGER_MAIN_BG, breakpoint);
  const fullLookImgSrc = pickAtshSingerResponsiveImage(pageData.fullLookImg, breakpoint);

  const fullLookWidth = isDesktop ? 575 : isTablet ? 400 : 370;
  const fullLookImageHeightHint = Math.round(fullLookWidth * (471 / 370));
  const fullLookImageSizes = isDesktop ? "575px" : "400px";
  const heroViewportHeight = headerHeight > 0 ? `calc(100dvh - ${headerHeight}px)` : "100dvh";

  return (
    <Box className={classes.pageRoot} sx={{ width: "100%" }}>
      <Box
        component="section"
        className={classes.heroBannerSection}
        sx={{
          height: heroViewportHeight,
          minHeight: heroViewportHeight,
          maxHeight: heroViewportHeight,
        }}
      >
        <CdnImage as="next" fill priority src={heroSrc} alt={pageData.singerName} sizes="100vw" className={classes.heroBannerImage} />
      </Box>
      <section className={classes.background}>
        <Box className={classes.backgroundImageLayer} aria-hidden>
          <CdnImage src={mainBgSrc} alt="" className={classes.backgroundImage} />
        </Box>
        <Box className={classes.backgroundContent}>
          <Box className={classes.introSection}>
            <Box className={classes.introLogosRow}>
              <CdnImage
                src={ATSH_SINGER_DATA.HEARTLOCK_LOGO}
                width={!isMobile ? 160 : 120}
                height={!isMobile ? 84 : 62}
                alt="hearlock logo"
              />
              <Typography component="span" className={classes.introCollabX}>
                x
              </Typography>
              <CdnImage src={ATSH_SINGER_DATA.ATSH_LOGO} width={!isMobile ? 160 : 120} height={!isMobile ? 128 : 96} alt="atsh logo" />
            </Box>
            <ATSHTypography fontSize={24} lineHeight="150%" color="white" textAlign="center" className={classes.introTitle}>
              {pageData.pageTitle}
            </ATSHTypography>
            <Typography component="p" className={classes.introDescription}>
              {pageData.introDescription}
            </Typography>
          </Box>
          <Box className={classes.pageContentShell}>
            <Stack direction="column" alignItems="center" divider={<ATSHDivider />} className={classes.productsStack}>
              {pageData.featuredProducts.map(({ product, imagePosition }, index) => (
                <ATSHProduct
                  index={index + 1}
                  product={product}
                  key={product.productId}
                  imagePosition={!isMobile ? imagePosition : "left"}
                />
              ))}
            </Stack>
          </Box>
          <Box className={classes.fullLookSection}>
            <Box className={classes.pageContentShellFullLook}>
              <Box className={classes.fullLookHeader}>
                <ATSHTypography fontSize={24} lineHeight="150%" color="white" className={classes.fullLookHeaderTitle}>
                  {ATSH_SINGER_FULL_LOOK_SECTION.title}
                </ATSHTypography>
                <Typography component="p" className={classes.fullLookHeaderDescription}>
                  {pageData.fullLookDescription}
                </Typography>
              </Box>
              <Box className={classes.fullLookBody}>
                <Box className={classes.fullLookHeroImageWrap}>
                  {isDesktop ? (
                    <CdnImage
                      as="next"
                      fill
                      src={fullLookImgSrc}
                      alt={pageData.singerName}
                      sizes={fullLookImageSizes}
                      className={classes.fullLookHeroImageFill}
                    />
                  ) : (
                    <CdnImage
                      src={fullLookImgSrc}
                      width={fullLookWidth}
                      height={fullLookImageHeightHint}
                      alt={pageData.singerName}
                      className={classes.fullLookHeroImage}
                    />
                  )}
                </Box>
                <Box className={classes.fullLookBottomWrap}>
                  <AtshSingerFullLookBottom
                    title={pageData.fullLookTitle}
                    products={pageData.collectionProducts}
                    totalPrice={pageData.fullLookTotalPrice}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          <AtshSingerBrotherGallery singerName={pageData.singerName} gallery={pageData.singerGallery} />
          <AtshSingerDiscover title={pageData.discoverSectionTitle} cards={pageData.discoverCards} />
          <AtshSingerNewsletter />
        </Box>
      </section>
    </Box>
  );
};

export default AtshSingerApp;
