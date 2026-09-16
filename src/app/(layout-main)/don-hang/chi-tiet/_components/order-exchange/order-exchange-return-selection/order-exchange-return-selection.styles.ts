import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  sectionTitle: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#6B7280",
    margin: "40px 0 0",
    [theme.breakpoints.down(810)]: {
      margin: "24px 0 0",
    },
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: "0",
    marginBottom: "24px",
  },
  selectAllRow: {
    paddingTop: "24px",
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
      ...TYPOGRAPHY_STYLES.base.bold,
    },
  },
  secondaryButton: {
    display: "inline-flex",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    padding: "12px 16px",
    border: "1px solid #EEEEEE",
    ...TYPOGRAPHY_STYLES.md.bold,
    cursor: "pointer",
    textTransform: "uppercase",
    [theme.breakpoints.down(810)]: {
      display: "none",
    },
  },
}));

export default useStyles;
