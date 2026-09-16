"use client";

import { SearchMd, XClose } from "@untitledui/icons";
import ProductItemComponent from "@/components/product/product-item/product-item.component";
import { useFetchProductBadgesBatch } from "@/hooks/use-fetch-product-badges-batch.hook";
import { Box, InputAdornment, InputBase, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { useRouter } from "next/navigation";
import React, { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween, StackRowAlignJustCenter } from "@/components/styled/stack.style";
import useStyles from "./header-mega-search.styles";
import { useHeaderMegaSearch } from "./use-header-mega-search.hook";

type HeaderMegaSearchProps = {
  open: boolean;
  onClose: () => void;
  topOffset: number;
};

export interface HeaderMegaSearchRef {
  focusInput: () => void;
}

const FOCUS_RETRY_DELAYS_MS = [50, 150, 300] as const;

const SearchInput = styled(InputBase)(() => ({
  flex: 1,
  width: "100%",
  padding: "8px 16px",
  borderBottom: "1px solid #E5E7EB",
  ...TYPOGRAPHY_STYLES.base.regular,
  "& input::placeholder": {
    color: "#27251F",
    opacity: 1,
    ...TYPOGRAPHY_STYLES.base.regular,
  },
}));

const HeaderMegaSearch = forwardRef<HeaderMegaSearchRef, HeaderMegaSearchProps>(function HeaderMegaSearch(
  { open, onClose, topOffset },
  ref,
) {
  const router = useRouter();
  const { classes } = useStyles();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const {
    searchValue,
    setSearchValue,
    trendingKeywords,
    suggestionItems,
    featuredProducts,
    historyKeywords,
    shouldShowSuggestions,
    showHistoryColumn,
    handleSuggestionClick,
    handleClearHistory,
    handleSearchSubmit,
    navigateToSearchResults,
  } = useHeaderMegaSearch({
    open,
    onClose,
  });

  const focusSearchInput = useCallback(() => {
    const input = searchInputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
  }, []);

  useImperativeHandle(ref, () => ({ focusInput: focusSearchInput }), [focusSearchInput]);

  useLayoutEffect(() => {
    if (!open) return;

    focusSearchInput();
    const frameId = window.requestAnimationFrame(focusSearchInput);
    const timeoutIds = FOCUS_RETRY_DELAYS_MS.map((delay) => window.setTimeout(focusSearchInput, delay));

    return () => {
      window.cancelAnimationFrame(frameId);
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, [focusSearchInput, open]);

  useFetchProductBadgesBatch(open ? featuredProducts : []);

  if (!open) {
    return null;
  }

  return (
    <React.Fragment>
      <Box className={classes.backdrop} style={{ top: topOffset }} onClick={onClose} />
      <Box className={classes.panel} style={{ top: topOffset, maxHeight: `calc(100vh - ${topOffset}px)` }}>
        <Box className={classes.panelInner}>
          <StackRowAlignJustCenter className={classes.closeButton} onClick={onClose}>
            <XClose size={20} color="#27251F" />
          </StackRowAlignJustCenter>

          <StackRowAlignCenter className={classes.searchRow}>
            <Box className={classes.searchField}>
              <SearchInput
                inputRef={searchInputRef}
                autoFocus={open}
                inputProps={{
                  "aria-label": "Tìm kiếm",
                  inputMode: "search",
                  enterKeyHint: "search",
                }}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={handleSearchSubmit}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchMd size={20} color="#27251F" />
                  </InputAdornment>
                }
                endAdornment={
                  searchValue ? (
                    <InputAdornment position="end">
                      <Typography
                        className={classes.clearButton}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setSearchValue("");
                          focusSearchInput();
                        }}
                      >
                        Xóa
                      </Typography>
                    </InputAdornment>
                  ) : undefined
                }
              />
            </Box>
          </StackRowAlignCenter>

          <Box className={classes.content}>
            <Box
              className={classes.keywordSide}
              sx={{
                gridTemplateColumns: shouldShowSuggestions || !showHistoryColumn ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))",
              }}
            >
              {shouldShowSuggestions ? (
                <Stack className={classes.keywordColumn}>
                  <Typography className={classes.keywordHeader}>Gợi ý tìm kiếm</Typography>
                  <Stack className={classes.suggestionList}>
                    {suggestionItems.length > 0 ? (
                      suggestionItems.map((suggestion) => (
                        <StackRowAlignCenterJustBetween
                          key={`${suggestion.type}-${suggestion.slug || suggestion.text}`}
                          className={classes.suggestionItem}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Typography className={classes.keywordItem}>{suggestion.text}</Typography>
                        </StackRowAlignCenterJustBetween>
                      ))
                    ) : (
                      <Typography className={classes.emptyStateText}>Không có gợi ý phù hợp</Typography>
                    )}
                  </Stack>
                </Stack>
              ) : (
                <React.Fragment>
                  {showHistoryColumn && (
                    <Stack className={classes.keywordColumn}>
                      <StackRowAlignCenterJustBetween>
                        <Typography className={classes.keywordHeader}>Lịch sử tìm kiếm</Typography>
                      </StackRowAlignCenterJustBetween>

                      <Stack className={classes.keywordList}>
                        {historyKeywords?.map((keyword) => (
                          <Typography key={keyword} className={classes.keywordItem} onClick={() => navigateToSearchResults(keyword)}>
                            {keyword}
                          </Typography>
                        ))}
                      </Stack>
                      <Typography className={classes.clearHistoryButton} onClick={handleClearHistory}>
                        Xóa lịch sử
                      </Typography>
                    </Stack>
                  )}

                  <Stack className={classes.keywordColumn}>
                    <Typography className={classes.keywordHeader}>Xu hướng tìm kiếm</Typography>
                    <Stack className={classes.keywordList}>
                      {trendingKeywords.map((keyword) => (
                        <Typography key={keyword} className={classes.keywordItem} onClick={() => navigateToSearchResults(keyword)}>
                          {keyword}
                        </Typography>
                      ))}
                    </Stack>
                  </Stack>
                </React.Fragment>
              )}
            </Box>

            <Box className={classes.productSide}>
              <Box className={classes.productGrid}>
                {featuredProducts.map((product) => (
                  <Box key={product.id} className={classes.productGridItem}>
                    <ProductItemComponent
                      {...product}
                      hideAddToCart
                      onClick={(slug) => {
                        onClose();
                        router.push(`/san-pham/${slug}`);
                      }}
                      sx={{ borderLeft: "1px solid #DDD" }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
});

export const HeaderMegaSearchTrigger = ({ open, onClick }: { open: boolean; onClick: () => void }) => {
  const { classes } = useStyles();

  return (
    <Box
      component="button"
      type="button"
      className={classes.searchTrigger}
      tabIndex={open ? -1 : 0}
      aria-label="Tìm kiếm"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={onClick}
      onFocus={() => {
        if (!open) {
          onClick();
        }
      }}
    >
      <SearchMd size={20} color="#27251F" />
      <Typography className={classes.searchTriggerText}>Tìm kiếm</Typography>
    </Box>
  );
};

export default HeaderMegaSearch;
