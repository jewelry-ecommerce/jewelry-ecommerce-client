import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PADDING_GAP_LAYOUT, PADDING_GAP_ITEM } from "@/utils/constants/style.constant";

const useStyles = makeStyles()((theme) => ({
  root: {
    gap: PADDING_GAP_LAYOUT,
  },

  summaryTable: {
    gap: PADDING_GAP_ITEM,
    [theme.breakpoints.down(810)]: {
      gap: "4px",
    },
  },

  row: {
    display: "flex",
    gap: "24px",
    width: "100%",
  },

  textBase: {
    flex: 1,
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#000000",
    whiteSpace: "nowrap",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.regular,
    },
  },

  textValue: {
    flex: 1,
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#000000",
    textAlign: "right",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.regular,
    },
  },

  shippingValueWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8px",
    flex: 1,
    textAlign: "right",
  },

  originalShippingFee: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#71717A",
    textDecoration: "line-through",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.regular,
    },
  },

  shippingFeeValue: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#000000",
    textAlign: "right",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.sm.regular,
    },
  },

  discountText: {
    flex: 1,
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#71717A",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.xs.regular,
    },
  },

  discountValue: {
    flex: 1,
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#71717A",
    textAlign: "right",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.xs.regular,
    },
  },

  stepperWrapper: {
    width: "100%",
  },

  discountLabel: {
    position: "relative",
    paddingLeft: "14px",
    "&::before": {
      content: '"•"',
      position: "absolute",
      left: 0,
      fontSize: "12px",
      color: "#71717A",
    },
  },

  pointsWrapper: {
    gap: PADDING_GAP_ITEM,
  },

  pointsInfo: {
    gap: PADDING_GAP_ITEM,
    flex: 1,
  },

  coinIcon: {
    width: 15,
    height: 15,
    flexShrink: 0,
  },

  pointsText: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#27251F",
  },

  pointsDiscount: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#27251F",
  },

  totalLabelValue: {
    flex: 1,
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#000000",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.bold,
    },
  },

  totalValue: {
    flex: 1,
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#000000",
    textAlign: "right",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.bold,
    },
  },

  caption: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#707070",
  },

  discountRow: {
    paddingLeft: "16px",
  },
}));

export const STEPPER_SX = {
  width: "100%",
  height: "fit-content",
  borderRadius: 0,
  border: "1px solid #D4D4D4",
  padding: "4px",
  backgroundColor: "#FFFFFF",
};

export const STEPPER_VALUE_SX = {
  flex: 1,
  "& .MuiTypography-root": {
    ...TYPOGRAPHY_STYLES.md.regular,
    color: "#27251F",
  },
};

export const STEPPER_BUTTON_SX = {
  width: "32px",
  height: "32px",
  borderRadius: 0,
  border: "1px solid #D4D4D4",
  color: "#27251F",
};

export default useStyles;
