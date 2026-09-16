import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import type { AppPaginationProps } from "@/components/pagination/pagination.component";
import type { SxProps, Theme } from "@mui/material";

export type BannerPosition = "left" | "right";

export interface ProductBannerConfig {
  id: string;
  enabled: boolean;
  position: BannerPosition;
  type: "link" | "product";
  content: {
    image: string;
    title?: string;
  };
  // For link type
  link?: string;
  openInNewTab?: boolean;
  // For product type
  product?: ProductItemProps | ProductItemProps[];
  /** Variation IDs from CMS config — hydrated via product-read at runtime */
  mixMatchVariationIds?: string[];
}

export interface ProductGridProps {
  products: ProductItemProps[];
  banner?: ProductBannerConfig;
  banners?: ProductBannerConfig[];
  pagination?: AppPaginationProps;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string, item?: CartViewItem) => void;
  sx?: SxProps<Theme>;
}
