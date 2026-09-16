"use client";

import CustomIconPhone from "@/assets/icon/CustomPhone";
import CustomIconReload from "@/assets/icon/CustomReload";
import CustomIconZalo from "@/assets/icon/CustomZalo";
import AppButton from "@/components/app-button/app-button.component";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import { useOtpInputBehavior } from "@/hooks/use-otp-input-behavior.hook";
import CloseIcon from "@mui/icons-material/Close";
import { Box, CircularProgress, Dialog, DialogContent, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useRef, type Dispatch, type SetStateAction } from "react";
import useOtpVerificationDialogsStyles from "./otp-verification-dialogs.styles";
import { OtpMethod } from "@/utils/api/auth/auth.enum";
import { OTP_DAILY_LIMIT_HOME_BUTTON_LABEL } from "@/utils/constants/otp-message.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { useNavigation } from "@/hooks/use-navigation";

type OtpVerificationDialogsProps = {
  showMethodDialog: boolean;
  showVerifyDialog: boolean;
  otpMethod: OtpMethod;
  submittedPhone: string;
  otpValues: string[];
  setOtpValues: Dispatch<SetStateAction<string[]>>;
  otpError: string;
  resendCounter: number;
  resendBlockedUntil: number | null;
  resendExceededMessage: string;
  resendText: string;
  onCloseMethodDialog: () => void;
  onCloseVerifyDialog: () => void;
  onBackToMethodDialog: () => void;
  onSelectMethod: (method: OtpMethod) => void;
  onOtpChange?: () => void;
  onConfirmOtp: (code: string) => void;
  onResendOtp: () => void;
  confirmDisabled?: boolean;
  confirmInFlight?: boolean;
  resendInFlight?: boolean;
  /** Khóa ô OTP sau quá số lần nhập sai — bật nút Gửi lại để yêu cầu mã mới */
  isOtpLocked?: boolean;
};

const OtpVerificationDialogs = ({
  showMethodDialog,
  showVerifyDialog,
  otpMethod,
  submittedPhone,
  otpValues,
  setOtpValues,
  otpError,
  resendCounter,
  resendBlockedUntil,
  resendExceededMessage,
  resendText,
  onCloseMethodDialog,
  onCloseVerifyDialog,
  onBackToMethodDialog,
  onSelectMethod,
  onOtpChange,
  onConfirmOtp,
  onResendOtp,
  confirmDisabled = false,
  confirmInFlight = false,
  resendInFlight = false,
  isOtpLocked = false,
}: OtpVerificationDialogsProps) => {
  const { classes } = useOtpVerificationDialogsStyles();
  const { gotoPage } = useNavigation();
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const { handleOtpChange, handlePaste, handleKeyDown, focusFirstOtpInput } = useOtpInputBehavior({
    submittedPhone,
    otpValues,
    setOtpValues,
    otpError,
    onOtpChange,
    onConfirmOtp,
    confirmDisabled: confirmDisabled || isOtpLocked || Boolean(resendExceededMessage),
    confirmInFlight,
    inputDisabled: isOtpLocked,
    isActive: showVerifyDialog,
    otpRefs,
  });

  const normalizePhone = (phone: string) => phone.replace(/\s+/g, "").trim();
  const hasDailyLimitExceeded = Boolean(resendExceededMessage);
  const isDailyBlocked = Boolean(resendBlockedUntil && resendBlockedUntil > Date.now());
  const resendDisabled = Boolean(hasDailyLimitExceeded || isDailyBlocked || resendCounter > 0 || resendInFlight);

  return (
    <>
      <Dialog open={showMethodDialog} onClose={onCloseMethodDialog} fullWidth classes={{ paper: classes.methodDialog }}>
        <DialogContent className={classes.dialogContent}>
          <StackRowAlignCenterJustBetween className={classes.dialogHeader}>
            <Typography className={classes.dialogTitle}>Xác Thực OTP</Typography>
            <IconButton size="small" onClick={onCloseMethodDialog}>
              <CloseIcon />
            </IconButton>
          </StackRowAlignCenterJustBetween>
          <Box className={classes.dialogBody}>
            <Typography className={classes.title}>Phương Thức Xác Thực</Typography>
            <Typography className={classes.otpText}>Mỗi phương thức chỉ được gửi tối đa 3 mã OTP trong 1 ngày.</Typography>
          </Box>

          <StackRowAlignCenter className={classes.dialogMethodRow}>
            <AppButton
              fullWidth
              variant="outlined"
              onClick={() => onSelectMethod(OtpMethod.ZNS)}
              startIcon={<CustomIconZalo />}
              className={`${classes.methodButton} ${classes.methodButtonZalo}`}
            >
              Gửi Qua Zalo
            </AppButton>
            <AppButton
              fullWidth
              variant="outlined"
              onClick={() => onSelectMethod(OtpMethod.SMS)}
              startIcon={<CustomIconPhone />}
              className={`${classes.methodButton} ${classes.methodButtonSms}`}
            >
              Gửi Qua SDT
            </AppButton>
          </StackRowAlignCenter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showVerifyDialog}
        onClose={onCloseVerifyDialog}
        fullWidth
        disableAutoFocus
        classes={{ paper: classes.methodDialog }}
        TransitionProps={{ onEntered: focusFirstOtpInput }}
      >
        <DialogContent className={classes.dialogContent}>
          <Box className={classes.dialogHeader}>
            <StackRowAlignCenter>
              <Typography className={classes.dialogTitle}>Xác Thực OTP</Typography>
            </StackRowAlignCenter>
            <IconButton size="small" onClick={onCloseVerifyDialog}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box className={classes.dialogBody}>
            {hasDailyLimitExceeded ? (
              <>
                <Typography
                  sx={{
                    ...TYPOGRAPHY_STYLES.base.regular,
                    color: "text.primary",
                    textAlign: "left",
                    mb: 2,
                  }}
                >
                  {resendExceededMessage}
                </Typography>
                <AppButton
                  fullWidth
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    onCloseVerifyDialog();
                    gotoPage("/");
                  }}
                  className={classes.confirmBtn}
                >
                  {OTP_DAILY_LIMIT_HOME_BUTTON_LABEL}
                </AppButton>
              </>
            ) : (
              <>
                <Typography className={classes.otpText} sx={{ mb: 2 }}>
                  Mã OTP gồm 6 chữ số đã được gửi {otpMethod === OtpMethod.ZNS ? "qua Zalo" : "đến số điện thoại"}{" "}
                  {normalizePhone(submittedPhone)}.
                  {otpMethod === OtpMethod.ZNS && (
                    <Box component="span" sx={{ display: "block", mt: 0.5, fontStyle: "italic", color: "text.secondary" }}>
                      Lưu ý: Trường hợp số điện thoại không đăng ký Zalo, bộ phận CSKH sẽ liên hệ để hỗ trợ quý khách tạo tài khoản.
                    </Box>
                  )}
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
                      const match = resendText.match(/(\d+[hs])/);
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
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OtpVerificationDialogs;
