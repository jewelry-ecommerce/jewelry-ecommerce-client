import { styled, Box, IconButton, Typography } from "@mui/material";
import { TRANSITION_TIME, BORDER_RADIUS_ELEMENT_SMALL } from "@/utils/constants/style.constant";
import { StackRowAlignJustCenter } from "../styled";

type StyledStepperProps = {
  stepperSize?: "small" | "medium" | "large";
  stepperVariant?: "outlined" | "split";
};

export const StepperContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "stepperSize" && prop !== "stepperVariant",
})<StyledStepperProps>(({ theme, stepperSize, stepperVariant }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "fit-content",

  ...(stepperSize === "small" && { height: 27 }),
  ...(stepperSize === "medium" && { height: 32 }),
  ...(stepperSize === "large" && { height: 50 }),

  ...(stepperVariant === "outlined" && {
    backgroundColor: theme.palette.background.paper,
    overflow: "hidden",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: BORDER_RADIUS_ELEMENT_SMALL,
    ...(stepperSize === "large" && {
      borderRadius: theme.spacing(1),
    }),
  }),

  ...(stepperVariant === "split" && {
    gap: theme.spacing(stepperSize === "large" ? 2 : 1),
  }),
}));

export const StepperButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "stepperSize" && prop !== "stepperVariant",
})<StyledStepperProps>(({ theme, stepperSize, stepperVariant }) => ({
  borderRadius: 0,
  height: "100%",
  padding: theme.spacing(stepperSize === "large" ? 1.5 : 0.5),
  transition: `all ${TRANSITION_TIME} ease`,
  color: theme.palette.text.primary,

  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:disabled": {
    color: theme.palette.text.disabled,
  },

  ...(stepperVariant === "split" && {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: BORDER_RADIUS_ELEMENT_SMALL,
    ...(stepperSize === "large" && {
      borderRadius: theme.spacing(1),
    }),
  }),

  ...(stepperSize === "large" && {
    width: 50,
    fontSize: "1.5rem",
  }),
  ...(stepperSize === "medium" && {
    width: 32,
    fontSize: "1.1rem",
  }),
  ...(stepperSize === "small" && {
    width: 27,
    fontSize: "0.9rem",
  }),
}));

export const ValueContainer = styled(StackRowAlignJustCenter, {
  shouldForwardProp: (prop) => prop !== "stepperSize" && prop !== "stepperVariant",
})<StyledStepperProps>(({ theme, stepperSize, stepperVariant }) => ({
  height: "100%",
  minWidth: stepperSize === "large" ? 60 : 40,
  padding: theme.spacing(0, stepperSize === "large" ? 2 : 1),

  ...(stepperVariant === "outlined" && {
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    margin: "0 -1px",
  }),

  ...(stepperVariant === "split" && {
    minWidth: "auto",
  }),
}));

export const ValueText = styled("input", {
  shouldForwardProp: (prop) => prop !== "stepperSize",
})<{ stepperSize?: "small" | "medium" | "large" }>(({ theme, stepperSize }) => ({
  fontWeight: theme.typography.fontWeightBold,
  fontSize: stepperSize === "large" ? "1.25rem" : "0.9rem",
  color: theme.palette.text.primary,
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  textAlign: "center",
  width: "100%",
  height: "100%",
  padding: 0,
  margin: 0,
  appearance: "none",
  "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
    appearance: "none",
    margin: 0,
  },
  ...theme.typography.body1, // Ensure standard input fonts are similar
}));
