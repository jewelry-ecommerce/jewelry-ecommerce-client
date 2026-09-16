import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  backdrop: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    zIndex: 1200,
  },
  panel: {
    position: "fixed",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 1201,
    boxShadow: "0px 12px 32px rgba(16, 24, 40, 0.08)",
    overflowY: "auto",
  },
  panelInner: {
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    margin: "0 auto",
    padding: "40px 80px 24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    [theme.breakpoints.down("lg")]: {
      padding: "24px 24px 32px",
    },
    [theme.breakpoints.down("md")]: {
      padding: "20px 16px 24px",
    },
  },
  searchRow: {
    gap: "16px",
  },
  searchField: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    zIndex: 1,
    width: "24px",
    height: "24px",
    cursor: "pointer",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 40%) minmax(0, 60%)",
    gap: "24px",
    padding: "0 0 24px 16px",
    [theme.breakpoints.down("lg")]: {
      gridTemplateColumns: "minmax(0, 1fr)",
    },
  },
  keywordSide: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "24px",
    alignContent: "start",
  },
  keywordColumn: {
    gap: "16px",
    minWidth: 0,
  },
  keywordHeader: {
    color: "#27251F",
    ...TYPOGRAPHY_STYLES.base.bold,
  },
  clearButton: {
    color: "#27251F",
    ...TYPOGRAPHY_STYLES.sm.regular,
    cursor: "pointer",
    width: "fit-content",
  },
  clearHistoryButton: {
    color: "#27251F",
    ...TYPOGRAPHY_STYLES.sm.regular,
    cursor: "pointer",
    width: "fit-content",
    textDecorationLine: "underline",
  },
  keywordList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  suggestionList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  suggestionItem: {
    gap: "12px",
    cursor: "pointer",
    paddingBottom: "8px",
  },
  suggestionType: {
    color: "#A5A5A5",
    flexShrink: 0,
    ...TYPOGRAPHY_STYLES.sm.regular,
  },
  keywordItem: {
    color: "#000000",
    ...TYPOGRAPHY_STYLES.sm.regular,
    cursor: "pointer",
    width: "fit-content",
  },
  emptyStateText: {
    color: "#A5A5A5",
    ...TYPOGRAPHY_STYLES.base.regular,
  },
  productSide: {
    minWidth: 0,
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "0",
    [theme.breakpoints.down("lg")]: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
  productGridItem: {
    minWidth: 0,
  },
  searchTrigger: {
    appearance: "none",
    backgroundColor: "transparent",
    border: 0,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: "220px",
    paddingBottom: "8px",
    borderBottom: "1px solid #E5E7EB",
    color: "inherit",
    cursor: "pointer",
    font: "inherit",
    textAlign: "left",
  },
  searchTriggerText: {
    color: "#27251F",
    ...TYPOGRAPHY_STYLES.base.regular,
  },
}));

export default useStyles;
