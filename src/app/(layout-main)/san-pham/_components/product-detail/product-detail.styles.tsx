import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "ProductDetail" })((theme) => ({
  gridContainer: {
    width: "100%",
    padding: "0",
    gap: "50px",
    display: "flex",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      gap: "0",
    },
  },

  /* --- Left Section: Gallery --- */
  leftSection: {
    position: "relative",
    width: "50%",
    [theme.breakpoints.down("md")]: {
      flex: "none",
      width: "100%",
    },
  },
  galleryStack: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
    width: "100%",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  galleryImageWrapper: {
    width: "100%",
    position: "relative",
    backgroundColor: "var(--product-image-background)",
    cursor: "url('/image/icons/icon-zoom.svg'), zoom-in",
    "&:hover .zoom-icon-overlay": {
      opacity: 1,
    },
  },
  favoriteIconWrapper: {
    position: "absolute",
    top: "23px",
    right: "28px",
    zIndex: 10,
    padding: "14px",
    cursor: "pointer",
    backgroundColor: "#fff",
    borderRadius: "24px",
    transition: "transform 0.15s ease",
  },
  galleryImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },

  // Mobile Slider (Embla)
  mobileSlider: {
    display: "none",
    [theme.breakpoints.down("md")]: {
      display: "block",
      position: "relative",
      width: "100%",
    },
  },
  sliderViewport: {
    overflow: "hidden",
    width: "100%",
  },
  sliderContainer: {
    display: "flex",
    backfaceVisibility: "hidden",
    touchAction: "pan-y pinch-zoom",
    willChange: "transform",
  },
  sliderSlide: {
    flex: "0 0 100%",
    minWidth: 0,
    position: "relative",
    overflow: "hidden",
  },
  progressBarContainer: {
    width: "100%",
    height: "2px",
    backgroundColor: "#E5E5E5",
    marginTop: "8px",
    position: "relative",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#000",
    transformOrigin: "left",
  },

  /* --- Right Section: Information --- */
  rightSectionContainer: {
    width: "50%",
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
  rightSection: {
    gap: "40px",
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto",
    padding: "44px 0 100px",
    position: "sticky",
    top: "64px",
    height: "fit-content",
    alignSelf: "flex-start",
    [theme.breakpoints.down("xl")]: {
      maxWidth: "400px",
    },
    [theme.breakpoints.down("lg")]: {
      maxWidth: "350px",
    },
    [theme.breakpoints.down("md")]: {
      position: "static",
      width: "100%",
      maxWidth: "100%",
      padding: "16px 16px 24px",
    },
  },

  /* --- Typography & Text Blocks --- */
  categoryText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#5F5F5F",
    marginBottom: "8px",
  },
  titleText: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#27272A",
    textTransform: "uppercase",
    marginBottom: "8px",
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.lg.bold,
    },
  },
  skuText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#5F5F5F",
    marginBottom: "8px",
  },

  /* Stats Box (Rating + Share) */
  statsBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  ratingGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  starList: {
    display: "flex",
    gap: "2px",
    color: "#CAE680",
  },
  ratingText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#7D7D7D",
  },
  shareGroup: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
  },
  shareText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#273BCD",
  },

  /* Price Section */
  priceBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    [theme.breakpoints.down("md")]: {
      gap: "8px",
    },
  },
  priceDiscount: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#27251F",
  },
  priceOriginal: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#AFAFAF",
    textDecoration: "line-through",
  },

  /* Action Buttons */
  buttonBox: {
    gap: "12px",
  },
  preOrderNotice: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#0A0A0A",
    textAlign: "left",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.sm.regular,
    },
  },
  preOrderNoticeDate: {
    ...TYPOGRAPHY_STYLES.base.bold,
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.sm.bold,
    },
  },
  btnBase: {
    padding: "12px 16px",
    ...TYPOGRAPHY_STYLES.md.bold,
    borderRadius: "2px",
    textAlign: "center",
    cursor: "pointer",
    border: "none",
    width: "100%",
    transition: "opacity 0.2s",
    "&:hover": {
      opacity: 0.9,
    },
  },
  btnAddToCart: {
    backgroundColor: "#F5F5F5",
    color: "#0A0A0A",
    textTransform: "capitalize",
    "&:disabled": {
      cursor: "not-allowed",
      color: "#0A0A0A",
      opacity: 0.4,
    },
  },
  btnBuyNow: {
    backgroundColor: "#0A0A0A",
    color: "#FFF",
    textTransform: "capitalize",
  },

  /* Gift Section */
  giftTitle: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#000",
    marginBottom: "16px",
  },
  giftItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginBottom: "12px",
  },
  giftLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  giftImage: {
    width: "68px",
    height: "68px",
    flexShrink: 0,
    objectFit: "cover",
    borderRadius: "4px",
    backgroundColor: "var(--product-image-background)",
  },
  giftInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  giftBadgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  giftBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#C7F584",
    padding: "3px 6px",
    borderRadius: "2px",
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: "#000",
  },
  packagingBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#DBEAFE",
    padding: "3px 6px",
    borderRadius: "2px",
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: "#1E3A8A",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  giftName: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: "#27272A",
  },
  giftQuantity: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#27272A",
  },
  giftRight: {
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  giftPriceCurrent: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: "#27251F",
  },
  giftPriceOld: {
    ...TYPOGRAPHY_STYLES.xs.regular,
    color: "#C4C4C4",
    textDecoration: "line-through",
  },

  /* Mix & Match / Related Products */
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  sectionTitle: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#000",
  },
  viewMore: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#000",
    cursor: "pointer",
    textDecoration: "underline",
  },

  // product review
  reviewHeader: {
    padding: "40px 16px 24px",
    gap: "48px",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "8px",
      padding: "16px",
    },
  },
  reviewTitle: {
    ...TYPOGRAPHY_STYLES["3xl"].bold,
    color: "#171717",
    textTransform: "uppercase",
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.lg.bold,
    },
  },
  ratingSummary: {
    gap: "8px",
  },
  ratingNumber: {
    ...TYPOGRAPHY_STYLES["2xl"].bold,
    color: "#171717",
    lineHeight: 1,
  },
  filterContainer: {
    padding: "8px 16px",
    borderTop: "1px solid #DDD",
    borderBottom: "1px solid #DDD",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "12px",
    },
  },
  filterList: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      gap: "8px",
      flexWrap: "wrap",
    },
  },
  filterLabel: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#171717",
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.sm.bold,
    },
  },
  filterItem: {
    ...TYPOGRAPHY_STYLES.md.regular,
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "2px",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.sm.regular,
      padding: "6px",
    },
  },
  filterItemActive: {
    backgroundColor: "#0A0A0A",
    color: "#fff",
  },
  filterItemInactive: {
    backgroundColor: "#fff",
    border: "1px solid #0A0A0A",
    color: "#0A0A0A",
  },
  reviewItem: {
    padding: "24px 32px",
    borderBottom: "1px solid #E5E5E5",
    display: "flex",
    gap: "24px",
    [theme.breakpoints.down("lg")]: {
      flexDirection: "column",
      gap: "16px",
      padding: "24px 16px",
    },
  },
  reviewAuthorCol: {
    width: "30%",
    gap: "4px",
    flexShrink: 0,
    [theme.breakpoints.down("lg")]: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  },
  reviewAuthorName: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#171717",
  },
  reviewTime: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#737373",
  },
  reviewContentColContainer: {
    flex: 1,
    gap: "24px",
  },
  reviewContentCol: {
    gap: "8px",
  },
  reviewStars: {
    display: "flex",
    gap: "2px",
    marginBottom: "4px",
  },
  reviewText: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#171717",
  },
  reviewSubText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#171717",
  },
  reviewImages: {
    gap: "24px",
    flexWrap: "wrap",
  },
  reviewImage: {
    width: "101px",
    height: "101px",
    objectFit: "cover",
    borderRadius: "4px",
    [theme.breakpoints.down("md")]: {
      width: "85px",
      height: "85px",
    },
  },
  reviewFilter: {
    [theme.breakpoints.down("md")]: {
      borderTop: "1px solid #DDD",
    },
  },
  reviewSortMobile: {
    display: "none",
    [theme.breakpoints.down("md")]: {
      display: "flex",
    },
  },
  reviewSortDesktop: {
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  reviewCount: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#1F1F1F",
    padding: "0px 0px 8px 16px",
    textTransform: "uppercase",
    [theme.breakpoints.down("md")]: {
      padding: "0px 0px 0px 16px",
    },
  },

  /* --- Flash Sale --- */
  flashSaleContainer: {
    border: "1px solid #FD0001",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "16px",
  },
  flashSaleHeader: {
    backgroundImage: "url('/image/logo/banner-1.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "8px",
    position: "relative",
  },
  flashSaleTitle: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    [theme.breakpoints.down("lg")]: {
      ...TYPOGRAPHY_STYLES.lg.bold,
    },
    wordBreak: "break-word",
  },
  soldLabel: {
    position: "absolute",
    left: "50%",
    backgroundColor: "#fff",
    borderRadius: "24px",
    height: "20px",
    paddingLeft: "6px",
    paddingRight: "6px",
    paddingTop: "2px",
    gap: "3px",
    [theme.breakpoints.down("lg")]: {
      position: "static",
      transform: "none",
      left: "auto",
    },
  },
  soldText: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: "#D8504F",
  },
  cornerDecoration: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "32px",
    height: "32px",
    backgroundColor: "#D92B27",
    clipPath: "polygon(0 0, 100% 0, 100% 100%)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    padding: "4px",
  },
  flashSaleContent: {
    padding: "10px 12px",
    background: "#fff",
  },
  labelSmall: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#000",
  },
  priceMd: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#000",
  },
  timeLabel: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#000",
    marginBottom: "4px",
  },
  timeItem: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: "#fff",
    background: "#000",
    borderRadius: "2px",
    padding: "2px 10px",
  },
  timeSeparator: {
    ...TYPOGRAPHY_STYLES.base.bold,
  },

  /* --- Tags --- */
  tagContainer: {
    gap: "8px",
    flexWrap: "wrap",
  },
  tagItem: {
    borderImageSource: "url('/image/icons/icon-discount-code.svg')",
    borderImageSlice: "14 22 fill",
    borderImageWidth: "auto",
    borderStyle: "solid",
    borderWidth: "1px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    padding: "6px 16px",
    backgroundColor: "transparent",
    [theme.breakpoints.down("md")]: {
      padding: "6px 12px",
    },
  },
  tagLabel: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#000",
  },
  tagText: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: "#000",
    lineHeight: "normal",
  },

  // popups contact
  notifyRoot: {
    gap: "24px",
  },
  notifyProductBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#F8F8F8",
    borderRadius: "8px",
    alignItems: "stretch",
  },
  notifyProductImageWrapper: {
    position: "relative",
    width: 58,
    height: 58,
    flexShrink: 0,
    borderRadius: "4px",
    overflow: "hidden",
    backgroundColor: "var(--product-image-background)",
    alignSelf: "stretch",
    [theme.breakpoints.down("md")]: {
      width: "100px",
      height: "auto",
    },
  },
  notifyProductImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  notifyProductContent: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      gap: "4px",
    },
  },
  notifyProductInfo: {
    flex: 1,
    minWidth: 0,
    gap: "8px",
  },
  notifyProductName: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#27251F",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  notifyPriceBox: {
    textAlign: "right",
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      textAlign: "left",
    },
  },
}));

export default useStyles;
