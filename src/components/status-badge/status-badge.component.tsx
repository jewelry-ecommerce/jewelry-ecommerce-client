"use client";

import { Box } from "@mui/material";
import useStyles from "./status-badge.styles";

export interface StatusBadgeProps {
  label: string;
  color: string;
  backgroundColor: string;
  /** `sm` = SKU/cart tag; `md` = badge trạng thái đơn */
  size?: "sm" | "md";
  uppercase?: boolean;
  className?: string;
}

export function StatusBadge({ label, color, backgroundColor, size = "md", uppercase = false, className }: StatusBadgeProps) {
  const { classes, cx } = useStyles();

  return (
    <Box
      component="span"
      className={cx(classes.root, size === "sm" ? classes.sizeSm : classes.sizeMd, uppercase && classes.uppercase, className)}
      style={{ color, backgroundColor }}
    >
      {label}
    </Box>
  );
}
