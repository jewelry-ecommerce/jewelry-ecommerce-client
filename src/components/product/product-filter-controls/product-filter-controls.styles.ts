import { makeStyles } from "tss-react/mui";

import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_LAYOUT, PADDING_GAP_ITEM, PADDING_GAP_ITEM_SMALL } from "@/utils/constants/style.constant";

export const FILTER_CHIP_SX = {
  background: "#F2F2F2",
  borderRadius: "4px",
  border: "none",
  height: 24,
  color: "#1F1F1F",
  "& .MuiChip-label": {
    ...TYPOGRAPHY_STYLES["sm"].regular,
    color: "#1F1F1F",
    // padding: "4px",
  },
};

const useStyles = makeStyles({ name: "ProductFilterControls" })((theme) => ({
  root: {
    width: "100%",
    background: "#FFFFFF",
    padding: `${PADDING_GAP_ITEM} ${PADDING_GAP_LAYOUT}`,
    display: "flex",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  filterTrigger: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down(810)]: {
      alignItems: "flex-start",
    },
    gap: PADDING_GAP_ITEM_SMALL,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    padding: 0,
    minWidth: 0,
    justifyContent: "flex-start",
  },
  filterIconWrap: {
    position: "relative",
    width: 24,
    height: 24,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 10,
    flexShrink: 0,
  },
  filterLine: {
    height: 5,
    borderRadius: 999,
    background: "#6B7280",
  },
  filterLineLong: {
    width: 40,
  },
  filterLineMedium: {
    width: 34,
  },
  filterLineShort: {
    width: 22,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#ECECEC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...TYPOGRAPHY_STYLES["sm"].regular,
    lineHeight: "120%",
    color: "#000000",
  },
  filterLabel: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#1F1F1F",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  sortTrigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    [theme.breakpoints.down(810)]: {
      gap: PADDING_GAP_ITEM_SMALL,
    },
    cursor: "pointer",
    background: "transparent",
    border: "none",
    padding: 0,
    minWidth: 0,
  },
  sortLabel: {
    ...TYPOGRAPHY_STYLES.base.bold,
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.bold,
    },
    color: "#1F1F1F",
  },
  sortValue: {
    ...TYPOGRAPHY_STYLES.base.regular,
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.regular,
    },
    color: "#1F1F1F",
  },
  sortChevron: {
    color: "#6B7280",
    fontSize: 42,
  },
  drawerPaper: {
    width: 400,
    maxWidth: "100vw",
    height: "100vh",
    maxHeight: "100vh",
    "@supports (height: 100dvh)": {
      height: "100dvh",
      maxHeight: "100dvh",
    },
    "@supports (height: 100svh)": {
      height: "100svh",
      maxHeight: "100svh",
    },
    borderRadius: 0,
    background: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    [theme.breakpoints.down(810)]: {
      width: "100%",
    },
  },
  drawerHeader: {
    flexShrink: 0,
    minWidth: 0,
    overflow: "hidden",
    padding: `${PADDING_GAP_LAYOUT} 20px`,
    borderBottom: "1px solid #DDD",
  },
  drawerTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  drawerTitle: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#27251F",
    flexShrink: 0,
  },
  drawerClearAllButton: {
    minWidth: "fit-content",
    padding: 0,
    color: "#27251F",
    textTransform: "none",
    background: "transparent",
    ...TYPOGRAPHY_STYLES.sm.regular,
    "&:hover": {
      background: "transparent",
      textDecoration: "underline",
    },
  },
  drawerEmpty: {
    padding: "24px 0",
    color: "#A5A5A5",
    textAlign: "center",
    ...TYPOGRAPHY_STYLES.sm.regular,
  },
  drawerBody: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflowX: "hidden",
    overflowY: "auto",
    padding: "0 20px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  sectionRow: {
    borderBottom: "1px solid #DDD",
  },
  sectionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: PADDING_GAP_ITEM_SMALL,
    width: "100%",
  },
  sectionTitle: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#27251F",
    lineHeight: "normal",
  },
  sectionSummary: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#27251F",
    lineHeight: "normal",
  },
  sectionDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingBottom: 12,
  },
  optionLabelRoot: {
    margin: 0,
  },
  checkbox: {
    padding: 0,
    marginRight: PADDING_GAP_ITEM,
    color: "#D6D6D6",
    "&.Mui-checked": {
      color: "#27251F",
    },
  },
  optionText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#27251F",
    lineHeight: "normal",
  },
  drawerFooter: {
    flexShrink: 0,
    borderTop: "1px solid #DDD",
    padding: `${PADDING_GAP_LAYOUT} 20px`,
    paddingBottom: `calc(${PADDING_GAP_LAYOUT} + env(safe-area-inset-bottom, 0px))`,
    background: "#FFFFFF",
  },
  applyButton: {
    width: "100%",
    borderRadius: 0,
    background: "#111111",
    color: "#FFFFFF",
    padding: `12px ${PADDING_GAP_LAYOUT}`,
    textTransform: "uppercase",
    ...TYPOGRAPHY_STYLES.base.bold,
    "&:hover": {
      background: "#27251F",
    },
  },
  sortPopoverPaper: {
    marginTop: theme.spacing(1.5),
    borderRadius: 0,
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)",
    border: "1px solid #F1F1F1",
    minWidth: 176,
    maxWidth: "calc(100vw - 32px)",
  },
  sortList: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 4,
    padding: PADDING_GAP_ITEM,
    background: "#FFFFFF",
  },
  sortOption: {
    display: "flex",
    justifyContent: "flex-start",
    width: "100%",
    border: "none",
    background: "transparent",
    textAlign: "left",
    padding: "4px 8px",
    cursor: "pointer",
    ...TYPOGRAPHY_STYLES["sm"].regular,
    color: "#27251F",
  },
  sortOptionActive: {
    ...TYPOGRAPHY_STYLES["sm"].bold,
    background: "#ECECFE",
  },
  accordionSummary: {
    paddingLeft: `${PADDING_GAP_LAYOUT} !important`,
    paddingRight: `${PADDING_GAP_LAYOUT} !important`,
  },
  accordionDetails: {
    paddingLeft: `${PADDING_GAP_LAYOUT} !important`,
    paddingRight: `${PADDING_GAP_LAYOUT} !important`,
  },
  resultCount: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  resultSortRow: {
    width: "fit-content",
    gap: 12,
  },
  divider: {
    width: 1,
    height: 20,
    background: "#D9D9D9",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  root2: {
    width: "100%",
    background: "#FFFFFF",
    padding: `10px ${PADDING_GAP_LAYOUT}`,
    borderBottom: "1px solid #DDD",
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    position: "relative",
  },
  root3: {
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    background: "#FFFFFF",
    paddingTop: 16,
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    position: "relative",
  },
  emblaViewport: {
    width: "100%",
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    [theme.breakpoints.down(810)]: {
      cursor: "grab",
      userSelect: "none",
      touchAction: "pan-y",
      "&:active": {
        cursor: "grabbing",
      },
    },
  },
  emblaContainer: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    [theme.breakpoints.down(810)]: {
      flexWrap: "nowrap",
    },
  },
  emblaSlide: {
    [theme.breakpoints.down(810)]: {
      flex: "0 0 auto",
    },
  },
  clearAllButton: {
    minWidth: "fit-content",
    padding: 0,
    marginTop: 4,
    color: "#1F1F1F",
    textTransform: "none",
    background: "transparent",
    ...TYPOGRAPHY_STYLES["base"].regular,
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES["sm"].regular,
    },
    "&:hover": {
      background: "transparent",
      textDecoration: "underline",
    },
  },
  priceRangeSection: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingBottom: 12,
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
  },
  priceRangeLabel: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#050505",
  },
  priceRangeSlider: {
    color: "#27251F",
    height: 4,
    width: "calc(100% - 32px)",
    maxWidth: "calc(100% - 32px)",
    marginLeft: "auto",
    marginRight: "auto",
    padding: "12px 0",
    boxSizing: "border-box",
    "& .MuiSlider-thumb": {
      width: 16,
      height: 16,
      backgroundColor: "#27251F",
      "&:hover, &.Mui-focusVisible": {
        boxShadow: "0 0 0 8px rgba(39, 37, 31, 0.16)",
      },
    },
    "& .MuiSlider-rail": {
      opacity: 1,
      backgroundColor: "#E5E5E5",
    },
    "& .MuiSlider-track": {
      border: "none",
      backgroundColor: "#27251F",
    },
  },
}));

export default useStyles;
