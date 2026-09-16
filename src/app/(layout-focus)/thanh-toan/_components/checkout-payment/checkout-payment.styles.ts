import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles()((theme) => ({
  root: {
    gap: PADDING_GAP_LAYOUT,
  },

  header: {
    gap: PADDING_GAP_ITEM,
  },

  title: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    textTransform: "uppercase",
  },

  subtitle: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#707070",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.regular,
    },
  },

  paymentList: {
    border: "1px solid #E5E5E5",
    borderRadius: "5px",
    overflow: "hidden",
  },

  paymentRow: {
    "&:not(:last-child)": {
      borderBottom: "1px solid #E5E5E5",
    },
  },

  paymentItem: {
    padding: "14px",
    cursor: "pointer",
    gap: PADDING_GAP_ITEM,
    transition: "background-color 0.2s ease",
  },

  paymentItemDisabled: {
    cursor: "not-allowed",
    opacity: 0.7,
    userSelect: "none",
  },

  deferredPaymentNotice: {
    width: "100%",
    boxSizing: "border-box",
  },

  deferredPaymentNoticeText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#171717",
    lineHeight: 1.5,
  },

  codWarning: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#B45309",
    padding: "0 14px 12px",
    marginTop: "-6px",
    lineHeight: 1.45,
  },

  label: {
    flex: 1,
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#000000",
  },

  iconGroup: {
    minWidth: 30,
    minHeight: 30,
    gap: PADDING_GAP_ITEM,
  },

  paymentIcon: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  amexIconWrapper: {
    backgroundColor: "#006FCF",
  },
}));

export default useStyles;
