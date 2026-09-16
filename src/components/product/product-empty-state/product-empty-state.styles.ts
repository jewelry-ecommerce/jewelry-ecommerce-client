import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({ name: "ProductEmptyState" })((theme) => ({
  root: {
    width: "100%",
    minHeight: "calc(100vh - 280px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: "48px 16px",
    boxSizing: "border-box",
    [theme.breakpoints.down("md")]: {
      minHeight: "calc(100vh - 240px)",
      padding: "40px 16px",
    },
  },
  illustration: {
    width: 298,
    height: "auto",
    maxWidth: "100%",
    [theme.breakpoints.down("md")]: {
      width: 240,
    },
  },
  message: {
    marginTop: 20,
    color: "#111827",
    textAlign: "center",
    textTransform: "uppercase",
    ...TYPOGRAPHY_STYLES["2xl"].bold,
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.lg.bold,
    },
  },
  description: {
    marginTop: 16,
    color: "#111827",
    textAlign: "center",
    ...TYPOGRAPHY_STYLES.base.regular,
  },
}));

export default useStyles;
