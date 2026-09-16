"use client";

import React, { type ReactElement } from "react";
import { Chip, Box, type SxProps, type Theme } from "@mui/material";

import { StackRowAlignCenter } from "@/components/styled";
import { IconPosition, CHIP_SIZE_CONFIG, CHIP_LABEL_PADDING } from "./chip.constant";

const getLabelPadding = (hasIcon: boolean, position: IconPosition) => {
  if (!hasIcon) return CHIP_LABEL_PADDING.NO_ICON;
  return position === "left" ? CHIP_LABEL_PADDING.WITH_ICON_LEFT : CHIP_LABEL_PADDING.WITH_ICON_RIGHT;
};

const ChipIcon: React.FC<{
  icon: ReactElement;
  size: string;
  sxIcon?: SxProps<Theme>;
}> = ({ icon, size, sxIcon }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      padding: "2px",
      "& svg": {
        width: size,
        height: size,
        display: "block",
      },
      ...sxIcon,
    }}
  >
    {icon}
  </Box>
);

export interface ChipComponentProps {
  label: string | React.ReactNode;
  onAction?: () => void;
  icon?: ReactElement;
  disabled?: boolean;
  clickable?: boolean;
  sx?: SxProps<Theme>;
  sxIcon?: SxProps<Theme>;
  iconPosition?: IconPosition;
  size?: keyof typeof CHIP_SIZE_CONFIG;
}

export const ChipComponent: React.FC<ChipComponentProps> = ({
  label,
  onAction,
  icon,
  disabled = false,
  clickable = true,
  sx,
  sxIcon,
  iconPosition = "right",
  size = "medium",
}) => {
  const sizeConfig = CHIP_SIZE_CONFIG[size];
  const hasIcon = Boolean(icon);
  const isInteractive = clickable && Boolean(onAction) && !disabled;

  return (
    <Chip
      disabled={disabled}
      clickable={isInteractive}
      onClick={isInteractive ? onAction : undefined}
      label={
        <StackRowAlignCenter sx={{ gap: "8px" }}>
          {hasIcon && iconPosition === "left" && <ChipIcon icon={icon!} size={sizeConfig.iconSize} sxIcon={sxIcon} />}
          <Box component="span">{label}</Box>
          {hasIcon && iconPosition === "right" && <ChipIcon icon={icon!} size={sizeConfig.iconSize} sxIcon={sxIcon} />}
        </StackRowAlignCenter>
      }
      sx={{
        height: sizeConfig.height,
        fontSize: sizeConfig.fontSize,
        borderRadius: sizeConfig.borderRadius,
        cursor: isInteractive ? "pointer" : "default",
        backgroundColor: "transparent",
        border: "1px solid #D1D5DB",
        "& .MuiChip-label": {
          padding: getLabelPadding(hasIcon, iconPosition),
          display: "flex",
          alignItems: "center",
        },
        "& .MuiChip-label svg": {
          flexShrink: 0,
          color: "#4B5563",
        },
        "&.Mui-disabled": {
          opacity: 0.5,
          color: "#9E9E9E",
        },
        ...sx,
      }}
    />
  );
};

export default ChipComponent;
