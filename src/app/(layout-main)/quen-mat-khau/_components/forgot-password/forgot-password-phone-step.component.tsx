"use client";

import AppButton from "@/components/app-button/app-button.component";
import { AuthCard } from "@/components/auth/auth-card";
import { StackRowAlignCenter } from "@/components/styled";
import TextFieldPhoneNumberComponent from "@/components/text-field/text-field-phone-number.component";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { ArrowNarrowLeft } from "@untitledui/icons";
import { Box, IconButton, Typography } from "@mui/material";
import Image from "next/image";
import { useLogoSrc } from "@/components/providers.component";

type ForgotPasswordPhoneStepProps = {
  phone: string;
  phoneError: string;
  canSubmitPhone: boolean;
  fieldClassName: string;
  submitButtonClassName: string;
  onPhoneChange: (val: string) => void;
  onContinue: () => void;
  onBack: () => void;
};

const ForgotPasswordPhoneStep = ({
  phone,
  phoneError,
  canSubmitPhone,
  fieldClassName,
  submitButtonClassName,
  onPhoneChange,
  onContinue,
  onBack,
}: ForgotPasswordPhoneStepProps) => {
  const logoSrc = useLogoSrc("AUTH");

  return (
    <AuthCard>
      <Box sx={{ mb: 2 }}>
        <Image src={logoSrc} alt="Logo" width={100} height={40} />
      </Box>
      <StackRowAlignCenter gap={2}>
        <IconButton size="small" onClick={onBack} sx={{ alignSelf: "flex-start", p: 0.5, mb: 1 }} aria-label="Quay lại">
          <ArrowNarrowLeft size={24} color="black" />
        </IconButton>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, mb: 1 }}>Quên Mật Khẩu?</Typography>
      </StackRowAlignCenter>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, mb: 2 }}>Vui lòng nhập số điện thoại để đặt lại mật khẩu.</Typography>
      <TextFieldPhoneNumberComponent
        label="Số điện thoại"
        value={phone}
        onChange={onPhoneChange}
        error={phoneError}
        className={fieldClassName}
        autoComplete="tel"
      />
      <AppButton
        fullWidth
        variant="contained"
        disableElevation
        onClick={onContinue}
        disabled={!canSubmitPhone}
        className={submitButtonClassName}
      >
        Tiếp Tục
      </AppButton>
    </AuthCard>
  );
};

export default ForgotPasswordPhoneStep;
