import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Box, Skeleton, Stack, Typography } from "@mui/material";
import useStyles from "./my-account-profile.styles";
import { AuthUser } from "@/utils/api/auth/auth.interface";
import { useMediaQuery, useTheme } from "@mui/material";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import MyAccountProfileUpdateDialog from "./components/my-account-profile-update-dialog.component";
import MyAccountProfilePasswordDialog from "./components/my-account-profile-password-dialog.component";
import MyAccountProfilePhoneDialog from "./components/my-account-profile-phone-dialog.component";
import OtpVerificationDialogs from "@/app/(layout-main)/dang-ky/_components/otp-verification-dialogs/otp-verification-dialogs.component";
import { formatDate } from "@/utils/format";
import { Gender, GenderLabel, AuthApiPath, OtpMethod, PhoneChangeStatus } from "@/utils/api/auth/auth.enum";
import { useOtp } from "@/hooks/use-otp.hook";
import { AuthApi } from "@/utils/api";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { getErrorMessage } from "@/utils/helpers/axios/axios.helpers";
import { isOtpDailyLimitError } from "@/utils/auth/otp-client.shared";
import { OTP_INCOMPLETE_CODE_MESSAGE, OTP_INVALID_CODE_MESSAGE, resolveOtpWrongAttemptError } from "@/utils/constants/otp-message.constant";
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import {
  getRecaptchaTokenForSendOtp,
  RECAPTCHA_CLIENT_FAILURE_MESSAGE,
  SendOtpRecaptchaAction,
} from "@/utils/recaptcha/recaptcha-v3.helper";

interface MyAccountProfileProps {
  user: AuthUser | undefined;
  isLoading: boolean;
}

const SectionSkeleton = () => (
  <Stack sx={{ gap: "12px", p: "16px" }}>
    <StackRowAlignCenterJustBetween>
      <Skeleton variant="text" width={140} height={24} />
      <Skeleton variant="text" width={80} height={20} />
    </StackRowAlignCenterJustBetween>
    <StackRow sx={{ gap: "24px", flexWrap: "wrap" }}>
      <Skeleton variant="rectangular" width="45%" height={48} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="45%" height={48} sx={{ borderRadius: 1 }} />
    </StackRow>
  </Stack>
);

