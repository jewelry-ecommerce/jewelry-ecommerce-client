import React, { useEffect, useState } from "react";
import { Box, IconButton, Stack } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DialogComponent from "@/components/dialog/dialog.component";
import TextFieldComponent from "@/components/text-field/text-field.component";
import { ButtonComponent } from "@/components/button/button.component";
import { AuthUserChangePasswordRequest } from "@/utils/api/auth/auth.interface";
import { AuthApi } from "@/utils/api";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/helpers/axios/axios.helpers";
import PasswordRequirement, {
  hasLowercase,
  hasMinLength,
  hasNumber,
  hasSpecial,
  hasUppercase,
} from "@/components/password-requirement/password-requirement.component";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

interface MyAccountProfilePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    newPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới.")
      .refine(
        (value) => hasMinLength(value) && hasLowercase(value) && hasUppercase(value) && hasNumber(value) && hasSpecial(value),
        "Mật khẩu chưa đạt yêu cầu.",
      ),
    confirmNewPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu không khớp.",
    path: ["confirmNewPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const MyAccountProfilePasswordDialog = ({ open, onClose }: MyAccountProfilePasswordDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const watchedNewPassword = watch("newPassword");

  const onSubmit = async (values: PasswordFormValues) => {
    setLoading(true);
    try {
      const payload: AuthUserChangePasswordRequest = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };

      await AuthApi.postCustomerChangePassword(payload);
      toast.success("Cập nhật mật khẩu thành công!");
      reset();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogComponent open={open} onClose={onClose} title="CHỈNH SỬA MẬT KHẨU" sx={{ maxWidth: "550px" }}>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2} sx={{ pt: 1 }}>
          <Controller
            name="currentPassword"
            control={control}
            render={({ field }) => (
              <TextFieldComponent
                label="Mật khẩu hiện tại"
                type={showCurrentPassword ? "text" : "password"}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.currentPassword?.message}
                endAdornment={
                  <IconButton onClick={() => setShowCurrentPassword((prev) => !prev)} size="small">
                    {showCurrentPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                }
                required
              />
            )}
          />

          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <TextFieldComponent
                label="Mật khẩu mới"
                type={showNewPassword ? "text" : "password"}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.newPassword?.message}
                endAdornment={
                  <IconButton onClick={() => setShowNewPassword((prev) => !prev)} size="small">
                    {showNewPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                }
                required
              />
            )}
          />

          <Controller
            name="confirmNewPassword"
            control={control}
            render={({ field }) => (
              <TextFieldComponent
                label="Nhập lại mật khẩu mới"
                type={showConfirmPassword ? "text" : "password"}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.confirmNewPassword?.message}
                endAdornment={
                  <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)} size="small">
                    {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                }
                required
              />
            )}
          />

          <PasswordRequirement password={watchedNewPassword} />

          <ButtonComponent
            type="submit"
            content="Cập Nhật Mật Khẩu"
            loading={loading}
            disabled={!isDirty || loading}
            fullWidth
            sx={{
              backgroundColor: "#0A0A0A",
              color: "#fff",
              height: "50px",
              ...TYPOGRAPHY_STYLES.md.bold,
              borderRadius: "0px",
              mt: 1,
            }}
          />
        </Stack>
      </Box>
    </DialogComponent>
  );
};

export default MyAccountProfilePasswordDialog;
