"use client";

import CustomIconReload from "@/assets/icon/CustomReload";
import AppButton from "@/components/app-button/app-button.component";
import { StackRowAlignCenter } from "@/components/styled";
import useOtpVerificationDialogsStyles from "@/app/(layout-main)/dang-ky/_components/otp-verification-dialogs/otp-verification-dialogs.styles";
import { ArrowNarrowLeft } from "@untitledui/icons";
import { Box, CircularProgress, IconButton, Stack, TextField, Typography } from "@mui/material";
import Image from "next/image";
import { useRef, useState } from "react";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { OTP_DAILY_LIMIT_HOME_BUTTON_LABEL } from "@/utils/constants/otp-message.constant";
import { useNavigation } from "@/hooks/use-navigation";
import { useLogoSrc } from "@/components/providers.component";
import { useOtpInputBehavior } from "@/hooks/use-otp-input-behavior.hook";

const OTP_LENGTH = 6;

export type OtpVerificationScreenProps = {
  submittedPhone: string;
  otpError: string;
  resendCounter: number;
  resendBlockedUntil: number | null;
  resendExceededMessage?: string;
  resendText: string;
  onOtpChange?: () => void;
  onConfirmOtp: (otpCode: string) => void;
  onResendOtp: () => void;
  onBack?: () => void;
  /** Khi vượt quota OTP trong ngày — BRD: disable nút xác nhận */
  confirmDisabled?: boolean;
  /** Disable gửi lại trong lúc request send-otp đang xử lý */
  resendInFlight?: boolean;
  /** Đang gọi API xác nhận OTP — hiển thị loading trên nút Xác nhận */
  confirmInFlight?: boolean;
  /** Khóa ô OTP sau quá số lần nhập sai */
  isOtpLocked?: boolean;
};

const normalizePhoneDisplay = (phone: string) => phone.replace(/\s+/g, "").trim();

function OtpDailyLimitExceededView({ message }: { message: string }) {
  const { classes } = useOtpVerificationDialogsStyles();
  const logoSrc = useLogoSrc("AUTH");
  const { gotoPage } = useNavigation();

  const handleGoHome = () => {
    gotoPage("/");
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Image src={logoSrc} alt="Logo" width={100} height={40} />
      </Box>

      <StackRowAlignCenter sx={{ gap: 2, mb: 1.5 }}>
        <IconButton size="small" onClick={handleGoHome} aria-label="Quay lại trang chủ" sx={{ p: 0.5 }}>
          <ArrowNarrowLeft size={24} color="black" />
        </IconButton>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold }}>Xác thực OTP!</Typography>
      </StackRowAlignCenter>

      <Typography
        sx={{
          ...TYPOGRAPHY_STYLES.base.regular,
          color: "text.primary",
          textAlign: "left",
          mb: 2,
        }}
      >
        {message}
      </Typography>

      <AppButton fullWidth variant="contained" disableElevation onClick={handleGoHome} className={classes.confirmBtn}>
        {OTP_DAILY_LIMIT_HOME_BUTTON_LABEL}
      </AppButton>
    </Box>
  );
}

