// set term
import { commonAxios } from "@/utils/axios";
import type {
  GetSetsParams,
  SetDetailResponse,
  SetItemVariationSelection,
  SetItemVariationsResponse,
  SetListResponse,
} from "./sets.interface";

export const getSets = async (params: GetSetsParams): Promise<SetListResponse> => (await commonAxios.get("catalog/sets", { params })).data;

// set term
export const getSetBySlug = async (slug: string): Promise<SetDetailResponse> => (await commonAxios.get(`catalog/sets/${slug}`)).data;

export const getSetItemVariations = async (
  setId: string,
  itemId: string,
  selections: Readonly<Record<string, string>>,
): Promise<SetItemVariationsResponse> =>
  (
    await commonAxios.post(`catalog/sets/${setId}/items/${itemId}/variations`, {
      selections: Object.entries(selections).map<SetItemVariationSelection>(([selectedItemId, variationId]) => ({
        itemId: selectedItemId,
        variationId,
      })),
    })
  ).data;
