import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: "40px 0 0",
  },
  accordion: {
    border: "1px solid #EEEEEE",
    borderRadius: "8px !important",
    boxShadow: "none !important",
    "&::before": {
      display: "none",
    },
    marginBottom: "24px",
  },
  accordionSummary: {
    padding: "0 24px",
    minHeight: "64px !important",
    "& .MuiAccordionSummary-content": {
      margin: "0 !important",
    },
  },
  accordionTitle: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#27251F",
    textTransform: "uppercase",
  },
  accordionDetails: {
    padding: "0 24px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionTitle: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#6B7280",
  },
  reasonSection: {
    paddingTop: "24px",
    borderTop: "1px solid #EEEEEE",
    gap: "24px",
  },
  reasonSelect: {
    gap: PADDING_GAP_LAYOUT,
  },
  stickyFooter: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "24px 0 40px",
    backgroundColor: "transparent",
    [theme.breakpoints.down(810)]: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      padding: "20px",
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
      maxWidth: "800px",
    },
  },
  primaryButton: {
    backgroundColor: "#000000",
    color: "#FFFFFF",
    padding: "12px 24px",
    border: "none",
    ...TYPOGRAPHY_STYLES.md.bold,
    cursor: "pointer",
    minWidth: "120px",
    "&:disabled": {
      backgroundColor: "#CCCCCC",
    },
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.bold,
    },
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    padding: "12px 24px",
    border: "1px solid #000000",
    ...TYPOGRAPHY_STYLES.md.bold,
    cursor: "pointer",
    minWidth: "120px",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.bold,
    },
  },
}));

export default useStyles;
