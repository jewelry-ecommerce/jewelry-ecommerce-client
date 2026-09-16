import React from "react";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { StepperContainer, StepperButton, ValueContainer, ValueText } from "./input-stepper.styles";
import { BoxProps, SxProps, Theme } from "@mui/material";

export interface InputStepperProps extends Omit<BoxProps, "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: "small" | "medium" | "large";
  variant?: "outlined" | "split";
  disabled?: boolean;
  sxButton?: SxProps<Theme>;
  sxValue?: SxProps<Theme>;
}

const InputStepperComponent = React.forwardRef<HTMLDivElement, InputStepperProps>(function InputStepper(
  {
    value,
    onChange,
    min,
    max,
    step = 1,
    size = "medium",
    variant = "outlined",
    disabled = false,
    sxButton,
    sxValue,
    className,
    sx,
    ...rest
  },
  ref,
) {
  const handleDecrement = () => {
    if (disabled) return;
    const newValue = value - step;
    if (min === undefined || newValue >= min) {
      onChange(newValue);
    } else if (value > min) {
      onChange(min);
    }
  };

  const handleIncrement = () => {
    if (disabled) return;
    const newValue = value + step;
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    } else if (value < max) {
      onChange(max);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onChange(min ?? 0);
      return;
    }

    const num = parseInt(val.replace(/\D/g, ""));
    if (isNaN(num)) return;

    let finalValue = num;
    if (min !== undefined && num < min) finalValue = min;
    if (max !== undefined && num > max) finalValue = max;

    onChange(finalValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const isDecrementDisabled = disabled || (min !== undefined && value <= min);
  const isIncrementDisabled = disabled || (max !== undefined && value >= max);

  return (
    <StepperContainer
      ref={ref}
      stepperSize={size}
      stepperVariant={variant}
      className={className}
      sx={sx}
      role="spinbutton"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      {...rest}
    >
      <StepperButton
        stepperSize={size}
        stepperVariant={variant}
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
        sx={sxButton}
        aria-label="Decrease value"
      >
        <RemoveIcon fontSize="inherit" />
      </StepperButton>

      <ValueContainer stepperSize={size} stepperVariant={variant} sx={sxValue}>
        <ValueText
          stepperSize={size}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          disabled={disabled}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </ValueContainer>

      <StepperButton
        stepperSize={size}
        stepperVariant={variant}
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
        sx={sxButton}
        aria-label="Increase value"
      >
        <AddIcon fontSize="inherit" />
      </StepperButton>
    </StepperContainer>
  );
});

export default InputStepperComponent;
