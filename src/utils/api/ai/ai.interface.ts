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

export type AiStylistResponse = {
  source: AiResultSource;
  banner?: string;
  sessionId?: number;
  recommendations: AiRecommendation[];
};

export type AiSetBuilderItem = {
  productId: number;
  productName: string;
  thumbnailUrl: string | null;
  slotName: string;
  isKeyPiece: boolean;
  sortOrder: number;
  skuId: number | null;
  skuCode: string | null;
  price: number | null;
  stock: number | null;
  source: AiResultSource;
  slug: string | null;
};

export type AiSetBuilderResponse = {
  code: string;
  name: string;
  description: string;
  bundleDiscountPercent: number;
  items: AiSetBuilderItem[];
  source: AiResultSource;
  banner?: string;
  totalPrice: number;
  sessionId?: number;
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
