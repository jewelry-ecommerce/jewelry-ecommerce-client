"use client";

import React from "react";
import { RemoveScroll } from "react-remove-scroll";
import { Dialog, Box, Stack, type DialogProps, type SxProps, type Theme, Typography } from "@mui/material";
import { XClose } from "@untitledui/icons";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { StackRowAlignCenterJustBetween } from "../styled";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({ name: "DialogComponent" })((theme) => ({
  root: {
    "--dialog-padding-x": "16px",
    padding: "16px",
    borderRadius: "8px",
    width: "100%",
    [theme.breakpoints.down(810)]: {
      "--dialog-padding-x": "12px",
      padding: "12px",
    },
  },
  title: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    textTransform: "uppercase",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.md.bold,
    },
  },
}));

export interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  titleAdornment?: React.ReactNode;
  closeIcon?: React.ReactNode;
  nodeContent?: React.ReactNode;
  children?: React.ReactNode;
  buttonLeft?: React.ReactNode;
  buttonRight?: React.ReactNode;
  buttonCenter?: React.ReactNode;
  sx?: SxProps<Theme>;
  sxContent?: SxProps<Theme>;
  sxTitle?: SxProps<Theme>;
  sxBottom?: SxProps<Theme>;
  closeButton?: boolean;
  maxWidth?: DialogProps["maxWidth"];
}

const DialogComponent = ({
  open,
  onClose,
  title,
  titleAdornment,
  closeIcon,
  nodeContent,
  children,
  buttonLeft,
  buttonRight,
  buttonCenter,
  sx,
  sxContent,
  sxTitle,
  sxBottom,
  closeButton = true,
  maxWidth = "sm",
}: DialogComponentProps) => {
  const { classes } = useStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableScrollLock
      maxWidth={maxWidth}
      PaperProps={{
        className: classes.root,
        sx,
      }}
    >
      <RemoveScroll enabled={open}>
        <StackRowAlignCenterJustBetween
          sx={{
            width: "calc(100% + (var(--dialog-padding-x) * 2))",
            marginLeft: "calc(var(--dialog-padding-x) * -1)",
            marginRight: "calc(var(--dialog-padding-x) * -1)",
            paddingLeft: "var(--dialog-padding-x)",
            paddingRight: "var(--dialog-padding-x)",
            marginBottom: "16px",
            ...sxTitle,
          }}
        >
          <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: 0 }}>
            <Typography className={classes.title}>{title}</Typography>
            {titleAdornment}
          </Stack>
          {closeButton && (
            <Box onClick={onClose} sx={{ cursor: "pointer" }}>
              {closeIcon ?? <XClose size={24} />}
            </Box>
          )}
        </StackRowAlignCenterJustBetween>

        <Box sx={{ ...sxContent }}>{nodeContent || children}</Box>

        {(buttonLeft || buttonRight || buttonCenter) && (
          <Stack direction="row" gap={2} sx={{ marginTop: "24px", ...sxBottom }}>
            {buttonCenter ? (
              <Box sx={{ width: "100%" }}>{buttonCenter}</Box>
            ) : (
              <React.Fragment>
                {buttonLeft}
                {buttonRight}
              </React.Fragment>
            )}
          </Stack>
        )}
      </RemoveScroll>
    </Dialog>
  );
};

export default DialogComponent;
