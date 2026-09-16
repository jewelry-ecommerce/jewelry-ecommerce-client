import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles()((theme) => ({
  root: {
    width: "100%",
    gap: PADDING_GAP_LAYOUT,
  },

  title: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#171717",
  },

  timeline: {
    position: "relative",
  },

  item: {
    display: "flex",
    gap: "10px",
    position: "relative",
    paddingBottom: "32px",
    "&:last-child": {
      paddingBottom: 0,
    },
  },

  spineWrapper: {
    width: "12px",
    flexShrink: 0,
    position: "relative",
    alignSelf: "stretch",
  },

  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#A3A3A3",
    zIndex: 2,
    marginTop: "4px",
  },

  dotActive: {
    backgroundColor: "#27251F",
  },

  line: {
    position: "absolute",
    top: "13px",
    bottom: "-40px",
    left: "50%",
    width: "1px",
    backgroundColor: "#A3A3A3",
    transform: "translateX(-50%)",
    zIndex: 1,
  },

  content: {
    gap: "2px",
    marginTop: "2px",
  },

  dateTimeWrapper: {
    gap: PADDING_GAP_ITEM,
  },

  dateTime: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#A3A3A3",
  },

  statusTitle: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#737373",
  },

  statusTitleActive: {
    color: "#27251F",
  },

  statusDescription: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#A3A3A3",
  },
}));

export default useStyles;
