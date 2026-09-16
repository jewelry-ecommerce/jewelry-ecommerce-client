import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const useStyles = makeStyles()((theme) => ({
  sectionCard: {
    padding: "24px",
    backgroundColor: "#fff",
    border: "1px solid #F4F4F5",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    [theme.breakpoints.down(810)]: {
      padding: "16px",
      gap: "16px",
    },
  },
  sectionTitle: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#27251F",
    textTransform: "uppercase",
  },
  searchFieldWrap: {
    width: "100%",
    [theme.breakpoints.down(810)]: {
      width: "calc(100% + 32px)",
      marginLeft: "-16px",
      marginRight: "-16px",
      paddingLeft: "16px",
      paddingRight: "16px",
      boxSizing: "border-box",
    },
  },
  // Tab styles
  tabItem: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#6B7280",
    padding: "8px 16px",
    minHeight: "44px",
    minWidth: "auto",
    textTransform: "none",
    opacity: 1,
    "&.Mui-selected": {
      ...TYPOGRAPHY_STYLES.base.bold,
      color: "#000",
    },
    "& .MuiStack-root": {
      gap: "8px",
    },
  },
  tabBadge: {
    width: "20px",
    height: "20px",
    backgroundColor: "#E5E7EB",
    borderRadius: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#000",
  },
  // Order Card styles
  orderWrapper: {
    border: "1px solid #E5E5E5",
    backgroundColor: "#fff",
    gap: "0px",
    cursor: "pointer",
  },
  orderHeader: {
    padding: "16px",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    [theme.breakpoints.down(810)]: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "8px",
    },
  },
  orderId: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#171717",
    textTransform: "uppercase",
    [theme.breakpoints.down(810)]: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  },
  orderDate: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#171717",
  },
  statusBadge: {
    [theme.breakpoints.down(810)]: {
      alignSelf: "flex-start",
    },
  },
  // Product Section
  productSection: {
    padding: "16px",
    gap: "16px",
    borderTop: "1px solid #E5E5E5",
    borderBottom: "1px solid #E5E5E5",
  },
  productItem: {
    gap: "14px",
  },
  productImage: {
    width: "77px",
    alignSelf: "stretch",
    aspectRatio: "11/13",
    objectFit: "cover",
    borderRadius: "4px",
    backgroundColor: "var(--product-image-background)",
  },
  productName: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#27251F",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  productVariant: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#27272A",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  // Summary Section
  summaryBox: {
    padding: "16px",
    gap: "2px",
  },
  summaryLabel: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#000",
  },
  summarySalePrice: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#27251F",
  },
  summaryPrice: {
    ...TYPOGRAPHY_STYLES.md.bold,
    color: "#27251F",
    textAlign: "right",
  },
  summaryPoint: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#9DA3AE",
    textAlign: "right",
  },
  summaryPointText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: "#9DA3AE",
    textAlign: "right",
    textDecoration: "line-through",
  },
  // Timer Section
  timerBox: {
    backgroundColor: "#F4FFE4",
    padding: "8px 16px",
    borderTop: "1px solid #DDD",
    borderBottom: "1px solid #DDD",
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  timerBoxBleed: {
    width: "calc(100% + 32px)",
    marginLeft: "-16px",
    marginRight: "-16px",
  },
  timerText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#171717",
    textAlign: "right",
  },
  timerValue: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#7B9E48",
  },
  returnNoticeBox: {
    backgroundColor: "#F5F5F5",
    padding: "8px 16px",
    borderTop: "1px solid #DDD",
    borderBottom: "1px solid #DDD",
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  returnNoticeBoxBleed: {
    width: "calc(100% + 32px)",
    marginLeft: "-16px",
    marginRight: "-16px",
  },
  returnNoticeText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#171717",
    textAlign: "right",
  },
  // Action Section
  actionBox: {
    padding: "16px",
    width: "100%",
    alignItems: "stretch",
    gap: "16px",
  },
  btnOutline: {
    padding: "6px 12px",
    ...TYPOGRAPHY_STYLES.base.bold,
    border: "1px solid #0A0A0A",
    color: "#0A0A0A",
    borderRadius: "0px",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.05)",
      border: "1px solid #0A0A0A",
    },
  },
  btnContained: {
    padding: "6px 12px",
    ...TYPOGRAPHY_STYLES.base.bold,
    backgroundColor: "#0A0A0A",
    color: "#fff",
    borderRadius: "0px",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#333",
    },
  },
}));

export default useStyles;
