import React from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { StackAlignJustCenter } from "../styled";
import TextFieldComponent from "@/components/text-field/text-field.component";
import { Send01 } from "@untitledui/icons";
import { CheckboxComponent } from "@/components";
import { useTenantBrandName } from "@/components/providers.component";
import useStyles from "./form-contact.styles";

interface FormContactProps {
  title?: string;
  consentText?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  privacyPolicyAccepted?: boolean;
  onChangePrivacyPolicy?: (checked: boolean) => void;
  loading?: boolean;
  errorMsg?: string;
}

const DEFAULT_CONSENT_TEXT = "Bằng cách nhấp chọn, bạn đồng ý với Chính sách Bảo mật thông tin ở trang này.";

const FormContactComponent = ({
  title,
  consentText,
  placeholder = "Email của bạn",
  value,
  onChange,
  onSubmit,
  privacyPolicyAccepted = false,
  onChangePrivacyPolicy,
  loading,
  errorMsg,
}: FormContactProps) => {
  const { classes } = useStyles();
  const brandName = useTenantBrandName();
  const resolvedTitle = title?.trim() || `ĐĂNG KÝ NHẬN TIN VỀ BỘ SƯU TẬP, SỰ KIỆN VÀ TIN TỨC ĐỘC QUYỀN TỪ ${brandName}`;
  const resolvedConsentText = consentText?.trim() || DEFAULT_CONSENT_TEXT;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <StackAlignJustCenter className={classes.container}>
      <Typography className={classes.title}>{resolvedTitle}</Typography>

      <Box className={classes.inputWrapper}>
        <TextFieldComponent
          label={placeholder}
          error={errorMsg || undefined}
          value={value}
          onValueChange={onChange}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className={classes.textField}
          endAdornment={
            <IconButton className={classes.sendIcon} onClick={onSubmit} disabled={loading || !value.trim()}>
              {loading ? <CircularProgress size={17} color="inherit" /> : <Send01 size={18} color="#000" />}
            </IconButton>
          }
        />

        <Box className={classes.checkboxWrapper}>
          <CheckboxComponent
            shape="circle"
            iconType="dot"
            checked={privacyPolicyAccepted}
            onChange={onChangePrivacyPolicy}
            disabled={loading}
            title={resolvedConsentText}
            sxLabel={{
              fontSize: "14px !important",
            }}
          />
        </Box>
      </Box>
    </StackAlignJustCenter>
  );
};

export default FormContactComponent;
