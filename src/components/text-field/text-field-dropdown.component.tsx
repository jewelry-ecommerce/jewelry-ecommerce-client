import React, { useState } from "react";
import { Box, Typography, Menu, MenuItem, Stack } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StackRowAlignCenterJustBetween } from "../styled";
import { ANIMATION_TIME, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";

const useStyles = makeStyles<{ isFocused: boolean; hasValue: boolean; isOpen: boolean; disabled: boolean; hasError: boolean }>()((
  theme,
  { isFocused, hasValue, isOpen, disabled, hasError },
) => {
  const active = isFocused || hasValue || isOpen;
  return {
    root: {
      position: "relative",
      width: "100%",
      height: 50,
      border: "1px solid",
      borderColor: disabled ? "#DEDEDE" : hasError ? "#EF4444" : "#DEDEDE",
      borderRadius: 4,
      padding: `0 ${PADDING_GAP_LAYOUT}`,
      transition: `all ${ANIMATION_TIME}ms ease`,
      backgroundColor: disabled ? "#F5F5F5" : "#FFFFFF",
      cursor: disabled ? "not-allowed" : "pointer",
      overflow: "hidden",
    },
    main: {
      flex: 1,
      position: "relative",
      height: "100%",
    },
    label: {
      position: "absolute",
      left: 0,
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
      display: "flex",
      alignItems: "center",
    },
    valueText: {
      color: disabled ? "#A3A3A3" : "#000000",
      ...TYPOGRAPHY_STYLES.base.regular,
      fontSize: "14px",
    },
    icon: {
      color: disabled ? "#A3A3A3" : "#888888",
      transition: `all ${ANIMATION_TIME}ms ease`,
      transform: isOpen ? "rotate(180deg)" : "none",
    },
    error: {
      marginTop: 4,
      ...TYPOGRAPHY_STYLES.base.regular,
      color: "#EF4444",
    },
  };
});

interface Option {
  label: string;
  value: string;
}

interface TextFieldDropdownProps {
  label: string;
  value?: string;
  options: Option[];
  onSelect?: (val: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  onOpen?: () => void;
  name?: string;
  error?: string;
  required?: boolean;
}

const TextFieldDropdownComponent = ({
  label,
  value = "",
  options,
  onSelect,
  onBlur,
  disabled = false,
  onOpen,
  name,
  error,
  required = false,
}: TextFieldDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);
  const selectedOption = options.find((opt) => opt.value === value);
  const { classes } = useStyles({ isFocused: false, hasValue: value.length > 0, isOpen, disabled, hasError: Boolean(error) });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    onOpen?.();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    onBlur?.();
  };

  const handleItemClick = (val: string) => {
    onSelect?.(val);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <StackRowAlignCenterJustBetween className={classes.root} onClick={handleClick}>
        <Stack className={classes.main} justifyContent="center">
          <Typography className={classes.label}>
            {label}
            {required && (
              <Typography component="span" style={{ color: "#EF4444" }}>
                *
              </Typography>
            )}
          </Typography>
          <Box className={classes.inputWrap}>
            <Typography className={classes.valueText}>{selectedOption ? selectedOption.label : ""}</Typography>
          </Box>
        </Stack>
        {!disabled && <ExpandMoreIcon className={classes.icon} />}
      </StackRowAlignCenterJustBetween>
      {error && <Typography className={classes.error}>{error}</Typography>}
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: anchorEl ? anchorEl.clientWidth : undefined,
            marginTop: 4,
            maxHeight: 300,
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === value}
            onClick={() => handleItemClick(option.value)}
            sx={{
              ...TYPOGRAPHY_STYLES.base.regular,
              "&.Mui-selected": {
                backgroundColor: "rgba(23, 23, 23, 0.08)",
              },
              "&:hover": {
                backgroundColor: "rgba(23, 23, 23, 0.04)",
              },
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default TextFieldDropdownComponent;
