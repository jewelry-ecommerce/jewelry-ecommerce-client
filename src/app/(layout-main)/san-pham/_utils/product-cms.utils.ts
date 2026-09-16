import type { ProductBannerConfig } from "@/components";
import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import type { ProductCollectionShowcaseItem } from "@/components/product/product-collection-showcase/product-collection-showcase.interface";
import type { ProductListBannerStorefrontItem, ProductListBannerStorefrontResponse } from "@/utils/api/banner/banner.interface";
import type {
  Block,
  BlockConfig,
  ProductListInterleavedBannerConfig,
  ProductListInterleavedBannerRuleConfig,
  ProductListMixMatchSkuConfig,
  StorefrontNavigationItem,
} from "@/utils/api/cms/cms.interface";

const PRODUCT_LIST_BANNER_PRODUCT_INTERVAL = 4;

export type ProductListBannerFetchContext = {
  shouldFetch: boolean;
  contextSlug: string | null;
  isCategory: boolean;
};

export interface ProductListBannerResolveContext {
  categorySlug?: string | null;
  categoryPathSlugs?: string[] | null;
}

const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime());

const isBannerActiveNow = (banner: ProductListInterleavedBannerConfig, now = new Date()): boolean => {
  if (banner.enabled === false) return false;
  if (!banner.imageUrl?.trim()) return false;

  if (banner.startTime?.trim()) {
    const start = new Date(banner.startTime);
    if (isValidDate(start) && start > now) return false;
  }

  if (banner.endTime?.trim()) {
    const end = new Date(banner.endTime);
    if (isValidDate(end) && end <= now) return false;
  }

  return true;
};

const normalizeCategorySlug = (value: string | null | undefined): string => value?.trim().replace(/^\/+|\/+$/g, "") || "";

export const resolveProductListBannerFetchContext = (
  block: Block | null | undefined,
  urlCategorySlug?: string | null,
): ProductListBannerFetchContext => {
  const emptyContext: ProductListBannerFetchContext = {
    shouldFetch: false,
    contextSlug: null,
    isCategory: false,
  };

  const normalizedUrlCategorySlug = normalizeCategorySlug(urlCategorySlug);

  if (normalizedUrlCategorySlug) {
    return { shouldFetch: true, contextSlug: normalizedUrlCategorySlug, isCategory: true };
  }

  if (!block) return emptyContext;

  const cmsPageSlug = normalizeCategorySlug(block.config.dataSource?.cmsPageSlug);
  if (!cmsPageSlug) return emptyContext;

  return { shouldFetch: true, contextSlug: cmsPageSlug, isCategory: false };
};

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
    });
};

export const getProductListBannerRuleForContext = (
  config: BlockConfig,
  context?: ProductListBannerResolveContext,
): ProductListInterleavedBannerRuleConfig | null => {
  const interleavedBanners = config.interleavedBanners;
  if (!interleavedBanners) return null;

  const defaultRule: ProductListInterleavedBannerRuleConfig = interleavedBanners.defaultRule ?? {
    inheritFromParent: interleavedBanners.inheritFromParent,
    items: interleavedBanners.items,
  };

  const categoryRules = interleavedBanners.categoryRules ?? [];
  const contextPathSlugs = (context?.categoryPathSlugs ?? []).map(normalizeCategorySlug).filter(Boolean);
  const contextCategorySlug = normalizeCategorySlug(context?.categorySlug);
  const lookupSlugs = contextPathSlugs.length ? contextPathSlugs : contextCategorySlug ? [contextCategorySlug] : [];

  for (let index = lookupSlugs.length - 1; index >= 0; index -= 1) {
    const currentSlug = lookupSlugs[index];
    const rule = categoryRules.find((item) => normalizeCategorySlug(item.categorySlug) === currentSlug);
    if (!rule) continue;

    if (rule.inheritFromParent === false) {
      return rule;
    }
  }

  return defaultRule;
};

export const extractMixMatchVariationIdsFromBlockConfig = (config: BlockConfig, context?: ProductListBannerResolveContext): string[] => {
  const resolvedRule = getProductListBannerRuleForContext(config, context);
  if (!resolvedRule || resolvedRule.inheritFromParent) {
    return [];
  }

  const variationIds: string[] = [];
  const seen = new Set<string>();

  (resolvedRule.items ?? [])
    .filter((banner) => isBannerActiveNow(banner))
    .forEach((banner) => {
      if (banner.actionType !== "MIX_MATCH") return;

      getSortedMixMatchVariationIds(banner.mixMatchSkus).forEach((variationId) => {
        if (seen.has(variationId)) return;
        seen.add(variationId);
        variationIds.push(variationId);
      });
    });

  return variationIds;
};

