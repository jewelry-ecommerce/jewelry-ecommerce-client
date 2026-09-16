import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  root: {
    minHeight: "100vh",
  },
  container: {
    maxWidth: "100%",
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    [theme.breakpoints.down("lg")]: {
      gap: "24px",
    },
    marginBottom: "60px",
  },
  title: {
    ...TYPOGRAPHY_STYLES["2xl"].bold,
    color: "#27251F",
    textTransform: "uppercase",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "0",
    [theme.breakpoints.down("lg")]: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
  gridItem: {
    position: "relative",
    minWidth: 0,
  },
  emptyState: {
    minHeight: "420px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 0 40px",
  },
  removeButton: {
    position: "absolute",
    top: "24px",
    right: "24px",
    zIndex: 5,
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: 0,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    [theme.breakpoints.down(810)]: {
      top: "16px",
      right: "16px",
    },
  },
}));

export default useStyles;
