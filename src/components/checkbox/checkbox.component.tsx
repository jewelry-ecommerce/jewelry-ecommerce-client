import React from "react";
import { Typography, SxProps, Theme, Stack, Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";

import { StackRowAlignCenter, StackRowAlignJustCenter } from "@/components/styled";
import { STYLE } from "@/utils/constants";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import useStyles, { CHECKBOX_COLORS } from "./checkbox.style";

export type CheckboxShape = "square" | "circle";
export type CheckboxSize = "small" | "medium" | number;
export type CheckboxVariant = "filled" | "outlined";
export type CheckboxIconType = "check" | "minus" | "dot" | "custom";

interface CheckboxProps {
  name?: string;
  checked?: boolean;
  disabled?: boolean;

  shape?: CheckboxShape;
  size?: CheckboxSize;
  variant?: CheckboxVariant;
  iconType?: CheckboxIconType;

  title?: string;
  children?: React.ReactNode;

  onChange?: (checked: boolean) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;

  sxCheckbox?: SxProps<Theme>;
  sxLabel?: SxProps<Theme>;
  sx?: SxProps<Theme>;
  error?: string;
}

const CheckboxComponent = ({
  name,
  checked = false,
  disabled = false,

  shape = "square",
  size = 16,
  variant = "filled",
  iconType = "check",

  title,
  children,
  onChange,
  onBlur,

  sxCheckbox,
  sxLabel,
  sx,
  error,
}: CheckboxProps) => {
  const isFilled = variant === "filled";

  const { classes, cx } = useStyles({
    checked,
    disabled,
    isFilled,
    shape,
    size,
    sxPropsColor: (sxCheckbox as any)?.color,
    sxPropsBgColor: (sxCheckbox as any)?.backgroundColor,
    sxPropsBorderColor: (sxCheckbox as any)?.borderColor,
    hasError: Boolean(error),
  });

  const handleToggle = (event?: React.SyntheticEvent) => {
    if (disabled) return;
    onChange?.(!checked);
    const target = event?.currentTarget;
    if (target instanceof HTMLElement && window.matchMedia("(hover: none), (pointer: coarse)").matches) {
      target.blur();
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    }
  };

  const iconColor = disabled
    ? CHECKBOX_COLORS.disabled.icon
    : (sxCheckbox as any)?.color
      ? (sxCheckbox as any).color
      : isFilled
        ? CHECKBOX_COLORS.checked.icon
        : CHECKBOX_COLORS.checked.border;

  const renderIcon = () => {
    if (!checked) return null;

    const iconSize = typeof size === "number" ? Math.max(8, Math.round(size * 0.75)) : size === "small" ? 12 : 16;
    const iconSx: SxProps<Theme> = {
      width: iconSize,
      height: iconSize,
      color: iconColor,
      display: "block",
      flexShrink: 0,
    };

    switch (iconType) {
      case "check":
        return <CheckIcon sx={iconSx} />;
      case "minus":
        return <RemoveIcon sx={iconSx} />;
      case "dot":
        return (
          <Box
            component="span"
            sx={{
              width: Math.max(4, iconSize - 8),
              height: Math.max(4, iconSize - 8),
              borderRadius: "50%",
              backgroundColor: iconColor,
              display: "block",
            }}
          />
        );
      case "custom":
        return children;
      default:
        return null;
    }
  };

  const checkbox = (
    <StackRowAlignJustCenter
      role="checkbox"
      tabIndex={disabled ? -1 : 0}
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        handleToggle(e);
      }}
      onBlur={onBlur}
      className={classes.checkbox}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleToggle(e);
        }
      }}
      sx={sxCheckbox}
    >
      {renderIcon()}
    </StackRowAlignJustCenter>
  );

  const content = (
    <StackRowAlignCenter gap={STYLE.PADDING_GAP_ITEM} onClick={(e) => handleToggle(e)} className={classes.wrapper} sx={sx}>
      {checkbox}
      {title && (
        <Typography
          className={classes.label}
          sx={[
            size === "small" ? TYPOGRAPHY_STYLES.sm.regular : TYPOGRAPHY_STYLES.base.regular,
            ...(Array.isArray(sxLabel) ? sxLabel : sxLabel ? [sxLabel] : []),
          ]}
        >
          {title}
        </Typography>
      )}
    </StackRowAlignCenter>
  );

  if (!error) return content;

  return (
    <Stack sx={sx}>
      {content}
      <Typography className={classes.error}>{error}</Typography>
    </Stack>
  );
};

export default CheckboxComponent;
