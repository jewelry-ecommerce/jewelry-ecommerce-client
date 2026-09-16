import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_ITEM, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles()((theme) => ({
  root: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    gap: PADDING_GAP_LAYOUT,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    [theme.breakpoints.down(810)]: {
      flexDirection: "column",
      gap: PADDING_GAP_LAYOUT,
    },
  },

  headerContent: {
    display: "flex",
    flexDirection: "row",
    gap: PADDING_GAP_LAYOUT,
    alignItems: "flex-start",
    [theme.breakpoints.down(810)]: {
      flexDirection: "column",
    },
  },

  title: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#27251F",
  },

  actions: {
    gap: PADDING_GAP_LAYOUT,
    [theme.breakpoints.down(810)]: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#FFFFFF",
      padding: PADDING_GAP_LAYOUT,
      borderTop: "1px solid #D4D4D4",
      zIndex: 1000,
      gap: PADDING_GAP_LAYOUT,
      "& > button": {
        flex: 1,
      },
    },
  },

  btnSecondary: {
    padding: "6px 12px",
    border: "1px solid #171717",
    borderRadius: "0",
    color: "#171717",
    ...TYPOGRAPHY_STYLES.sm.bold,
    "&:hover": {
      backgroundColor: "#F4F4F5",
    },
  },

  btnPrimary: {
    padding: "6px 12px",
    backgroundColor: "#000000",
    borderRadius: "0",
    color: "#FFFFFF",
    ...TYPOGRAPHY_STYLES.sm.bold,
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#333333",
    },
    "&.Mui-disabled": {
      backgroundColor: "#A3A3A3",
      color: "#FFFFFF",
    },
  },

  infoList: {
    gap: "14px",
  },

  infoRow: {
    alignItems: "flex-start",
    minWidth: 0,
    width: "100%",
  },

  reasonInfoList: {
    gap: PADDING_GAP_LAYOUT,
  },

  label: {
    flex: 1,
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
  },

  infoLabel: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#6B7280",
  },

  value: {
    flex: 1,
    minWidth: 0,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
  },

  statusBadge: {
    width: "fit-content",
  },

  returnNotice: {
    backgroundColor: "#F5F5F5",
    padding: `${PADDING_GAP_ITEM} ${PADDING_GAP_LAYOUT}`,
  },

  paymentNotice: {
    backgroundColor: "#F4FFE4",
    padding: `${PADDING_GAP_ITEM} ${PADDING_GAP_LAYOUT}`,
  },

  paymentNoticeText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#171717",
  },

  paymentNoticeValue: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    fontWeight: 700,
    color: "#7B9E48",
  },

  fulfillmentSummaryValue: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    fontWeight: 700,
    color: "#7B9E48",
  },

  returnNoticeText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#171717",
  },
}));

export default useStyles;
