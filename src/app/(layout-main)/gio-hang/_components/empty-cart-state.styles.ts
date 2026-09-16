import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({ name: "EmptyCartState" })((theme) => ({
  root: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 40,
  },
  miniCartRoot: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    height: "100%",
  },
  title: {
    ...TYPOGRAPHY_STYLES["2xl"].bold,
    textTransform: "uppercase",
    textAlign: "center",
  },
  iconBox: {
    display: "flex",
    padding: "0 24px",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
    alignSelf: "stretch",
  },
  iconImage: {
    width: 200,
    height: "auto",
    maxWidth: "100%",
    [theme.breakpoints.down("md")]: {
      width: 120,
    },
  },
  emptyText: {
    ...TYPOGRAPHY_STYLES["2xl"].bold,
    color: "#111827",
    textAlign: "center",
    textTransform: "uppercase",
    lineHeight: "150%",
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES["lg"].bold,
    },
  },
  description: {
    ...TYPOGRAPHY_STYLES["base"].regular,
    color: "#111827",
    textAlign: "center",
    lineHeight: "150%",
    maxWidth: 700,
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES["sm"].regular,
    },
  },
  ctaButton: {
    "&&": {
      display: "flex",
      width: 250,
      padding: "12px 16px",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      borderRadius: 0,
      backgroundColor: "#000",
      textTransform: "none",
      color: theme.palette.common.white,
      textAlign: "center",
      ...TYPOGRAPHY_STYLES["md"].bold,
      lineHeight: "150%",
      "&:hover": {
        backgroundColor: "#111",
      },
      [theme.breakpoints.down("md")]: {
        width: "fit-content",
        padding: "6px 12px",
      },
    },
  },
  pageWrapper: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.down(810)]: {
      minHeight: "50vh",
    },
  },
}));

export default useStyles;
