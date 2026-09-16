import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { type Theme } from "@mui/material";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import { useTenantBrandName } from "@/components/providers.component";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import type { CheckoutFormValues } from "./checkout.constant";

export const CHECKOUT_CONSENT_CHECKBOX_SX = {
  backgroundColor: "#171717",
  borderColor: "#171717",
  color: "#FFFFFF",
  marginTop: "2px",
} as const;

export const checkoutConsentLabelSx = (theme: Theme) => ({
  color: "#71717A",
  ...TYPOGRAPHY_STYLES.base.regular,
  [theme.breakpoints.down(810)]: {
    ...TYPOGRAPHY_STYLES.sm.regular,
  },
});

export const CheckoutConsentField = () => {
  const { control } = useFormContext<CheckoutFormValues>();
  const brandName = useTenantBrandName();
  return (
    <Controller
      name="consent"
      control={control}
      render={({ field, fieldState }) => (
        <CheckboxComponent
          checked={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          shape="circle"
          iconType="dot"
          title={`Bằng cách nhấp chọn, bạn đồng ý với việc cho phép ${brandName} chia sẻ thông tin giao hàng với đối tác vận chuyển nhằm phục vụ việc chuyển phát hàng hóa.`}
          sx={{ alignItems: "flex-start" }}
          sxCheckbox={{
            ...CHECKOUT_CONSENT_CHECKBOX_SX,
            backgroundColor: field.value ? CHECKOUT_CONSENT_CHECKBOX_SX.backgroundColor : "transparent",
          }}
          sxLabel={checkoutConsentLabelSx}
          error={fieldState.error?.message}
        />
      )}
    />
  );
};

export default CheckoutConsentField;
