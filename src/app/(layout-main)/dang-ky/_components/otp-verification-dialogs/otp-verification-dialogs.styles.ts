import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

export const otpDigitInputProps = {
  maxLength: 1,
  inputMode: "numeric" as const,
  pattern: "[0-9]*",
  type: "tel",
};

const useOtpVerificationDialogsStyles = makeStyles({ name: "OtpVerificationDialogs" })((theme) => ({
  methodDialog: {
    width: "512px",
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(2),
    },
  },
  dialogContent: {
    padding: 0,
  },
  dialogHeader: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
  },
  verifyDialogHeader: {
    padding: "16px 24px 0px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dialogTitle: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    textTransform: "none",
  },
  dialogBody: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    gap: theme.spacing(0.5),
  },
  dialogMethodRow: {
    gap: theme.spacing(2),
    padding: "0px 24px 24px 24px",
    alignItems: "stretch",
  },
  title: {
    ...TYPOGRAPHY_STYLES["md"].bold,
    textTransform: "none",
    textAlign: "left",
  },
  otpText: {
    ...TYPOGRAPHY_STYLES.base.medium,
  },
  otpCodeRow: {
    display: "flex",
    width: "100%",
    gap: "clamp(6px, 2vw, 12px)",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  otpCodeCell: {
    flex: "1 1 0",
    minWidth: 0,
    maxWidth: 54,
    "& .MuiOutlinedInput-root": {
      width: "100%",
      aspectRatio: "1",
      minHeight: 44,
      maxHeight: 56,
      backgroundColor: "#F6F6F6",
      borderRadius: 4,
      "& fieldset": {
        borderColor: "#E5E5E5",
      },
      "&:hover fieldset": {
        borderColor: "#171717",
      },
      "&.Mui-focused fieldset": {
        borderWidth: 1,
        borderColor: "#171717",
      },
      "&.Mui-error fieldset": {
        borderColor: "#ef4444",
      },
    },
    "& .MuiOutlinedInput-input": {
      textAlign: "center",
      fontSize: "clamp(18px, 5vw, 24px)",
      padding: 0,
      height: "100%",
      boxSizing: "border-box",
      backgroundColor: "transparent",
    },
  },
  otpResendRow: {
    gap: theme.spacing(1),
  },
  otpResendText: {
    ...TYPOGRAPHY_STYLES.base.regular,
  },
  otpResendTextBold: {
    ...TYPOGRAPHY_STYLES.base.bold,
  },
  replayIcon: {
    fontSize: 18,
    color: "#4b5563",
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
  otpErrorText: {
    textAlign: "center",
    color: "#ef4444",
    fontSize: 14,
    marginBottom: theme.spacing(1),
  },
  otpFailedText: {
    color: "#ef4444",
    fontSize: 13.5,
    marginBottom: theme.spacing(1.5),
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
  methodButton: {
    "&&": {
      // minHeight: 56,
      color: "#0F172A",
      textTransform: "none",
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
      gap: theme.spacing(1),
      boxShadow: "none",
      ...TYPOGRAPHY_STYLES.md.regular,
      padding: "12px 16px",
      "&:hover": {
        backgroundColor: "#E2E8F0",
        boxShadow: "none",
        borderRadius: 0,
        border: "none",
      },
      [theme.breakpoints.down(470)]: {
        height: 48,
      },
      [theme.breakpoints.down(380)]: {
        height: "100%",
      },
    },
  },
  methodButtonZalo: {
    backgroundColor: "#E8EEFF",
    color: "#197CBD",
    borderRadius: 0,
    border: "none",
    "&:hover": {
      backgroundColor: "#D5EEFF",
    },
  },
  methodButtonSms: {
    backgroundColor: theme.palette.grey[100],
    borderRadius: 0,
    border: "none",
    "&:hover": {
      backgroundColor: "#E9EEFF",
    },
  },
}));

export default useOtpVerificationDialogsStyles;
