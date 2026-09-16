export const enum AuthApiPath {
  REGISTER = "register",
  FORGOT = "forgot",
  CHANGE_PHONE = "change_phone",
  ORDER_LOOKUP = "order_lookup",
}

export const enum PhoneChangeStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export const enum OtpMethod {
  SMS = "SMS",
  ZNS = "ZNS",
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other",
}

export const GenderLabel: Record<Gender, string> = {
  [Gender.MALE]: "Nam",
  [Gender.FEMALE]: "Nữ",
  [Gender.OTHER]: "Khác",
};
