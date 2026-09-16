import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import type { BlockConfig, ProductListMixMatchSkuConfig } from "@/utils/api/cms/cms.interface";
import { MediaType } from "@/utils/api/banner/banner.enum";
import type { ProductReviewItem } from "@/components/product/product-gallery/product-gallery.component";

export const IMAGE_GALLERY_MAX_MIX_MATCH_SKUS = 6;

const getSortedMixMatchVariationIds = (skus: ProductListMixMatchSkuConfig[] | undefined): string[] => {
  if (!skus?.length) return [];

  const seen = new Set<string>();

  return skus
    .slice()
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .map((sku) => sku.variationId?.trim() || "")
    .filter((variationId) => {
      if (!variationId || seen.has(variationId)) return false;
      seen.add(variationId);
      return true;
    })
    .slice(0, IMAGE_GALLERY_MAX_MIX_MATCH_SKUS);
};

export const extractMixMatchVariationIdsFromImageGalleryConfig = (config: BlockConfig): string[] => {
  const variationIds: string[] = [];
  const seen = new Set<string>();

  (config.items ?? []).forEach((item) => {
    const actionType = item.actionType === "MIX_MATCH" ? "MIX_MATCH" : "LINK_URL";
    if (actionType !== "MIX_MATCH") return;

    getSortedMixMatchVariationIds(item.mixMatchSkus).forEach((variationId) => {
      if (seen.has(variationId)) return;
      seen.add(variationId);
      variationIds.push(variationId);
    });
  });

  return variationIds;
};

export const mapImageGalleryItemsFromBlockConfig = (
  blockId: string,
  config: BlockConfig,
  productsByVariationId: Map<string, ProductItemProps>,
): ProductReviewItem[] =>
  (config.items ?? []).map((item, index) => {
    const isVideo = item.mediaType === MediaType.VIDEO;
    const actionType = item.actionType === "MIX_MATCH" ? "MIX_MATCH" : "LINK_URL";
    const mixMatchVariationIds = actionType === "MIX_MATCH" ? getSortedMixMatchVariationIds(item.mixMatchSkus) : [];
    const mixMatchProducts = mixMatchVariationIds
      .map((variationId) => productsByVariationId.get(variationId))
      .filter((product): product is ProductItemProps => Boolean(product));

    return {
      id: `${blockId}-gallery-item-${index}`,
      src: isVideo ? item.videoUrl || "" : item.imageUrl || "",
      labelText: item.label || "",
      alt: item.label || item.title || "",
      link: actionType === "LINK_URL" ? item.actionUrl || "" : undefined,
      mediaType: item.mediaType as MediaType | undefined,
      posterSrc: isVideo ? item.thumbnailUrl : undefined,
      actionType,
      mixMatchVariationIds,
      mixMatchProducts,
    };
  });

export const resolveImageGalleryMixMatchProducts = (
  variationIds: string[],
  productsByVariationId: Map<string, ProductItemProps>,
): ProductItemProps[] =>
  variationIds
    .map((variationId) => productsByVariationId.get(variationId))
    .filter((product): product is ProductItemProps => Boolean(product));
