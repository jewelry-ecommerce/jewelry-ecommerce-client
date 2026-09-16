import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useRegisterFormStyles = makeStyles({ name: "RegisterForm" })((theme) => ({
  welcomeRoot: {
    width: "100%",
    maxWidth: 472,
    minHeight: 420,
    margin: "0 auto",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(9),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeStack: {
    maxWidth: 472,
    textAlign: "center",
  },
  welcomeTitle: {
    ...TYPOGRAPHY_STYLES["2xl"].bold,
    textTransform: "uppercase",
  },
  welcomeText: {
    ...TYPOGRAPHY_STYLES.md.regular,
  },
  actionButton: {
    maxWidth: 472,
    borderRadius: "0 !Important",
    backgroundColor: "#111111",
    ...TYPOGRAPHY_STYLES.md.regular,
    textTransform: "uppercase",
    padding: "12px 16px",
    "&:hover": {
      backgroundColor: "#000",
    },
  },
  welcomeSubTitle: {
    fontWeight: 700,
    fontSize: 30,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  registerForm: {
    width: "100%",
    maxWidth: 512,
    margin: "0 auto",
    border: "1px solid #cfcfcf",
    padding: "16px 24px 24px 24px",
    [theme.breakpoints.up("md")]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    [theme.breakpoints.down("md")]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
  },
  title: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(1),
    textTransform: "none",
    textAlign: "left",
  },
  otpLinks: {
    ...TYPOGRAPHY_STYLES.base.regular,
    marginTop: theme.spacing(3),
    textAlign: "left",
    color: "#6b7280",
  },
  footerText: {
    mt: theme.spacing(2),
    textAlign: "left",
    color: "#6b7280",
    fontSize: 14,
  },
  otpLinkKey: {
    color: "#197CBD",
    textDecoration: "underline",
    textTransform: "none",
    cursor: "pointer",
  },
  forgotLogin: {
    marginTop: theme.spacing(2),
    textAlign: "left",
    color: "#6b7280",
    fontSize: 14,
  },
  dialogContent: {
    padding: 0,
  },
  dialogHeader: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
  },
  dialogBody: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  dialogMethodRow: {
    padding: theme.spacing(2),
    display: "flex",
    gap: theme.spacing(1.2),
  },
  otpText: {
    fontSize: 13,
    color: "#4b5563",
  },
  otpDescription: {
    fontSize: 16,
    color: "#374151",
    marginBottom: theme.spacing(2),
  },
  otpCodeCell: {
    width: 54,
  },
  otpResendRow: {
    marginBottom: theme.spacing(0.8),
  },
  otpResendText: {
    fontSize: 14,
    color: "#374151",
  },
  fieldMargin: {
    marginBottom: theme.spacing(2),
    position: "relative",
    "& .MuiInputBase-input": {
      height: 42,
      minHeight: 42,
      padding: "12px 12px 8px",
      fontSize: 14,
      lineHeight: 1.25,
      boxSizing: "border-box",
    },
    "& .MuiInputLabel-root": {
      ...TYPOGRAPHY_STYLES.base.regular,
      color: "#374151",
      position: "absolute",
      top: "12px",
      left: 12,
      transform: "translate(0, 0)",
      pointerEvents: "none",
      transition: "all 150ms ease",
    },
    "& .MuiInputLabel-shrink": {
      top: "-8px",
      transform: "translate(0, 0)",
      fontSize: "0.75rem",
    },
    "& .MuiOutlinedInput-root:hover .MuiInputLabel-root, & .MuiOutlinedInput-root.Mui-focused .MuiInputLabel-root": {
      top: "-8px",
      transform: "translate(0, 0)",
      fontSize: "0.75rem",
      pointerEvents: "none",
    },
  },
  acceptRow: {
    gap: theme.spacing(2),
  },
  topPaddingZero: {
    padding: 0,
  },
  headerPadding: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  otpCannot: {
    color: "#197CBD",
    textDecoration: "underline",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    fontSize: 14,
  },
  otpError: {
    color: "#ef4444",
    fontSize: 13.5,
    marginBottom: theme.spacing(1.5),
  },
  checkIcon: {
    fontSize: 18,
  },
  termsText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#111827",
    margin: 0,
  },
  termsSpan: {
    color: "#197CBD",
    textDecoration: "underline",
    cursor: "pointer",
  },
  errorMessage: {
    fontSize: 12,
    color: "#ef4444",
    marginBottom: theme.spacing(1.5),
  },
  methodButton: {
    borderRadius: 8,
    minHeight: 56,
    border: "1px solid #D1D5DB",
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
    textTransform: "none",
    fontWeight: 600,
    fontSize: 15,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(1),
    borderColor: "#E5E7EB",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#E2E8F0",
      borderColor: "#CBD5E1",
      boxShadow: "none",
    },
  },
  methodButtonZalo: {
    backgroundColor: "#ECF9FF",
    borderColor: "#AEE2FF",
    color: "#0C61B3",
    "&:hover": {
      backgroundColor: "#D5EEFF",
    },
  },
  methodButtonSms: {
    backgroundColor: "#F5F7FF",
    borderColor: "#C4D5FF",
    color: "#1D4ED8",
    "&:hover": {
      backgroundColor: "#E9EEFF",
    },
  },
  replayIcon: {
    fontSize: 18,
    color: "#4b5563",
  },
  otpCodeStack: {
    marginBottom: theme.spacing(1.5),
  },
  otpErrorText: {
    textAlign: "center",
    color: "#ef4444",
    fontSize: 14,
    marginBottom: theme.spacing(1),
  },
  resendButton: {
    border: "none",
    background: "transparent",
    color: "#197CBD",
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
    fontSize: 14,
  },
  resendButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  confirmBtn: {
    "&&": {
      borderRadius: 0,
      backgroundColor: theme.palette.grey[900],
      color: "#fff",
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
      marginTop: theme.spacing(3),
      ...TYPOGRAPHY_STYLES.md.bold,
      textTransform: "none",
      "&:hover": {
        backgroundColor: theme.palette.grey[800],
      },
    },
  },
  notConfirmBtn: {
    "&&": {
      borderRadius: 0,
      backgroundColor: theme.palette.grey[500],
      color: "#fff",
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
      marginTop: theme.spacing(3),
      ...TYPOGRAPHY_STYLES.md.bold,
      textTransform: "none",
      "&:hover": {
        backgroundColor: theme.palette.grey[500],
      },
    },
  },
}));

export default useRegisterFormStyles;
