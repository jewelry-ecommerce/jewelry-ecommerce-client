import { tss } from "tss-react/mui";

const useStyles = tss.withName("BannerHero").create(({ theme }) => ({
  root: {
    width: "100%",
    margin: "0 auto",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridAutoRows: "auto",
    gap: 0,
    width: "100%",
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "repeat(2, 1fr)",
      gridAutoRows: "auto",
    },
  },
  gridItem: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: theme.palette.background.default,
    isolation: "isolate",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
    backgroundColor: "#000",
    pointerEvents: "none",
  },
  contentOverlay: {
    position: "absolute",
    color: "#fff",
    width: "90%",
    maxWidth: "100%",
    zIndex: 2,
    pointerEvents: "none",
    "& a, & button": {
      pointerEvents: "auto",
    },
  },
  title: {
    fontSize: "clamp(0.75rem, 2vw, 1.25rem)",
    fontWeight: 700,
    marginBottom: 4,
    textTransform: "uppercase",
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: "clamp(0.625rem, 1.5vw, 0.875rem)",
    marginBottom: 6,
    lineHeight: 1.3,
  },
  actions: {
    gap: 6,
    flexWrap: "wrap",
    marginTop: 6,
  },
  actionsStack: {
    flexDirection: "column",
    gap: 6,
    flexWrap: "wrap",
  },
  button: {
    fontSize: "clamp(0.625rem, 1.2vw, 0.75rem)",
    minWidth: 72,
    height: 28,
    padding: "4px 10px",
    borderRadius: 0,
    textTransform: "none",
    whiteSpace: "nowrap",
  },
  mediaWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    // Scale nhẹ (clip bởi gridItem) để vá đường hở 1px do làm tròn 1fr / object-fit ở zoom khác nhau.
    transform: "scale(1.004)",
    backfaceVisibility: "hidden",
    transition: "transform 0.6s ease",
    "& video, & img": {
      display: "block",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      border: 0,
      outline: 0,
      backgroundColor: "transparent",
    },
    "&:hover": {
      transform: "scale(1.03)",
    },
  },
  carousel: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative",
  },
  carouselContainer: {
    display: "flex",
    height: "100%",
  },
  carouselSlide: {
    flex: "0 0 100%",
    minWidth: 0,
    height: "100%",
    position: "relative",
  },
  dots: {
    position: "absolute",
    bottom: 12,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 6,
    zIndex: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  activeDot: {
    backgroundColor: "#fff",
  },
}));

export default useStyles;
