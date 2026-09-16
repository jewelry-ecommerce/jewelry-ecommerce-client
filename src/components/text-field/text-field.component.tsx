import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Box, InputAdornment, InputBase, Typography, Stack, type SxProps, type Theme } from "@mui/material";
import type { InputBaseProps } from "@mui/material/InputBase";
import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { StackRowAlignCenter } from "../styled";
import { ANIMATION_TIME, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles<{
  isFocused: boolean;
  hasValue: boolean;
  hasError: boolean;
  hasEndAdornment: boolean;
  multiline: boolean;
  disabled: boolean;
}>()((_theme, { isFocused, hasValue, hasError, hasEndAdornment, multiline, disabled }) => {
  const active = isFocused || hasValue;
  return {
    root: {
      position: "relative",
      width: "100%",
      minHeight: multiline ? 140 : 50,
      border: "1px solid",
      borderColor: disabled ? "#DEDEDE" : hasError ? "#EF4444" : "#DEDEDE",
      borderRadius: 4,
      display: "flex",
      alignItems: multiline ? "stretch" : "center",
      transition: `all ${ANIMATION_TIME}ms ease`,
      backgroundColor: disabled ? "#F5F5F5" : "#FFFFFF",
      overflow: "hidden",
      padding: `0 ${PADDING_GAP_LAYOUT}`,
    },
    main: {
      flex: 1,
      position: "relative",
      height: "100%",
    },
    label: {
      position: "absolute",
      left: 0,
      top: active ? 0 : multiline ? 16 : "50%",
      transform: active || multiline ? "none" : "translateY(-50%)",
      color: disabled ? "#A3A3A3" : "#6B7280",
      transition: `all ${ANIMATION_TIME}ms ease`,
      zIndex: 1,
      pointerEvents: "none",
      ...TYPOGRAPHY_STYLES.base.regular,
      fontSize: active ? "12px" : "14px",
    },
    inputWrap: {
      minHeight: multiline ? 96 : active ? "21px" : "100%",
      height: multiline ? "auto" : active ? "21px" : "100%",
      marginTop: active ? (multiline ? "24px" : "16px") : multiline ? "24px" : 0,
      display: "flex",
      alignItems: "center",
      paddingRight: hasEndAdornment ? 28 : 0,
    },
    input: {
      width: "100%",
      height: "100%",
      "& input, & textarea": {
        animationName: "onAutoFillCancel",
        animationDuration: "0.01s",
        paddingLeft: "0 !important",
        height: "100%",
        color: disabled ? "#A3A3A3" : "#171717",
        WebkitTextFillColor: disabled ? "#A3A3A3 !important" : "inherit",
        ...TYPOGRAPHY_STYLES.base.regular,
        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
          WebkitAppearance: "none",
          margin: 0,
        },
        "&[type=number]": {
          MozAppearance: "textfield",
        },
        "&:-webkit-autofill": {
          animationName: "onAutoFillStart",
          WebkitBoxShadow: "0 0 0 100px white inset !important",
          WebkitTextFillColor: "inherit !important",
        },
      },
      "& textarea": {
        padding: "0 !important",
        resize: "none",
      },
      "@keyframes onAutoFillStart": {},
      "@keyframes onAutoFillCancel": {},
    },
    error: {
      marginTop: 4,
      ...TYPOGRAPHY_STYLES.base.regular,
      color: "#EF4444",
    },
    endAdornment: {
      position: "absolute",
      top: "50%",
      right: 0,
      transform: "translateY(-50%)",
      height: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
  };
});

interface TextFieldProps {
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: InputBaseProps["onChange"];
  onValueChange?: (val: string) => void;
  onBlur?: InputBaseProps["onBlur"];
  onFocus?: InputBaseProps["onFocus"];
  type?: string;
  name?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  multiline?: boolean;
  rows?: number;
  sx?: SxProps<Theme>;
  alwaysShrinkLabel?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

function resolveTextFieldInputConfig(type: string) {
  const normalizedType = type.trim().toLowerCase();

  if (normalizedType === "numeric") {
    return {
      type: "text" as const,
      inputProps: {
        inputMode: "numeric" as const,
        pattern: "[0-9]*",
      },
    };
  }
  return {
    type,
    inputProps: undefined,
  };
}

const TextFieldComponent = forwardRef<HTMLInputElement, TextFieldProps>(function TextFieldComponent(
  {
    label,
    value,
    defaultValue,
    onChange,
    onValueChange,
    onBlur,
    onFocus,
    type = "text",
    name,
    disabled = false,
    error,
    className,
    required = false,
    autoComplete,
    placeholder,
    startAdornment,
    endAdornment,
    onKeyDown,
    multiline = false,
    rows,
    sx,
    alwaysShrinkLabel = false,
    inputMode,
  },
  ref,
) {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const [hasAutofilledValue, setHasAutofilledValue] = useState(false);
  const innerRef = useRef<HTMLInputElement | null>(null);
  const displayValue = isControlled ? value : innerValue;
  const { type: resolvedType, inputProps: numericInputProps } = resolveTextFieldInputConfig(type);
  const inputProps = numericInputProps ?? (inputMode ? { inputMode } : undefined);
  const { classes } = useStyles({
    isFocused,
    hasValue: alwaysShrinkLabel || Boolean(displayValue) || hasAutofilledValue,
    hasError: Boolean(error),
    hasEndAdornment: Boolean(endAdornment),
    multiline,
    disabled,
  });

  const syncAutofilledValue = () => {
    const domValue = innerRef.current?.value ?? "";
    setHasAutofilledValue(Boolean(domValue));
  };

  useEffect(() => {
    if (!isControlled) return;
    setInnerValue(value ?? "");
  }, [isControlled, value]);

  useEffect(() => {
    const t1 = window.setTimeout(syncAutofilledValue, 0);
    const t2 = window.setTimeout(syncAutofilledValue, 300);
    const t3 = window.setTimeout(syncAutofilledValue, 1000);

    // Chrome password manager/autofill can populate values a bit later after initial paint.
    // Poll briefly after mount so label state follows autofilled value without requiring user interaction.
    const start = Date.now();
    const interval = window.setInterval(() => {
      syncAutofilledValue();
      if (Date.now() - start > 6000) {
        window.clearInterval(interval);
      }
    }, 250);

    const handlePageShow = () => syncAutofilledValue();
    const handleWindowFocus = () => syncAutofilledValue();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncAutofilledValue();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearInterval(interval);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const handleFocus: InputBaseProps["onFocus"] = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur: InputBaseProps["onBlur"] = (event) => {
    setIsFocused(false);
    syncAutofilledValue();
    onBlur?.(event);
  };

  const handleChange: InputBaseProps["onChange"] = (event) => {
    if (!isControlled) {
      setInnerValue(event.target.value);
    }
    onChange?.(event);
    onValueChange?.(event.target.value);
    syncAutofilledValue();
  };

  return (
    <Box sx={{ position: "relative", width: "100%", ...sx }} className={className}>
      <StackRowAlignCenter className={classes.root} sx={{ pointerEvents: disabled ? "none" : "auto" }}>
        <Stack className={classes.main} justifyContent="center">
          <Typography className={classes.label}>
            {label}
            {required && <span style={{ color: "#EF4444" }}>*</span>}
          </Typography>
          <Box className={classes.inputWrap}>
            <InputBase
              className={classes.input}
              inputRef={(el) => {
                innerRef.current = el;
                if (typeof ref === "function") {
                  ref(el);
                } else if (ref) {
                  (ref as any).current = el;
                }
              }}
              value={displayValue ?? ""}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onAnimationStart={syncAutofilledValue}
              placeholder={placeholder ?? ""}
              type={resolvedType}
              inputProps={inputProps}
              multiline={multiline}
              rows={rows}
              name={name}
              required={required}
              autoComplete={autoComplete}
              startAdornment={startAdornment ? <InputAdornment position="start">{startAdornment}</InputAdornment> : undefined}
              onKeyDown={onKeyDown}
              fullWidth
              disabled={disabled}
            />
          </Box>
          {endAdornment && <Box className={classes.endAdornment}>{endAdornment}</Box>}
        </Stack>
      </StackRowAlignCenter>
      {error && <Typography className={classes.error}>{error}</Typography>}
    </Box>
  );
});

export default TextFieldComponent;
