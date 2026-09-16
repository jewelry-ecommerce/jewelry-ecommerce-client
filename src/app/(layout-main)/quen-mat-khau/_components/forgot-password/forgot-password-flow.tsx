"use client";

import { AuthCard } from "@/components/auth/auth-card";
import OtpVerificationScreen from "@/components/auth/otp-verification-screen.component";
import { useNavigation } from "@/hooks/use-navigation";
import { AuthApi } from "@/utils/api";
import { AuthApiPath } from "@/utils/api/auth/auth.enum";
import { getPasswordStrengthLevel, isPasswordStrongBrd, passwordStrengthSatisfiedCount } from "@/utils/auth/password-strength-brd";
import { validatePhoneBrd } from "@/utils/auth/validate-phone-brd";
import { getErrorMessage } from "@/utils/helpers/axios/axios.helpers";
import { buildLoginUrlPreservingReturn, getPostAuthRedirectPath } from "@/utils/helpers/common/navigation";
import {
  getOtpResendCountdownMessage,
  OTP_DAILY_LIMIT_MESSAGE,
  OTP_INCOMPLETE_CODE_MESSAGE,
  OTP_INVALID_CODE_MESSAGE,
  OTP_RESEND_FAILED_SHORT_MESSAGE,
  OTP_RESEND_READY_MESSAGE,
  OTP_RESEND_SUCCESS_MESSAGE,
  OTP_SEND_FAILED_MESSAGE,
  OTP_VERIFY_SUCCESS_MESSAGE,
  resolveOtpWrongAttemptError,
} from "@/utils/constants/otp-message.constant";
import { Box } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getRecaptchaTokenForSendOtp,
  RECAPTCHA_CLIENT_FAILURE_MESSAGE,
  SendOtpRecaptchaAction,
} from "@/utils/recaptcha/recaptcha-v3.helper";
import { useOtpWrongAttempts } from "@/hooks/use-otp-wrong-attempts.hook";
import { getOtpDailyQuotaResetAtMs, isOtpDailyLimitReached } from "@/utils/auth/otp-client.shared";
import useForgotPasswordFlowStyles from "./forgot-password-flow.styles";
import ForgotPasswordPhoneStep from "./forgot-password-phone-step.component";
import ForgotPasswordResetStep from "./forgot-password-reset-step.component";
import {
  clearForgotOtpSendSession,
  getAxiosOtpDailyLimit429Message,
  getCooldownRemainingSeconds,
  getOtpMeta,
  isAxiosOtpCooldown429,
  normalizePhone,
  OTP_MAX_SEND_PER_DAY,
  readForgotOtpSendSession,
  saveOtpMeta,
  todayIso,
  writeForgotOtpSendSession,
  type OtpStorageMeta,
} from "./forgot-password.constant";
import { clearCheckoutSessionId } from "@/utils/session/anonymous-session.util";
import { clearForgotPasswordPhone } from "@/utils/auth/auth-phone-flow.client";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/slices/auth.slice";

type ForgotPasswordFlowProps = {
  callbackUrl?: string | null;
  initialPhone?: string | null;
  onClose?: () => void;
};

type Step = "PHONE" | "RESET_PASSWORD";

