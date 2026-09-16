import { AuthApiPath, PhoneChangeStatus, Gender } from "./auth.enum";

export type SendOtpRegisterRequest = {
  phone: string;
  type: AuthApiPath;
  recaptchaToken: string;
};

export type SendOtpRegisterResponse = {
  success: boolean;
  message: string;
};

export type VerifyOtpRegisterRequest = {
  otp: string;
  firstName: string;
  lastName?: string | null;
  password: string;
  /** Gửi kèm khi khách nhập email ở form đăng ký */
  email?: string | null;
};

export type AuthUser = {
  id: string;
  createdByType: string | null;
  updatedByType: string | null;
  deletedByType: string | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  status: string;
  email: string | null;
  phone: string;
  firstName: string;
  lastName: string;
  type: string;
  birthday: string | null;
  url: string | null;
  gender: string | null;
  segmentIds?: string[];
  pendingPhoneChange?: {
    newPhone: string;
    status: PhoneChangeStatus;
  };
};
export type AuthUserRequest = {
  firstName: string;
  email?: string | null;
  gender?: Gender | null;
  birthday?: string | null;
};

export type AuthUserChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type VerifyOtpRegisterResponse = {
  success: boolean;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenId?: string;
};

export type VerifyOtpOrderLookupRequest = {
  phone: string;
  otp: string;
};

export type VerifyOtpOrderLookupResponse = {
  success?: boolean;
  message?: string;
  accessToken: string;
  expiresIn?: number;
};

export type LoginRequest = {
  phone: string;
  password: string;
};

export type LoginResponse = {
  user: AuthUser;
  tokenId: string;
  accessToken: string;
  refreshToken: string;
};

export type LogoutResponse = {
  success?: boolean;
  message?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ForgotPasswordRequest = {
  phone: string;
};

export type VerifyOtpForgotPasswordRequest = {
  phone: string;
  otp: string;
};

export type VerifyOtpForgotPasswordResponse = {
  success: boolean;
  message: string;
  resetToken?: string;
  statusCode?: number;
};

export type ResetPasswordRequest = {
  resetToken: string;
  newPassword: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  tokenId?: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
  tokenId: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
  tokenId: string;
};

export type AuthUserVerifyChangePhoneRequest = {
  newPhone: string;
  otp: string;
};

export type AuthUserChangePhoneRequest = {
  newPhone: string;
};

export type VerifyOtpRegisterPrecheckRequest = {
  phone?: string;
  otp?: string;
};

export type VerifyOtpRegisterPrecheckResponse = {
  success: boolean;
  message?: string;
  profileSetupToken?: string;
};

export type CheckPhoneRequest = {
  phone: string;
  recaptchaToken: string;
};

export type CompleteOtpLoginProfileRequest = {
  profileSetupToken: string;
  firstName: string;
  email?: string | null;
  password: string;
};

export type CompleteOtpLoginProfileResponse = {
  success: boolean;
  message?: string;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenId?: string;
};