const OtpVerificationScreen = ({
  submittedPhone,
  otpError,
  resendCounter,
  resendBlockedUntil,
  resendExceededMessage,
  resendText,
  onOtpChange,
  onConfirmOtp,
  onResendOtp,
  onBack,
  confirmDisabled = false,
  resendInFlight = false,
  confirmInFlight = false,
  isOtpLocked = false,
}: OtpVerificationScreenProps) => {
  const logoSrc = useLogoSrc("AUTH");
  const { classes } = useOtpVerificationDialogsStyles();
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [otpValues, setOtpValues] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const hasDailyLimitExceeded = Boolean(resendExceededMessage);

  const { handleOtpChange, handlePaste, handleKeyDown } = useOtpInputBehavior({
    submittedPhone,
    otpValues,
    setOtpValues,
    otpError,
    onOtpChange,
    onConfirmOtp,
    confirmDisabled: confirmDisabled || isOtpLocked || hasDailyLimitExceeded,
    confirmInFlight,
    inputDisabled: isOtpLocked,
    isActive: !hasDailyLimitExceeded,
    otpRefs,
  });

  const isDailyBlocked = Boolean(resendBlockedUntil && resendBlockedUntil > Date.now());
  const resendDisabled = Boolean(hasDailyLimitExceeded || isDailyBlocked || resendCounter > 0 || resendInFlight);

  if (hasDailyLimitExceeded && resendExceededMessage) {
    return <OtpDailyLimitExceededView message={resendExceededMessage} />;
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Image src={logoSrc} alt="Logo" width={100} height={40} />
      </Box>

      <StackRowAlignCenter sx={{ gap: 2, mb: 1.5 }}>
        {onBack ? (
          <IconButton size="small" onClick={onBack} aria-label="Quay lại" sx={{ p: 0.5 }}>
            <ArrowNarrowLeft size={24} color="black" />
          </IconButton>
        ) : null}
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold }}>Xác thực OTP!</Typography>
      </StackRowAlignCenter>

      <Typography className={classes.otpText} sx={{ mb: 2 }}>
        Mã OTP gồm 6 chữ số đã được gửi qua Zalo {normalizePhoneDisplay(submittedPhone)}.
        <Box component="span" sx={{ display: "block", mt: 0.5, fontStyle: "italic", color: "text.secondary" }}>
          Lưu ý: Trường hợp số điện thoại không đăng ký Zalo, bộ phận CSKH sẽ liên hệ để hỗ trợ quý khách tạo tài khoản.
        </Box>
      </Typography>

      <Stack direction="row" justifyContent="center" className={classes.otpCodeRow}>
        {otpValues.map((digit, index) => (
          <TextField
            key={`otp-${index}`}
            value={digit}
            inputRef={(el) => {
              otpRefs.current[index] = el;
            }}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            inputProps={{
              maxLength: 1,
              inputMode: "numeric",
              pattern: "[0-9]*",
              style: { textAlign: "center", fontSize: 24, padding: "10px 0", backgroundColor: "#F6F6F6" },
            }}
            className={classes.otpCodeCell}
            error={Boolean(otpError)}
            autoComplete="one-time-code"
            disabled={confirmInFlight || isOtpLocked}
          />
        ))}
      </Stack>

      {otpError ? <Typography className={classes.otpErrorText}>{otpError}</Typography> : null}

      <Stack direction="row" spacing={0.8} alignItems="center" className={classes.otpResendRow}>
        <CustomIconReload className={classes.replayIcon} />
        <Typography className={classes.otpResendText}>
          {(() => {
            const match = resendText.match(/(\d+s)/);
            if (match) {
              const parts = resendText.split(match[1]);
              return (
                <>
                  {parts[0]}
                  <Typography component="span" className={classes.otpResendTextBold}>
                    {match[1]}
                  </Typography>
                  {parts[1]}
                </>
              );
            }
            return resendText;
          })()}
        </Typography>
        <Box
          component="button"
          type="button"
          className={`${classes.resendButton} ${resendDisabled ? classes.resendButtonDisabled : ""}`}
          disabled={resendDisabled}
          onClick={() => {
            if (resendDisabled) return;
            onResendOtp();
          }}
        >
          {resendInFlight ? (
            <Stack direction="row" alignItems="center" spacing={0.5} component="span">
              <CircularProgress size={12} color="inherit" />
              <span>Đang gửi...</span>
            </Stack>
          ) : (
            "Gửi Lại"
          )}
        </Box>
      </Stack>

      <AppButton
        fullWidth
        variant="contained"
        disableElevation
        loading={confirmInFlight}
        onClick={() => onConfirmOtp(otpValues.join(""))}
        disabled={confirmDisabled || confirmInFlight || isOtpLocked}
        className={classes.confirmBtn}
      >
        Xác Nhận
      </AppButton>
    </Box>
  );
};

export default OtpVerificationScreen;
