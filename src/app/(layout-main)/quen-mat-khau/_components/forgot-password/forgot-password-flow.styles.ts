import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useForgotPasswordFlowStyles = makeStyles({ name: "ForgotPasswordFlow" })((theme) => ({
  dialogPaper: {
    // width: "100%",
    // maxWidth: 560,
    width: "512px",
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(2),
    },
  },
  dialogContent: {
    padding: 0,
  },
  dialogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 24px 0 24px",
  },
  dialogTitle: {
    ...TYPOGRAPHY_STYLES["xl"].bold,
    textTransform: "uppercase",
  },
  dialogBody: {
    padding: theme.spacing(3),
  },
  field: {
    marginBottom: theme.spacing(3),
  },
  field2: {
    marginBottom: theme.spacing(2),
  },
  submitButton: {
    "&&": {
      borderRadius: 0,
      backgroundColor: "#111111",
      color: "#fff",
      ...TYPOGRAPHY_STYLES.md.bold,
      textTransform: "none",
      padding: "12px 16px",
      "&:hover": {
        backgroundColor: "#000",
      },
      "&.Mui-disabled": {
        backgroundColor: "#cfcfcf",
        color: "#f4f4f4",
      },
    },
  },
  passwordInfoTitle: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#16A34A",
    marginBottom: theme.spacing(1),
  },
  passwordInfoTextInvalid: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#737373",
  },
  passwordInfoItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.8),
  },
  iconChecked: {
    color: "#16A34A",
    fontSize: 18,
  },
  iconUnChecked: {
    color: "#9CA3AF",
    fontSize: 18,
  },
  passwordInfoText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#16A34A",
  },
}));

export default useForgotPasswordFlowStyles;
