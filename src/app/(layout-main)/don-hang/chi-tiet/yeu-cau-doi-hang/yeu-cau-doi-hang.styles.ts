import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  root: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    [theme.breakpoints.down(810)]: {
      paddingBottom: "100px",
    },
  },
  container: {
    maxWidth: "640px",
    margin: "0 auto",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "0 16px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "40px",
    [theme.breakpoints.down(810)]: {
      gap: "24px",
    },
    padding: "40px 0 0 0",
  },
  title: {
    ...TYPOGRAPHY_STYLES["2xl"].bold,
    color: "#27251F",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
}));

export default useStyles;
