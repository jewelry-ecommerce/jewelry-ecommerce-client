"use client";

import AppButton from "@/components/app-button/app-button.component";
import { AuthCard } from "@/components/auth/auth-card";
import TextFieldComponent from "@/components/text-field/text-field.component";
import { passwordStrengthHint } from "@/utils/auth/password-strength-brd";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Box, IconButton, LinearProgress, Typography } from "@mui/material";
import Image from "next/image";
import { useLogoSrc } from "@/components/providers.component";

type ForgotPasswordResetStepProps = {
  classes: {
    field: string;
    field2: string;
    submitButton: string;
  };
  newPassword: string;
  confirmPassword: string;
  newPasswordError: string;
  confirmPasswordError: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  hasPasswordInteracted: boolean;
  hasPasswordTyped: boolean;
  showStrengthMeter: boolean;
  strengthBar: number;
  strengthColor: string;
  strengthLabel: string;
  canSubmitReset: boolean;
  onSetHasPasswordInteracted: () => void;
  onChangeNewPassword: (val: string) => void;
  onChangeConfirmPassword: (val: string) => void;
  onClearNewPasswordError: () => void;
  onValidatePasswordBlur: () => void;
  onValidateConfirmPasswordBlur: () => void;
  onToggleShowNewPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onSubmitReset: () => void;
};

const ForgotPasswordResetStep = ({
  classes,
  newPassword,
  confirmPassword,
  newPasswordError,
  confirmPasswordError,
  showNewPassword,
  showConfirmPassword,
  hasPasswordInteracted,
  hasPasswordTyped,
  showStrengthMeter,
  strengthBar,
  strengthColor,
  strengthLabel,
  canSubmitReset,
  onSetHasPasswordInteracted,
  onChangeNewPassword,
  onChangeConfirmPassword,
  onClearNewPasswordError,
  onValidatePasswordBlur,
  onValidateConfirmPasswordBlur,
  onToggleShowNewPassword,
  onToggleShowConfirmPassword,
  onSubmitReset,
}: ForgotPasswordResetStepProps) => {
  const logoSrc = useLogoSrc("AUTH");

  return (
    <AuthCard>
      <Box sx={{ mb: 1 }}>
        <Image src={logoSrc} alt="Logo" width={100} height={40} />
      </Box>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, mb: 3 }}>Đặt Lại Mật Khẩu</Typography>
      <Box onClick={onSetHasPasswordInteracted}>
        <TextFieldComponent
          type={showNewPassword ? "text" : "password"}
          label="Mật khẩu"
          value={newPassword}
          onValueChange={(val) => {
            onChangeNewPassword(val);
            if (newPasswordError) onClearNewPasswordError();
          }}
          onBlur={onValidatePasswordBlur}
          className={!hasPasswordInteracted && !hasPasswordTyped ? classes.field2 : undefined}
          autoComplete="new-password"
          required
          endAdornment={
            <IconButton size="small" onClick={onToggleShowNewPassword}>
              {showNewPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          }
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
            sx={{
              height: 2,
              borderRadius: 0,
              mb: 1,
              bgcolor: "#f3f4f6",
              "& .MuiLinearProgress-bar": { bgcolor: strengthColor },
            }}
          />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, mb: 0.5, color: "#737373" }}>
            Độ mạnh mật khẩu:{" "}
            <Box component="span" sx={{ fontWeight: 700, color: strengthColor }}>
              {strengthLabel}
            </Box>
          </Typography>
          {passwordStrengthHint(newPassword) ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium }}>{passwordStrengthHint(newPassword)}</Typography>
          ) : null}
        </Box>
      ) : null}
      <TextFieldComponent
        type={showConfirmPassword ? "text" : "password"}
        label="Nhập lại Mật khẩu"
        value={confirmPassword}
        onValueChange={(val) => {
          onChangeConfirmPassword(val);
        }}
        onBlur={onValidateConfirmPasswordBlur}
        error={confirmPasswordError}
        className={classes.field}
        autoComplete="new-password"
        required
        endAdornment={
          <IconButton size="small" onClick={onToggleShowConfirmPassword}>
            {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        }
      />
      <AppButton
        fullWidth
        variant="contained"
        disableElevation
        onClick={onSubmitReset}
        disabled={!canSubmitReset}
        className={classes.submitButton}
      >
        Đặt Lại Mật Khẩu
      </AppButton>
    </AuthCard>
  );
};

export default ForgotPasswordResetStep;
