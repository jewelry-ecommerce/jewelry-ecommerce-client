"use client";

import React, { useEffect, useState } from "react";
import { Box, Dialog, FormControl, FormControlLabel, IconButton, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import { toast } from "react-toastify";

import { XClose } from "@untitledui/icons";
import { ORDER_CANCELLATION_REASON_LABEL, ORDER_CANCELLATION_REASON_OPTIONS, OrderCancellationReason } from "@/utils/api/order/order.enum";
import { PRE_ORDER_CANCEL_CONFIRM_MESSAGE } from "@/utils/api/pre-order/pre-order-order.util";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { StackRow, StackRowAlignCenterJustBetween } from "@/components/styled";

export interface OrderCancelConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (cancellationReason: OrderCancellationReason) => void;
  loading?: boolean;
  /** Pre-order AC4: simple confirm copy, no reason radios. */
  variant?: "default" | "pre-order";
}

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

const radioSx = {
  color: "#DEDEDE",
  padding: "6px",
  "&.Mui-checked": { color: "#0A0A0A" },
};

const labelSx = {
  ...TYPOGRAPHY_STYLES.sm.regular,
  color: "#27251F",
  margin: 0,
  flex: 1,
  "& .MuiFormControlLabel-label": {
    lineHeight: 1.4,
  },
};

const OrderCancelConfirmModal: React.FC<OrderCancelConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  variant = "default",
}) => {
  const [cancellationReason, setCancellationReason] = useState<OrderCancellationReason | "">("");
  const isPreOrder = variant === "pre-order";

  useEffect(() => {
    if (!open) {
      setCancellationReason("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (isPreOrder) {
      onConfirm(OrderCancellationReason.CHANGE_MIND);
      return;
    }
    if (!cancellationReason) {
      toast.warning("Vui lòng chọn lý do hủy đơn hàng.");
      return;
    }
    onConfirm(cancellationReason);
  };

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
              {isPreOrder ? "Xác nhận hủy đơn đặt trước" : "Xác nhận hủy đơn hàng"}
            </Typography>
            <IconButton type="button" aria-label="Đóng" onClick={onClose} size="small" disabled={loading}>
              <XClose size={24} />
            </IconButton>
          </StackRowAlignCenterJustBetween>
        </Stack>

        <Stack sx={{ padding: "16px 20px", gap: "12px" }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#000000", textAlign: "left" }}>
            {isPreOrder
              ? PRE_ORDER_CANCEL_CONFIRM_MESSAGE
              : "Bạn có chắc muốn hủy đơn hàng này? Sau khi hủy, đơn sẽ không tiếp tục được xử lý."}
          </Typography>

          {!isPreOrder ? (
            <FormControl component="fieldset" disabled={loading} sx={{ width: "100%" }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold, color: "#27251F", mb: 1 }}>Lý do hủy đơn *</Typography>
              <RadioGroup
                row
                value={cancellationReason}
                onChange={(_, value) => setCancellationReason(value as OrderCancellationReason)}
                sx={{
                  width: "100%",
                  gap: { xs: 0, sm: 2 },
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "stretch" },
                }}
              >
                {ORDER_CANCELLATION_REASON_OPTIONS.map((reason) => (
                  <FormControlLabel
                    key={reason}
                    value={reason}
                    control={<Radio size="small" sx={radioSx} />}
                    label={ORDER_CANCELLATION_REASON_LABEL[reason]}
                    sx={labelSx}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          ) : null}
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
            {isPreOrder ? "Đóng" : "Không, giữ lại"}
          </Box>
          <Box
            component="button"
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            sx={{
              ...actionButtonBase,
              backgroundColor: "#0A0A0A",
              color: "#FFFFFF",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Đang hủy..." : isPreOrder ? "Xác nhận" : "Hủy đơn"}
          </Box>
        </StackRow>
      </Stack>
    </Dialog>
  );
};

export default OrderCancelConfirmModal;
