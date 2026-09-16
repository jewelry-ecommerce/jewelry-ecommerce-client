import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "../../../utils/constants/typography.constant";
import { PADDING_GAP_ITEM } from "@/utils/constants/style.constant";

const useStyles = makeStyles({ name: "ProductTitle" })((theme) => ({
  root: {
    gap: "16px",
    padding: "24px 16px 16px",
    [theme.breakpoints.down(810)]: {
      padding: "16px 16px 8px",
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
  titles: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: 0,
    [theme.breakpoints.down(810)]: {
      gap: PADDING_GAP_ITEM,
    },
  },
  mainTitle: {
    ...TYPOGRAPHY_STYLES["3xl"].bold,
    color: theme.palette.text.primary,
    textTransform: "uppercase",
    [theme.breakpoints.down(1199)]: {
      ...TYPOGRAPHY_STYLES["2xl"].bold,
    },
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES["xl"].bold,
    },
  },
  subTitle: {
    ...TYPOGRAPHY_STYLES["xl"].regular,
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    [theme.breakpoints.down(1199)]: {
      ...TYPOGRAPHY_STYLES["lg"].regular,
    },
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES["md"].regular,
    },
  },
  seeMoreLink: {
    ...TYPOGRAPHY_STYLES.md.regular,
    color: "#27251F",
    textDecoration: "underline",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.regular,
    },
  },
}));

export default useStyles;
