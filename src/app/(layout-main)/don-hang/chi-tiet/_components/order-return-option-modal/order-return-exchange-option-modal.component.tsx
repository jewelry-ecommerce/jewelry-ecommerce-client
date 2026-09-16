"use client";

import React from "react";
import { Box, Dialog, IconButton, Stack, Typography } from "@mui/material";

import { XClose } from "@untitledui/icons";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";

export type OrderReturnExchangeOptionType = "refund" | "exchange";

export interface OrderReturnExchangeOptionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectOption?: (option: OrderReturnExchangeOptionType) => void;
  footerNote?: string;
}

const DEFAULT_FOOTER_NOTE = "Bạn có thể tạo yêu cầu tối đa 3 lần.";

const optionButtonBase = {
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

const OrderReturnExchangeOptionModal: React.FC<OrderReturnExchangeOptionModalProps> = ({
  open,
  onClose,
  onSelectOption,
  footerNote = DEFAULT_FOOTER_NOTE,
}) => {
  const handleSelect = (option: OrderReturnExchangeOptionType) => {
    onSelectOption?.(option);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
              Chọn loại yêu cầu
            </Typography>
            <IconButton type="button" aria-label="Đóng" onClick={onClose} size="small">
              <XClose size={24} />
            </IconButton>
          </StackRowAlignCenterJustBetween>
        </Stack>

        <StackRowAlignCenter gap={2} sx={{ width: "100%", padding: "16px 20px" }}>
          <Box
            component="button"
            type="button"
            onClick={() => handleSelect("refund")}
            sx={{
              ...optionButtonBase,
              backgroundColor: "#F5F5F5",
              color: "#0A0A0A",
            }}
          >
            Hoàn tiền
          </Box>
          <Box
            component="button"
            type="button"
            onClick={() => handleSelect("exchange")}
            sx={{
              ...optionButtonBase,
              backgroundColor: "#0A0A0A",
              color: "#FFFFFF",
            }}
          >
            Đổi hàng
          </Box>
        </StackRowAlignCenter>

        <Stack sx={{ padding: "0 16px 16px 20px" }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#000000", textAlign: "left" }}>{footerNote}</Typography>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default OrderReturnExchangeOptionModal;
