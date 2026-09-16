"use client";

import { AuthCard } from "@/components/auth/auth-card";
import AuthFormSkeleton from "@/components/auth/auth-form-skeleton.component";
import OtpVerificationScreen from "@/components/auth/otp-verification-screen.component";
import { useNavigation } from "@/hooks/use-navigation";
import { useRegisterEntryGuard } from "@/hooks/register/use-register-entry-guard.hook";
import { useRegisterOtpFlow } from "@/hooks/register/use-register-otp-flow.hook";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/slices/auth.slice";
import { AuthApi } from "@/utils/api";
import { getErrorMessage } from "@/utils/helpers/axios/axios.helpers";
import { getPostAuthRedirectPath } from "@/utils/helpers/common/navigation";
import {
  OTP_INCOMPLETE_CODE_MESSAGE,
  OTP_INVALID_CODE_MESSAGE,
  OTP_VERIFY_SUCCESS_MESSAGE,
  resolveOtpWrongAttemptError,
} from "@/utils/constants/otp-message.constant";
import { clearCheckoutSessionId } from "@/utils/session/anonymous-session.util";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getPasswordStrengthLevel, passwordStrengthSatisfiedCount } from "@/utils/auth/password-strength-brd";
import { clearRegisterPrecheckPhone } from "@/utils/auth/auth-phone-flow.client";
import useRegisterFormStyles from "./register-form.styles";
import { OTP_LENGTH, normalizePhone, phoneRegex, clearRegisterOtpSendSession } from "./register.constant";
import RegisterAccountStep from "./register-account-step.component";
import { registerSchema, type RegisterFormValues } from "./register.schema";
import { useTenantBrandName } from "@/components/providers.component";

