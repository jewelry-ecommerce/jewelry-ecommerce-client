import { isPasswordStrongBrd } from "@/utils/auth/password-strength-brd";
import { z } from "zod";
import { emailRegex } from "./register.constant";

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Vui lòng nhập đầy đủ Họ và tên."),
    email: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || emailRegex.test(value), "Email không đúng định dạng."),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu.")
      .refine((value) => isPasswordStrongBrd(value), " "),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu."),
    acceptTerms: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.confirmPassword !== value.password) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mật khẩu không khớp.",
        path: ["confirmPassword"],
      });
    }
    if (!value.acceptTerms) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bạn cần đồng ý chính sách và điều khoản dịch vụ.",
        path: ["acceptTerms"],
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