export const mapProductListBannerConfigsFromBlockConfig = (
  config: BlockConfig,
  context?: ProductListBannerResolveContext,
): ProductBannerConfig[] => {
  const resolvedRule = getProductListBannerRuleForContext(config, context);
  if (!resolvedRule || resolvedRule.inheritFromParent) {
    return [];
  }

  const items = resolvedRule.items ?? [];

  return items
    .filter((banner) => isBannerActiveNow(banner))
    .map((banner, index): ProductBannerConfig | null => {
      const baseBanner = {
        id: banner.id?.trim() || `product-list-banner-${index}`,
        enabled: banner.enabled !== false,
        position: index % 2 === 0 ? ("left" as const) : ("right" as const),
        content: {
          image: banner.imageUrl?.trim() || "",
          title: `Banner sau ${(index + 1) * PRODUCT_LIST_BANNER_PRODUCT_INTERVAL} san pham`,
        },
      };

      if (banner.actionType === "MIX_MATCH") {
        const mixMatchVariationIds = getSortedMixMatchVariationIds(banner.mixMatchSkus);
        if (!mixMatchVariationIds.length) return null;

        return {
          ...baseBanner,
          type: "product",
          mixMatchVariationIds,
          product: [],
        };
      }

      const link = banner.actionUrl?.trim();
      if (!link) return null;

      return {
        ...baseBanner,
        type: "link",
        link,
        openInNewTab: Boolean(banner.openInNewTab),
      };
    })
    .filter((banner): banner is ProductBannerConfig => Boolean(banner));
};

export const mergeMixMatchProductsIntoBannerConfigs = (
  banners: ProductBannerConfig[],
  productsByVariationId: Map<string, ProductItemProps>,
): ProductBannerConfig[] =>
  banners.map((banner) => {
    if (banner.type !== "product" || !banner.mixMatchVariationIds?.length) {
      return banner;
    }

    const products = banner.mixMatchVariationIds
      .map((variationId) => productsByVariationId.get(variationId))
      .filter((item): item is ProductItemProps => Boolean(item));

    if (!products.length) {
      return {
        ...banner,
        product: [],
      };
    }

    return {
      ...banner,
      product: products,
    };
  });

export const extractMixMatchVariationIdsFromProductListBanners = (response?: ProductListBannerStorefrontResponse | null): string[] => {
  const seen = new Set<string>();

  return (response?.banners ?? [])
    .filter((banner) => banner.actionType === "MIX_MATCH")
    .flatMap((banner) => getSortedMixMatchVariationIds(banner.mixMatchSkus))
    .filter((variationId) => {
      if (!variationId || seen.has(variationId)) return false;
      seen.add(variationId);
      return true;
    });
};

export const mapProductListBannerConfigsFromStorefrontResponse = (
  response?: ProductListBannerStorefrontResponse | null,
): ProductBannerConfig[] =>
  (response?.banners ?? [])
    .map((banner, index) => mapProductListBannerStorefrontItem(banner, index))
    .filter((banner): banner is ProductBannerConfig => Boolean(banner));

const mapProductListBannerStorefrontItem = (banner: ProductListBannerStorefrontItem, index: number): ProductBannerConfig | null => {
  const baseBanner = {
    id: banner.id?.trim() || `product-list-banner-${index}`,
    enabled: banner.enabled !== false,
    position: index % 2 === 0 ? ("left" as const) : ("right" as const),
    content: {
      image: banner.imageUrl?.trim() || "",
      title: `Banner sau ${(index + 1) * PRODUCT_LIST_BANNER_PRODUCT_INTERVAL} san pham`,
    },
  };

  if (!baseBanner.content.image) return null;
  if (banner.actionType === "MIX_MATCH") return mapMixMatchBanner(baseBanner, banner);
  return mapLinkBanner(baseBanner, banner);
};

const mapMixMatchBanner = (
  baseBanner: Omit<ProductBannerConfig, "type">,
  banner: ProductListBannerStorefrontItem,
): ProductBannerConfig | null => {
  const mixMatchVariationIds = getSortedMixMatchVariationIds(banner.mixMatchSkus);
  if (!mixMatchVariationIds.length) return null;
  return { ...baseBanner, type: "product", mixMatchVariationIds, product: [] };
};

const mapLinkBanner = (
  baseBanner: Omit<ProductBannerConfig, "type">,
  banner: ProductListBannerStorefrontItem,
): ProductBannerConfig | null => {
  const link = banner.actionUrl?.trim();
  if (!link) return null;
  return { ...baseBanner, type: "link", link, openInNewTab: Boolean(banner.openInNewTab) };
};

export const mapShowcaseItemsFromBlockConfig = (config: BlockConfig): ProductCollectionShowcaseItem[] =>
  (config.items ?? []).map((item, index) => ({
    id: item.id?.trim() || `showcase-item-${index}`,
    title: item.title || item.label || "",
    image: item.imageUrl,
    href: item.actionUrl,
  }));

export const mapShowcaseTagsFromBlockConfig = (config: BlockConfig): string[] => {
  if (!config.tags?.length) {
    return [];
  }

  return config.tags
    .map((tag) => {
      if (typeof tag === "string") {
        return tag;
      }
      return tag.text?.trim() || "";
    })
    .filter(Boolean);
};

export const getCategoryNavLimit = (block: Block): number | undefined => {
  const limit = Number(block.config.display?.limit ?? 0);
  if (!Number.isFinite(limit) || limit <= 0) {
    return undefined;
  }
  return limit;
};

export const getCategoryNavigationDisplayItems = (items: StorefrontNavigationItem[], limit?: number): StorefrontNavigationItem[] =>
  limit ? items.slice(0, limit) : items;
