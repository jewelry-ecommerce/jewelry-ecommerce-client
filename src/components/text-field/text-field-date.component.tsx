import React, { useEffect, useMemo, useRef, useState } from "react";
import TextFieldComponent from "./text-field.component";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Box, ClickAwayListener, Paper, Popper, SxProps, Theme } from "@mui/material";
import dayjs, { type Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";

interface DateTextFieldProps {
  label: string;
  value?: string;
  onValueChange?: (val: string) => void;
  error?: string;
  required?: boolean;
  sx?: SxProps<Theme>;
}

const TextFieldDateComponent = ({ label, value, onValueChange, error, required, sx }: DateTextFieldProps) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [calendarWidth, setCalendarWidth] = useState<number>(320);

  const toggleCalendar = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const selectedDate = useMemo(() => {
    if (!value) {
      return null;
    }

    const parsedValue = dayjs(value);
    return parsedValue.isValid() ? parsedValue : null;
  }, [value]);

  const displayValue = selectedDate ? selectedDate.format("DD/MM/YYYY") : "";

  useEffect(() => {
    if (!anchorRef.current) {
      return;
    }

    const updateWidth = () => {
      setCalendarWidth(anchorRef.current?.offsetWidth || 320);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <Box ref={anchorRef} sx={{ position: "relative", width: "100%" }}>
          <TextFieldComponent
            label={label}
            value={displayValue}
            error={error}
            required={required}
            placeholder=""
            alwaysShrinkLabel={Boolean(displayValue)}
            onKeyDown={(event) => {
              event.preventDefault();
            }}
            endAdornment={<CalendarMonthIcon fontSize="small" onClick={toggleCalendar} sx={{ color: "#6B7280", cursor: "pointer" }} />}
            sx={sx}
          />

          <Box
            onClick={() => setOpen(true)}
            sx={{
              position: "absolute",
              inset: 0,
              height: "50px",
              cursor: "pointer",
              zIndex: 1,
            }}
          />

          <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start" sx={{ zIndex: 1400 }}>
            <Paper sx={{ mt: "6px", width: `${calendarWidth}px`, minWidth: `${calendarWidth}px` }}>
              <DateCalendar
                value={selectedDate}
                disableFuture
                maxDate={dayjs()}
                onChange={(nextValue: Dayjs | null) => {
                  const nextDate = nextValue && dayjs(nextValue).isValid() ? dayjs(nextValue) : null;
                  onValueChange?.(nextDate ? nextDate.format("YYYY-MM-DD") : "");
                }}
              />
            </Paper>
          </Popper>
        </Box>
      </ClickAwayListener>
    </LocalizationProvider>
  );
};

export default TextFieldDateComponent;
