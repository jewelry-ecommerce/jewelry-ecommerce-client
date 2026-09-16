import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import * as React from "react";
import useStyles from "./number-spinner.styles";

function setRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  if (ref) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

export default function NumberSpinner({
  id: idProp,
  label,
  error,
  size = "medium",
  isMiniCart = false,
  format,
  ...other
}: BaseNumberField.Root.Props & {
  label?: React.ReactNode;
  size?: "small" | "medium";
  error?: boolean;
  isMiniCart?: boolean;
}) {
  let id = React.useId();
  if (idProp) {
    id = idProp;
  }
  const { classes } = useStyles();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  function dismissKeyboard() {
    inputRef.current?.blur();
  }

  return (
    <BaseNumberField.Root
      {...other}
      // Quantity must stay plain digits — locale grouping (1,013) breaks edit/parse.
      format={{ useGrouping: false, maximumFractionDigits: 0, ...format }}
      render={(props, state) => (
        <FormControl
          size={size}
          ref={props.ref}
          disabled={state.disabled}
          required={state.required}
          error={error}
          variant="outlined"
          className={classes.root}
        >
          {props.children}
        </FormControl>
      )}
    >
      <Box
        component="form"
        noValidate
        className={classes.buttonGroup}
        onSubmit={(e) => {
          e.preventDefault();
          dismissKeyboard();
        }}
      >
        <BaseNumberField.Decrement
          render={
            <Button
              type="button"
              variant="outlined"
              aria-label="Decrease"
              size={size}
              className={isMiniCart ? classes.miniCartButton : classes.button}
            />
          }
        >
          <RemoveIcon fontSize={size} />
        </BaseNumberField.Decrement>

        <BaseNumberField.Input
          id={id}
          render={(props, state) => {
            const { onKeyDown, onBlur, onFocus, ref, ...inputProps } = props;

            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.replace(/[^\d]/g, "");
              // Only allow integers - strip separators/decimals from locale formatting.
              if (value !== e.target.value) {
                e.target.value = value;
              }
              if (value === "" || /^\d+$/.test(value)) {
                props.onChange?.(e);
              }
            };

            const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                dismissKeyboard();
                return;
              }
              onKeyDown?.(e);
            };

            const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              if (target.value === "" || target.value === "0") {
                target.value = "1";
              }
              onBlur?.(e);
            };

            const setInputRef = (node: HTMLInputElement | null) => {
              inputRef.current = node;
              setRef(ref, node);
            };

            return (
              <OutlinedInput
                inputRef={setInputRef}
                value={state.inputValue}
                onChange={handleChange}
                onFocus={onFocus}
                className={isMiniCart ? classes.miniCartInput : classes.input}
                slotProps={{
                  input: {
                    ...inputProps,
                    onBlur: handleBlur,
                    onKeyDown: handleKeyDown,
                    size: isMiniCart ? 3 : Math.max((other.min?.toString() || "").length, state.inputValue.length || 1) + 1,
                    pattern: "[0-9]*",
                    inputMode: "numeric",
                    enterKeyHint: "done",
                  },
                }}
              />
            );
          }}
        />

        <BaseNumberField.Increment
          render={
            <Button
              type="button"
              variant="outlined"
              aria-label="Increase"
              size={size}
              className={isMiniCart ? classes.miniCartButton : classes.button}
            />
          }
        >
          <AddIcon fontSize={size} />
        </BaseNumberField.Increment>
      </Box>
    </BaseNumberField.Root>
  );
}
