import * as Yup from "yup";
import { PHONE_REGEX, VALIDATION_MESSAGES } from "@/utils/constants/common.constant";
import type { PickupAddressValues } from "./order-exchange-address.types";

/** Cùng rule với địa chỉ giao hàng ở checkout (Họ tên, tỉnh, phường, địa chỉ, SĐT). */
export const orderExchangePickupAddressSchema: Yup.ObjectSchema<PickupAddressValues> = Yup.object({
  fullName: Yup.string().required("Vui lòng nhập đầy đủ Họ và tên"),
  provinceCode: Yup.number().required(VALIDATION_MESSAGES.required).min(1, VALIDATION_MESSAGES.required),
  wardCode: Yup.number().required(VALIDATION_MESSAGES.required).min(1, VALIDATION_MESSAGES.required),
  addressLine: Yup.string().required(VALIDATION_MESSAGES.required),
  phone: Yup.string().matches(PHONE_REGEX, VALIDATION_MESSAGES.phone).required(VALIDATION_MESSAGES.required),
  provinceName: Yup.string().default(""),
  wardName: Yup.string().default(""),
});
