import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import {
  ATSH_SINGER_FULL_LOOK_FRAME,
  ATSH_SINGER_GALLERY_IMAGE_FRAME,
  ATSH_SINGER_PAGE_MAX_WIDTH,
  ATSH_SINGER_PRODUCT_FRAME,
} from "../_constants/atsh-singer.constants";

const GRADIENT_TEXT = {
  textShadow: "0 0 8px rgba(139, 92, 255, 0.70)",
  background: "linear-gradient(180deg, #FFF 0%, #D7C2FF 44.71%, #9C74FF 86.39%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as const;

const useAtshSingerStyles = makeStyles({ name: "AtshSinger" })((theme) => ({
  pageRoot: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflowX: "hidden",
  },
  heroBannerSection: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },
  heroBannerImage: {
    objectFit: "cover",
    objectPosition: "center center",
  },
  background: {
    position: "relative",
    width: "100%",
  },
  backgroundImageLayer: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    overflow: "hidden",
  },
  backgroundImage: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "top center",
  },
  backgroundContent: {
    position: "relative",
    zIndex: 1,
  },
  introSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
    paddingTop: 40,
    paddingBottom: 40,
    [theme.breakpoints.up("md")]: {
      paddingTop: 80,
      paddingBottom: 80,
    },
  },
  introLogosRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    width: 320,
    [theme.breakpoints.between("md", "lg")]: {
      width: "auto",
    },
  },
  introCollabX: {
    fontSize: 32,
    lineHeight: "125%",
    color: theme.palette.common.white,
    textTransform: "lowercase",
  },
  introTitle: {
    maxWidth: 295,
    [theme.breakpoints.between("md", "lg")]: {
      maxWidth: 368,
      fontSize: 32,
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: 998,
      fontSize: 40,
    },
  },
  introDescription: {
    paddingLeft: 24,
    paddingRight: 24,
    fontSize: 14,
    color: theme.palette.common.white,
    textAlign: "center",
    [theme.breakpoints.between("md", "lg")]: {
      maxWidth: 756,
      fontSize: 18,
      lineHeight: "26px",
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: 998,
      fontSize: 24,
      lineHeight: "32px",
    },
  },
  divider: {
    width: "100%",
    maxWidth: "420px",
    height: "auto",
    [theme.breakpoints.between("md", "lg")]: {
      maxWidth: 650,
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: 1200,
    },
  },
  productsStack: {
    width: "100%",
    gap: 40,
    [theme.breakpoints.up("md")]: {
      gap: 80,
    },
  },
  pageContentShell: {
    width: "100%",
    maxWidth: ATSH_SINGER_PAGE_MAX_WIDTH,
    marginInline: "auto",
    paddingInline: 16,
    boxSizing: "border-box",
    [theme.breakpoints.up("md")]: {
      paddingInline: 24,
    },
    [theme.breakpoints.up("xl")]: {
      paddingInline: 0,
    },
  },
  pageContentShellFullLook: {
    width: "100%",
    maxWidth: ATSH_SINGER_PAGE_MAX_WIDTH,
    marginInline: "auto",
    paddingInline: 16,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 40,
    [theme.breakpoints.up("md")]: {
      paddingInline: 24,
      gap: 56,
    },
    [theme.breakpoints.up("lg")]: {
      gap: 80,
    },
    [theme.breakpoints.up("xl")]: {
      paddingInline: 0,
    },
  },
  productRoot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 24px",
    width: "100%",
    boxSizing: "border-box",
    [theme.breakpoints.up("md")]: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: ATSH_SINGER_PRODUCT_FRAME.tabletGap,
      padding: "44px 16px",
      width: "100%",
      maxWidth: "100%",
    },
    [theme.breakpoints.up("xl")]: {
      gap: ATSH_SINGER_PRODUCT_FRAME.gap,
      padding: "44px 0",
      maxWidth: ATSH_SINGER_PRODUCT_FRAME.width,
      marginInline: "auto",
      justifyContent: "space-between",
      width: "100%",
    },
  },
  productRootReverse: {
    [theme.breakpoints.up("md")]: {
      flexDirection: "row-reverse",
    },
  },
  productImageWrap: {
    width: "100%",
    marginBottom: 16,
    backgroundColor: "var(--product-image-background)",
    [theme.breakpoints.up("md")]: {
      flex: "1 1 52%",
      minWidth: 0,
      maxWidth: ATSH_SINGER_PRODUCT_FRAME.tabletImageMaxWidth,
      width: "auto",
      aspectRatio: "1 / 1",
      height: "auto",
      marginBottom: 0,
    },
    [theme.breakpoints.up("xl")]: {
      flex: "none",
      width: ATSH_SINGER_PRODUCT_FRAME.imageSize,
      height: ATSH_SINGER_PRODUCT_FRAME.imageSize,
      maxWidth: ATSH_SINGER_PRODUCT_FRAME.imageSize,
      aspectRatio: "auto",
    },
  },
  productImage: {
    width: "100%",
    height: "auto",
    display: "block",
    [theme.breakpoints.up("md")]: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
  },
  productContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
    [theme.breakpoints.up("md")]: {
      flex: "1 1 48%",
      width: "auto",
      maxWidth: ATSH_SINGER_PRODUCT_FRAME.contentWidth,
      alignItems: "flex-start",
    },
    [theme.breakpoints.up("lg")]: {
      paddingLeft: 80,
    },
    [theme.breakpoints.up("xl")]: {
      flex: "none",
      width: ATSH_SINGER_PRODUCT_FRAME.contentWidth,
    },
  },
  productTextStack: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
    alignSelf: "stretch",
    [theme.breakpoints.up("md")]: {
      alignItems: "flex-start",
    },
  },
  productNameRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    alignSelf: "stretch",
    gap: 0,
    [theme.breakpoints.up("md")]: {
      alignItems: "flex-start",
    },
  },
  productGradientText: {
    ...GRADIENT_TEXT,
    textAlign: "center",
    alignSelf: "center",
    maxWidth: "100%",
    wordBreak: "break-word",
    [theme.breakpoints.up("md")]: {
      textAlign: "left",
      alignSelf: "stretch",
      maxWidth: "none",
    },
  },
  productName: {
    maxWidth: 197,
    [theme.breakpoints.up("md")]: {
      maxWidth: "100%",
    },
    [theme.breakpoints.up("xl")]: {
      maxWidth: 400,
    },
  },
  productIndexText: {
    [theme.breakpoints.up("md")]: {
      fontSize: "22px !important",
    },
    [theme.breakpoints.up("xl")]: {
      fontSize: "28px !important",
    },
  },
  productNameText: {
    [theme.breakpoints.up("md")]: {
      fontSize: "32px !important",
    },
    [theme.breakpoints.up("xl")]: {
      fontSize: "44px !important",
    },
  },
  productPriceText: {
    [theme.breakpoints.up("md")]: {
      fontSize: "28px !important",
    },
    [theme.breakpoints.up("xl")]: {
      fontSize: "38px !important",
    },
  },
  productPriceRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
    [theme.breakpoints.up("md")]: {
      justifyContent: "flex-start",
    },
  },
  productDescription: {
    alignSelf: "stretch",
    fontSize: 16,
    color: theme.palette.common.white,
    textAlign: "center",
    wordBreak: "break-word",
    [theme.breakpoints.up("md")]: {
      textAlign: "left",
      fontSize: 18,
      lineHeight: "26px",
    },
    [theme.breakpoints.up("xl")]: {
      fontSize: 20,
      lineHeight: "28px",
    },
  },
  productCta: {
    "&&": {
      ...TYPOGRAPHY_STYLES.xl.bold,
      lineHeight: "28px",
      width: 280,
      minWidth: 280,
      height: 56,
      minHeight: 56,
      padding: "14px 34px",
      color: theme.palette.common.white,
    },
  },
  productCtaWrap: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginTop: 24,
    [theme.breakpoints.up("md")]: {
      justifyContent: "flex-start",
    },
  },
  fullLookSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    paddingTop: 40,
    paddingBottom: 40,
    width: "100%",
    [theme.breakpoints.up("md")]: {
      paddingTop: 80,
      paddingBottom: 80,
    },
    [theme.breakpoints.up("lg")]: {
      gap: 80,
    },
  },
  fullLookHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    width: "100%",
    [theme.breakpoints.up("lg")]: {
      gap: 24,
    },
  },
  fullLookHeaderTitle: {
    alignSelf: "stretch",
    textAlign: "center",
    textTransform: "uppercase",
    maxWidth: 295,
    marginInline: "auto",
    [theme.breakpoints.between("md", "lg")]: {
      maxWidth: 368,
      fontSize: "32px !important",
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: 756,
      fontSize: "40px !important",
    },
  },
  fullLookHeaderDescription: {
    alignSelf: "stretch",
    paddingLeft: 24,
    paddingRight: 24,
    fontSize: 14,
    lineHeight: "20px",
    color: theme.palette.common.white,
    textAlign: "center",
    [theme.breakpoints.between("md", "lg")]: {
      maxWidth: 756,
      marginLeft: "auto",
      marginRight: "auto",
      fontSize: 18,
      lineHeight: "26px",
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: 756,
      marginLeft: "auto",
      marginRight: "auto",
      fontSize: 20,
      lineHeight: "28px",
      paddingLeft: 16,
      paddingRight: 16,
    },
  },
  fullLookBody: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    [theme.breakpoints.up("lg")]: {
      flexDirection: "row",
      alignItems: "stretch",
      gap: ATSH_SINGER_FULL_LOOK_FRAME.bodyGap,
      width: "100%",
    },
  },
  fullLookHeroImageWrap: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginBottom: 24,
    [theme.breakpoints.up("lg")]: {
      position: "relative",
      flex: `0 0 ${ATSH_SINGER_FULL_LOOK_FRAME.heroWidth}px`,
      alignSelf: "stretch",
      width: ATSH_SINGER_FULL_LOOK_FRAME.heroWidth,
      maxWidth: ATSH_SINGER_FULL_LOOK_FRAME.heroWidth,
      minHeight: 0,
      marginBottom: 0,
      overflow: "hidden",
    },
  },
  fullLookHeroImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  fullLookHeroImageFill: {
    objectFit: "cover",
  },
  fullLookBottomWrap: {
    width: "100%",
    minWidth: 0,
    [theme.breakpoints.up("lg")]: {
      flex: 1,
    },
  },
  fullLookBottom: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 16,
    width: "100%",
    minWidth: 0,
    [theme.breakpoints.up("lg")]: {
      gap: 24,
    },
  },
  fullLookTitle: {
    alignSelf: "stretch",
    textAlign: "left",
    [theme.breakpoints.up("lg")]: {
      fontSize: "40px !important",
    },
  },
  fullLookTotalPrice: {
    textAlign: "center",
  },
  fullLookCarousel: {
    width: "100%",
    minWidth: 0,
    backgroundColor: "transparent",
    overflow: "hidden",
    "& [class*='ProductSlider-root']": {
      borderBottom: "none",
    },
    "& [class*='slideItem']": {
      boxSizing: "border-box",
      paddingLeft: ATSH_SINGER_FULL_LOOK_FRAME.carouselItemGap / 2,
      paddingRight: ATSH_SINGER_FULL_LOOK_FRAME.carouselItemGap / 2,
      "&:first-of-type": {
        paddingLeft: 0,
      },
      "&:last-of-type": {
        paddingRight: 0,
      },
    },
    "& .item": {
      border: "none",
      backgroundColor: theme.palette.common.white,
    },
    "& .item [class*='priceRow']": {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 4,
      minHeight: 21,
    },
    "& .item [class*='priceColorBox']": {
      minHeight: 42,
    },
    "& .nav-button": {
      opacity: "1 !important",
    },
    "& .nav-button-disabled": {
      opacity: "0.3 !important",
    },
  },
  fullLookFooter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    width: "100%",
    [theme.breakpoints.up("lg")]: {
      gap: 24,
      paddingTop: 32,
    },
  },
  fullLookPriceBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    width: "100%",
    [theme.breakpoints.up("lg")]: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      width: "auto",
    },
  },
  fullLookPriceTopRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    order: 1,
    width: "100%",
    [theme.breakpoints.up("lg")]: {
      display: "contents",
      order: 0,
      width: "auto",
    },
  },
  fullLookSavingsBadge: {
    position: "relative",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
    width: "auto",
    height: 29,
    paddingInline: 8,
    overflow: "hidden",
  },
  fullLookSavingsBadgeText: {
    position: "relative",
    zIndex: 1,
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 400,
    color: "#FFFFFF",
    whiteSpace: "nowrap",
  },
  fullLookOriginalPrice: {
    order: 2,
    fontSize: 16,
    lineHeight: "150%",
    color: "#999999",
    textDecoration: "line-through",
    textAlign: "center",
    whiteSpace: "nowrap",
    [theme.breakpoints.up("lg")]: {
      order: 0,
      fontSize: 20,
    },
  },
  brotherGallery: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    [theme.breakpoints.up("md")]: {
      gap: 80,
      paddingTop: 80,
    },
  },
  brotherGalleryHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    paddingLeft: 24,
    paddingRight: 24,
    width: "100%",
    [theme.breakpoints.between("md", "lg")]: {
      paddingLeft: 16,
      paddingRight: 16,
    },
  },
  brotherGalleryTitle: {
    alignSelf: "stretch",
    textTransform: "uppercase",
    textAlign: "center",
    [theme.breakpoints.between("md", "lg")]: {
      fontSize: 32,
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: 40,
    },
  },
  brotherGalleryDescription: {
    alignSelf: "stretch",
    fontSize: 14,
    lineHeight: "20px",
    color: theme.palette.common.white,
    textAlign: "center",
    [theme.breakpoints.between("md", "lg")]: {
      fontSize: 18,
      lineHeight: "26px",
      maxWidth: 756,
      marginLeft: "auto",
      marginRight: "auto",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: 20,
      lineHeight: "28px",
    },
  },
  brotherGalleryRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  brotherGalleryRowItem: {
    position: "relative",
    flex: "1 1 50%",
    maxWidth: "50%",
    minWidth: 0,
    aspectRatio: `${ATSH_SINGER_GALLERY_IMAGE_FRAME.width} / ${ATSH_SINGER_GALLERY_IMAGE_FRAME.height}`,
    overflow: "hidden",
  },
  brotherGalleryRowItemFour: {
    flex: "1 1 25%",
    maxWidth: "25%",
  },
  brotherGalleryImages: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
  },
  brotherGalleryImageItem: {
    position: "relative",
    width: "100%",
    aspectRatio: `${ATSH_SINGER_GALLERY_IMAGE_FRAME.width} / ${ATSH_SINGER_GALLERY_IMAGE_FRAME.height}`,
    overflow: "hidden",
  },
  brotherGalleryImage: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
    objectPosition: "center center",
  },
  brotherGalleryCarouselWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  brotherGalleryViewport: {
    overflow: "hidden",
    width: "100%",
  },
  brotherGalleryContainer: {
    display: "flex",
    backfaceVisibility: "hidden",
    touchAction: "pan-y",
  },
  brotherGallerySlide: {
    position: "relative",
    flex: "0 0 100%",
    minWidth: 0,
    aspectRatio: `${ATSH_SINGER_GALLERY_IMAGE_FRAME.width} / ${ATSH_SINGER_GALLERY_IMAGE_FRAME.height}`,
    overflow: "hidden",
  },
  brotherGallerySlideImage: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
    objectPosition: "center center",
  },
  brotherGalleryNavButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    width: 28,
    height: 28,
    minWidth: 28,
    padding: 4,
    backgroundColor: "rgba(255, 255, 255, 0.56)",
    borderRadius: "44px",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.72)",
    },
  },
  brotherGalleryNavPrev: {
    left: 16,
  },
  brotherGalleryNavNext: {
    right: 16,
  },
  brotherGalleryNavDisabled: {
    opacity: 0.4,
  },
  discoverSection: {
    width: "100%",
    backgroundColor: theme.palette.common.white,
  },
}));

export default useAtshSingerStyles;
