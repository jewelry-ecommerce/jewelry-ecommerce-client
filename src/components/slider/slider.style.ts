import { styled, Box, IconButton, alpha, keyframes } from "@mui/material";
import {
  TRANSITION_TIME,
  BORDER_RADIUS_ELEMENT_WRAPPER,
  BORDER_RADIUS_ELEMENT_SMALL,
  PADDING_GAP_ITEM,
  PADDING_GAP_LAYOUT,
} from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { StackRow, StackRowAlignJustCenter } from "../styled";

export const SliderContainer = styled(Box)(({ theme }) => ({
  ...TYPOGRAPHY_STYLES.base.regular,
  position: "relative",
  width: "100%",
  overflow: "hidden",
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: "2px",
  },
  "&:hover .nav-arrow": {
    opacity: 1,
  },
}));

export const SliderViewport = styled(Box)(() => ({
  width: "100%",
  overflow: "hidden",
}));

export const SlidesTrack = styled(StackRow)(() => ({
  height: "100%",
  willChange: "transform",
  userSelect: "none",
  WebkitTouchCallout: "none",
  KhtmlUserSelect: "none",
  WebkitTapHighlightColor: "transparent",
}));

export const NavArrow = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 10,
  width: 40,
  height: 40,
  minWidth: 40,
  padding: 0,
  borderRadius: "50%",
  backgroundColor: alpha("#333333", 0.56),
  color: "#fff",
  backdropFilter: "blur(8px)",
  transition: `all ${TRANSITION_TIME} ease`,
  "&:hover": {
    backgroundColor: alpha("#333333", 0.8),
  },
  "&.Mui-disabled": {
    opacity: "0.3 !important",
    cursor: "not-allowed",
    pointerEvents: "none",
  },
  [theme.breakpoints.down(810)]: {
    width: 28,
    height: 28,
    minWidth: 28,
  },
  [theme.breakpoints.down("md")]: {
    opacity: 1,
  },
  [theme.breakpoints.up("md")]: {
    opacity: 0,
  },
}));

export const DotsContainer = styled(StackRowAlignJustCenter)(({ theme }) => ({
  position: "absolute",
  bottom: "24px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 10,
  backgroundColor: alpha("#333333", 0.56),
  backdropFilter: "blur(8px)",
  padding: `${PADDING_GAP_ITEM} ${PADDING_GAP_LAYOUT}`,
  borderRadius: BORDER_RADIUS_ELEMENT_WRAPPER,
  border: "1px solid rgba(255,255,255,0.1)",
  gap: PADDING_GAP_ITEM,
}));

export const Dot = styled("button")<{ active: boolean }>(({ theme, active }) => ({
  width: active ? 60 : 10,
  height: 10,
  borderRadius: BORDER_RADIUS_ELEMENT_SMALL,
  backgroundColor: active ? "#FFFFFF" : alpha("#FFFFFF", 0.3),
  cursor: "pointer",
  transition: `all ${TRANSITION_TIME} cubic-bezier(0.4, 0, 0.2, 1)`,
  border: "none",
  padding: 0,
  "&:hover": {
    backgroundColor: "#FFFFFF",
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: "4px",
  },
}));

export const sliderProgressKeyframes = keyframes`
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
`;

export const ProgressContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 10,
  display: "flex",
  gap: theme.spacing(3),
  bottom: "24px",
  [theme.breakpoints.down(810)]: {
    gap: PADDING_GAP_ITEM,
  },
}));

export const ProgressSegment = styled("button")(({ theme }) => ({
  width: 117,
  height: 2,
  backgroundColor: alpha("#fff", 0.3),
  overflow: "hidden",
  border: "none",
  padding: 0,
  cursor: "pointer",
  position: "relative",
  [theme.breakpoints.down("md")]: {
    width: 85,
  },
}));

export const ProgressBar = styled(Box)(({ theme }) => ({
  height: "100%",
  backgroundColor: "#fff",
  width: "100%",
  transformOrigin: "left",
  willChange: "transform",
  boxShadow: "0 0 8px rgba(255,255,255,0.4)",
}));
