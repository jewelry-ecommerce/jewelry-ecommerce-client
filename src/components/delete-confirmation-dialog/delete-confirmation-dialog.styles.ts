import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useDeleteConfirmationDialogStyles = makeStyles()((theme) => ({
  dialog: {
    // "& .MuiDialog-paper": {
    //   borderRadius: "8px",
    //   maxWidth: "550px",
    // },
    "& .MuiDialog-paper": {
      borderRadius: "8px",
      maxWidth: "550px",
      width: "100%",
      boxSizing: "border-box",
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
  message: {
    ...TYPOGRAPHY_STYLES.sm.regular,
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    [theme.breakpoints.down(810)]: {
      flexDirection: "column-reverse",
    },
  },
  cancelButton: {
    "&&": {
      flex: 1,
      padding: "12px 24px",
      border: "1px solid #000",
      backgroundColor: "#fff",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "none",
      ...TYPOGRAPHY_STYLES.md.regular,
      "&:hover": {
        backgroundColor: "#f5f5f5",
      },
      "&:disabled": {
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },
  },
  confirmButton: {
    "&&": {
      flex: 1,
      padding: "12px 24px",
      backgroundColor: "#000",
      color: "#fff",
      borderRadius: "4px",
      border: "1px solid #000",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "none",
      ...TYPOGRAPHY_STYLES.md.regular,
      "&:hover": {
        backgroundColor: "#1a1a1a",
      },
      "&:disabled": {
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },
  },
}));

export default useDeleteConfirmationDialogStyles;
