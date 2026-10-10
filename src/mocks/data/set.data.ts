import type { CuratedSet } from "@/utils/api/set/set.interface";
import { buildPlaceholderImage } from "@/utils/media/placeholder.util";
import { findProductById } from "./catalog.data";

/**
 * Curated set fixtures.
 *
 * Each item is a slot (`setItemId`) with a list of SKUs the customer may pick. The slot identity is
 * stable and never derived from the chosen SKU — this is what keeps cart and order lines correct
 * when two slots happen to offer the same product.
 */
const variantIdsOf = (productId: string): string[] => findProductById(productId)?.variants.map((variant) => variant.id) ?? [];

const defaultVariantOf = (productId: string): string => {
  const variants = variantIdsOf(productId);
  if (!variants.length) throw new Error(`Set fixture references a product with no variants: ${productId}`);
  return variants[0];
};

export const CURATED_SETS: CuratedSet[] = [];

export const findSetBySlug = (slug: string): CuratedSet | undefined => CURATED_SETS.find((entry) => entry.slug === slug);

export const findSetById = (id: string): CuratedSet | undefined => CURATED_SETS.find((entry) => entry.id === id);
