import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import type { ApiProduct } from "@/utils/api/product/product.interface";
import { mapApiProductToProductItem } from "@/utils/product.mapper.util";
import { ATSH_SINGER_PRODUCT_DESCRIPTION } from "../_constants/atsh-singer.constants";
import type { AtshSingerImagePosition } from "../_constants/atsh-singer.constants";

export type AtshSingerSpiralPanelProps = {
  product: ProductItemProps;
  description: string;
  imagePosition: AtshSingerImagePosition;
  imageSrc: string;
};

export const mapApiProductToSpiralPanel = (apiProduct: ApiProduct, imagePosition: AtshSingerImagePosition): AtshSingerSpiralPanelProps => ({
  product: mapApiProductToProductItem(apiProduct),
  description: ATSH_SINGER_PRODUCT_DESCRIPTION,
  imagePosition,
  imageSrc: apiProduct.image,
});

export const mapApiProductsToSpiralPanels = (
  products: ApiProduct[],
  imagePositions: AtshSingerImagePosition[],
  descriptions: string[] = [],
): AtshSingerSpiralPanelProps[] =>
  products.map((product, index) => {
    const panel = mapApiProductToSpiralPanel(product, imagePositions[index] ?? (index % 2 === 0 ? "left" : "right"));
    return {
      ...panel,
      description: descriptions[index] ?? panel.description,
    };
  });
