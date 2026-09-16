"use client";

import AppButton from "@/components/app-button/app-button.component";
import AppLink from "@/components/app-link/app-link.component";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import { StackRowAlignCenter } from "@/components/styled";
import TextFieldComponent from "@/components/text-field/text-field.component";
import { passwordStrengthHint } from "@/utils/auth/password-strength-brd";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Box, IconButton, LinearProgress, Typography } from "@mui/material";
import Image from "next/image";
import { useLogoSrc, useTenantBrandName } from "@/components/providers.component";
import type { BaseSyntheticEvent, KeyboardEvent } from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { type RegisterFormValues } from "./register.schema";

type RegisterAccountStepProps = {
  classes: {
    registerForm: string;
    title: string;
    fieldMargin: string;
    acceptRow: string;
    termsText: string;
    termsSpan: string;
    errorMessage: string;
    confirmBtn: string;
    notConfirmBtn: string;
    otpLinks: string;
    otpLinkKey: string;
  };
  register: UseFormRegister<RegisterFormValues>;
  control: Control<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
  isSubmitting: boolean;
  isValid: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  hasPasswordInteracted: boolean;
  hasPasswordTyped: boolean;
  showStrengthMeter: boolean;
  strengthBar: number;
  strengthColor: string;
  strengthLabel: string;
  watchedPassword: string;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onPasswordInteract: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLFormElement>) => void;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<unknown>;
  onNavigateLogin: () => void;
};

const RegisterAccountStep = ({
  classes,
  register,
  control,
  errors,
  isSubmitting,
  isValid,
  showPassword,
  showConfirmPassword,
  hasPasswordInteracted,
  hasPasswordTyped,
  showStrengthMeter,
  strengthBar,
  strengthColor,
  strengthLabel,
  watchedPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  onPasswordInteract,
  onKeyDown,
  onSubmit,
  onNavigateLogin,
}: RegisterAccountStepProps) => {
  const logoSrc = useLogoSrc("AUTH");
  const brandName = useTenantBrandName();

  return (
    <Box component="form" onSubmit={onSubmit} onKeyDown={onKeyDown} className={classes.registerForm}>
      <Image src={logoSrc} alt={`${brandName || "Brand"} logo`} width={100} height={40} />
      <Typography className={classes.title}>Thông Tin Tài Khoản</Typography>
      <TextFieldComponent
        label="Họ và tên"
        error={errors.fullName?.message}
        {...register("fullName")}
        className={classes.fieldMargin}
        required
      />
      <TextFieldComponent
        label="Email"
        error={errors.email?.message}
        autoComplete="email"
        {...register("email")}
        className={classes.fieldMargin}
      />
      <Box onClick={onPasswordInteract}>
        <TextFieldComponent
          label="Mật khẩu"
          type={showPassword ? "text" : "password"}
          error={errors.password?.message}
          autoComplete="new-password"
          {...register("password")}
          className={!hasPasswordInteracted && !hasPasswordTyped ? classes.fieldMargin : undefined}
          endAdornment={
            <IconButton onClick={onTogglePassword} size="small">
              {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          }
          required
        />
      </Box>
      {!showStrengthMeter && hasPasswordInteracted ? (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, mb: 2, mt: 2 }}>
          Tối thiểu 8 ký tự; bao gồm số, chữ viết hoa, chữ viết thường, ký tự đặc biệt.
        </Typography>
      ) : showStrengthMeter && hasPasswordTyped ? (
        <Box sx={{ mb: 2, mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={strengthBar}
            sx={{ height: 2, borderRadius: 0, mb: 1, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: strengthColor } }}
          />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, mb: 0.5, color: "#737373" }}>
            Độ mạnh mật khẩu:{" "}
            <Box component="span" sx={{ fontWeight: 700, color: strengthColor }}>
              {strengthLabel}
            </Box>
          </Typography>
          {passwordStrengthHint(watchedPassword) ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium }}>{passwordStrengthHint(watchedPassword)}</Typography>
          ) : null}
        </Box>
      ) : null}
      <TextFieldComponent
        label="Nhập lại Mật khẩu"
        type={showConfirmPassword ? "text" : "password"}
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
        {...register("confirmPassword")}
        className={classes.fieldMargin}
        endAdornment={
          <IconButton onClick={onToggleConfirmPassword} size="small">
            {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        }
        required
      />
      <StackRowAlignCenter className={classes.acceptRow}>
        <Controller
          control={control}
          name="acceptTerms"
          render={({ field }) => <CheckboxComponent checked={field.value} onChange={field.onChange} shape="circle" iconType="dot" />}
        />
        <Typography className={classes.termsText}>
          Tôi đã đọc và đồng ý với{" "}
          <AppLink href="/chinh-sach-bao-mat" target="_blank" rel="noopener noreferrer" className={classes.termsSpan}>
            Chính Sách bảo mật
          </AppLink>{" "}
          của website.
        </Typography>
      </StackRowAlignCenter>{" "}
      {errors.acceptTerms && <Typography className={classes.errorMessage}>{errors.acceptTerms.message}</Typography>}
      <AppButton
        fullWidth
        variant="contained"
        disableElevation
        type="submit"
        disabled={isSubmitting || !isValid}
        className={isSubmitting || isValid ? classes.confirmBtn : classes.notConfirmBtn}
      >
        Đăng Ký Ngay
      </AppButton>
      <Typography className={classes.otpLinks}>
        Bạn đã có tài khoản?{" "}
        <Box component="span" className={classes.otpLinkKey} onClick={onNavigateLogin}>
          Đăng Nhập
        </Box>
      </Typography>
    </Box>
  );
};

export default RegisterAccountStep;
