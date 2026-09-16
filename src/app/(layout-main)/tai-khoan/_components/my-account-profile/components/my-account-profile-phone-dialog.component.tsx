import React, { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DialogComponent from "@/components/dialog/dialog.component";
import TextFieldComponent from "@/components/text-field/text-field.component";
import TextFieldPhoneNumberComponent from "@/components/text-field/text-field-phone-number.component";
import { ButtonComponent } from "@/components/button/button.component";
import { AuthApi } from "@/utils/api";
import { PHONE_REGEX } from "@/utils/constants/common.constant";
import { AuthUserChangePhoneRequest } from "@/utils/api/auth";
import { getErrorMessage } from "@/utils/helpers/axios/axios.helpers";

interface MyAccountProfilePhoneDialogProps {
  open: boolean;
  onClose: () => void;
  currentPhone: string;
  onSuccess: (newPhone: string) => Promise<boolean>;
}

const phoneSchema = z.object({
  newPhone: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại mới.")
    .refine((value) => PHONE_REGEX.test(value), "Số điện thoại không đúng định dạng."),
});

const MyAccountProfilePhoneDialog = ({ open, onClose, currentPhone, onSuccess }: MyAccountProfilePhoneDialogProps) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setError,
    clearErrors,
  } = useForm<AuthUserChangePhoneRequest>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      newPhone: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (values: AuthUserChangePhoneRequest) => {
    setLoading(true);
    try {
      await AuthApi.postCustomerChangePhone(values);
      const isOtpSent = await onSuccess(values.newPhone);

      if (isOtpSent) {
        reset();
        onClose();
      }
    } catch (error) {
      setError("newPhone", { type: "server", message: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogComponent open={open} onClose={onClose} title="CHỈNH SỬA SỐ ĐIỆN THOẠI" sx={{ maxWidth: "550px" }}>
      <Box noValidate component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={3} sx={{ pt: 1 }}>
          <TextFieldComponent label="Số điện thoại hiện tại" value={currentPhone.replace(/\d+(\d{2})/, "********$1")} disabled />

          <Controller
            name="newPhone"
            control={control}
            render={({ field }) => (
              <TextFieldPhoneNumberComponent
                label="Số điện thoại mới"
                value={field.value}
                onChange={(v) => {
                  clearErrors("newPhone");
                  field.onChange(v);
                }}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.newPhone?.message}
              />
            )}
          />

          <ButtonComponent
            type="submit"
            content="Xác Nhận OTP"
            loading={loading}
            disabled={!isDirty || loading}
            fullWidth
            sx={{
              backgroundColor: "#000",
              color: "#fff",
              height: "50px",
              fontSize: "16px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#333",
              },
              borderRadius: "0px",
            }}
          />
        </Stack>
      </Box>
    </DialogComponent>
  );
};

export default MyAccountProfilePhoneDialog;
