import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  root: {
    width: "100%",
    gap: "12px",
    maxWidth: "580px",
    [theme.breakpoints.down(810)]: {
      maxWidth: "500px",
    },
    [theme.breakpoints.down(500)]: {
      maxWidth: "350px",
    },
  },
  lineWrapper: {
    position: "relative",
    width: "100%",
    display: "flex",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "6px",
      left: "40px",
      right: "40px",
      height: "2px",
      backgroundColor: "#DEDEDE",
      zIndex: 0,
      [theme.breakpoints.down(810)]: {
        top: "4px",
      },
    },
  },
  lineActive: {
    position: "absolute",
    top: "6px",
    left: "40px",
    height: "2px",
    backgroundColor: "#27251F",
    zIndex: 1,
    transition: "width 0.3s ease",
    [theme.breakpoints.down(810)]: {
      top: "5px",
    },
  },
  stepsContainer: {
    width: "100%",
    padding: "0 40px",
    position: "relative",
    zIndex: 2,
  },
  stepItem: {
    width: "0px",
    overflow: "visible",
  },
  circle: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#DEDEDE",
    transition: "background-color 0.3s ease",
    flexShrink: 0,
  },
  circleActive: {
    backgroundColor: "#27251F",
  },
  circleCompleted: {
    backgroundColor: "#27251F",
  },
  label: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#A3A3A3",
    textAlign: "center",
    marginTop: PADDING_GAP_LAYOUT,
    whiteSpace: "nowrap",
    width: "max-content",
  },
  labelActive: {
    color: "#27251F",
  },
}));

export default useStyles;
