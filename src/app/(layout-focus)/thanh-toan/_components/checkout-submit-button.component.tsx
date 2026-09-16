import React from "react";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useFormContext, useFormState } from "react-hook-form";
import type { CheckoutFormValues } from "./checkout.constant";

export interface CheckoutSubmitButtonProps {
  submitButtonClass: string;
  isMobileFooter?: boolean;
  onSubmit: () => void | Promise<void>;
  isPlacingOrder: boolean;
  isLoading: boolean;
  isAddressSyncing: boolean;
  isShippingLoading?: boolean;
  shippingQuoteBlocked?: boolean;
  label?: string;
}

export const CheckoutSubmitButton = ({
  submitButtonClass,
  isMobileFooter = false,
  onSubmit,
  isPlacingOrder,
  isLoading,
  isAddressSyncing,
  isShippingLoading,
  shippingQuoteBlocked,
  label = "Hoàn Tất Thanh Toán",
}: CheckoutSubmitButtonProps) => {
  const { control } = useFormContext<CheckoutFormValues>();
  const { isValid } = useFormState({ control });

  return (
    <Button
      variant="contained"
      fullWidth={!isMobileFooter}
      className={submitButtonClass}
      onClick={onSubmit}
      disabled={!isValid || isPlacingOrder || isLoading || isAddressSyncing || isShippingLoading || shippingQuoteBlocked}
    >
      {isPlacingOrder ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} color="inherit" />
          <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit" }}>
            Đang Xử Lý...
          </Typography>
        </Stack>
      ) : (
        label
      )}
    </Button>
  );
};

export default CheckoutSubmitButton;
