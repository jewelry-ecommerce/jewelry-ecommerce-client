import React, { useEffect, useState } from "react";
import { Radio, RadioGroup, FormControlLabel, FormControl, Stack, Box } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DialogComponent from "@/components/dialog/dialog.component";
import TextFieldComponent from "@/components/text-field/text-field.component";
import TextFieldDateComponent from "@/components/text-field/text-field-date.component";
import { ButtonComponent } from "@/components/button/button.component";
import { AuthUser, AuthUserRequest } from "@/utils/api/auth/auth.interface";
import { getDateISO } from "@/utils/format";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { Gender, GenderLabel } from "@/utils/api/auth/auth.enum";
import { AuthApi } from "@/utils/api";
import { getErrorMessage } from "@/utils/helpers/axios/axios.helpers";
import { StackRow } from "@/components/styled";

interface MyAccountProfileUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser | undefined;
}

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Tên là bắt buộc"),
  email: z.string().trim().email("Email không hợp lệ").nullable().optional().or(z.literal("")),
  birthday: z.string().nullable().optional(),
  gender: z.nativeEnum(Gender).nullable().optional(),
});

const MyAccountProfileUpdateDialog = ({ open, onClose, user }: MyAccountProfileUpdateDialogProps) => {
  // state
  const [loading, setLoading] = useState(false);

  // function
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<AuthUserRequest>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: "",
      email: "",
      gender: Gender.OTHER,
      birthday: "",
    },
  });

  useEffect(() => {
    if (open && user) {
      reset({
        firstName: user.firstName || "",
        email: user.email || null,
        gender: (user.gender as Gender) || Gender.OTHER,
        birthday: getDateISO(user.birthday) ?? "",
      });
    }
  }, [open, user, reset]);

  const clearForm = (obj: AuthUserRequest): AuthUserRequest => {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])) as AuthUserRequest;
  };

  const onSubmit = async (values: AuthUserRequest) => {
    setLoading(true);
    try {
      const cleanedValues = clearForm(values);
      await AuthApi.patchCustomerProfile(cleanedValues);
      toast.success("Cập nhật thông tin thành công!");
      mutate((key) => key === "customer-profile" || (Array.isArray(key) && key[0] === "customer-profile"));
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogComponent open={open} onClose={onClose} title="CHỈNH SỬA THÔNG TIN" sx={{ maxWidth: "550px" }}>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="12px" sx={{ pt: 1 }}>
          <StackRow gap={2}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextFieldComponent
                  label="Họ và tên"
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.firstName?.message}
                  required
                />
              )}
            />
          </StackRow>

          <Controller
            name="birthday"
            control={control}
            render={({ field }) => (
              <TextFieldDateComponent
                label="Ngày sinh"
                value={field.value ?? ""}
                onValueChange={field.onChange}
                error={errors.birthday?.message}
              />
            )}
          />

          <FormControl>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field} row>
                  <FormControlLabel
                    value={Gender.MALE}
                    control={<Radio sx={{ color: "#DEDEDE", "&.Mui-checked": { color: "#000" } }} />}
                    label={GenderLabel[Gender.MALE]}
                  />
                  <FormControlLabel
                    value={Gender.FEMALE}
                    control={<Radio sx={{ color: "#DEDEDE", "&.Mui-checked": { color: "#000" } }} />}
                    label={GenderLabel[Gender.FEMALE]}
                  />
                  <FormControlLabel
                    value={Gender.OTHER}
                    control={<Radio sx={{ color: "#DEDEDE", "&.Mui-checked": { color: "#000" } }} />}
                    label={GenderLabel[Gender.OTHER]}
                  />
                </RadioGroup>
              )}
            />
          </FormControl>

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextFieldComponent
                label="Email"
                value={field.value ?? ""}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.email?.message}
              />
            )}
          />

          <ButtonComponent
            type="submit"
            content="Cập Nhật Thông Tin"
            loading={loading}
            fullWidth
            disabled={!isDirty || loading}
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

export default MyAccountProfileUpdateDialog;
