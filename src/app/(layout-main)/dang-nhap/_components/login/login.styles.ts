import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useLoginStyles = makeStyles({ name: "LoginForm" })((theme) => ({
  page: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  title: {
    ...TYPOGRAPHY_STYLES["xl"].bold,
    marginBottom: theme.spacing(3),
    textTransform: "uppercase",
    textAlign: "left",
  },
  card: {
    width: "100%",
    maxWidth: 450,
    border: "1px solid #d8d8d8",
    padding: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      maxWidth: 500,
      padding: theme.spacing(2.5),
    },
    [theme.breakpoints.up("md")]: {
      maxWidth: 560,
      padding: theme.spacing(3),
    },
  },
  field: {
    marginBottom: theme.spacing(2),
    "& .MuiInputBase-root": {
      // backgroundColor: "#f5f5f5",
    },
  },
  rememberRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(1),
  },
  rememberText: {
    fontSize: 13,
    color: "#111827",
  },
  submitButton: {
    "&&": {
      borderRadius: 0,
      backgroundColor: "#111",
      color: "#fff",
      ...TYPOGRAPHY_STYLES.md.bold,
      padding: "12px 16px",
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#000",
      },
      "&.Mui-disabled": {
        backgroundColor: "#cfcfcf",
        color: "#f4f4f4",
      },
    },
  },
  footerRow: {
    flexWrap: "wrap",
  },
  footerLink: {
    color: "#197CBD",
    textDecoration: "underline",
    ...TYPOGRAPHY_STYLES.base.regular,
  },
  footerLinkButton: {
    color: "#197CBD",
    textDecoration: "underline",
    ...TYPOGRAPHY_STYLES.base.regular,
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
  },
  spacer: {
    width: 20,
  },
  footerText: {
    ...TYPOGRAPHY_STYLES.base.regular,
  },
}));

export default useLoginStyles;