const MyAccountProfile = ({ user, isLoading }: MyAccountProfileProps) => {
  // hook
  const { classes } = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));
  const otp = useOtp("otp_change_phone_meta");

  // state
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isConfirmingOtp, setIsConfirmingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const otpSendInFlightRef = useRef(false);
  const showSkeleton = isLoading || !user;
  const isPhonePending = user?.pendingPhoneChange?.status === PhoneChangeStatus.PENDING;

  // function
  const getGenderText = (gender: string | null) => {
    if (!gender) return "Chưa cập nhật";
    return GenderLabel[gender as Gender] || "Chưa cập nhật";
  };

  const shouldRetryOtpWithSms = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return true;
    }

    const status = error.response?.status;
    return !status || status >= 500;
  };

  const sendChangePhoneOtpWithRecaptcha = useCallback(async (targetPhone: string): Promise<boolean> => {
    const recaptchaToken = await getRecaptchaTokenForSendOtp(SendOtpRecaptchaAction.CHANGE_PHONE);
    if (!recaptchaToken) {
      toast.error(RECAPTCHA_CLIENT_FAILURE_MESSAGE);
      return false;
    }
    await AuthApi.sendOtpRegister({
      phone: targetPhone,
      type: AuthApiPath.CHANGE_PHONE,
      recaptchaToken,
    });
    return true;
  }, []);

  const handlePhoneSuccess = async (newPhone: string) => {
    otp.setSubmittedPhone(newPhone);

    // Logic cũ: mở popup chọn phương thức OTP.
    // otp.setShowMethodDialog(true);

    // Logic mới: mặc định gửi OTP qua Zalo và mở thẳng popup nhập OTP.
    otp.setOtpMethod(OtpMethod.ZNS);
    return handleSelectMethod(OtpMethod.ZNS, newPhone);
  };

  const handleSelectMethod = async (method: OtpMethod, phoneOverride?: string) => {
    if (otpSendInFlightRef.current) return false;

    const targetPhone = phoneOverride || otp.submittedPhone;
    otp.setOtpMethod(method);

    if (otp.openExistingCooldownIfAny(targetPhone)) {
      otp.setShowMethodDialog(false);
      return true;
    }

    if (!otp.canSendOtp(targetPhone)) {
      otp.applyDailyLimitExceeded();
      otp.setShowMethodDialog(false);
      otp.setShowVerifyDialog(true);
      return false;
    }

    otpSendInFlightRef.current = true;
    setIsSendingOtp(true);
    try {
      const sent = await sendChangePhoneOtpWithRecaptcha(targetPhone);
      if (!sent) {
        return false;
      }
      const canContinue = otp.markOtpSent(targetPhone, method);
      otp.setShowMethodDialog(false);
      otp.setShowVerifyDialog(true);
      if (canContinue) {
        toast.success("Mã OTP đã được gửi!");
        return true;
      }
      return false;
    } catch (error) {
      if (isOtpDailyLimitError(error)) {
        otp.applyDailyLimitExceeded();
        otp.setShowMethodDialog(false);
        otp.setShowVerifyDialog(true);
        return false;
      }
      if (method === OtpMethod.ZNS && shouldRetryOtpWithSms(error)) {
        try {
          const sent = await sendChangePhoneOtpWithRecaptcha(targetPhone);
          if (!sent) {
            return false;
          }
          // ZNS fallback SMS cùng 1 lượt gửi — chỉ mark 1 lần.
          const canContinue = otp.markOtpSent(targetPhone, OtpMethod.ZNS);
          otp.setOtpMethod(OtpMethod.SMS);
          otp.setShowMethodDialog(false);
          otp.setShowVerifyDialog(true);
          if (canContinue) {
            toast.success("Mã OTP đã được gửi!");
            return true;
          }
          return false;
        } catch (smsError) {
          if (isOtpDailyLimitError(smsError)) {
            otp.applyDailyLimitExceeded();
            otp.setShowMethodDialog(false);
            otp.setShowVerifyDialog(true);
            return false;
          }
        }
      }
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      otpSendInFlightRef.current = false;
      setIsSendingOtp(false);
    }
  };

  const handleConfirmOtp = async (code: string) => {
    if (otp.isOtpLocked) return;
    if (code.length < 6) {
      otp.setOtpError(OTP_INCOMPLETE_CODE_MESSAGE);
      return;
    }
    setIsConfirmingOtp(true);
    try {
      await AuthApi.postCustomerVerifyChangePhone({
        newPhone: otp.submittedPhone,
        otp: code,
      });
      toast.success("Yêu cầu thay đổi số điện thoại đã được gửi!");
      mutate((key) => key === "customer-profile" || (Array.isArray(key) && key[0] === "customer-profile"));
      otp.resetOtpState();
    } catch (error) {
      const locked = otp.recordWrongOtpAttempt();
      otp.setOtpError(resolveOtpWrongAttemptError(locked, getErrorMessage(error) || OTP_INVALID_CODE_MESSAGE));
    } finally {
      setIsConfirmingOtp(false);
    }
  };

  return (
    <Stack id="thong-tin-tai-khoan" sx={{ gap: "16px" }}>
      {!isMobile && (
        <Typography
          sx={{
            ...TYPOGRAPHY_STYLES.xl.bold,
            color: "#27251F",
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          Thông tin tài khoản
        </Typography>
      )}

      {/* Section 1: Thông tin chung */}
      <Box className={classes.sectionCard}>
        {showSkeleton ? (
          <SectionSkeleton />
        ) : (
          <React.Fragment>
            <Box className={classes.sectionHeader}>
              <Typography className={classes.sectionTitle}>Thông tin chung</Typography>
              <Box component="button" className={classes.editButton} onClick={() => setIsUpdateDialogOpen(true)}>
                Chỉnh sửa
              </Box>
            </Box>
            <Box className={classes.infoGrid}>
              <Box className={classes.infoItem}>
                <Typography className={classes.infoLabel}>Họ và tên</Typography>
                <Typography className={classes.infoValue}>{user.firstName}</Typography>
              </Box>
              <Box className={classes.infoItem}>
                <Typography className={classes.infoLabel}>Email</Typography>
                <Typography className={classes.infoValue}>{user.email || "Chưa cập nhật"}</Typography>
              </Box>
              <Box className={classes.infoItem}>
                <Typography className={classes.infoLabel}>Giới tính</Typography>
                <Typography className={classes.infoValue}>{getGenderText(user.gender)}</Typography>
              </Box>
              <Box className={classes.infoItem}>
                <Typography className={classes.infoLabel}>Ngày sinh</Typography>
                <Typography className={classes.infoValue}>{formatDate(user.birthday) || "Chưa cập nhật"}</Typography>
              </Box>
            </Box>
          </React.Fragment>
        )}
      </Box>

      {/* Section 2: Số điện thoại */}
      <Box className={classes.sectionCard} id="phone">
        {showSkeleton ? (
          <SectionSkeleton />
        ) : (
          <React.Fragment>
            <Box className={classes.sectionHeader}>
              <Typography className={classes.sectionTitle}>Số điện thoại</Typography>
              <StackRowAlignCenter gap={2}>
                {isPhonePending && (
                  <Box
                    sx={{
                      color: "#EAB308",
                      bgcolor: "#FEF9C3",
                      px: 1,
                      py: 0.5,
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontWeight: 400,
                    }}
                  >
                    CHỜ duyệt
                  </Box>
                )}
                <Box disabled={isPhonePending} component="button" className={classes.editButton} onClick={() => setIsPhoneDialogOpen(true)}>
                  Chỉnh sửa số điện thoại
                </Box>
              </StackRowAlignCenter>
            </Box>
            <Box className={classes.infoGrid}>
              <Box className={classes.infoItem}>
                <Typography className={classes.infoLabel}>Số điện thoại</Typography>
                <Typography className={classes.infoValue}>{user.phone.replace(/\d+(\d{2})/, "********$1")}</Typography>
              </Box>
            </Box>
          </React.Fragment>
        )}
      </Box>

      {/* Section 3: Mật khẩu */}
      <Box className={classes.sectionCard} id="password">
        {showSkeleton ? (
          <SectionSkeleton />
        ) : (
          <React.Fragment>
            <Box className={classes.sectionHeader}>
              <Typography className={classes.sectionTitle}>Mật khẩu</Typography>
              <Box component="button" className={classes.editButton} onClick={() => setIsPasswordDialogOpen(true)}>
                Chỉnh sửa mật khẩu
              </Box>
            </Box>
            <Box className={classes.infoGrid}>
              <Box className={classes.infoItem}>
                <Typography className={classes.infoLabel}>Mật khẩu</Typography>
                <Typography className={classes.infoValue}>**********</Typography>
              </Box>
            </Box>
          </React.Fragment>
        )}
      </Box>

      <MyAccountProfileUpdateDialog open={isUpdateDialogOpen} onClose={() => setIsUpdateDialogOpen(false)} user={user} />

      <MyAccountProfilePasswordDialog open={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)} />

      {user && (
        <MyAccountProfilePhoneDialog
          open={isPhoneDialogOpen}
          onClose={() => setIsPhoneDialogOpen(false)}
          currentPhone={user.phone}
          onSuccess={handlePhoneSuccess}
        />
      )}

      <OtpVerificationDialogs
        showMethodDialog={false}
        showVerifyDialog={otp.showVerifyDialog}
        otpMethod={otp.otpMethod}
        submittedPhone={otp.submittedPhone}
        otpValues={otp.otpValues}
        setOtpValues={otp.setOtpValues}
        otpError={otp.otpError}
        resendCounter={otp.resendCounter}
        resendBlockedUntil={otp.resendBlockedUntil}
        resendExceededMessage={otp.resendExceededMessage}
        resendText={otp.resendText}
        onCloseMethodDialog={() => otp.setShowMethodDialog(false)}
        onCloseVerifyDialog={() => otp.setShowVerifyDialog(false)}
        onBackToMethodDialog={() => {
          otp.setShowVerifyDialog(false);
          otp.setShowMethodDialog(false);
        }}
        onSelectMethod={handleSelectMethod}
        onOtpChange={() => {
          if (!otp.isOtpLocked) otp.setOtpError("");
        }}
        onConfirmOtp={handleConfirmOtp}
        onResendOtp={() => {
          void handleSelectMethod(otp.otpMethod);
        }}
        confirmInFlight={isConfirmingOtp}
        resendInFlight={isSendingOtp}
        isOtpLocked={otp.isOtpLocked}
        confirmDisabled={otp.isOtpLocked || Boolean(otp.resendExceededMessage)}
      />
    </Stack>
  );
};

export default MyAccountProfile;
