"use client";

import AppButton from "@/components/app-button/app-button.component";
import AppLink from "@/components/app-link/app-link.component";
import { AuthCard } from "@/components/auth/auth-card";
import AuthFormSkeleton from "@/components/auth/auth-form-skeleton.component";
import { StackRowAlignCenter } from "@/components/styled";
import TextFieldPhoneNumberComponent from "@/components/text-field/text-field-phone-number.component";
import TextFieldComponent from "@/components/text-field/text-field.component";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsAuthResolved, selectIsLogin, setCredentials } from "@/redux/slices/auth.slice";
import { AuthApi } from "@/utils/api";
import { validatePhoneBrd } from "@/utils/auth/validate-phone-brd";
import { writeForgotPasswordPhone, writeRegisterPrecheckPhone } from "@/utils/auth/auth-phone-flow.client";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { clearCheckoutSessionId } from "@/utils/session/anonymous-session.util";
import { getPostAuthRedirectPath } from "@/utils/helpers/common/navigation";
import {
  getRecaptchaTokenForSendOtp,
  RECAPTCHA_CLIENT_FAILURE_MESSAGE,
  SendOtpRecaptchaAction,
} from "@/utils/recaptcha/recaptcha-v3.helper";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";
import { ArrowNarrowLeft, Eye, EyeOff } from "@untitledui/icons";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type KeyboardEvent } from "react";
import { toast } from "react-toastify";
import { useLogoSrc, useTenantBrandName } from "@/components/providers.component";
import useLoginStyles from "./login.styles";

const LOGIN_REMEMBER_KEY = "remember_login_info";

type Step = "PHONE" | "PASSWORD";

