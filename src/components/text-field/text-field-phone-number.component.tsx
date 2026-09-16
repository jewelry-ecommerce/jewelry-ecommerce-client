import React, { useMemo, useState, type KeyboardEventHandler } from "react";
import { Box, InputBase, Typography, Stack, type SxProps, type Theme } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { StackRowAlignCenter } from "../styled";
import { ANIMATION_TIME, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles<{ isFocused: boolean; hasValue: boolean; hasError: boolean; disabled: boolean }>()((
  theme,
  { isFocused, hasValue, hasError, disabled },
) => {
  const active = isFocused || hasValue;
  return {
    root: {
      position: "relative",
      width: "100%",
      height: 50,
      border: "1px solid",
      borderColor: disabled ? "#DEDEDE" : hasError ? "#EF4444" : "#DEDEDE",
      borderRadius: 4,
      transition: `all ${ANIMATION_TIME}ms ease`,
      backgroundColor: disabled ? "#F5F5F5" : "#FFFFFF",
      overflow: "hidden",
    },
    prefix: {
      height: "100%",
      padding: `0 ${PADDING_GAP_LAYOUT}`,
      borderRight: "1px solid #DEDEDE",
      ...TYPOGRAPHY_STYLES.base.regular,
      fontStyle: "normal",
    },
    main: {
      flex: 1,
      position: "relative",
      height: "100%",
      padding: `0 ${PADDING_GAP_LAYOUT}`,
    },
    label: {
      position: "absolute",
      left: 15,
      top: active ? 3 : "50%",
      transform: active ? "none" : "translateY(-50%)",
      color: disabled ? "#A3A3A3" : "#9CA3AF",
      transition: `all ${ANIMATION_TIME}ms ease`,
      zIndex: 1,
      pointerEvents: "none",
      ...TYPOGRAPHY_STYLES.base.regular,
      fontSize: active ? "12px" : "14px",
    },
    inputWrap: {
      height: active ? "21px" : "100%",
      marginTop: active ? "14px" : 0,
    },
    input: {
      width: "100%",
      height: "100%",
      "& input": {
        padding: 0,
        height: "100%",
        color: disabled ? "#A3A3A3" : "#171717",
        WebkitTextFillColor: disabled ? "#A3A3A3 !important" : "inherit",
        ...TYPOGRAPHY_STYLES.base.regular,
        "&:-webkit-autofill": {
          WebkitBoxShadow: "0 0 0 100px white inset !important",
          WebkitTextFillColor: "inherit !important",
        },
      },
    },
    error: {
      marginTop: 4,
      ...TYPOGRAPHY_STYLES.base.regular,
      color: "#EF4444",
    },
  };
});

interface TextFieldPhoneNumberProps {
  label: string;
  value?: string;
  onChange?: (val: string) => void;
  onBlur?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  prefix?: string;
  disabled?: boolean;
  name?: string;
  error?: string;
  maxDigits?: number;
  className?: string;
  autoComplete?: string;
  sx?: SxProps<Theme>;
  required?: boolean;
}

const TextFieldPhoneNumberComponent = ({
  label,
  value = "",
  onChange,
  onBlur,
  onKeyDown,
  prefix = "+84",
  disabled = false,
  name,
  error,
  maxDigits = 10,
  className,
  autoComplete,
  sx,
  required = false,
}: TextFieldPhoneNumberProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const sanitizedValue = useMemo(() => value.replace(/\D/g, "").slice(0, maxDigits), [maxDigits, value]);
  const { classes } = useStyles({ isFocused, hasValue: sanitizedValue.length > 0, hasError: Boolean(error), disabled });

  const handleChange = (nextValue: string) => {
    const normalizedValue = nextValue.replace(/\D/g, "").slice(0, maxDigits);
    onChange?.(normalizedValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <Box sx={{ position: "relative", width: "100%", ...sx }} className={className}>
      <StackRowAlignCenter className={classes.root} sx={{ pointerEvents: disabled ? "none" : "auto" }}>
        <StackRowAlignCenter className={classes.prefix}>{prefix}</StackRowAlignCenter>
        <Stack className={classes.main} justifyContent="center">
          <Typography className={classes.label}>
            {label}
            {required && (
              <Typography component="span" style={{ color: "#EF4444" }}>
                *
              </Typography>
            )}
          </Typography>
          <StackRowAlignCenter className={classes.inputWrap}>
            <InputBase
              className={classes.input}
              value={sanitizedValue}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              onKeyDown={onKeyDown}
              placeholder=""
              type="text"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                maxLength: maxDigits,
              }}
              autoComplete={autoComplete}
              required={required}
              fullWidth
              disabled={disabled}
              name={name}
            />
          </StackRowAlignCenter>
        </Stack>
      </StackRowAlignCenter>
      {error && <Typography className={classes.error}>{error}</Typography>}
    </Box>
  );
};

export default TextFieldPhoneNumberComponent;
