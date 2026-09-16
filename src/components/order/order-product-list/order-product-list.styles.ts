import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles()((theme) => ({
  root: {
    width: "100%",
    gap: PADDING_GAP_LAYOUT,
  },

  title: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#171717",
  },

  list: {
    gap: PADDING_GAP_LAYOUT,
  },
}));

export default useStyles;
