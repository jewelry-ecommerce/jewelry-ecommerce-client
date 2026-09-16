"use client";

import type { CartItemStatus, CartItemStatusTone } from "@/utils/api/cart/cart.interface";
import { StatusBadge } from "@/components/status-badge/status-badge.component";
import { PRE_ORDER_BADGE_COLORS } from "@/utils/constants/pre-order-badge.constant";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const TONE_COLORS: Record<CartItemStatusTone, { color: string; backgroundColor: string }> = {
  success: { color: "#019A01", backgroundColor: "#019A011F" },
  warning: { color: PRE_ORDER_BADGE_COLORS.color, backgroundColor: PRE_ORDER_BADGE_COLORS.backgroundColor },
  error: { color: "#F04438", backgroundColor: "#F044381F" },
  neutral: { color: "#737373", backgroundColor: "#F5F5F5" },
};

const useStyles = makeStyles({ name: "CartItemStatusBadge" })((theme) => ({
  statusRow: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    width: "100%",
  },
  statusNotes: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  statusNoteLine: {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: theme.palette.text.secondary,
    lineHeight: "140%",
  },
}));

export type CartItemStatusBadgeProps = {
  status: CartItemStatus;
  tagClassName?: string;
  showNotes?: boolean;
};

export function CartItemStatusBadge({ status, tagClassName, showNotes = true }: CartItemStatusBadgeProps) {
  const { classes } = useStyles();
  const notes = status.notes?.length ? status.notes : undefined;
  const toneColors = TONE_COLORS[status.tone];
  const color = status.textColor || toneColors.color;
  const backgroundColor = status.backgroundColor || toneColors.backgroundColor;

  return (
    <Box className={classes.statusRow}>
      <StatusBadge label={status.label} color={color} backgroundColor={backgroundColor} size="sm" className={tagClassName} />
      {showNotes && notes ? (
        <Box className={classes.statusNotes}>
          {notes.map((note) => (
            <Typography key={`${note.label}-${note.value}`} className={classes.statusNoteLine}>
              {note.label} {note.value}
            </Typography>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
