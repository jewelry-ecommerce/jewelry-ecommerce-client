import React, { useMemo } from "react";
import { Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { StackRowAlignCenter } from "@/components/styled";
import usePasswordRequirementStyles from "./password-requirement.styles";

export const hasMinLength = (password: string) => password.length >= 8;
export const hasLowercase = (password: string) => /[a-z]/.test(password);
export const hasUppercase = (password: string) => /[A-Z]/.test(password);
export const hasNumber = (password: string) => /\d/.test(password);
export const hasSpecial = (password: string) => /[^A-Za-z0-9]/.test(password);

interface PasswordRequirementProps {
  password?: string;
  className?: string;
}

const PasswordRequirement = ({ password = "", className }: PasswordRequirementProps) => {
  const { classes, cx } = usePasswordRequirementStyles();

  const passwordChecks = useMemo(
    () => [
      { label: "Tối thiểu 8 ký tự.", ok: hasMinLength(password) },
      {
        label: "Bao gồm số, chữ viết hoa, chữ viết thường.",
        ok: hasNumber(password) && hasLowercase(password) && hasUppercase(password),
      },
      { label: "Bao gồm ít nhất 1 ký tự đặc biệt.", ok: hasSpecial(password) },
    ],
    [password],
  );

  return (
    <Stack className={cx(classes.root, className)}>
      <Typography className={classes.title}>Yêu cầu mật khẩu</Typography>
      <Stack spacing={0.8} className={classes.hintMargin}>
        {passwordChecks.map((item) => (
          <StackRowAlignCenter key={item.label} className={classes.item}>
            <CheckIcon className={item.ok ? classes.iconChecked : classes.iconUnChecked} />
            <Typography className={item.ok ? classes.text : classes.textDisabled}>{item.label}</Typography>
          </StackRowAlignCenter>
        ))}
      </Stack>
    </Stack>
  );
};

export default PasswordRequirement;
