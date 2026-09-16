import React, { useState, useEffect, useRef, useMemo, memo, useCallback, forwardRef, useImperativeHandle } from "react";
import { Box, Typography, MenuItem, Stack, InputBase, CircularProgress, Portal, useMediaQuery } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { ChevronDown } from "@untitledui/icons";
import { StackRowAlignCenterJustBetween } from "../styled";
import { ANIMATION_TIME, PADDING_GAP_LAYOUT } from "@/utils/constants/style.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const DROPDOWN_GAP = 4;
const DROPDOWN_MAX_HEIGHT = 250;
const MOBILE_LAYOUT_SYNC_DELAYS_MS = [50, 120, 280, 450] as const;

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
      cursor: "text",
      overflow: "hidden",
      "&:hover": {
        borderColor: disabled ? "#DEDEDE" : "#171717",
      },
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
      height: active ? "24px" : "100%",
      marginTop: active ? "16px" : 0,
      display: "flex",
      alignItems: "center",
    },
    inputBase: {
      width: "100%",
      color: disabled ? "#A3A3A3" : "#000000",
      ...TYPOGRAPHY_STYLES.base.regular,
      fontSize: "14px",
      "& input": {
        padding: 0,
        height: "22px",
        "&::placeholder": {
          color: "#A1A1AA",
          opacity: 1,
        },
      },
    },
    iconGroup: {
      display: "flex",
      alignItems: "center",
      gap: 2,
    },
    icon: {
      flexShrink: 0,
      transition: `all ${ANIMATION_TIME}ms ease`,
      transform: isOpen ? "rotate(180deg)" : "none",
      cursor: disabled ? "default" : "pointer",
    },
    error: {
      marginTop: 4,
      ...TYPOGRAPHY_STYLES.base.regular,
      color: "#EF4444",
    },
    menuList: {
      maxHeight: 250,
      overflowY: "auto",
      padding: "4px 0",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px 0",
    },
    noResult: {
      padding: "16px",
      textAlign: "center",
      color: "#71717A",
      ...TYPOGRAPHY_STYLES.base.regular,
      fontSize: "14px",
    },
    dropdownPaper: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      zIndex: 10,
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      border: "1px solid #F4F4F5",
    },
    dropdownPaperMobile: {
      position: "fixed",
      zIndex: 1300,
    },
  };
});

interface Option {
  label: string;
  value: string | number;
}

export interface TextFieldSelectSearchRef {
  focus: () => void;
}

