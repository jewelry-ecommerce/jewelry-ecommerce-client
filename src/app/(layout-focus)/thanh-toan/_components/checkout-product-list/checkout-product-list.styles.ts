import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT, TRANSITION_TIME } from "@/utils/constants/style.constant";

const useStyles = makeStyles()((theme) => ({
  root: {
    width: "100%",
    gap: PADDING_GAP_LAYOUT,
  },

  group: {
    gap: "8px",
  },

  attachedGroup: {
    marginLeft: "18px",
    paddingLeft: "14px",
    gap: "8px",
    borderLeft: "2px solid #E5E5E5",
  },

  desktopList: {
    width: "100%",
    position: "relative",
  },

  scrollContainer: {
    maxHeight: "320px",
    overflowY: "auto",
    gap: "12px",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  },

  seeMoreChip: {
    position: "absolute",
    bottom: "0",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "4px 8px",
    background: "#737373",
    borderRadius: "20px",
    gap: "4px",
    cursor: "pointer",
    zIndex: 2,
    transition: `all ${TRANSITION_TIME} ease`,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",

    "&.hidden": {
      opacity: 0,
      pointerEvents: "none",
      transform: "translateX(-50%) translateY(20px)",
    },
  },

  seeMoreText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#FFFFFF",
  },

  seeMoreIcon: {
    color: "#FFFFFF",
    transition: `transform ${TRANSITION_TIME} ease`,
  },

  tabletSummaryContainer: {
    width: "100%",
    border: "1px solid #E5E5E5",
    borderRadius: "12px",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  tabletSummary: {
    padding: PADDING_GAP_LAYOUT,
    cursor: "pointer",
    width: "100%",
    [theme.breakpoints.down(810)]: {
      padding: "12px",
    },
  },

  collapsibleContent: {
    padding: 0,
    gap: "12px",
    maxHeight: "0px",
    overflow: "hidden",
    transition: "max-height 0.3s ease-in-out, padding 0.3s ease-in-out",
    "&.expanded": {
      maxHeight: "100vh",
      padding: `${PADDING_GAP_ITEM} ${PADDING_GAP_LAYOUT} 20px`,
    },
  },

  summaryHeaderInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    height: "100%",
  },

  summaryTitle: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#171717",
    textTransform: "uppercase",
  },

  summaryQty: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#A3A3A3",
  },

  summaryPriceWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
    marginRight: "12px",
    flex: 1,
    [theme.breakpoints.down(810)]: {
      marginRight: "8px",
    },
  },

  summaryTotalPrice: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#171717",
  },

  summarySavings: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#A3A3A3",
    textAlign: "end",
  },

  arrowIcon: {
    color: "#171717",
    fontSize: "20px",
  },

  fulfillmentSummary: {
    width: "100%",
    maxWidth: 388,
    minHeight: 44,
    boxSizing: "border-box",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
    padding: "12px 16px",
    backgroundColor: "rgba(254, 252, 232, 1)",
    borderLeft: "3px solid rgba(250, 204, 21, 1)",
  },

  fulfillmentSummaryLabel: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#171717",
  },

  fulfillmentSummaryValue: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    fontWeight: 700,
    color: "#171717",
  },

  // Modal Styles
  modalPaper: {
    borderRadius: "16px",
    overflow: "hidden",
  },

  modalTitle: {
    padding: "16px 24px",
    borderBottom: "1px solid #F5F5F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalContent: {
    padding: "16px",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "70vh",
    overflowY: "auto",
  },
}));

export default useStyles;
