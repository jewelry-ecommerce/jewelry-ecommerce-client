import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

/** Kích thước ảnh quà — đồng bộ với giftImageWrap bên dưới */
export const cartDrawerGiftImage = {
  width: 68,
  height: 88,
} as const;

const useStyles = makeStyles({ name: "CartDrawerComponent" })((theme) => ({
  paper: {
    width: "100%",
    maxWidth: 460,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down("lg")]: {
      maxWidth: "100%",
    },
  },
  header: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 16px 14px",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  titleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  title: {
    ...TYPOGRAPHY_STYLES["xl"].bold,
    textTransform: "uppercase",
    marginRight: 12,
  },
  titleCount: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: "#E5E5E5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#525252",
  },
  closeButton: {
    color: theme.palette.text.primary,
    width: 28,
    height: 28,
  },
  drawerContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    height: "100%",
  },
  body: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overscrollBehavior: "contain",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
  },
  promoWrap: {
    padding: "8px 20px 20px 20px",
  },
  promoRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  promoIcon: {
    fontSize: 14,
    color: "#F59E0B",
  },
  promoText: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  bold: {
    ...TYPOGRAPHY_STYLES.sm.bold,
  },
  promoHighlight: {
    ...TYPOGRAPHY_STYLES.base.bold,
    marginTop: 8,
    marginBottom: 10,
  },
  giftTabsScrollWrapper: {
    overflow: "auto",
    width: "100%",
    marginBottom: 12,
    "&::-webkit-scrollbar": {
      height: 4,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#D1D5DB",
      borderRadius: 2,
      "&:hover": {
        backgroundColor: "#9CA3AF",
      },
    },
  },
  giftTabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
    minWidth: "100%",
    "&:before": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      top: "50%",
      height: 1,
      backgroundColor: "#FED05D",
      zIndex: 0,
    },
  },
  giftTabActive: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    backgroundColor: "#FED05D",
    color: "#111",
    width: "fit-content",
    padding: "2px 6px",
    zIndex: 1,
    justifySelf: "center",
  },
  giftTabDisabled: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    backgroundColor: "#E5E7EB",
    color: "#A3A3A3",
    width: "fit-content",
    padding: "2px 6px",
    zIndex: 1,
    justifySelf: "center",
  },
  giftLabel: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    marginBottom: 8,
  },
  giftEmbla: {
    overflow: "hidden",
    width: "100%",
    paddingBottom: 4,
  },
  giftEmblaContainer: {
    display: "flex",
    gap: 10,
    touchAction: "pan-y pinch-zoom",
    WebkitTapHighlightColor: "transparent",
  },
  giftCard: {
    display: "flex",
    // gridTemplateColumns: "56px 1fr auto 56px",
    gap: 10,
    alignItems: "center",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    paddingRight: 12,
    // backgroundColor: "#FAFAFA",
    minWidth: "fit-content",
    flex: "0 0 auto",
    scrollSnapAlign: "start",
    cursor: "pointer",
  },
  giftImageWrap: {
    width: 68,
    height: 88,
    flexShrink: 0,
    backgroundColor: "#F3E8FF",
    borderRadius: 2,
    overflow: "hidden",
  },
  giftImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  giftInfo: {
    minWidth: 0,
  },
  giftName: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#171717",
  },
  giftPrice: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#171717",
  },
  giftOriginalPrice: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: "#A3A3A3",
    textDecoration: "line-through",
    marginLeft: 6,
  },
  giftActionButton: {
    width: 30,
    height: 30,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    color: "#525252",
  },
  emptyState: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: theme.palette.text.secondary,
    padding: "24px 0",
    textAlign: "center",
  },
  itemWrap: {
    padding: "0px 20px",
    width: "100%",
    "&:last-of-type": {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
  footer: {
    flexShrink: 0,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down("lg")]: {
      paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px))`,
    },
  },
  totalRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    ...TYPOGRAPHY_STYLES.base.bold,
  },
  totalValue: {
    ...TYPOGRAPHY_STYLES.xl.bold,
  },
  checkoutButton: {
    ...TYPOGRAPHY_STYLES.md.bold,
    borderRadius: 0,
    backgroundColor: "#000",
    color: "#fff",
    padding: "12px 14px",
    textTransform: "capitalize",
    "&:hover": {
      backgroundColor: "#111",
    },
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.bold,
    },
  },
  goCartButton: {
    ...TYPOGRAPHY_STYLES.md.bold,
    borderRadius: 0,
    padding: "12px 14px",
    borderColor: "#111",
    color: "#0A0A0A",
    textTransform: "none",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.base.bold,
    },
  },
  divider: {
    // marginTop: 12,
  },
}));

export default useStyles;
