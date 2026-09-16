import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useCartFulfillmentChoiceDialogStyles = makeStyles()((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: "8px",
      maxWidth: "550px",
      width: "100%",
      boxSizing: "border-box",
      margin: "16px",
    },
  },
  closeButtonWrap: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    padding: "16px 20px",
  },
  container: {
    padding: "16px 40px 40px 40px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    [theme.breakpoints.down(810)]: {
      padding: "16px",
    },
  },
  content: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    gap: "0",
  },
  title: {
    ...TYPOGRAPHY_STYLES["2xl"].bold,
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    [theme.breakpoints.down(810)]: {
      flexDirection: "column",
    },
  },
  outlinedButton: {
    "&&": {
      flex: 1,
      padding: "12px 14px",
      border: "1px solid #111",
      backgroundColor: "#fff",
      borderRadius: 0,
      color: "#0A0A0A",
      textTransform: "none",
      ...TYPOGRAPHY_STYLES.md.bold,
      "&:hover": {
        backgroundColor: "#f5f5f5",
        borderColor: "#111",
      },
      "&:disabled": {
        opacity: 0.6,
      },
      [theme.breakpoints.down(810)]: {
        ...TYPOGRAPHY_STYLES.base.bold,
      },
    },
  },
  filledButton: {
    "&&": {
      flex: 1,
      padding: "12px 14px",
      backgroundColor: "#000",
      color: "#fff",
      borderRadius: 0,
      border: "1px solid #000",
      textTransform: "none",
      ...TYPOGRAPHY_STYLES.md.bold,
      "&:hover": {
        backgroundColor: "#111",
      },
      "&:disabled": {
        opacity: 0.6,
      },
      [theme.breakpoints.down(810)]: {
        ...TYPOGRAPHY_STYLES.base.bold,
      },
    },
  },
}));

export default useCartFulfillmentChoiceDialogStyles;
