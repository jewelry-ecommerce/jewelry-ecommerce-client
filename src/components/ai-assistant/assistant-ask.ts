import { AiApi } from "@/utils/api";
import type { AiRecommendation } from "@/utils/api/ai/ai.interface";
import { getErrorMessage } from "@/utils/helpers/axios";

export type AssistantCard = {
  id: number;
  name: string;
  price: number | null;
  image: string | null;
  href: string;
};

export type AssistantAnswer = {
  text: string;
  cards: AssistantCard[];
  setPath?: string;
};

const productHref = (slug: string | null, name: string): string =>
  slug ? `/san-pham/${slug}` : `/tim-kiem?query=${encodeURIComponent(name)}`;

const cardFromRecommendation = (item: AiRecommendation): AssistantCard => ({
  id: item.id,
  name: item.name,
  price: item.price,
  image: item.thumbnailUrl,
  href: productHref(item.slug, item.name),
});

export const askAssistant = async (text: string): Promise<AssistantAnswer> => {
  try {
    const result = await AiApi.chatWithAssistant(text);
    const reply = result.reply.trim() || "Shop chưa nhận được nội dung. Bạn nhắn lại giúp shop nhé.";
    return { text: reply, cards: result.recommendations.map(cardFromRecommendation) };
  } catch (error) {
    return { text: getErrorMessage(error) || "Shop chưa trả lời được lúc này. Bạn nhắn lại giúp shop nhé.", cards: [] };
  }
};
