import { ProductApi } from "@/utils/api";
import useSWR from "swr";
import { useMemo } from "react";
import { buildVariationCardLookup } from "../../_utils/mix-match-product.mapper";

const buildMixMatchCacheKey = (variationIds: string[]) => {
  if (!variationIds.length) return null;
  return ["catalog/variations/cards", ...variationIds] as const;
};

export const useMixMatchProducts = (variationIds: string[]) => {
  const normalizedIds = useMemo(() => {
    const seen = new Set<string>();
    return variationIds
      .map((id) => id.trim())
      .filter((id) => {
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
  }, [variationIds]);

  const cacheKey = buildMixMatchCacheKey(normalizedIds);

  const { data, isLoading, error } = useSWR(cacheKey, async () => ProductApi.getVariationCards({ ids: normalizedIds }));

  const productsByVariationId = useMemo(() => buildVariationCardLookup(data?.items ?? []), [data?.items]);

  return {
    productsByVariationId,
    isLoading: Boolean(cacheKey) && isLoading,
    error,
  };
};

export default useMixMatchProducts;
