"use client";

import React from "react";
import { Box, Dialog, IconButton, Stack, Typography } from "@mui/material";

import { XClose } from "@untitledui/icons";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";

export interface OrderReturnCancelConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const DESCRIPTION =
  "Bạn có chắc muốn hủy yêu cầu đổi trả / hoàn tiền này? Sau khi hủy, bạn có thể tạo yêu cầu mới nếu đơn hàng vẫn đủ điều kiện.";

const actionButtonBase = {
  flex: 1,
  padding: "12px 16px",
  border: "none",
  borderRadius: 0,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  ...TYPOGRAPHY_STYLES.md.bold,
};

const OrderReturnCancelConfirmModal: React.FC<OrderReturnCancelConfirmModalProps> = ({ open, onClose, onConfirm, loading = false }) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      BackdropProps={{
        sx: { backgroundColor: "rgba(0, 0, 0, 0.45)" },
      }}
      PaperProps={{
        elevation: 8,
        sx: (theme) => ({
          margin: theme.spacing(2),
          width: "100%",
          maxWidth: { xs: "calc(100vw - 32px)", sm: 550 },
          borderRadius: 0,
          overflow: "hidden",
        }),
      }}
    >
      <Stack>
        <Stack sx={{ borderBottom: "1px solid #E0E0E0" }}>
          <StackRowAlignCenterJustBetween sx={{ padding: "16px 20px" }}>
            <Typography
              sx={(theme) => ({
                ...TYPOGRAPHY_STYLES.xl.bold,
                textTransform: "uppercase",
                color: "#27251F",
                flex: { xs: 1, sm: "none" },
                textAlign: { xs: "left", sm: "center" },
                pr: { xs: 1, sm: 0 },
                [theme.breakpoints.down("sm")]: {
                  ...TYPOGRAPHY_STYLES.md.bold,
                },
              })}
            >
              Xác nhận hủy yêu cầu
            </Typography>
            <IconButton type="button" aria-label="Đóng" onClick={onClose} size="small" disabled={loading}>
              <XClose size={24} />
            </IconButton>
          </StackRowAlignCenterJustBetween>
        </Stack>

        <Stack sx={{ padding: "16px 20px" }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#000000", textAlign: "left" }}>{DESCRIPTION}</Typography>
        </Stack>

        <StackRow gap={2} sx={{ width: "100%", padding: "0 20px 16px" }}>
          <Box
            component="button"
            type="button"
            disabled={loading}
            onClick={onClose}
            sx={{
              ...actionButtonBase,
              backgroundColor: "#F5F5F5",
              color: "#0A0A0A",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Không, giữ lại
          </Box>
          <Box
            component="button"
            type="button"
            disabled={loading}
            onClick={onConfirm}
            sx={{
              ...actionButtonBase,
              backgroundColor: "#0A0A0A",
              color: "#FFFFFF",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Đang hủy..." : "Hủy yêu cầu"}
          </Box>
        </StackRow>
      </Stack>
    </Dialog>
  );
};

export default OrderReturnCancelConfirmModal;
