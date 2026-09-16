export const PHONE_REGEX = /^(0|\+84)?(3|5|7|8|9)[0-9]{8}$/;

export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const TAX_CODE_REGEX = /^[0-9]{10}(-[0-9]{3})?$/;

export const VALIDATION_MESSAGES = {
  required: "Vui lòng nhập thông tin này",
  email: "Email không hợp lệ",
  phone: "Số điện thoại không hợp lệ (VD: 0912345678)",
  taxCode: "Mã số thuế không đúng định dạng (VD: 0312345678 hoặc 0312345678-001)",
  taxCodeNoSpace: "Mã số thuế không được có khoảng trắng",
};

export const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "đ";
