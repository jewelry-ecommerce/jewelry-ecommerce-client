import { authAxios, commonAxios } from "@/utils/axios";
import { getAuthRouteHeaders } from "@/utils/api/auth/auth-route-headers";
import {
  AuthUser,
  AuthUserChangePasswordRequest,
  AuthUserRequest,
  AuthUserVerifyChangePhoneRequest,
  CheckPhoneRequest,
  CompleteOtpLoginProfileRequest,
  CompleteOtpLoginProfileResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendOtpRegisterRequest,
  SendOtpRegisterResponse,
  VerifyOtpOrderLookupRequest,
  VerifyOtpOrderLookupResponse,
  VerifyOtpForgotPasswordRequest,
  VerifyOtpForgotPasswordResponse,
  VerifyOtpRegisterRequest,
  VerifyOtpRegisterResponse,
  VerifyOtpRegisterPrecheckRequest,
  VerifyOtpRegisterPrecheckResponse,
} from "./auth.interface";

export type LoginViaRouteResponse = {
  success?: boolean;
  user?: AuthUser;
  message?: string;
};

export type ResetPasswordViaRouteResponse = {
  success: boolean;
  message?: string;
  user: AuthUser;
};

export type CompleteOtpLoginProfileViaRouteResponse = {
  success: boolean;
  message?: string;
  user?: AuthUser;
};

export const sendOtpRegister = async (payload: SendOtpRegisterRequest): Promise<SendOtpRegisterResponse> =>
  (await commonAxios.post("iam/customer/send-otp", payload)).data;

export const verifyOtpRegister = async (payload: VerifyOtpRegisterRequest): Promise<VerifyOtpRegisterResponse> =>
  (await commonAxios.post("iam/customer/verify-otp-register", payload)).data;

export const verifyOtpOrderLookup = async (payload: VerifyOtpOrderLookupRequest): Promise<VerifyOtpOrderLookupResponse> =>
  (await commonAxios.post("iam/customer/verify-otp-order-lookup", payload)).data;

export const login = async (payload: LoginRequest): Promise<LoginResponse> => (await commonAxios.post("iam/customer/login", payload)).data;

export const loginViaRoute = async (payload: LoginRequest): Promise<LoginViaRouteResponse> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: getAuthRouteHeaders({
      "Content-Type": "application/json",
    }),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as LoginViaRouteResponse;

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const logoutViaRoute = async (): Promise<LogoutResponse> => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: getAuthRouteHeaders(),
    credentials: "include",
  });

  const data = (await response.json()) as LogoutResponse;

  if (!response.ok) {
    throw new Error(data?.message || "Logout failed");
  }

  return data;
};

export const logout = async (): Promise<LogoutResponse> => (await commonAxios.post("iam/customer/logout")).data;

export const logoutAll = async (): Promise<LogoutResponse> => (await commonAxios.post("iam/customer/logout-all")).data;

export const changePassword = async (payload: ChangePasswordRequest): Promise<LogoutResponse> =>
  (await commonAxios.post("iam/customer/change-password", payload)).data;

export const forgotPassword = async (payload: ForgotPasswordRequest): Promise<SendOtpRegisterResponse> =>
  (await commonAxios.post("iam/customer/forgot-password", payload)).data;

export const verifyOtpForgotPassword = async (payload: VerifyOtpForgotPasswordRequest): Promise<VerifyOtpForgotPasswordResponse> =>
  (await commonAxios.post("iam/customer/verify-otp-reset-password", payload)).data;

export const resetPassword = async (payload: ResetPasswordRequest): Promise<ResetPasswordResponse> =>
  (await commonAxios.post("iam/customer/reset-password", payload)).data;

export const resetPasswordViaRoute = async (payload: ResetPasswordRequest): Promise<ResetPasswordViaRouteResponse> => {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: getAuthRouteHeaders({
      "Content-Type": "application/json",
    }),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ResetPasswordViaRouteResponse;

  if (!response.ok) {
    throw new Error(data.message || "Reset password failed");
  }

  return data;
};

// customer
export const getCustomerProfile = async (): Promise<AuthUser> => (await authAxios.get("iam/customer/profile")).data;

export const postCustomerRefresh = async (payload: RefreshTokenRequest): Promise<RefreshTokenResponse> =>
  (await commonAxios.post("iam/customer/refresh", payload)).data;

export const patchCustomerProfile = async (payload: AuthUserRequest): Promise<void> =>
  (await authAxios.patch("iam/customer/profile", payload)).data;

export const postCustomerChangePassword = async (payload: AuthUserChangePasswordRequest): Promise<void> =>
  (await authAxios.post("iam/customer/change-password", payload)).data;

export const postCustomerChangePhone = async (payload: { newPhone: string }): Promise<void> =>
  (await authAxios.post("iam/customer/change-phone", payload)).data;

export const postCustomerVerifyChangePhone = async (payload: AuthUserVerifyChangePhoneRequest): Promise<void> =>
  (await authAxios.post("iam/customer/verify-change-phone", payload)).data;

export const verifyOtpRegisterPrecheck = async (payload: VerifyOtpRegisterPrecheckRequest): Promise<VerifyOtpRegisterPrecheckResponse> =>
  (await commonAxios.post("iam/customer/verify-otp-login", payload)).data;

export const completeOtpLoginProfile = async (payload: CompleteOtpLoginProfileRequest): Promise<CompleteOtpLoginProfileResponse> =>
  (await commonAxios.post("iam/customer/complete-otp-login-profile", payload)).data;

export const completeOtpLoginProfileViaRoute = async (
  payload: CompleteOtpLoginProfileRequest,
): Promise<CompleteOtpLoginProfileViaRouteResponse> => {
  const response = await fetch("/api/auth/register/complete-otp-login-profile", {
    method: "POST",
    headers: getAuthRouteHeaders({
      "Content-Type": "application/json",
    }),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as CompleteOtpLoginProfileViaRouteResponse;

  if (!response.ok) {
    throw new Error(data.message || "Complete profile failed");
  }

  return data;
};

export const checkPhone = async (payload: CheckPhoneRequest): Promise<unknown> =>
  (
    await commonAxios.post("iam/customer/check-phone", payload, {
      headers: {
        "x-load-test-bypass": "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe",
      },
    })
  ).data;

export const logoutByAccessToken = async (accessToken: string): Promise<LogoutResponse> =>
  (
    await commonAxios.post("iam/customer/logout", undefined, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })
  ).data;
