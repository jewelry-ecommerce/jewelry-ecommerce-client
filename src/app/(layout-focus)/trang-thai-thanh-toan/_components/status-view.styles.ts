import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles({ name: "CheckoutStatusView" })((theme) => ({
  root: {
    width: "100%",
    margin: "0 auto",
    maxWidth: "1512px",
    padding: "40px 100px 60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    [theme.breakpoints.down("lg")]: {
      padding: `40px ${PADDING_GAP_LAYOUT}`,
    },
    [theme.breakpoints.down("md")]: {
      padding: `${PADDING_GAP_LAYOUT} ${PADDING_GAP_LAYOUT} 32px`,
    },
  },
  container: {
    width: "100%",
    maxWidth: "1024px",
    padding: PADDING_GAP_LAYOUT,
    gap: "24px",
    [theme.breakpoints.down("md")]: {
      padding: 0,
    },
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    gap: "40px",
    textAlign: "center",
    [theme.breakpoints.down("md")]: {
      gap: "24px",
    },
  },
  /** Success: cột hẹp + rhythm dọc sát design (hình 2). */
  successCard: {
    maxWidth: 668,
    margin: "0 auto",
    gap: "24px",
    [theme.breakpoints.down("md")]: {
      gap: "20px",
      maxWidth: "100%",
    },
  },
  successContent: {
    gap: "16px",
    width: "100%",
  },
  successHeader: {
    gap: "16px",
    width: "100%",
  },
  successIllustration: {
    width: "100%",
    maxWidth: 300,
    "& img, & svg": {
      maxWidth: "100%",
      height: "auto",
      display: "block",
      margin: "0 auto",
    },
    [theme.breakpoints.down("md")]: {
      maxWidth: 240,
      width: "auto",
      height: "auto",
    },
  },
  successActions: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
  },
  successContactInfoWrapper: {
    padding: "24px",
    gap: "16px",
    backgroundColor: "#F8F8F8",
    width: "100%",
    maxWidth: 498,
    minHeight: 138,
    boxSizing: "border-box",
    [theme.breakpoints.down("md")]: {
      maxWidth: "100%",
      minHeight: "unset",
      padding: "12px",
    },
  },
  redirectCard: {
    width: "100%",
    maxWidth: "420px",
    minHeight: "240px",
    backgroundColor: "#FFFFFF",
    gap: "16px",
    textAlign: "center",
    justifyContent: "center",
  },
  content: {
    gap: "24px",
  },

  illustration: {
    "& img, & svg": {
      maxWidth: "100%",
      height: "auto",
    },
    [theme.breakpoints.down("md")]: {
      width: "160px",
      height: "90px",
    },
  },

  header: {
    gap: "24px",
  },

  title: {
    ...TYPOGRAPHY_STYLES["2xl"].bold,
    color: "#111827",
    textTransform: "uppercase",
    lineHeight: "1.2",
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.xl.bold,
    },
  },
  redirectTitle: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#111827",
    textTransform: "uppercase",
    lineHeight: "1.3",
  },
  redirectDescription: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#52525B",
    lineHeight: "1.5",
  },

  orderIdLabel: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#111827",
  },
  orderIdValue: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#111827",
  },
  orderIdLabelWrapper: {
    gap: "0px",
    justifyContent: "center",
    width: "100%",
  },
  messageTitle: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#111827",
  },
  messageContent: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#525252",
    width: "100%",
    maxWidth: 668,
    margin: "0 auto",
    lineHeight: "1.6",
    letterSpacing: 0,
  },
  inlineLink: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#197CBD",
    textDecoration: "underline",
    "&:hover": {
      color: "#197CBD",
      textDecoration: "underline",
    },
  },

  buttonContainer: {
    gap: "24px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  orderDetailLink: {
    ...TYPOGRAPHY_STYLES.md.regular,
    color: "#197CBD",
    textTransform: "none",
    textDecoration: "underline",
    padding: 0,
    minWidth: "unset",
    "&:hover": {
      backgroundColor: "transparent",
      textDecoration: "underline",
      color: "#197CBD",
    },
  },

  buttonPrimary: {
    width: "276px",
    padding: "12px 24px",
    backgroundColor: "#F5F5F5",
    color: "#0A0A0A",
    borderRadius: "0",
    boxShadow: "none",
    ...TYPOGRAPHY_STYLES.md.regular,
    "&:hover": {
      backgroundColor: "#E5E5E5",
      boxShadow: "none",
    },
    textTransform: "none",
  },

  buttonBlack: {
    padding: "12px 24px",
    backgroundColor: "#0A0A0A",
    color: "#FFFFFF",
    borderRadius: "0",
    ...TYPOGRAPHY_STYLES.md.bold,
    whiteSpace: "nowrap",
    width: "100%",
    maxWidth: "280px",
    [theme.breakpoints.down("md")]: {
      fontSize: "14px",
      padding: "6px 12px",
    },
    "&:hover": {
      backgroundColor: "#333333",
    },
  },

  buttonSecondary: {
    width: "100%",
    maxWidth: "280px",
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#0A0A0A",
    border: "1px solid #0A0A0A",
    borderRadius: "0",
    ...TYPOGRAPHY_STYLES.md.bold,
    [theme.breakpoints.down("md")]: {
      fontSize: "14px",
      padding: "10px 16px",
    },
    "&:hover": {
      backgroundColor: "#F9F9F9",
    },
    textTransform: "none",
    whiteSpace: "nowrap",
  },

  rowButtons: {
    display: "flex",
    gap: "12px",
    width: "100%",
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "center",
    },
    "& > button": {
      flex: 1,
      flexBasis: 0,
      minWidth: 0,
    },
  },

  warningBox: {
    width: "100%",
    backgroundColor: "#F8F8F8",
    padding: `${PADDING_GAP_LAYOUT} 24px`,
    maxWidth: "720px",
    marginTop: "24px",
  },
  failedButtonStack: {
    width: "100%",
    gap: "12px",
    alignItems: "center",
    "& > button": {
      width: "100%",
      maxWidth: "378px",
    },
  },

  warningText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#111827",
    lineHeight: "1.5",
    textAlign: "center",
    "& b, & strong": {
      color: "#000000",
      ...TYPOGRAPHY_STYLES.base.bold,
    },
  },

  contactInfoWrapper: {
    padding: "24px",
    gap: "16px",
    backgroundColor: "#F8F8F8",
    width: "100%",
    maxWidth: 498,
    minHeight: 138,
    boxSizing: "border-box",
    [theme.breakpoints.down("md")]: {
      maxWidth: "100%",
      minHeight: "unset",
    },
  },

  supportLabel: {
    ...TYPOGRAPHY_STYLES.md.bold,
    textTransform: "uppercase",
    color: "#000000",
    width: "100%",
    textAlign: "center",
  },
  contactInfo: {
    gap: "16px",
    width: "100%",
    justifyContent: "stretch",
    alignItems: "stretch",
  },
  textFieldPhoneNumber: {
    flex: 1,
    minWidth: 0,
    width: "100%",
  },
  submitRequestButton: {
    height: "50px",
    padding: "0 24px",
    backgroundColor: "#F4F4F5",
    color: "#18181B",
    borderRadius: "0",
    boxShadow: "none",
    ...TYPOGRAPHY_STYLES.sm.bold,
    "&:hover": {
      backgroundColor: "#E4E4E7",
      boxShadow: "none",
    },
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  textBoldBlack: {
    color: "#111827",
    ...TYPOGRAPHY_STYLES.base.bold,
  },
  textBoldRed: {
    color: "#E5001A",
    ...TYPOGRAPHY_STYLES.base.bold,
  },
  sendIcon: {
    padding: "12px 16px",
    backgroundColor: "#0A0A0A",
    color: "#FFFFFF",
    borderRadius: "0",
    height: "50px",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#333333",
    },
    "&:active": {
      backgroundColor: "#000000",
      transform: "scale(0.98)",
    },
  },

  copyLabel: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#525252",
    textAlign: "center",
    maxWidth: "100%",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  copyBoxWrapper: {
    width: "100%",
    maxWidth: "480px",
    alignSelf: "center",
    height: "50px",
    border: "1px solid #D4D4D4",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    [theme.breakpoints.down("sm")]: {
      height: "44px",
      padding: "8px 12px",
    },
  },
  copyText: {
    flex: 1,
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#6B7280",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textAlign: "left",
  },
  copyIcon: {
    cursor: "pointer",
    color: "#737373",
    transition: "color 0.2s",
    "&:hover": {
      color: "#18181B",
    },
  },
}));

export default useStyles;
