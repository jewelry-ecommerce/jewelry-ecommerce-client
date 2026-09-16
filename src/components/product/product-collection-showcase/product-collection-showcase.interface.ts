import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material";

export interface ProductCollectionShowcaseItem {
  id: string;
  title: string;
  image?: string;
  href?: string;
}

export interface ProductCollectionShowcaseProps {
  title: string;
  items: ProductCollectionShowcaseItem[];
  tags: string[];
  footer?: ReactNode;
  sx?: SxProps<Theme>;
  onItemClick?: (item: ProductCollectionShowcaseItem) => void;
  onTagClick?: (tag: string) => void;
}
