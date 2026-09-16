"use client";

import { Box, Button, Checkbox, Drawer, FormControlLabel, IconButton, Popover, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

import { AccordionComponent } from "@/components/accordion/accordion.component";

import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from "../../styled";
import type { ProductFilterControlsProps, ProductFilterSection } from "./product-filter-controls.interface";
import useStyles, { FILTER_CHIP_SX } from "./product-filter-controls.styles";
import { ChevronDown, ChevronUp, FilterLines, XClose } from "@untitledui/icons";
import ChipComponent from "@/components/chip/chip.component";
import { SwitchVertical02 } from "@untitledui/icons";
import { RemoveScroll } from "react-remove-scroll";
import ProductPriceRangeFilter, { formatProductPriceRangeChipLabel } from "./product-price-range-filter.component";
import {
  DEFAULT_PRODUCT_PRICE_RANGE,
  isDefaultProductPriceRange,
  isProductPriceFilterChip,
  PRODUCT_PRICE_FILTER_CHIP_OPTION_ID,
  PRODUCT_PRICE_FILTER_CHIP_SECTION_ID,
  type ProductPriceRange,
} from "@/utils/constants/product-price-filter.constant";
type ActiveFilterChip = {
  sectionId: string;
  optionId: string;
  label: string;
};

const buildPriceFilterChip = (range: ProductPriceRange): ActiveFilterChip => ({
  sectionId: PRODUCT_PRICE_FILTER_CHIP_SECTION_ID,
  optionId: PRODUCT_PRICE_FILTER_CHIP_OPTION_ID,
  label: formatProductPriceRangeChipLabel(range),
});

const appendPriceFilterChip = (chips: ActiveFilterChip[], range: ProductPriceRange): ActiveFilterChip[] => {
  if (isDefaultProductPriceRange(range)) {
    return chips;
  }

  return [...chips, buildPriceFilterChip(range)];
};

const ProductFilterControls = ({
  filterLabel = "Bộ lọc sản phẩm",
  drawerTitle = "Title",
  sections,
  onSectionsChange,
  appliedSections,
  sortLabel = "Sắp xếp:",
  sortValue,
  sortOptions,
  onSortChange,
  showResultCount = false,
  resultCount = 0,
  resultLabel = "sản phẩm",
  onSubmit,
  onDrawerOpenChange,
  shouldFetch,
  setShouldFetch,
  sxRoot = {},
  variant = "full",
  priceRange = DEFAULT_PRODUCT_PRICE_RANGE,
  onPriceRangeCommit,
  drawerEmptyMessage,
}: ProductFilterControlsProps) => {
  const { classes, cx } = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);

  const hasFilterSections = sections.length > 0;
  const shouldShowResultCount = variant === "full" || showResultCount;
  const hasPriceFilter = Boolean(onPriceRangeCommit);
  const shouldShowDrawerEmptyMessage = Boolean(drawerEmptyMessage) && !hasFilterSections && !hasPriceFilter;

  const [emblaRef] = useEmblaCarousel({
    active: isMobile,
    dragFree: true,
    align: "start",
    containScroll: "trimSnaps",
  });

  const activeFilterCount = useMemo(() => {
    const attributeCount = sections.reduce(
      (count, section) => count + (section.options?.filter((option) => option.checked).length || 0),
      0,
    );
    const priceCount = isDefaultProductPriceRange(priceRange) ? 0 : 1;
    return attributeCount + priceCount;
  }, [priceRange, sections]);

  const selectedSortLabel = sortOptions.find((option) => option.value === sortValue)?.label || "";

  /** Chips inside the drawer — reflects draft (checkbox) state, updates live. */
  const draftFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const attributeChips = sections.flatMap((section) =>
      (section.options || [])
        .filter((option) => option.checked)
        .map((option) => ({ sectionId: section.id, optionId: option.id, label: option.label })),
    );

    return appendPriceFilterChip(attributeChips, priceRange);
  }, [priceRange, sections]);

  /** Chips outside the drawer — reflects applied state, only updates on submit. */
  const appliedFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const source = appliedSections ?? sections;
    const attributeChips = source.flatMap((section) =>
      (section.options || [])
        .filter((option) => option.checked)
        .map((option) => ({ sectionId: section.id, optionId: option.id, label: option.label })),
    );

    return appendPriceFilterChip(attributeChips, priceRange);
  }, [appliedSections, priceRange, sections]);

  const computeToggledSections = (
    source: ProductFilterSection[],
    sectionId: string,
    optionId: string,
    checked: boolean,
  ): ProductFilterSection[] =>
    source.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        options: section.options?.map((option) => (option.id === optionId ? { ...option, checked } : option)),
      };
    });

  /** Checkbox toggle inside drawer — applies immediately and keeps both chip bars in sync. */
  const handleToggleOption = (sectionId: string, optionId: string, checked: boolean) => {
    const nextSections = computeToggledSections(sections, sectionId, optionId, checked);
    onSectionsChange(nextSections);
    onSubmit?.(nextSections);
  };

  const buildClearedSections = (source: ProductFilterSection[]) =>
    source.map((section) => ({
      ...section,
      options: section.options?.map((option) => ({ ...option, checked: false })),
    }));

  /** "Xoá tất cả" outside drawer — clears and immediately removes all applied filters. */
  const handleClearAllFilters = () => {
    onSectionsChange(buildClearedSections(sections));
    setShouldFetch?.(false);
  };

  /** "Xoá tất cả" inside drawer — clears draft and immediately clears applied filters. */
  const handleClearAllFiltersInDrawer = () => {
    onSectionsChange(buildClearedSections(sections));
    setShouldFetch?.(false);
  };

  /** Chip removal inside drawer — updates draft only, no apply until "Xem sản phẩm". */
  const handleRemoveDraftChip = (sectionId: string, optionId: string) => {
    if (isProductPriceFilterChip(sectionId, optionId)) {
      onPriceRangeCommit?.(DEFAULT_PRODUCT_PRICE_RANGE);
      return;
    }

    onSectionsChange(computeToggledSections(sections, sectionId, optionId, false));
  };

  /** Chip removal outside drawer — immediately applies the removal to the product list. */
  const handleRemoveAppliedChip = (sectionId: string, optionId: string) => {
    if (isProductPriceFilterChip(sectionId, optionId)) {
      onPriceRangeCommit?.(DEFAULT_PRODUCT_PRICE_RANGE);
      return;
    }

    const source = appliedSections ?? sections;
    const nextSections = computeToggledSections(source, sectionId, optionId, false);
    onSectionsChange(nextSections);
    onSubmit?.(nextSections);
  };

  const renderSectionTitle = (section: ProductFilterSection) => {
    if (!section.summary) {
      return <Typography className={classes.sectionTitle}>{section.label}</Typography>;
    }

    return (
      <Box className={classes.sectionTitleRow}>
        <Typography className={classes.sectionTitle}>{`${section.label}:`}</Typography>
        <Typography className={classes.sectionSummary}>{section.summary}</Typography>
      </Box>
    );
  };

  const renderChipBar = (
    chips: ActiveFilterChip[],
    onRemoveChip: (sectionId: string, optionId: string) => void,
    hiddenButton?: boolean,
  ) => {
    return (
      <Box className={!hiddenButton ? classes.root2 : classes.root3}>
        {!hiddenButton && (
          <Button className={classes.clearAllButton} onClick={handleClearAllFilters}>
            Xoá tất cả
          </Button>
        )}

        <Box className={classes.emblaViewport} ref={isMobile ? emblaRef : undefined}>
          <Box className={classes.emblaContainer}>
            {chips.map((chip) => (
              <Box key={`${chip.sectionId}-${chip.optionId}`} className={classes.emblaSlide}>
                <ChipComponent
                  label={chip.label}
                  icon={<XClose />}
                  iconPosition="right"
                  onAction={() => onRemoveChip(chip.sectionId, chip.optionId)}
                  sx={FILTER_CHIP_SX}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };
  return (
    <Box>
      <Box
        sx={{
          borderTop: "1px solid #DDD",
          borderBottom: "1px solid #DDD",
          ...sxRoot,
        }}
        className={classes.root}
      >
        <Box className={classes.toolbar}>
          {variant === "full" && (
            <Button
              className={classes.filterTrigger}
              onClick={() => {
                setDrawerOpen(true);
                onDrawerOpenChange?.(true);
              }}
            >
              <Box className={classes.filterIconWrap}>
                <FilterLines />
                <Box className={classes.filterBadge}>{activeFilterCount}</Box>
              </Box>
              <Typography className={classes.filterLabel}>{filterLabel}</Typography>
            </Button>
          )}

          <StackRowAlignCenter className={classes.resultSortRow} sx={variant === "simple" ? { marginLeft: "auto" } : undefined}>
            {shouldShowResultCount && (
              <React.Fragment>
                <Typography className={classes.resultCount}>{`${resultCount} ${resultLabel}`}</Typography>
                <Box className={classes.divider} />
              </React.Fragment>
            )}
            <Button className={classes.sortTrigger} onClick={(event) => setSortAnchorEl(event.currentTarget)}>
              <SwitchVertical02 />
              <Typography className={classes.sortLabel}>{sortLabel}</Typography>
              <Typography className={classes.sortValue}>{selectedSortLabel}</Typography>
              {Boolean(sortAnchorEl) ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </StackRowAlignCenter>
        </Box>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            onDrawerOpenChange?.(false);
          }}
          PaperProps={{ className: classes.drawerPaper }}
          ModalProps={{ disableScrollLock: true }}
        >
          <Box className={classes.drawerHeader}>
            <StackRowAlignCenterJustBetween sx={{ width: "100%" }}>
              <Box className={classes.drawerTitleRow}>
                <Typography className={classes.drawerTitle}>{drawerTitle}</Typography>
                {activeFilterCount > 0 && (
                  <Button className={classes.drawerClearAllButton} onClick={handleClearAllFiltersInDrawer}>
                    Xoá tất cả
                  </Button>
                )}
              </Box>
              <IconButton
                onClick={() => {
                  setDrawerOpen(false);
                  onDrawerOpenChange?.(false);
                }}
                size="small"
                sx={{ p: 0, color: "#000000" }}
              >
                <XClose />
              </IconButton>
            </StackRowAlignCenterJustBetween>
            <StackRowAlignCenter>{renderChipBar(draftFilterChips, handleRemoveDraftChip, true)}</StackRowAlignCenter>
          </Box>

          <RemoveScroll enabled={drawerOpen} forwardProps>
            <Box className={classes.drawerBody}>
              {shouldShowDrawerEmptyMessage ? <Typography className={classes.drawerEmpty}>{drawerEmptyMessage}</Typography> : null}
              {sections.map((section) => (
                <AccordionComponent
                  key={section.id}
                  title={renderSectionTitle(section)}
                  defaultExpanded={section.defaultExpanded}
                  className={classes.sectionRow}
                  summarySx={{ padding: 0, minHeight: "unset" }}
                  detailsSx={{ padding: 0 }}
                >
                  <Box className={classes.sectionDetails}>
                    {section.options?.map((option) => (
                      <FormControlLabel
                        key={option.id}
                        className={classes.optionLabelRoot}
                        control={
                          <Checkbox
                            checked={Boolean(option.checked)}
                            onChange={(event) => handleToggleOption(section.id, option.id, event.target.checked)}
                            className={classes.checkbox}
                          />
                        }
                        label={<Typography className={classes.optionText}>{option.label}</Typography>}
                      />
                    ))}
                  </Box>
                </AccordionComponent>
              ))}
              {onPriceRangeCommit ? (
                <AccordionComponent
                  title={<Typography className={classes.sectionTitle}>Khung giá</Typography>}
                  defaultExpanded
                  className={classes.sectionRow}
                  summarySx={{ padding: 0, minHeight: "unset" }}
                  detailsSx={{ padding: 0 }}
                >
                  <ProductPriceRangeFilter value={priceRange} onChangeCommitted={onPriceRangeCommit} />
                </AccordionComponent>
              ) : null}
            </Box>
          </RemoveScroll>

          <Box className={classes.drawerFooter}>
            <Button
              className={classes.applyButton}
              onClick={() => {
                onSubmit?.();
                setDrawerOpen(false);
                onDrawerOpenChange?.(false);
              }}
            >
              {`Xem ${resultCount} ${resultLabel}`}
            </Button>
          </Box>
        </Drawer>

        <Popover
          open={Boolean(sortAnchorEl)}
          anchorEl={sortAnchorEl}
          onClose={() => setSortAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{ className: classes.sortPopoverPaper }}
        >
          <Box className={classes.sortList}>
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                className={cx(classes.sortOption, option.value === sortValue && classes.sortOptionActive)}
                onClick={() => {
                  onSortChange(option.value);
                  setSortAnchorEl(null);
                }}
              >
                {option.label}
              </Button>
            ))}
          </Box>
        </Popover>
      </Box>
      {appliedFilterChips.length > 0 && shouldFetch && renderChipBar(appliedFilterChips, handleRemoveAppliedChip)}
    </Box>
  );
};

export default ProductFilterControls;
