import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  root: {
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    padding: "40px 0 60px",
    [theme.breakpoints.down(1199)]: {
      padding: PADDING_GAP_LAYOUT,
    },
  },
  content: {
    padding: `${PADDING_GAP_LAYOUT} 0`,
    width: "100%",
    backgroundColor: "#FFFFFF",
    maxWidth: "1116px",
    gap: "24px",
  },

  sectionWrapper: {
    width: "100%",
  },
}));

export default useStyles;
