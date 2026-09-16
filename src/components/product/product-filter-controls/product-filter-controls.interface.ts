import { SxProps, Theme } from "@mui/material";

import type { ProductPriceRange } from "@/utils/constants/product-price-filter.constant";

export type ProductFilterOption = {
  id: string;
  label: string;
  checked?: boolean;
  count?: number;
};

export type ProductFilterSection = {
  id: string;
  label: string;
  summary?: string;
  options?: ProductFilterOption[];
  defaultExpanded?: boolean;
};

export type ProductSortOption = {
  value: string;
  label: string;
};

export interface ProductFilterControlsProps {
  filterLabel?: string;
  drawerTitle?: string;
  sections: ProductFilterSection[];
  onSectionsChange: (sections: ProductFilterSection[]) => void;
  /** Applied state — only updates when "Xem sản phẩm" is clicked. Used for the
   *  chip bar outside the product list so it never changes mid-drawer interaction. */
  appliedSections?: ProductFilterSection[];
  sortLabel?: string;
  sortValue: string;
  sortOptions: ProductSortOption[];
  onSortChange: (value: string) => void;
  /** Shows the result count without enabling the filter trigger. */
  showResultCount?: boolean;
  resultCount?: number;
  resultLabel?: string;
  onSubmit?: (sections?: ProductFilterSection[]) => void;
  onDrawerOpenChange?: (open: boolean) => void;
  shouldFetch?: boolean;
  setShouldFetch?: (value: boolean) => void;
  sxRoot?: SxProps<Theme>;
  variant?: "full" | "simple";
  priceRange?: ProductPriceRange;
  onPriceRangeCommit?: (range: ProductPriceRange) => void;
  drawerEmptyMessage?: string;
}
