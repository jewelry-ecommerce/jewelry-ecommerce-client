import * as Yup from "yup";
import { EMAIL_REGEX, TAX_CODE_REGEX, VALIDATION_MESSAGES, PHONE_REGEX } from "@/utils/constants/common.constant";
import { CheckoutSession } from "@/utils/api/checkout/checkout.interface";
import { PaymentMethod } from "@/utils/api/order/order.enum";
import type { AuthUser } from "@/utils/api/auth/auth.interface";
import { getCheckoutProfilePrefill } from "@/app/(layout-focus)/thanh-toan/_utils/checkout-profile-prefill.util";
import { isPreOrderReserveCheckout } from "@/utils/api/pre-order/pre-order-checkout.util";

export interface CheckoutFormValues {
  companyName: string;
  companyAddress: string;
  taxCode: string;
  vatEmail: string;
  note: string;
  paymentMethod: string;
  consent: boolean;
  isAllowCheck: boolean;
  /** Pre-order lần 1 only. Optional. */
  consentCollabPartnerSharing: boolean;
  showVat: boolean;
  showNote: boolean;
  // Address fields
  lastName: string;
  firstName: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  addressLine: string;
  receiverPhone: string;
  /** Pre-order lần 1 only. Empty on retail / pre-order lần 2. */
  email: string;
  saveAddress: boolean;
}

export const CART_USER_ID = "b1c2d3e4-f5a6-7890-1234-56789abcdef0";
export const POINTS_TO_VND_RATE = 10_000_000 / 9_000;

export const VALID_PAYMENT_METHODS = Object.values(PaymentMethod);

export const getCheckoutInitialValues = (
  session?: CheckoutSession | null,
  isLoggedIn: boolean = false,
  user?: AuthUser | null,
): CheckoutFormValues => {
  const values: CheckoutFormValues = {
    companyName: session?.vatInvoice?.companyName || "",
    companyAddress: session?.vatInvoice?.companyAddress || "",
    taxCode: session?.vatInvoice?.taxCode || "",
    vatEmail: session?.vatInvoice?.email || "",
    note: session?.note || "",
    paymentMethod: isPreOrderReserveCheckout(session) ? "" : session?.paymentMethod || PaymentMethod.QR_CODE,
    consent: isLoggedIn ? true : session?.consentThirdPartySharing || false,
    isAllowCheck: false,
    consentCollabPartnerSharing: session?.consentCollabPartnerSharing || false,
    showVat: !!session?.vatInvoice,
    showNote: !!session?.note,
    lastName: session?.shippingAddress?.lastName || "",
    firstName: session?.shippingAddress?.firstName || "",
    provinceCode: session?.shippingAddress?.provinceCode || 0,
    provinceName: session?.shippingAddress?.provinceName || "",
    wardCode: session?.shippingAddress?.wardCode || 0,
    wardName: session?.shippingAddress?.wardName || "",
    addressLine: session?.shippingAddress?.addressLine || "",
    receiverPhone: session?.shippingAddress?.receiverPhone || "",
    email: isPreOrderReserveCheckout(session) ? session?.contactEmail?.trim() || user?.email?.trim() || "" : "",
    saveAddress: false,
  };

  if (isLoggedIn && user) {
    const prefill = getCheckoutProfilePrefill(user);
    if (!values.firstName.trim()) values.firstName = prefill.firstName;
    if (!values.receiverPhone.trim()) values.receiverPhone = prefill.receiverPhone;
  }

  return values;
};

export const getCheckoutValidationSchema = (
  activeIsLoggedIn: boolean,
  activeIsAddressSaved: boolean,
  paymentRequired: boolean = true,
  requireEmail: boolean = false,
) =>
  Yup.object({
    companyName: Yup.string().when("showVat", {
      is: true,
      then: (schema) => schema.required(VALIDATION_MESSAGES.required),
      otherwise: (schema) => schema.notRequired(),
    }),
    companyAddress: Yup.string().when("showVat", {
      is: true,
      then: (schema) => schema.required(VALIDATION_MESSAGES.required),
      otherwise: (schema) => schema.notRequired(),
    }),
    taxCode: Yup.string().when("showVat", {
      is: true,
      then: (schema) =>
        schema
          .required(VALIDATION_MESSAGES.required)
          .test("no-space", VALIDATION_MESSAGES.taxCodeNoSpace, (value) => !/\s/.test(value || ""))
          .matches(TAX_CODE_REGEX, VALIDATION_MESSAGES.taxCode),
      otherwise: (schema) => schema.notRequired(),
    }),
    vatEmail: Yup.string().when("showVat", {
      is: true,
      then: (schema) => schema.required(VALIDATION_MESSAGES.required).matches(EMAIL_REGEX, VALIDATION_MESSAGES.email),
      otherwise: (schema) => schema.notRequired(),
    }),
    note: Yup.string().when("showNote", {
      is: true,
      then: (schema) => schema.required(VALIDATION_MESSAGES.required),
      otherwise: (schema) => schema.notRequired(),
    }),
    consent: activeIsLoggedIn
      ? Yup.boolean().notRequired()
      : Yup.boolean().oneOf([true], "Vui lòng đồng ý với điều khoản chia sẻ thông tin."),
    consentCollabPartnerSharing: Yup.boolean().notRequired().default(false),
    isAllowCheck: Yup.boolean().notRequired().default(false),
    // Address validation
    lastName: Yup.string().notRequired(),
    firstName: activeIsAddressSaved ? Yup.string().notRequired() : Yup.string().required("Vui lòng nhập đầy đủ Họ và tên"),
    provinceCode: activeIsAddressSaved
      ? Yup.number().notRequired()
      : Yup.number().required(VALIDATION_MESSAGES.required).min(1, VALIDATION_MESSAGES.required),
    wardCode: activeIsAddressSaved
      ? Yup.number().notRequired()
      : Yup.number().required(VALIDATION_MESSAGES.required).min(1, VALIDATION_MESSAGES.required),
    addressLine: activeIsAddressSaved ? Yup.string().notRequired() : Yup.string().required(VALIDATION_MESSAGES.required),
    receiverPhone: activeIsAddressSaved
      ? Yup.string().notRequired().default("")
      : Yup.string().matches(PHONE_REGEX, VALIDATION_MESSAGES.phone).required(VALIDATION_MESSAGES.required).default(""),
    email: requireEmail
      ? Yup.string().trim().required(VALIDATION_MESSAGES.required).matches(EMAIL_REGEX, VALIDATION_MESSAGES.email)
      : Yup.string().notRequired().default(""),
    // Pre-order lần 1: không bắt paymentMethod
    paymentMethod: paymentRequired
      ? Yup.string().oneOf(VALID_PAYMENT_METHODS, VALIDATION_MESSAGES.required).default(PaymentMethod.QR_CODE)
      : Yup.string().notRequired().default(""),
    showVat: Yup.boolean().default(false),
    showNote: Yup.boolean().default(false),
    provinceName: Yup.string().default(""),
    wardName: Yup.string().default(""),
    saveAddress: Yup.boolean().notRequired(),
  });