const ForgotPasswordFlow = ({ callbackUrl = null, initialPhone = null, onClose }: ForgotPasswordFlowProps) => {
  const { classes } = useForgotPasswordFlowStyles();
  const { gotoPage } = useNavigation();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<Step>("PHONE");

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [submittedPhone, setSubmittedPhone] = useState("");
  const [showOtpVerifyDialog, setShowOtpVerifyDialog] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [resendCounter, setResendCounter] = useState(0);
  const [resendBlockedUntil, setResendBlockedUntil] = useState<number | null>(null);
  const [resendExceededMessage, setResendExceededMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasPasswordInteracted, setHasPasswordInteracted] = useState(false);
  const [hasPasswordTyped, setHasPasswordTyped] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const { isOtpLocked, recordWrongOtpAttempt, resetWrongOtpAttempts } = useOtpWrongAttempts();

  const resetFlowState = () => {
    setStep("PHONE");
    setPhone("");
    setPhoneError("");
    setSubmittedPhone("");
    setShowOtpVerifyDialog(false);
    setOtpError("");
    setResendCounter(0);
    setResendBlockedUntil(null);
    setResendExceededMessage("");
    clearForgotOtpSendSession();
    setNewPassword("");
    setConfirmPassword("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setHasPasswordInteracted(false);
    setHasPasswordTyped(false);
    clearForgotPasswordPhone();
    resetWrongOtpAttempts();
  };

  const phoneBrdResult = useMemo(() => validatePhoneBrd(phone.trim()), [phone]);

  const isPasswordValid = isPasswordStrongBrd(newPassword);
  const isPasswordMatched = newPassword.length > 0 && newPassword === confirmPassword;
  const isPhoneValid = phoneBrdResult.ok;
  const canSubmitPhone = isPhoneValid && !isLoading;

  const strengthLevel = useMemo(() => getPasswordStrengthLevel(newPassword), [newPassword]);
  const strengthBar = useMemo(() => (passwordStrengthSatisfiedCount(newPassword) / 5) * 100, [newPassword]);
  const strengthColor = strengthLevel === "strong" ? "#16a34a" : strengthLevel === "medium" ? "#ca8a04" : "#ef4444";
  const strengthLabel = strengthLevel === "strong" ? "Mạnh" : strengthLevel === "medium" ? "Trung bình" : "Yếu";
  const showStrengthMeter = newPassword.length > 0;

  const canSubmitReset = isPasswordValid && isPasswordMatched && !isLoading;

  /** Đếm ngược từ session startTime — chạy nền kể cả khi đóng popup OTP. */
  useEffect(() => {
    const tick = () => {
      const s = readForgotOtpSendSession();
      if (!s) {
        setResendCounter(0);
        return;
      }
      setResendCounter(getCooldownRemainingSeconds(s.startTime));
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  /** Đổi SĐT hợp lệ khác session cooldown → xóa session. */
  useEffect(() => {
    const s = readForgotOtpSendSession();
    if (!s) return;
    const v = validatePhoneBrd(phone.trim());
    if (v.ok && v.normalized !== s.phone) {
      clearForgotOtpSendSession();
      setResendCounter(0);
    }
  }, [phone]);

  useEffect(() => {
    if (!initialPhone) return;
    const v = validatePhoneBrd(initialPhone.trim());
    if (v.ok) {
      setPhone(v.normalized);
    } else {
      setPhone(initialPhone.replace(/\D/g, ""));
    }
  }, [initialPhone]);

  const syncOtpStatus = (phoneNumber: string, nextMeta?: OtpStorageMeta) => {
    const meta = nextMeta ?? getOtpMeta(phoneNumber);
    setResendBlockedUntil(meta.blockedUntil);
  };

  const applyDailyLimitExceeded = () => {
    setResendBlockedUntil(getOtpDailyQuotaResetAtMs());
    setResendExceededMessage(OTP_DAILY_LIMIT_MESSAGE);
    setResendCounter(0);
    clearForgotOtpSendSession();
  };

  const markOtpSent = (phoneNumber: string): boolean => {
    const current = getOtpMeta(phoneNumber);
    const now = Date.now();

    if (isOtpDailyLimitReached(current, OTP_MAX_SEND_PER_DAY)) {
      applyDailyLimitExceeded();
      return false;
    }

    const nextSendCount = current.sendCount + 1;
    const nextMeta: OtpStorageMeta = {
      date: todayIso(),
      sendCount: nextSendCount,
      blockedUntil: current.blockedUntil && current.blockedUntil > now ? current.blockedUntil : null,
    };

    saveOtpMeta(phoneNumber, nextMeta);
    syncOtpStatus(phoneNumber, nextMeta);
    setResendExceededMessage("");
    resetWrongOtpAttempts();
    setOtpError("");
    return true;
  };

  const handleOpenOtp = () => {
    if (!phoneBrdResult.ok) {
      setPhoneError(phoneBrdResult.message);
      return;
    }

    setPhoneError("");
    const normalized = phoneBrdResult.normalized;
    setSubmittedPhone(normalized);
    setOtpError("");

    if (isOtpDailyLimitReached(getOtpMeta(normalized), OTP_MAX_SEND_PER_DAY)) {
      applyDailyLimitExceeded();
      setShowOtpVerifyDialog(true);
      return;
    }

    let sessionSend = readForgotOtpSendSession();
    if (sessionSend && sessionSend.phone !== normalized) {
      clearForgotOtpSendSession();
      sessionSend = null;
    }

    const samePhoneCooldown = sessionSend && sessionSend.phone === normalized && getCooldownRemainingSeconds(sessionSend.startTime) > 0;

    if (samePhoneCooldown) {
      setResendCounter(getCooldownRemainingSeconds(sessionSend!.startTime));
      setShowOtpVerifyDialog(true);
      return;
    }

    void sendOtp(normalized);
  };

  const sendOtp = async (phoneOverride?: string) => {
    const normalized = normalizePhone(phoneOverride || submittedPhone || phone);

    if (isOtpDailyLimitReached(getOtpMeta(normalized), OTP_MAX_SEND_PER_DAY)) {
      applyDailyLimitExceeded();
      setShowOtpVerifyDialog(true);
      return;
    }

    const recaptchaToken = await getRecaptchaTokenForSendOtp(SendOtpRecaptchaAction.FORGOT_PASSWORD);
    if (!recaptchaToken) {
      toast.error(RECAPTCHA_CLIENT_FAILURE_MESSAGE);
      return;
    }

    setIsLoading(true);
    try {
      const sendResult = await AuthApi.sendOtpRegister({
        phone: normalized,
        type: AuthApiPath.FORGOT,
        recaptchaToken,
      });
      if (!sendResult.success) {
        const msg = sendResult.message?.trim() || OTP_SEND_FAILED_MESSAGE;
        if (msg.toLowerCase().includes("vượt quá số lần gửi otp")) {
          applyDailyLimitExceeded();
          setShowOtpVerifyDialog(true);
          return;
        }
        toast.error(msg);
        setOtpError(msg);
        setShowOtpVerifyDialog(true);
        return;
      }
      const canContinue = markOtpSent(normalized);
      if (!canContinue) {
        setShowOtpVerifyDialog(true);
        return;
      }

      writeForgotOtpSendSession(normalized);
      setResendCounter(getCooldownRemainingSeconds(Date.now()));
      toast.success("Mã đã được gửi đến số điện thoại của bạn");
      setShowOtpVerifyDialog(true);
    } catch (error) {
      const dailyLimitMsg = getAxiosOtpDailyLimit429Message(error);
      if (dailyLimitMsg) {
        applyDailyLimitExceeded();
        setShowOtpVerifyDialog(true);
        return;
      }
      if (isAxiosOtpCooldown429(error)) {
        const existing = readForgotOtpSendSession();
        if (!existing || existing.phone !== normalized) {
          writeForgotOtpSendSession(normalized);
        }
        const s = readForgotOtpSendSession();
        if (s) setResendCounter(getCooldownRemainingSeconds(s.startTime));
        setShowOtpVerifyDialog(true);
        return;
      }
      const msg = getErrorMessage(error) || OTP_SEND_FAILED_MESSAGE;
      toast.error(msg);
      setOtpError(msg);
      setShowOtpVerifyDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOtp = async (code: string) => {
    if (isOtpLocked) return;
    if (code.length !== 6) {
      setOtpError(OTP_INCOMPLETE_CODE_MESSAGE);
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthApi.verifyOtpForgotPassword({
        phone: submittedPhone,
        otp: code,
      });

      if (!response.success || !response.resetToken) {
        const locked = recordWrongOtpAttempt();
        setOtpError(resolveOtpWrongAttemptError(locked));
        return;
      }
      clearForgotOtpSendSession();
      setResetToken(response.resetToken || "");
      setShowOtpVerifyDialog(false);
      setStep("RESET_PASSWORD");
      toast.success(OTP_VERIFY_SUCCESS_MESSAGE);
    } catch (error) {
      const msg = getErrorMessage(error);
      const locked = recordWrongOtpAttempt();
      setOtpError(resolveOtpWrongAttemptError(locked, msg?.trim() ? msg : OTP_INVALID_CODE_MESSAGE));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!submittedPhone) return;

    if (isOtpDailyLimitReached(getOtpMeta(submittedPhone), OTP_MAX_SEND_PER_DAY)) {
      applyDailyLimitExceeded();
      setShowOtpVerifyDialog(true);
      return;
    }

    const recaptchaToken = await getRecaptchaTokenForSendOtp(SendOtpRecaptchaAction.FORGOT_PASSWORD);
    if (!recaptchaToken) {
      toast.error(RECAPTCHA_CLIENT_FAILURE_MESSAGE);
      return;
    }

    setIsLoading(true);
    try {
      await AuthApi.sendOtpRegister({
        phone: submittedPhone,
        type: AuthApiPath.FORGOT,
        recaptchaToken,
      });

      writeForgotOtpSendSession(submittedPhone);
      markOtpSent(submittedPhone);
      setResendCounter(getCooldownRemainingSeconds(Date.now()));
      toast.success(OTP_RESEND_SUCCESS_MESSAGE);
    } catch (error) {
      const dailyLimitMsg = getAxiosOtpDailyLimit429Message(error);
      if (dailyLimitMsg) {
        applyDailyLimitExceeded();
        setShowOtpVerifyDialog(true);
        return;
      }
      if (isAxiosOtpCooldown429(error)) {
        const existing = readForgotOtpSendSession();
        if (!existing || existing.phone !== submittedPhone) {
          writeForgotOtpSendSession(submittedPhone);
        }
        const s = readForgotOtpSendSession();
        if (s) setResendCounter(getCooldownRemainingSeconds(s.startTime));
        setShowOtpVerifyDialog(true);
        return;
      }
      const msg = getErrorMessage(error) || OTP_RESEND_FAILED_SHORT_MESSAGE;
      toast.error(msg);
      setOtpError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resendText = useMemo(() => {
    if (resendExceededMessage) return "";
    if (resendCounter > 0) {
      return getOtpResendCountdownMessage(resendCounter);
    }
    return OTP_RESEND_READY_MESSAGE;
  }, [resendCounter, resendExceededMessage]);

  const validatePasswordOnBlur = () => {
    if (!newPassword) return;

    if (!isPasswordStrongBrd(newPassword)) {
    } else {
      setNewPasswordError("");
    }

    if (!confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu không khớp.");
      return;
    }
    setConfirmPasswordError("");
  };

  const validateConfirmPasswordOnBlur = () => {
    if (!confirmPassword) return;
    if (!newPassword || newPassword !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu không khớp.");
      return;
    }
    setConfirmPasswordError("");
  };

  const validateConfirmPasswordLive = (nextConfirmPassword: string, nextNewPassword?: string) => {
    const targetNewPassword = nextNewPassword ?? newPassword;
    if (!nextConfirmPassword) {
      setConfirmPasswordError("");
      return;
    }
    if (!targetNewPassword || targetNewPassword !== nextConfirmPassword) {
      setConfirmPasswordError("Mật khẩu không khớp.");
      return;
    }
    setConfirmPasswordError("");
  };

  const handleResetPassword = async () => {
    if (!isPasswordValid) {
      return;
    }

    if (!isPasswordMatched) {
      setConfirmPasswordError("Mật khẩu không khớp.");
      return;
    }

    setNewPasswordError("");
    setConfirmPasswordError("");

    setIsLoading(true);
    try {
      const resetResult = await AuthApi.resetPasswordViaRoute({
        resetToken: resetToken,
        newPassword,
      });
      if (!resetResult.success) {
        toast.error(resetResult.message?.trim() || "Đặt lại mật khẩu thất bại");
        return;
      }

      if (typeof window !== "undefined") {
        clearCheckoutSessionId();
        dispatch(
          setCredentials({
            accessToken: null,
            refreshToken: null,
            user: resetResult?.user,
          }),
        );
      }
      clearForgotPasswordPhone();
      toast.success("Đặt lại mật khẩu thành công");
      gotoPage(getPostAuthRedirectPath({ callbackUrl, fallback: "/" }));
    } catch (error) {
      toast.error("Đặt lại mật khẩu thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const otpScreen = (
    <OtpVerificationScreen
      submittedPhone={submittedPhone}
      otpError={otpError}
      resendCounter={resendCounter}
      resendBlockedUntil={resendBlockedUntil}
      resendExceededMessage={resendExceededMessage}
      resendText={resendText}
      onOtpChange={() => {
        if (!isOtpLocked) setOtpError("");
      }}
      onConfirmOtp={handleConfirmOtp}
      onResendOtp={handleResendOtp}
      confirmInFlight={isLoading}
      isOtpLocked={isOtpLocked}
      onBack={() => {
        setShowOtpVerifyDialog(false);
        setStep("PHONE");
      }}
      confirmDisabled={Boolean(resendExceededMessage) || isOtpLocked}
    />
  );

  return (
    <Box sx={{ py: { xs: 3, md: 4 }, px: 2, display: "flex", justifyContent: "center" }}>
      {step === "PHONE" && !showOtpVerifyDialog ? (
        <ForgotPasswordPhoneStep
          phone={phone}
          phoneError={phoneError}
          canSubmitPhone={canSubmitPhone}
          fieldClassName={classes.field}
          submitButtonClassName={classes.submitButton}
          onPhoneChange={(val) => {
            setPhone(val);
            if (phoneError) setPhoneError("");
          }}
          onContinue={handleOpenOtp}
          onBack={() => {
            resetFlowState();
            if (onClose) {
              onClose();
            } else {
              gotoPage(buildLoginUrlPreservingReturn(callbackUrl));
            }
          }}
        />
      ) : null}

      {showOtpVerifyDialog ? <AuthCard>{otpScreen}</AuthCard> : null}

      {step === "RESET_PASSWORD" ? (
        <ForgotPasswordResetStep
          classes={{ field: classes.field, field2: classes.field2, submitButton: classes.submitButton }}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          newPasswordError={newPasswordError}
          confirmPasswordError={confirmPasswordError}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          hasPasswordInteracted={hasPasswordInteracted}
          hasPasswordTyped={hasPasswordTyped}
          showStrengthMeter={showStrengthMeter}
          strengthBar={strengthBar}
          strengthColor={strengthColor}
          strengthLabel={strengthLabel}
          canSubmitReset={canSubmitReset}
          onSetHasPasswordInteracted={() => setHasPasswordInteracted(true)}
          onChangeNewPassword={(val) => {
            setNewPassword(val);
            setHasPasswordTyped(val.trim().length > 0);
            validateConfirmPasswordLive(confirmPassword, val);
          }}
          onChangeConfirmPassword={(val) => {
            setConfirmPassword(val);
            validateConfirmPasswordLive(val);
          }}
          onClearNewPasswordError={() => setNewPasswordError("")}
          onValidatePasswordBlur={validatePasswordOnBlur}
          onValidateConfirmPasswordBlur={validateConfirmPasswordOnBlur}
          onToggleShowNewPassword={() => setShowNewPassword((prev) => !prev)}
          onToggleShowConfirmPassword={() => setShowConfirmPassword((prev) => !prev)}
          onSubmitReset={handleResetPassword}
        />
      ) : null}
    </Box>
  );
};

export default ForgotPasswordFlow;
