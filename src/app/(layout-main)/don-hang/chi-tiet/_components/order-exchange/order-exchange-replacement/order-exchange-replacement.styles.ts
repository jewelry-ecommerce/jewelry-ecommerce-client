import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  summarySection: {
    paddingBottom: PADDING_GAP_LAYOUT,
    marginBottom: PADDING_GAP_LAYOUT,
  },
  sectionTitle: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#6B7280",
    margin: "40px 0 0",
  },
  selectorWrapper: {
    position: "relative",
    width: "100%",
    marginTop: "16px",
  },
  selectorTrigger: {
    width: "100%",
    padding: PADDING_GAP_LAYOUT,
    border: "1px solid #EEEEEE",
    borderRadius: "4px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: "#FFFFFF",
    ...TYPOGRAPHY_STYLES.md.regular,
    color: "#27251F",
  },
  selectorMenu: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #EEEEEE",
    borderRadius: "4px",
    marginTop: "8px",
    maxHeight: "400px",
    overflowY: "auto",
    padding: "0 16px",
  },
  replacementItem: {
    display: "flex",
    gap: "24px",
    padding: "24px 0",
    borderBottom: "1px solid #EEEEEE",
    alignItems: "flex-start",
    "&:last-child": {
      borderBottom: "none",
    },
    [theme.breakpoints.down(810)]: {
      gap: "12px",
      padding: "16px 0",
    },
  },
  stickyFooter: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "24px 0 40px",
    backgroundColor: "transparent",
    [theme.breakpoints.down(810)]: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      padding: "16px 20px",
      zIndex: 100,
      borderTop: "1px solid #EEEEEE",
    },
  },
  footerContent: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    [theme.breakpoints.down(810)]: {
      maxWidth: "640px",
    },
  },
  primaryButton: {
    backgroundColor: "#000000",
    color: "#FFFFFF",
    padding: "12px 16px",
    border: "none",
    ...TYPOGRAPHY_STYLES.md.bold,
    cursor: "pointer",
    textTransform: "uppercase",
    "&:disabled": {
      backgroundColor: "#DEDEDE",
      color: "#FFFFFF",
      cursor: "not-allowed",
    },
    [theme.breakpoints.down(810)]: {
      fontSize: "14px",
    },
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    padding: "12px 16px",
    border: "1px solid #EEEEEE",
    ...TYPOGRAPHY_STYLES.md.bold,
    cursor: "pointer",
    textTransform: "uppercase",
    [theme.breakpoints.down(810)]: {
      fontSize: "14px",
    },
  },
}));

export default useStyles;
