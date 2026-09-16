import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import { useTenantBrandName } from "@/components/providers.component";
import type { CheckoutFormValues } from "./checkout.constant";
import { CHECKOUT_CONSENT_CHECKBOX_SX, checkoutConsentLabelSx } from "./checkout-consent-field.component";

export const CheckoutCollabPartnerConsentField = () => {
  const { control } = useFormContext<CheckoutFormValues>();
  const brandName = useTenantBrandName();
  return (
    <Controller
      name="consentCollabPartnerSharing"
      control={control}
      render={({ field }) => (
        <CheckboxComponent
          checked={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          shape="circle"
          iconType="dot"
          title={`Bằng cách nhấp chọn, bạn cho phép ${brandName} chia sẻ thông tin với đối tác Đất Việt VAC cho các đơn hàng có sản phẩm thuộc BST Collab Tinh Hà "Say Hi". Lưu ý: Đây là trường không bắt buộc.`}
          sx={{ alignItems: "flex-start" }}
          sxCheckbox={{
            ...CHECKOUT_CONSENT_CHECKBOX_SX,
            backgroundColor: field.value ? CHECKOUT_CONSENT_CHECKBOX_SX.backgroundColor : "transparent",
          }}
          sxLabel={checkoutConsentLabelSx}
        />
      )}
    />
  );
};

export default CheckoutCollabPartnerConsentField;