const LoginFlow = () => {
  const { classes } = useLoginStyles();
  const logoSrc = useLogoSrc("AUTH");
  const brandName = useTenantBrandName();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const isAuthResolved = useAppSelector(selectIsAuthResolved);
  const isLogin = useAppSelector(selectIsLogin);

  const [step, setStep] = useState<Step>("PHONE");
  const [nationalInput, setNationalInput] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rememberRaw = localStorage.getItem(LOGIN_REMEMBER_KEY);
    if (rememberRaw) {
      try {
        const remembered = JSON.parse(rememberRaw) as { phone?: string; password?: string };
        if (remembered.phone) {
          const p = remembered.phone.replace(/\s+/g, "").trim();
          if (p.startsWith("+84")) setNationalInput(p.slice(3));
          else if (p.startsWith("84") && p.length >= 10) setNationalInput(`0${p.slice(2)}`.replace(/^00/, "0"));
          else setNationalInput(p.replace(/^\+/, ""));
        }
        if (remembered.password) setPassword(remembered.password);
        if (remembered.phone || remembered.password) setRememberMe(true);
      } catch {
        // ignore
      }
    }
    setIsInitializing(false);
  }, []);

  // Phiên còn hiệu lực thật (theo /api/auth/me) mới chuyển trang. Nếu /api/auth/me thất bại,
  // user vẫn thấy form để đăng nhập lại thay vì bị đẩy vòng vòng.
  useEffect(() => {
    if (!isAuthResolved || !isLogin) return;
    router.replace(getPostAuthRedirectPath({ callbackUrl, fallback: "/trang-chu" }));
  }, [isAuthResolved, isLogin, callbackUrl, router]);

  if (isInitializing) {
    return <AuthFormSkeleton fieldCount={1} showSecondaryAction />;
  }

  const buildPhoneForValidate = () => {
    const raw = nationalInput.replace(/\s+/g, "").trim();
    if (!raw) return "";
    if (raw.startsWith("0")) return raw;
    return raw;
  };

  const handleContinuePhone = async () => {
    setPhoneError("");
    const raw = buildPhoneForValidate();
    const v = validatePhoneBrd(raw);
    if (!v.ok) {
      setPhoneError(v.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const recaptchaToken = await getRecaptchaTokenForSendOtp(SendOtpRecaptchaAction.CHECK_PHONE);
      if (!recaptchaToken) {
        setPhoneError(RECAPTCHA_CLIENT_FAILURE_MESSAGE);
        return;
      }

      const res = await fetch("/api/auth/resolve-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: v.normalized, recaptchaToken }),
      });
      const data = (await res.json().catch(() => null)) as { flow?: string; error?: boolean; message?: string } | null;

      if (!res.ok || data?.error || !data?.flow) {
        setPhoneError(data?.message || "Không kiểm tra được số điện thoại. Vui lòng thử lại.");
        return;
      }

      const resolvedFlow = (data.flow || "").trim().toUpperCase();
      writeForgotPasswordPhone(v.normalized);

      if (resolvedFlow === "OTP") {
        writeRegisterPrecheckPhone(v.normalized);
        const q = new URLSearchParams();
        if (callbackUrl) q.set("callbackUrl", callbackUrl);
        q.set("from", "otp");
        router.push(`/dang-ky?${q.toString()}`);
        return;
      }

      if (resolvedFlow !== "PASSWORD") {
        setPhoneError("Không kiểm tra được số điện thoại. Vui lòng thử lại.");
        return;
      }

      setNormalizedPhone(v.normalized);
      setStep("PASSWORD");
      setPasswordError("");
    } catch {
      setPhoneError("Không kiểm tra được số điện thoại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    setPasswordError("");
    if (password.length < 8) {
      setPasswordError("Mật khẩu không đúng");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await AuthApi.loginViaRoute({
        phone: normalizedPhone,
        password,
      });

      if (!result.user) {
        throw new Error(result.message || "Login failed");
      }

      if (typeof window !== "undefined") {
        clearCheckoutSessionId();
        dispatch(
          setCredentials({
            accessToken: null,
            refreshToken: null,
            user: result.user,
          }),
        );

        if (rememberMe) {
          localStorage.setItem(LOGIN_REMEMBER_KEY, JSON.stringify({ phone: normalizedPhone, password }));
        } else {
          localStorage.removeItem(LOGIN_REMEMBER_KEY);
        }
      }

      // Điều hướng do effect theo dõi state auth đảm nhiệm, tránh chuyển trang hai lần.
      toast.success(`Chào bạn! Cùng ${brandName} tỏa sáng theo cách riêng.`);
    } catch {
      setPasswordError("Mật khẩu không đúng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPhoneKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleContinuePhone();
    }
  };

  const onPasswordKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.type !== "password" && t.type !== "text") return;
    e.preventDefault();
    if (password.length >= 8 && !isSubmitting) void handleLogin();
  };

  const canLogin = password.length >= 8 && !isSubmitting;
  const forgotHref = (() => {
    const q = new URLSearchParams();
    if (callbackUrl) q.set("callbackUrl", callbackUrl);
    const s = q.toString();
    return s ? `/quen-mat-khau?${s}` : "/quen-mat-khau";
  })();

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: { xs: 3, md: 5 } }}>
      {step === "PHONE" ? (
        <AuthCard>
          <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start" }}>
            <Image src={logoSrc} alt={`${brandName} logo`} width={168} height={20} style={{ display: "block" }} />
          </Box>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, mb: 1 }}>Chào mừng đến với {brandName}!</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#4b5563", mb: 3 }}>
            Vui lòng nhập số điện thoại của bạn để tiếp tục.
          </Typography>

          <TextFieldPhoneNumberComponent
            label="Số điện thoại"
            value={nationalInput}
            onChange={(val) => setNationalInput(val)}
            onKeyDown={onPhoneKeyDown}
            error={phoneError}
            autoComplete="tel"
            sx={{ mb: 3 }}
          />

          <AppButton
            fullWidth
            disableElevation
            variant="contained"
            onClick={() => void handleContinuePhone()}
            disabled={isSubmitting}
            className={classes.submitButton}
          >
            Tiếp Tục
          </AppButton>
        </AuthCard>
      ) : (
        <AuthCard>
          <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start" }}>
            <Image src={logoSrc} alt={`${brandName} logo`} width={168} height={20} style={{ display: "block" }} />
          </Box>
          <StackRowAlignCenter gap={{ xs: 1.5, md: 2 }}>
            <IconButton size="small" onClick={() => setStep("PHONE")} sx={{ alignSelf: "flex-start", p: 0.5, mb: 1 }} aria-label="Quay lại">
              <ArrowNarrowLeft size={24} color="black" />
            </IconButton>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, mb: 1 }}>Chào mừng bạn trở lại!</Typography>
          </StackRowAlignCenter>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, mb: 2 }}>Vui lòng nhập mật khẩu để đăng nhập.</Typography>
          <TextFieldComponent
            type={isShowPassword ? "text" : "password"}
            label="Mật khẩu"
            value={password}
            onValueChange={(v) => {
              setPassword(v);
              if (passwordError) setPasswordError("");
            }}
            onKeyDown={onPasswordKeyDown}
            error={passwordError}
            autoComplete="current-password"
            required
            endAdornment={
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setIsShowPassword((p) => !p)} edge="end" aria-label="Hiện mật khẩu">
                  {isShowPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </IconButton>
              </InputAdornment>
            }
            sx={{ mb: 3 }}
          />

          <AppButton
            fullWidth
            disableElevation
            variant="contained"
            onClick={() => void handleLogin()}
            disabled={!canLogin}
            className={classes.submitButton}
          >
            Đăng Nhập
          </AppButton>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <AppLink href={forgotHref} sx={{ color: "#197CBD", textDecoration: "underline", ...TYPOGRAPHY_STYLES.base.medium }}>
              Quên Mật Khẩu
            </AppLink>
          </Box>
        </AuthCard>
      )}
    </Box>
  );
};

export default LoginFlow;
