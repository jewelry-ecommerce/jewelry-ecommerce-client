import { authAxios, commonAxios } from "@/utils/axios";
import { AI_CATALOG_SEARCH_TAKE } from "./ai.constant";
import type { AiAssistantReply, AiFeedbackRequest, AiStylistRequest, AiStylistResponse, AiStylistSession, AssistantHistoryItem } from "./ai.interface";
import { mapAssistantReply, mapStylistResponse, mapStylistSessions, pickCatalogSlug } from "./ai.mapper";

export const chatWithAssistant = async (
  message: string,
  history: AssistantHistoryItem[] = [],
): Promise<AiAssistantReply> =>
  mapAssistantReply((await authAxios.post("ai/assistant", { message, history })).data);

export const recommendStylist = async (body: AiStylistRequest): Promise<AiStylistResponse> =>
  mapStylistResponse((await authAxios.post("ai/stylist/recommendations", body)).data);

export const sendStylistFeedback = async (body: AiFeedbackRequest): Promise<void> => {
  await authAxios.post("ai/stylist/feedback", body);
};

export const getStylistSessions = async (): Promise<AiStylistSession[]> =>
  mapStylistSessions((await authAxios.get("ai/stylist/sessions")).data);

const findProductSlug = async (productId: number, keyword: string): Promise<string | null> => {
  try {
    const data = (await commonAxios.get("catalog/products", {
      params: { search: keyword, page: 1, take: AI_CATALOG_SEARCH_TAKE },
    })).data;
    return pickCatalogSlug(data, productId);
  } catch {
    return null;
  }
};

export const resolveProductDetailPath = async (productId: number, name: string, slug?: string | null): Promise<string> => {
  const knownSlug = slug?.trim();
  if (knownSlug) return `/san-pham/${knownSlug}`;
  const keyword = name.trim();
  if (!keyword) return "/san-pham";
  const resolved = await findProductSlug(productId, keyword);
  return resolved ? `/san-pham/${resolved}` : `/tim-kiem?query=${encodeURIComponent(keyword)}`;
};
