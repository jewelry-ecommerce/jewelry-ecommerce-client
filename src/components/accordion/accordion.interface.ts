import { SxProps, Theme } from "@mui/material";
import React from "react";

export interface AccordionProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  sx?: SxProps<Theme>;
  summarySx?: SxProps<Theme>;
  detailsSx?: SxProps<Theme>;
  expandIcon?: React.ReactNode;
  disableGutters?: boolean;
  elevation?: number;
  className?: string;
}
