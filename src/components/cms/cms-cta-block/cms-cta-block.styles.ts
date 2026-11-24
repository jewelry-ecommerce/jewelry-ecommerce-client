import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

export const CTA_BUTTON_SX = {
  minWidth: 0,
  maxWidth: "100%",
  height: 60,
  flexShrink: 1,
  px: 3,
  py: 2,
  borderRadius: 0,
  border: "1px solid",
  textTransform: "none",
  "& .MuiTypography-root": {
    ...TYPOGRAPHY_STYLES.xl.bold,
    lineHeight: "28px",
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
} as const;

const useStyles = makeStyles({ name: "CmsCtaBlock" })((theme) => ({
  root: {
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(8, 2),
    gap: theme.spacing(4),
    overflowWrap: "anywhere",
    [theme.breakpoints.up("lg")]: { padding: "80px 100px", gap: theme.spacing(5) },
  },
  header: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    [theme.breakpoints.up("lg")]: { gap: theme.spacing(3) },
  },
  title: {
    ...TYPOGRAPHY_STYLES["2xl"].bold,
    lineHeight: "32px",
    margin: 0,
    maxWidth: 870,
    width: "100%",
    "& p": { margin: 0 },
    [theme.breakpoints.up("lg")]: { ...TYPOGRAPHY_STYLES["3xl"].bold, lineHeight: "36px" },
  },
  description: {
    ...TYPOGRAPHY_STYLES.md.regular,
    lineHeight: "24px",
    margin: 0,
    whiteSpace: "pre-wrap",
    [theme.breakpoints.up("lg")]: { ...TYPOGRAPHY_STYLES.xl.regular, lineHeight: "28px" },
  },
  bottomText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    lineHeight: "18px",
    margin: 0,
    whiteSpace: "pre-wrap",
    [theme.breakpoints.up("lg")]: { ...TYPOGRAPHY_STYLES.xl.regular, lineHeight: "28px" },
  },
  actions: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "inherit",
    gap: theme.spacing(1.5),
    [theme.breakpoints.up("lg")]: { gap: theme.spacing(5) },
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    maxWidth: "100%",
    [theme.breakpoints.up("sm")]: { flexDirection: "row" },
  },
}));

export default useStyles;