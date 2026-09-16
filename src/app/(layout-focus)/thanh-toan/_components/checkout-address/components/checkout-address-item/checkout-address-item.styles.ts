import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles()((theme) => ({
  addressItem: {
    padding: PADDING_GAP_LAYOUT,
    gap: PADDING_GAP_LAYOUT,
    borderBottom: "1px solid #EAEAEA",
    "&:last-child": {
      borderBottom: "none",
    },
    cursor: "pointer",
    [theme.breakpoints.down(810)]: {
      padding: PADDING_GAP_LAYOUT,
    },
  },

  addressInfo: {
    flex: 1,
    minWidth: 0,
    gap: "4px",
  },

  addressName: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#27251F",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.bold,
    },
  },

  addressPhone: {
    ...TYPOGRAPHY_STYLES.md.regular,
    color: "#27251F",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.regular,
    },
  },

  addressDetail: {
    ...TYPOGRAPHY_STYLES.md.regular,
    color: "#27251F",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.regular,
      whiteSpace: "normal",
      overflow: "visible",
      textOverflow: "unset",
    },
  },

  badge: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#197CBD",
    border: "1px solid #197CBD",
    borderRadius: "4px",
    padding: "4px 8px",
    marginLeft: PADDING_GAP_ITEM,
    whiteSpace: "nowrap",
    [theme.breakpoints.down(810)]: {
      padding: "2px 6px",
      fontSize: "10px",
    },
  },

  updateLink: {
    color: "#197CBD",
    textDecoration: "underline",
    ...TYPOGRAPHY_STYLES.base.regular,
    whiteSpace: "nowrap",
    cursor: "pointer",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.regular,
    },
  },
}));

export default useStyles;
