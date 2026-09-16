import React from "react";
import { InputBase, InputAdornment, Box, debounce } from "@mui/material";
import { styled } from "@mui/material/styles";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  flex: 1,
  padding: "4px 0",
  ...TYPOGRAPHY_STYLES.base.regular,
  borderBottom: "1px solid #E5E7EB",
  "& input::placeholder": {
    color: "#000",
    opacity: 1,
    ...TYPOGRAPHY_STYLES.base.regular,
  },
}));

import { SxProps, Theme } from "@mui/material";
import { SearchMd } from "@untitledui/icons";

interface TextFieldSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: SxProps<Theme>;
  debounceMs?: number;
}

const TextFieldSearch = ({ placeholder = "Tìm kiếm", value, onChange, sx, debounceMs = 500 }: TextFieldSearchProps) => {
  const change = debounce((nextValue: string) => {
    onChange?.({
      target: { name: "search", value: nextValue },
    } as React.ChangeEvent<HTMLInputElement>);
  }, debounceMs);

  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 300, ...sx }}>
      <StyledInputBase
        placeholder={placeholder}
        value={value}
        onChange={(event) => change(event.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <SearchMd size={20} color="#333" />
          </InputAdornment>
        }
      />
    </Box>
  );
};

export default TextFieldSearch;
