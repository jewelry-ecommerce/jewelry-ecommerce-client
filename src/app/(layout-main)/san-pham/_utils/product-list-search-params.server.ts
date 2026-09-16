import { hasProductListFacetSearchParams, type SearchParamsReader } from "./product-list-query.utils";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const getSearchParamValue = (params: SearchParamsRecord | undefined, key: string): string | null => {
  const value = params?.[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const getAllSearchParamValues = (params: SearchParamsRecord | undefined, key: string): string[] => {
  const value = params?.[key];
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.includes(",") ? value.split(",") : [value];
};

export function createProductListSearchParamsReader(searchParams?: SearchParamsRecord): SearchParamsReader {
  return {
    get: (key) => getSearchParamValue(searchParams, key),
    getAll: (key) => getAllSearchParamValues(searchParams, key),
  };
}

export function hasProductListFacetSearchParamsFromRecord(searchParams?: SearchParamsRecord): boolean {
  return hasProductListFacetSearchParams(createProductListSearchParamsReader(searchParams));
}
