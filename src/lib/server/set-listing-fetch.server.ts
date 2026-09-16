// set term
import { cache } from "react";
import { fetchApiJson } from "@/lib/server/storefront-metadata";
import type { GetSetsParams, SetListResponse } from "@/utils/api/sets/sets.interface";
import { PAGE_TAKE_DEFAULT, resolveProductListTakeFromSearchParams } from "@/utils/constants/page-take.constant";
import { CatalogSortType } from "@/utils/api/product/product.enum";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const getFirstSearchParam = (searchParams: SearchParamsRecord | undefined, key: string): string | null => {
  const value = searchParams?.[key];
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
};

const resolvePage = (searchParams: SearchParamsRecord | undefined): number => {
  const value = Number.parseInt(getFirstSearchParam(searchParams, "page") ?? "", 10);
  return Number.isNaN(value) || value < 1 ? PAGE_TAKE_DEFAULT.page : value;
};

export const getSetListParams = (searchParams?: SearchParamsRecord): GetSetsParams => ({
  orderType: "DESC",
  orderBy: "updatedAt",
  page: resolvePage(searchParams),
  take: resolveProductListTakeFromSearchParams({ get: (key) => getFirstSearchParam(searchParams, key) }),
  isPagination: true,
  sort: resolveSetSort(searchParams),
});

const resolveSetSort = (searchParams?: SearchParamsRecord): GetSetsParams["sort"] => {
  const sort = getFirstSearchParam(searchParams, "sort");
  return sort === CatalogSortType.PRICE_DESC ? CatalogSortType.PRICE_DESC : CatalogSortType.PRICE_ASC;
};

const buildSetListPath = (params: GetSetsParams): string => {
  const query = new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)]));
  return `catalog/sets?${query.toString()}`;
};

export const fetchSetListing = cache(async (params: GetSetsParams): Promise<SetListResponse | null> =>
  fetchApiJson<SetListResponse>(buildSetListPath(params)),
);
