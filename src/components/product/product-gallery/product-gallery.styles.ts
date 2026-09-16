import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { STYLE } from "@/utils/constants";
import { PRODUCT_GALLERY_TILE_ASPECT_RATIO } from "./product-gallery.constants";

const useStyles = makeStyles({ name: "ProductReview" })((theme) => ({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    "&:hover": {
      "& .nav-button": {
        opacity: 1,
      },
      "& .nav-button-disabled": {
        opacity: 0.3,
      },
    },
  },
  carouselWrapper: {
    position: "relative",
    width: "100%",
  },
  viewport: {
    overflow: "hidden",
    width: "100%",
  },
  container: {
    display: "flex",
    backfaceVisibility: "hidden",
    touchAction: "pan-y",
    margin: `0 calc(${STYLE.PADDING_GAP_ITEM} / -2)`,
  },
  slideItem: {
    flex: "0 0 100%", // Mobile: 1
    minWidth: 0,
    boxSizing: "border-box",
    padding: `0 calc(${STYLE.PADDING_GAP_ITEM} / 2)`,
    [theme.breakpoints.up("md")]: {
      flex: "0 0 50%", // Tablet: 2
    },
    [theme.breakpoints.up("lg")]: {
      flex: "0 0 25%", // Desktop: 4
    },
  },
  reviewCard: {
    position: "relative",
    width: "100%",
    aspectRatio: PRODUCT_GALLERY_TILE_ASPECT_RATIO,
    overflow: "hidden",
    cursor: "pointer",
    textDecoration: "none",
    display: "block",
    color: "inherit",
    "&:hover": {
      "& .review-image": {
        transform: STYLE.SCALE_VALUE,
      },
    },
  },
  reviewCardButton: {
    border: "none",
    padding: 0,
    margin: 0,
    background: "none",
    font: "inherit",
    textAlign: "inherit",
  },
  mediaWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "var(--product-image-background)",
  },
  reviewMedia: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
  },
  labelWrapper: {
    position: "absolute",
    top: -1,
    left: -1,
    zIndex: 2,
    height: "fit-content",
    width: "fit-content",
    minWidth: "173px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
    paddingLeft: STYLE.PADDING_GAP_ITEM_SMALL,
    willChange: "transform",
    backfaceVisibility: "hidden",
  },
  labelText: {
    ...TYPOGRAPHY_STYLES["xs"].regular,
    color: "#000",
    textTransform: "uppercase",
    display: "block",
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    backgroundColor: "rgba(51, 51, 51, 0.56)",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: `opacity ${STYLE.TRANSITION_TIME}, background-color ${STYLE.TRANSITION_TIME}, transform ${STYLE.TRANSITION_TIME}`,
    [theme.breakpoints.down("lg")]: {
      opacity: 1,
    },
    "&:hover": {
      backgroundColor: "rgba(51, 51, 51, 0.8)",
      transform: "translateY(-50%) scale(1.1)",
    },
    [theme.breakpoints.down("md")]: {
      width: "28px",
      height: "28px",
    },
  },
  disabled: {
    cursor: "default",
    opacity: 0.3,
    "&:hover": {
      backgroundColor: "rgba(51, 51, 51, 0.56)",
      transform: "translateY(-50%)",
    },
  },
  prevButton: {
    left: "16px",
  },
  nextButton: {
    right: "16px",
  },
}));

export default useStyles;
