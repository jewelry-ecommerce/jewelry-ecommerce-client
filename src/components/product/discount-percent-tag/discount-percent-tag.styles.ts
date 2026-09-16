import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useDiscountPercentTagStyles = makeStyles({ name: "DiscountPercentTag" })((theme) => ({
  root: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: theme.palette.common.white,
    backgroundColor: "#EF4444",
    padding: "2px 6px",
    borderRadius: 0,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
  },
}));

export default useDiscountPercentTagStyles;