const RegisterForm = () => {
  const brandName = useTenantBrandName();
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasPasswordInteracted, setHasPasswordInteracted] = useState(false);

  const [isConfirmingOtp, setIsConfirmingOtp] = useState(false);
  const [profileSetupToken, setProfileSetupToken] = useState("");

  const [pendingRegisterData, setPendingRegisterData] = useState<{
    firstName: string;
    password: string;
    email: string | null;
  } | null>(null);
  const { classes } = useRegisterFormStyles();
  const { gotoPage } = useNavigation();
  const dispatch = useAppDispatch();
  const { callbackUrl, entryPhone, requireOtpPrecheck, canAccessRegisterPage } = useRegisterEntryGuard();
  const [otpPrecheckPassed, setOtpPrecheckPassed] = useState(!requireOtpPrecheck);
  const submitInFlightRef = useRef(false);
  const otpVerifyInFlightRef = useRef(false);

  const {
    showOtpVerifyDialog,
    setShowOtpVerifyDialog,
    otpError,
    setOtpError,
    resendCounter,
    resendBlockedUntil,
    resendExceededMessage,
    isSendingOtp,
    resendText,
    isOtpLocked,
    recordWrongOtpAttempt,
    openOtpVerify,
    handleResendOtp,
    showExistingCooldownDialog,
  } = useRegisterOtpFlow({
    entryPhone,
    requireOtpPrecheck,
    otpPrecheckPassed,
    submittedPhone,
    setSubmittedPhone,
  });

  useEffect(() => {
    if (!requireOtpPrecheck) {
      setOtpPrecheckPassed(true);
      setProfileSetupToken("");
      return;
    }
    setOtpPrecheckPassed(false);
    setProfileSetupToken("");
  }, [requireOtpPrecheck, entryPhone]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onTouched",
    reValidateMode: "onChange",
    criteriaMode: "all",
  });

  const watchedPassword = watch("password");
  const watchedConfirmPassword = watch("confirmPassword");
  const hasPasswordTyped = watchedPassword.trim().length > 0;
  const strengthLevel = useMemo(() => getPasswordStrengthLevel(watchedPassword), [watchedPassword]);
  const strengthBar = useMemo(() => (passwordStrengthSatisfiedCount(watchedPassword) / 5) * 100, [watchedPassword]);
  const strengthColor = strengthLevel === "strong" ? "#16a34a" : strengthLevel === "medium" ? "#ca8a04" : "#ef4444";
  const strengthLabel = strengthLevel === "strong" ? "Mạnh" : strengthLevel === "medium" ? "Trung bình" : "Yếu";
  const showStrengthMeter = watchedPassword.length > 0;

  // passwordChecks moved to PasswordRequirement component

  useEffect(() => {
    if (!watchedConfirmPassword) return;
    void trigger("confirmPassword");
  }, [trigger, watchedConfirmPassword, watchedPassword]);

  const handleSubmitRegister: SubmitHandler<RegisterFormValues> = async (formValues) => {
    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    try {
      if (requireOtpPrecheck && !otpPrecheckPassed) {
        toast.error("Vui lòng xác thực OTP trước khi đăng ký.");
        return;
      }

      const normalizedPhone = normalizePhone(submittedPhone || entryPhone || "");
      if (!phoneRegex.test(normalizedPhone)) {
        toast.error("Thiếu số điện thoại đăng ký. Vui lòng quay lại bước nhập số điện thoại.");
        return;
      }
      const normalizedEmail = formValues.email?.trim() || null;
      setSubmittedPhone(normalizedPhone);

      if (requireOtpPrecheck) {
        if (!profileSetupToken) {
          toast.error("Thiếu phiên xác thực OTP. Vui lòng xác thực lại OTP.");
          setOtpPrecheckPassed(false);
          void openOtpVerify(normalizedPhone);
          return;
        }

        try {
          const result = await AuthApi.completeOtpLoginProfileViaRoute({
            profileSetupToken,
            firstName: formValues.fullName.trim(),
            email: normalizedEmail,
            password: formValues.password,
          });

          if (!result?.user) {
            toast.error(result?.message?.trim() || "Không thể hoàn tất đăng ký.");
            return;
          }

          if (typeof window !== "undefined") {
            clearRegisterOtpSendSession();
            dispatch(
              setCredentials({
                accessToken: null,
                refreshToken: null,
                user: result.user,
              }),
            );
          }

          clearCheckoutSessionId();
          clearRegisterPrecheckPhone();
          toast.success(`Chào mừng bạn đã trở thành mảnh ghép của ${brandName} Keyholder.`);
          gotoPage(getPostAuthRedirectPath({ callbackUrl, fallback: "/" }));
        } catch (err) {
          toast.error(getErrorMessage(err) || "Không thể hoàn tất đăng ký.");
        }
        return;
      }

      setPendingRegisterData({
        firstName: formValues.fullName.trim(),
        password: formValues.password,
        email: normalizedEmail,
      });

      setOtpError("");

      if (showExistingCooldownDialog(normalizedPhone)) {
        return;
      }

      await openOtpVerify(normalizedPhone);
    } finally {
      submitInFlightRef.current = false;
    }
  };

  const handleConfirmOtp = async (code: string) => {
    if (otpVerifyInFlightRef.current || isOtpLocked) return;
    if (code.length !== OTP_LENGTH) {
      setOtpError(OTP_INCOMPLETE_CODE_MESSAGE);
      return;
    }

    const applyWrongOtpError = (fallbackMessage = OTP_INVALID_CODE_MESSAGE) => {
      const locked = recordWrongOtpAttempt();
      setOtpError(resolveOtpWrongAttemptError(locked, fallbackMessage));
    };

    if (requireOtpPrecheck && !otpPrecheckPassed && !pendingRegisterData) {
      try {
        otpVerifyInFlightRef.current = true;
        setIsConfirmingOtp(true);
        const result = await AuthApi.verifyOtpRegisterPrecheck({
          phone: submittedPhone,
          otp: code,
        });
        if (!result?.success) {
          applyWrongOtpError(result?.message?.trim() || OTP_INVALID_CODE_MESSAGE);
          return;
        }
        if (!result.profileSetupToken) {
          setOtpError("Không thể khởi tạo phiên đăng ký. Vui lòng thử lại.");
          return;
        }
        clearRegisterOtpSendSession();
        setOtpError("");
        setShowOtpVerifyDialog(false);
        setProfileSetupToken(result.profileSetupToken);
        setOtpPrecheckPassed(true);
        toast.success(OTP_VERIFY_SUCCESS_MESSAGE);
      } catch (err) {
        applyWrongOtpError(getErrorMessage(err) || OTP_INVALID_CODE_MESSAGE);
      } finally {
        otpVerifyInFlightRef.current = false;
        setIsConfirmingOtp(false);
      }
      return;
    }

    if (!pendingRegisterData) {
      setOtpError("Dữ liệu đăng ký bị thiếu. Vui lòng thử lại.");
      return;
    }

    try {
      otpVerifyInFlightRef.current = true;
      setIsConfirmingOtp(true);
      const result = await AuthApi.verifyOtpRegister({
        ...pendingRegisterData,
        otp: code,
      });

      if (!result?.user) {
        applyWrongOtpError();
        return;
      }

      if (typeof window !== "undefined") {
        clearRegisterOtpSendSession();

        dispatch(
          setCredentials({
            accessToken: null,
            refreshToken: null,
            user: result.user,
          }),
        );
      }

      setShowOtpVerifyDialog(false);
      clearRegisterPrecheckPhone();
      clearCheckoutSessionId();
      toast.success("Xin chân thành cảm ơn vì đã trở thành thành viên của chúng tôi <3");
      gotoPage(getPostAuthRedirectPath({ callbackUrl, fallback: "/" }));
    } catch (err) {
      applyWrongOtpError(getErrorMessage(err) || OTP_INVALID_CODE_MESSAGE);
    } finally {
      otpVerifyInFlightRef.current = false;
      setIsConfirmingOtp(false);
    }
  };

  if (!canAccessRegisterPage) {
    return <AuthFormSkeleton fieldCount={3} showSecondaryAction />;
  }

  if (showOtpVerifyDialog || (requireOtpPrecheck && !otpPrecheckPassed)) {
    return (
      <Box sx={{ py: { xs: 3, md: 4 }, display: "flex", justifyContent: "center", px: 2 }}>
        <AuthCard>
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
            resendInFlight={isSendingOtp}
            confirmInFlight={isConfirmingOtp}
            isOtpLocked={isOtpLocked}
            onBack={() => {
              if (requireOtpPrecheck && !otpPrecheckPassed && !pendingRegisterData) {
                gotoPage(callbackUrl ? `/dang-nhap?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/dang-nhap");
                return;
              }
              setShowOtpVerifyDialog(false);
            }}
            confirmDisabled={Boolean(resendExceededMessage) || isOtpLocked}
          />
        </AuthCard>
      </Box>
    );
  }

  const handleRegisterFormKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    const submittableTypes = ["text", "tel", "email", "password", "search", "url"];
    if (!submittableTypes.includes(target.type)) return;
    e.preventDefault();
    void handleSubmit(handleSubmitRegister)();
  };

  return (
    <RegisterAccountStep
      classes={{
        registerForm: classes.registerForm,
        title: classes.title,
        fieldMargin: classes.fieldMargin,
        acceptRow: classes.acceptRow,
        termsText: classes.termsText,
        termsSpan: classes.termsSpan,
        errorMessage: classes.errorMessage,
        confirmBtn: classes.confirmBtn,
        notConfirmBtn: classes.notConfirmBtn,
        otpLinks: classes.otpLinks,
        otpLinkKey: classes.otpLinkKey,
      }}
      register={register}
      control={control}
      errors={errors}
      isSubmitting={isSubmitting}
      isValid={isValid}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      hasPasswordInteracted={hasPasswordInteracted}
      hasPasswordTyped={hasPasswordTyped}
      showStrengthMeter={showStrengthMeter}
      strengthBar={strengthBar}
      strengthColor={strengthColor}
      strengthLabel={strengthLabel}
      watchedPassword={watchedPassword}
      onTogglePassword={() => setShowPassword((prev) => !prev)}
      onToggleConfirmPassword={() => setShowConfirmPassword((prev) => !prev)}
      onPasswordInteract={() => setHasPasswordInteracted(true)}
      onKeyDown={handleRegisterFormKeyDown}
      onSubmit={handleSubmit(handleSubmitRegister)}
      onNavigateLogin={() => gotoPage(callbackUrl ? `/dang-nhap?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/dang-nhap")}
    />
  );
};

export default RegisterForm;