interface TextFieldSelectSearchProps {
  label: string;
  value?: string | number;
  options: Option[];
  onSelect?: (val: string | number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  onSearch?: (val: string) => void;
  searchValue?: string;
  isLoading?: boolean;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

const TextFieldSelectSearchComponent = memo(
  forwardRef<TextFieldSelectSearchRef, TextFieldSelectSearchProps>(function TextFieldSelectSearchComponent(
    {
      label,
      value = "",
      options,
      onSelect,
      onBlur,
      disabled = false,
      onSearch,
      searchValue = "",
      isLoading = false,
      error,
      placeholder = "Gõ để tìm kiếm...",
      required = false,
    },
    ref,
  ) {
    const isMobile = useMediaQuery("(max-width:810px)");
    const [isOpen, setIsOpen] = useState(false);
    const [mobileDropdownStyle, setMobileDropdownStyle] = useState<React.CSSProperties>({});
    const [mobileListMaxHeight, setMobileListMaxHeight] = useState(DROPDOWN_MAX_HEIGHT);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuListRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = useMemo(() => options.find((opt) => String(opt.value) === String(value)), [options, value]);
    const [inputValue, setInputValue] = useState("");

    const filteredOptions = useMemo(() => {
      if (!inputValue || inputValue === selectedOption?.label) return options;
      return options.filter((o) => o.label.toLowerCase().includes(inputValue.toLowerCase()));
    }, [options, inputValue, selectedOption?.label]);

    const { classes } = useStyles({
      isFocused: isOpen,
      hasValue: Boolean(value) || Boolean(inputValue),
      isOpen,
      disabled,
      hasError: Boolean(error),
    });

    useEffect(() => {
      if (selectedOption) {
        setInputValue(selectedOption.label);
      } else if (!value) {
        setInputValue("");
      }
    }, [selectedOption?.label, value]);

    const handleOpen = useCallback(() => {
      if (disabled) return;
      setIsOpen(true);
      onSearch?.("");
    }, [disabled, onSearch]);

    const updateMobileDropdownLayout = useCallback(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper || !isMobile) return;

      const rect = wrapper.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const viewportOffsetTop = viewport?.offsetTop ?? 0;
      const viewportOffsetLeft = viewport?.offsetLeft ?? 0;
      const fieldBottom = rect.bottom;
      const availableHeight = viewportHeight - (fieldBottom - viewportOffsetTop) - 8;
      const listMaxHeight = Math.min(DROPDOWN_MAX_HEIGHT, Math.max(60, availableHeight));

      setMobileDropdownStyle({
        top: fieldBottom + viewportOffsetTop + DROPDOWN_GAP,
        left: rect.left + viewportOffsetLeft,
        width: rect.width,
      });
      setMobileListMaxHeight(listMaxHeight);
    }, [isMobile]);

    const scheduleMobileLayoutSync = useCallback(() => {
      if (!isMobile) return () => undefined;

      updateMobileDropdownLayout();
      const frameId = requestAnimationFrame(updateMobileDropdownLayout);
      const timeoutIds = MOBILE_LAYOUT_SYNC_DELAYS_MS.map((delay) => window.setTimeout(updateMobileDropdownLayout, delay));

      return () => {
        cancelAnimationFrame(frameId);
        timeoutIds.forEach((id) => window.clearTimeout(id));
      };
    }, [isMobile, updateMobileDropdownLayout]);

    const focusInput = useCallback(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, []);

    useEffect(() => {
      if (!isOpen || !isMobile) return;

      const cancelLayoutSync = scheduleMobileLayoutSync();

      const viewport = window.visualViewport;
      viewport?.addEventListener("resize", updateMobileDropdownLayout);
      viewport?.addEventListener("scroll", updateMobileDropdownLayout);
      window.addEventListener("resize", updateMobileDropdownLayout);

      return () => {
        cancelLayoutSync();
        viewport?.removeEventListener("resize", updateMobileDropdownLayout);
        viewport?.removeEventListener("scroll", updateMobileDropdownLayout);
        window.removeEventListener("resize", updateMobileDropdownLayout);
      };
    }, [isOpen, isMobile, scheduleMobileLayoutSync, updateMobileDropdownLayout]);

    const handleFieldActivate = useCallback(() => {
      if (disabled) return;
      handleOpen();
      if (isMobile) {
        scheduleMobileLayoutSync();
        focusInput();
        return;
      }
      inputRef.current?.focus();
    }, [disabled, focusInput, handleOpen, isMobile, scheduleMobileLayoutSync]);

    const handleMobilePointerDownCapture = useCallback(
      (event: React.PointerEvent<HTMLElement>) => {
        if (disabled || !isMobile) return;
        event.preventDefault();
        handleOpen();
        scheduleMobileLayoutSync();
        focusInput();
      },
      [disabled, focusInput, handleOpen, isMobile, scheduleMobileLayoutSync],
    );

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          handleOpen();
          if (isMobile) {
            scheduleMobileLayoutSync();
            focusInput();
            return;
          }
          inputRef.current?.focus();
        },
      }),
      [focusInput, handleOpen, isMobile, scheduleMobileLayoutSync],
    );

    const handleClose = useCallback(() => {
      setIsOpen(false);
      onBlur?.();

      const trimmed = inputValue.trim();

      if (!trimmed) {
        setInputValue("");
        if (value) {
          onSelect?.(0);
          onSearch?.("");
        }
        return;
      }

      if (selectedOption && trimmed === selectedOption.label) {
        return;
      }

      const matchedOption = options.find((option) => option.label.toLowerCase() === trimmed.toLowerCase());

      if (matchedOption) {
        onSelect?.(matchedOption.value);
        setInputValue(matchedOption.label);
        onSearch?.("");
        return;
      }

      if (selectedOption) {
        setInputValue(selectedOption.label);
      }
    }, [inputValue, onBlur, onSearch, onSelect, options, selectedOption, value]);

    useEffect(() => {
      if (!isOpen) return;

      const handlePointerDown = (event: MouseEvent | TouchEvent) => {
        const target = event.target as Node;
        const inField = wrapperRef.current?.contains(target);
        const inDropdown = dropdownRef.current?.contains(target);
        if (!inField && !inDropdown) {
          handleClose();
        }
      };

      const handleScroll = (event: Event) => {
        const target = event.target as Node;
        if (menuListRef.current && (menuListRef.current === target || menuListRef.current.contains(target))) {
          return;
        }
        if (isMobile && document.activeElement === inputRef.current) return;
        handleClose();
      };

      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("touchstart", handlePointerDown);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }, [isOpen, handleClose, isMobile]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        onSearch?.(val);
        if (!isOpen) setIsOpen(true);
      },
      [isOpen, onSearch],
    );

    const handleItemClick = useCallback(
      (event: React.MouseEvent, option: Option) => {
        event.stopPropagation();
        setIsOpen(false);
        onSelect?.(option.value);
        setInputValue(option.label);
        onSearch?.("");
        setTimeout(() => {
          inputRef.current?.blur();
        }, 0);
      },
      [onSelect, onSearch],
    );

    const handleInputFocus = useCallback(() => {
      handleOpen();
      if (isMobile) scheduleMobileLayoutSync();
    }, [handleOpen, isMobile, scheduleMobileLayoutSync]);

    const dropdownNode = isOpen ? (
      <Box
        ref={dropdownRef}
        className={isMobile ? `${classes.dropdownPaper} ${classes.dropdownPaperMobile}` : classes.dropdownPaper}
        style={isMobile ? mobileDropdownStyle : undefined}
        role="listbox"
      >
        <Box ref={menuListRef} className={classes.menuList} sx={isMobile ? { maxHeight: mobileListMaxHeight } : undefined}>
          {isLoading ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress size={24} sx={{ color: "#171717" }} />
            </Box>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <MenuItem
                key={option.value}
                role="option"
                aria-selected={String(option.value) === String(value)}
                selected={String(option.value) === String(value)}
                onClick={(e) => handleItemClick(e, option)}
                sx={{
                  padding: "10px 12px",
                  ...TYPOGRAPHY_STYLES.base.regular,
                  fontSize: "14px",
                  "&.Mui-selected": {
                    backgroundColor: "rgba(23, 23, 23, 0.08)",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "rgba(23, 23, 23, 0.12)",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "rgba(23, 23, 23, 0.04)",
                  },
                }}
              >
                {option.label}
              </MenuItem>
            ))
          ) : (
            <Typography className={classes.noResult}>Không có kết quả</Typography>
          )}
        </Box>
      </Box>
    ) : null;

    return (
      <Box sx={{ width: "100%" }}>
        <Box ref={wrapperRef} sx={{ position: "relative", width: "100%" }}>
          <StackRowAlignCenterJustBetween
            className={classes.root}
            onPointerDownCapture={handleMobilePointerDownCapture}
            onClick={() => {
              if (!isMobile) handleFieldActivate();
            }}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <Stack className={classes.main} justifyContent="center">
              <Typography className={classes.label}>
                {label}
                {required && <span style={{ color: "#EF4444" }}>*</span>}
              </Typography>
              <Box className={classes.inputWrap}>
                <InputBase
                  inputRef={inputRef}
                  className={classes.inputBase}
                  required={required}
                  placeholder={isOpen ? placeholder : ""}
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  disabled={disabled}
                  fullWidth
                  autoComplete="off"
                />
              </Box>
            </Stack>

            <Box
              className={classes.iconGroup}
              onClick={(event) => {
                event.stopPropagation();
                handleFieldActivate();
              }}
            >
              <ChevronDown className={classes.icon} size={18} color="#737373" />
            </Box>
          </StackRowAlignCenterJustBetween>

          {!isMobile && dropdownNode}
        </Box>

        {isMobile ? <Portal>{dropdownNode}</Portal> : null}

        {error && <Typography className={classes.error}>{error}</Typography>}
      </Box>
    );
  }),
);

export default TextFieldSelectSearchComponent;
