import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_LAYOUT, PADDING_GAP_ITEM } from "@/utils/constants/style.constant";
import { CATEGORY_SCROLLER_ASPECT_RATIO, CATEGORY_SCROLLER_CARD_SIZE } from "./category-scroller.constants";

const useStyles = makeStyles({ name: "CategoryScroller" })((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    alignSelf: "stretch",
    background: "#FFF",
    paddingBottom: "40px",
    width: "100%",
    maxWidth: "100%",
  },
  titleWrapper: {
    display: "flex",
    padding: `24px ${PADDING_GAP_LAYOUT} ${PADDING_GAP_LAYOUT} ${PADDING_GAP_LAYOUT}`,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: PADDING_GAP_ITEM,
    alignSelf: "stretch",
    [theme.breakpoints.down(810)]: {
      padding: `16px 16px ${PADDING_GAP_ITEM} 16px`,
    },
  },
  titleText: {
    ...TYPOGRAPHY_STYLES["3xl"].bold,
    lineHeight: "150%",
    color: "#27251F",
    textTransform: "uppercase",
    [theme.breakpoints.down(1199)]: {
      ...TYPOGRAPHY_STYLES["2xl"].bold,
    },
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.xl.bold,
    },
  },
  selectedCategoryText: {
    ...TYPOGRAPHY_STYLES.xl.regular,
    lineHeight: "150%",
    color: "#A5A5A5",
    textTransform: "uppercase",
  },
  embla: {
    width: "100%",
    overflow: "hidden",
    cursor: "grab",
    userSelect: "none",
    touchAction: "pan-y",
    "&:active": {
      cursor: "grabbing",
    },
  },
  emblaContainer: {
    display: "flex",
    alignItems: "stretch",
    gap: PADDING_GAP_LAYOUT,
    padding: `0 ${PADDING_GAP_LAYOUT}`,
  },
  card: {
    position: "relative",
    overflow: "hidden",
    display: "flex",
    width: `${CATEGORY_SCROLLER_CARD_SIZE}px`,
    height: `${CATEGORY_SCROLLER_CARD_SIZE}px`,
    padding: "2px 4px",
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: CATEGORY_SCROLLER_ASPECT_RATIO,
    flex: "0 0 auto",
    userSelect: "none",
    cursor: "pointer",
    border: "2px solid transparent",
    boxSizing: "border-box",
    transition: "background-color 0.2s ease, padding 0.2s ease",
  },
  cardInner: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "var(--product-image-background)",
  },
  activeCard: {
    padding: "6px",
    border: "none",
    backgroundColor: "#B3ADF6",
    [theme.breakpoints.down(810)]: {
      padding: "4px",
    },
  },
  activeCardTopBar: {
    position: "absolute",
    top: -1,
    left: 0,
    zIndex: 2,
    width: "60%",
    height: "10px",
    backgroundColor: "#B3ADF6",
    pointerEvents: "none",
    clipPath: "polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
    [theme.breakpoints.down(810)]: {
      height: "6px",
      clipPath: "polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
    },
  },
  activeCardInner: {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  activeCardInnerContent: {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "var(--product-image-background)",
  },
  loadingCard: {
    position: "relative",
    overflow: "hidden",
    cursor: "default",
    background: "#F5F5F5",
    border: "1px solid #E5E5E5",
  },
  loadingLabelBox: {
    position: "relative",
    zIndex: 1,
    background: "rgba(0, 0, 0, 0.28)",
  },
  backCard: {
    background: "linear-gradient(180deg, #F8F8F8 0%, #ECECEC 100%)",
    border: "1px solid #D9D9D9",
  },
  cardLabelBox: {
    position: "absolute",
    display: "flex",
    padding: "2px 4px",
    bottom: "5px",
    left: "5px",
    right: "5px",
    [theme.breakpoints.down(1199)]: {
      bottom: "4px",
      left: "4px",
      right: "4px",
    },
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
    background: "rgba(0, 0, 0, 0.40)",
  },
  cardLabelText: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: "#FFF",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  activeCardLabelText: {
    color: "#27251F",
  },
}));

export default useStyles;
