import type { ProductItemProps } from "../product-item/product-item.component";

export type BannerPosition = "left" | "right";

export interface BannerConfig {
  id: string;
  image: string;
  link?: string;
  product?: ProductItemProps;
  position?: BannerPosition; // "left" | "right", default "right"
  visible?: boolean;
}

export interface ProductListBannerProps {
  products: ProductItemProps[];
  banner?: BannerConfig;
  onProductClick?: (productId: string) => void;
  onProductAddToCart?: (productId: string) => void;
}
