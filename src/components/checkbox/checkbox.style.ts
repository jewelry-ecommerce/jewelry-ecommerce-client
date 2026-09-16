import { makeStyles } from "tss-react/mui";
import { STYLE } from "@/utils/constants";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

export const CHECKBOX_COLORS = {
  checked: {
    filledBg: "#050505",
    outlinedBg: "transparent",
    border: "#050505",
    icon: "#FFF",
  },
  default: {
    background: "transparent",
    border: "#D0D5DD",
    hoverBg: "#F5F5F5",
  },
  disabled: {
    background: "#F5F5F5",
    border: "#E0E0E0",
    icon: "#BDBDBD",
  },
};

export const CHECKBOX_TEXT_COLOR = {
  default: "#000000",
  disabled: "#9E9E9E",
};

interface CheckboxStyleProps {
  checked: boolean;
  disabled: boolean;
  isFilled: boolean;
  shape: "square" | "circle";
  size: "small" | "medium" | number;
  sxPropsColor: any;
  sxPropsBgColor: any;
  sxPropsBorderColor: any;
  hasError: boolean;
}

const useStyles = makeStyles<CheckboxStyleProps>({ name: "CheckboxComponent" })((
  theme,
  { checked, disabled, isFilled, shape, size, sxPropsBgColor, sxPropsBorderColor, hasError },
) => {
  const boxSize = typeof size === "number" ? size : size === "small" ? 16 : 20;

  const backgroundColor = disabled
    ? sxPropsBgColor || CHECKBOX_COLORS.disabled.background
    : checked
      ? isFilled
        ? sxPropsBgColor || CHECKBOX_COLORS.checked.filledBg
        : CHECKBOX_COLORS.checked.outlinedBg
      : CHECKBOX_COLORS.default.background;

  const borderColor = disabled
    ? sxPropsBorderColor || CHECKBOX_COLORS.disabled.border
    : hasError
      ? "#EF4444"
      : checked
        ? sxPropsBorderColor || CHECKBOX_COLORS.checked.border
        : CHECKBOX_COLORS.default.border;

  return {
    wrapper: {
      cursor: disabled ? "not-allowed" : "pointer",
    },
    checkbox: {
      width: boxSize,
      height: boxSize,
      minWidth: boxSize,
      minHeight: boxSize,
      boxSizing: "border-box",
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      aspectRatio: "1 / 1",
      lineHeight: 0,
      cursor: disabled ? "not-allowed" : "pointer",
      userSelect: "none",
      borderRadius: shape === "circle" ? "50%" : `calc(${STYLE.BORDER_RADIUS_ELEMENT_SMALL} / 2)`,
      border: `1px solid ${borderColor}`,
      backgroundColor,
      transition: `all 0.2s ease`,

      ...(!disabled &&
        (!checked || !isFilled) && {
          "@media (hover: hover) and (pointer: fine)": {
            "&:hover": {
              borderColor: sxPropsBgColor || CHECKBOX_COLORS.checked.border,
              backgroundColor: CHECKBOX_COLORS.default.hoverBg,
            },
          },
        }),

      "&:focus-visible": {
        outline: "none",
        boxShadow: "0 0 0 3px rgba(14, 147, 132, 0.25)",
      },

      ...(disabled && { opacity: 0.4 }),
    },
    label: {
      color: disabled ? CHECKBOX_TEXT_COLOR.disabled : CHECKBOX_TEXT_COLOR.default,
      userSelect: "none",
    },
    error: {
      marginTop: 4,
      ...TYPOGRAPHY_STYLES.base.regular,
      color: "#EF4444",
    },
  };
});

export default useStyles;
