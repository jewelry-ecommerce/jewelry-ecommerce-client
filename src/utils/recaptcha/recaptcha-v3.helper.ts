/**
 * Demo-only adapter. Auth and checkout retain the same call contract without
 * loading a third-party script or requiring a site key.
 */
export const SendOtpRecaptchaAction = {
  REGISTER: "register",
  CHANGE_PHONE: "change_phone",
  ORDER_LOOKUP: "order_lookup",
  FORGOT_PASSWORD: "forgot",
  CHECK_PHONE: "check_phone",
  PLACE_ORDER: "checkout_place_order",
} as const;

export type SendOtpRecaptchaActionName = (typeof SendOtpRecaptchaAction)[keyof typeof SendOtpRecaptchaAction];

export const RECAPTCHA_CLIENT_FAILURE_MESSAGE = "";
export const getRecaptchaTokenForSendOtp = async (_action: SendOtpRecaptchaActionName): Promise<string | null> => null;
