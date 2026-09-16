"use client";

import { Box, Button, CircularProgress, Dialog, DialogContent, Stack, Typography } from "@mui/material";
import { StackRowAlignCenterJustEnd } from "../styled";
import { DeleteConfirmationDialogProps } from "./delete-confirmation-dialog.interface";
import useDeleteConfirmationDialogStyles from "./delete-confirmation-dialog.styles";
import { XClose } from "@untitledui/icons";

const DeleteConfirmationDialog = ({
  open,
  title = "BẠN CHẮC CHẮN MUỐN XÓA CẢ SẢN PHẨM NÀY?",
  onClose,
  onConfirm,
  isLoading = false,
  cancelButtonText = "Hủy",
  confirmButtonText = "Đồng Ý",
  modalZIndex,
}: DeleteConfirmationDialogProps) => {
  const { classes } = useDeleteConfirmationDialogStyles();

  return (
    <Dialog open={open} onClose={onClose} className={classes.dialog} sx={modalZIndex ? { zIndex: modalZIndex } : undefined}>
      <StackRowAlignCenterJustEnd className={classes.closeButtonWrap} onClick={onClose}>
        <XClose size={32} style={{ cursor: "pointer" }} />
      </StackRowAlignCenterJustEnd>
      <Box className={classes.container}>
        <DialogContent className={classes.content}>
          <Typography className={classes.title}>{title}</Typography>
        </DialogContent>

        <Box className={classes.actions}>
          <Button className={classes.cancelButton} onClick={onClose} disabled={isLoading}>
            {cancelButtonText}
          </Button>
          <Button className={classes.confirmButton} onClick={onConfirm} disabled={isLoading} style={{ opacity: isLoading ? 0.6 : 1 }}>
            {isLoading ? <CircularProgress size={16} color="inherit" /> : confirmButtonText}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
