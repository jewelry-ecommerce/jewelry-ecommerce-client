import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { PRODUCT_COLLECTION_SHOWCASE_ASPECT_RATIO, PRODUCT_COLLECTION_SHOWCASE_CARD_WIDTH } from "./product-collection-showcase.constants";

const useStyles = makeStyles({ name: "ProductCollectionShowcase" })((theme) => ({
  root: {
    width: "fit-content",
    maxWidth: "100%",
    background: "#fff",
    padding: "8px 16px 24px",
  },
  title: {
    ...TYPOGRAPHY_STYLES["3xl"].bold,
    color: "#27251F",
    textTransform: "uppercase",
    marginBottom: 14,
  },
  cards: {
    display: "grid",
    gridTemplateColumns: `repeat(3, ${PRODUCT_COLLECTION_SHOWCASE_CARD_WIDTH}px)`,
    width: "fit-content",
    maxWidth: "100%",
    justifyContent: "flex-start",
    gap: 14,
    marginBottom: 14,
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      width: "100%",
      gap: 10,
    },
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      width: "100%",
      gap: 8,
    },
  },
  card: {
    alignSelf: "stretch",
    aspectRatio: PRODUCT_COLLECTION_SHOWCASE_ASPECT_RATIO,
    border: "1px solid #000",
    background: "var(--product-image-background)",
    width: PRODUCT_COLLECTION_SHOWCASE_CARD_WIDTH,
    minWidth: 0,
    maxWidth: "100%",
    cursor: "pointer",
    overflow: "hidden",
    position: "relative",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
    },
    [theme.breakpoints.down("md")]: {
      width: "100%",
      height: "auto",
    },
  },
  loadingCardWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  loadingCard: {
    height: 306,
    width: 257,
    maxWidth: "100%",
    border: "1px solid #E0E0E0",
    background: "var(--product-image-background)",
    position: "relative",
    overflow: "hidden",
  },
  loadingCardMedia: {
    width: "100%",
    height: "100%",
  },
  loadingCardTitle: {
    width: "65%",
    maxWidth: 180,
    fontSize: "0.85rem",
  },
  cardTitle: {
    ...TYPOGRAPHY_STYLES.sm.bold,
    width: "100%",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    paddingTop: 8,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  tagButton: {
    ...TYPOGRAPHY_STYLES.xs.regular,
    border: "none",
    padding: "6px 12px",
    borderRadius: 4,
    background: "#f1f1f1",
    color: "#666",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    "&:hover": {
      background: "#e6e6e6",
    },
  },
}));

export default useStyles;
