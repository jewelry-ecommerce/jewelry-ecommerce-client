export type AiBudgetScope = "ITEM" | "SET";
export type AiResultSource = "AI" | "FALLBACK";

export type AiPreferenceValues = {
  occasion: string;
  styles: string[];
  budget: number;
  recipient: string;
};

export type AiStylistRequest = {
  occasion: string;
  style?: string[];
  budget?: number;
  budgetScope?: AiBudgetScope;
  recipient?: string;
};

export type AiRecommendation = {
  type: string;
  id: number;
  name: string;
  thumbnailUrl: string | null;
  reason: string;
  matchScore: number;
  skuId: number | null;
  skuCode: string | null;
  price: number | null;
  stock: number | null;
  source: AiResultSource;
  slug: string | null;
};

export type AiAssistantReply = {
  reply: string;
  recommendations: AiRecommendation[];
};

export type AssistantHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type AiStylistResponse = {
  source: AiResultSource;
  banner?: string;
  sessionId?: number;
  recommendations: AiRecommendation[];
};

export type AiFeedbackRequest = {
  sessionId: number;
  productId: number;
  liked: boolean;
};

export type AiStylistSessionItem = {
  productId: number;
  skuId: number | null;
  reason: string;
  matchScore: number;
  sortOrder: number;
};

export type AiStylistSession = {
  id: number;
  occasion: string;
  styles: string[];
  budget: number | null;
  budgetScope: string;
  recipient: string | null;
  source: AiResultSource;
  fallbackReason: string | null;
  createdDate: string | number | null;
  items: AiStylistSessionItem[];
};

export type CatalogPick = {
  productId: number;
  name: string;
  thumbnailUrl: string | null;
  slug: string | null;
  skuId: number | null;
  skuCode: string | null;
  price: number | null;
  stock: number | null;
};

export type AiTryOnVariant = {
  style: string;
  styleLabel: string;
  tryOnImageUrl: string;
  productId: number;
  productName: string;
  productSlug: string | null;
  productThumbnailUrl: string | null;
  price: number | null;
  categoryName: string | null;
};

export type AiTryOnResponse = {
  ok: boolean;
  message: string | null;
  disclaimer: string;
  detectedRegions: string[];
  variants: AiTryOnVariant[];
};
