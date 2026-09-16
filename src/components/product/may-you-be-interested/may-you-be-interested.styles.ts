import { PADDING_GAP_ITEM } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: "16px 20px",
  },
  title: {
    ...TYPOGRAPHY_STYLES.base.bold,
    color: "#000",
    lineHeight: "150%",
    mb: 2,
  },
  embla: {
    overflow: "hidden",
    width: "100%",
    padding: "8px 0",
  },
  emblaContainer: {
    display: "flex",
    gap: "12px",
  },
  emblaSlide: {
    flex: "0 0 420px",
    minWidth: 0,
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      flex: "0 0 calc(100vw - 56px)",
    },
    [theme.breakpoints.between("sm", "md")]: {
      flex: "0 0 380px",
    },
  },
  card: {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    border: "1px solid #E3E3E3",
    backgroundColor: "#FFFFFF",
    gap: PADDING_GAP_ITEM,
    padding: "4px",
  },
  imageWrapper: {
    position: "relative",
    flexShrink: 0,
    width: "88px",
    minWidth: "88px",
    height: "93px",
    cursor: "pointer",
    backgroundColor: "var(--product-image-background)",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
  },
  content: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    padding: "0 8px 8px 0",
  },
  productNameLink: {
    textDecoration: "none",
  },
  productTitle: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: "var(--Text, #27251F)",
    textTransform: "capitalize",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  attributesText: {
    ...TYPOGRAPHY_STYLES.xs.regular,
    color: "#27272A",
    lineHeight: "14px",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "flex-start",
    flexShrink: 0,
    gap: 2,
  },
  price: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    color: "var(--Text, #27251F)",
    textAlign: "right",
  },
  originalPrice: {
    ...TYPOGRAPHY_STYLES.xs.regular,
    color: "#707070",
    textAlign: "right",
    textDecoration: "line-through",
  },
  addToCartButton: {
    borderRadius: "4px",
    padding: "6px",
    width: "fit-content",
    marginTop: "auto",
    alignSelf: "flex-end",
    border: "1px solid #E2E2E2",
    display: "inline-flex",
    cursor: "pointer",
    lineHeight: 0,
  },
  addToCartButtonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
    pointerEvents: "none",
    borderColor: "#ECECEC",
  },
  emptyText: {
    textAlign: "center",
    color: "#999999",
    py: 4,
  },
  metaRow: {
    minWidth: 0,
    gap: 8,
  },
}));

export default useStyles;
