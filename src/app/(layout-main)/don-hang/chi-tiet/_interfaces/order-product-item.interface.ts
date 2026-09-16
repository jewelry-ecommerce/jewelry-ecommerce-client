import type { CustomerDisplayPrice } from "@/utils/customer-display-price.util";

export interface OrderProductItemData {
  productId: string;
  variationId?: string;
  productName: string;
  image: string;
  slug: string;
  compareAtPriceAfterTaxMinor: string | number;
  sellingPriceAfterTaxMinor: string | number;
  customerDisplayPrice?: CustomerDisplayPrice;
  stockStatus: string;
  attributes?: { attributeCode: string; attributeName: string; value: string }[];
}
