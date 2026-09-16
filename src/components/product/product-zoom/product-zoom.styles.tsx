import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({ name: "ProductZoom" })((theme) => ({
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#fff",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    userSelect: "none",
  },
  topRightControls: {
    position: "absolute",
    top: "20px",
    right: "20px",
    zIndex: 10002,
  },
  closeButton: {
    width: "48px",
    height: "48px",
    backgroundColor: "#000",
    "&:hover": { backgroundColor: "#333" },
  },

  // Navigation Arrows
  sideNav: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "48px",
    height: "48px",
    zIndex: 10001,
    backgroundColor: "#fff",
    border: "1px solid #E5E5E5",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.3s",
    cursor: "pointer",
    "&:hover": { backgroundColor: "#f5f5f5" },
    "&.disabled": { opacity: 0.1, cursor: "not-allowed", pointerEvents: "none" },
  },
  prevArrow: { left: "40px" },
  nextArrow: { right: "40px" },

  // Zoom Toolbar
  zoomToolbar: {
    position: "absolute",
    bottom: 24,
    left: 24,
    zIndex: 10001,
    display: "flex",
    flexDirection: "column-reverse",
    gap: "12px",
    padding: "6px",
    borderRadius: "24px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: "transparent",
    "&.expanded": {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
  },
  toolBtn: {
    width: "44px",
    height: "44px",
    backgroundColor: "#fff",
    border: "1px solid #E5E5E5",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    cursor: "pointer",
    "&:hover": { backgroundColor: "#f5f5f5" },
    "&.hidden": {
      opacity: 0,
      transform: "scale(0.5)",
      pointerEvents: "none",
      height: 0,
      margin: 0,
      padding: 0,
    },
  },

  zoomContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    touchAction: "none",
    cursor: "auto",
  },
  mainImage: {
    maxWidth: "85%",
    maxHeight: "85%",
    objectFit: "contain",
    willChange: "transform",
    pointerEvents: "auto",
    userDrag: "none" as any,
  },
  iconWhite: {
    filter: "brightness(0) invert(1)",
  },
  iconBlack: {
    filter: "brightness(0)",
  },
}));

export default useStyles;
