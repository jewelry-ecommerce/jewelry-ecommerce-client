import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles({ name: "BreadcrumbComponent" })((_theme) => ({
  root: {
    display: "flex",
    height: 40,
    padding: "12px 16px",
    alignItems: "center",
    gap: 10,
    alignSelf: "stretch",
    borderBottom: "1px solid #DDD",
    background: "#FFF",
    overflowX: "auto",
    overflowY: "hidden",
  },
  item: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: _theme.palette.text.secondary,
    textAlign: "center",
    lineHeight: "16px",
    whiteSpace: "nowrap",
  },
  currentItem: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: _theme.palette.text.primary,
    textAlign: "center",
    lineHeight: "16px",
    whiteSpace: "nowrap",
  },
  separator: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: _theme.palette.text.secondary,
    textAlign: "center",
    lineHeight: "16px",
  },
}));

export default useStyles;
