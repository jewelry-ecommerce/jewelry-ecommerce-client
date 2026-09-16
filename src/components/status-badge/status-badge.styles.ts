import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "StatusBadge" })((theme) => ({
  root: {
    width: "fit-content",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    maxHeight: 30,
    whiteSpace: "nowrap",
    borderRadius: 2,
    lineHeight: "120%",
  },
  sizeSm: {
    padding: "3px 4px",
    ...TYPOGRAPHY_STYLES.sm.regular,
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.xs.regular,
    },
  },
  sizeMd: {
    padding: "4px 8px",
    ...TYPOGRAPHY_STYLES.base.regular,
  },
  uppercase: {
    textTransform: "uppercase",
  },
}));

export default useStyles;
