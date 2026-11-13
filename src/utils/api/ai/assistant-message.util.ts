import {
  AI_BUDGET_DEFAULT,
  AI_BUDGET_MAX,
  AI_BUDGET_MIN,
  AI_BUDGET_SCOPE_ITEM,
  AI_BUDGET_SCOPE_SET,
  AI_OCCASIONS,
  AI_RECIPIENT_MAX_LENGTH,
  AI_STYLES,
} from "./ai.constant";
import type { AiBudgetScope, AiStylistRequest } from "./ai.interface";

export type AssistantIntent = "RECOMMEND" | "SET";

export type ParsedAssistantMessage = {
  intent: AssistantIntent;
  request: AiStylistRequest;
  lead: string;
};

const OCCASION_RULES: Array<{ pattern: RegExp; occasion: (typeof AI_OCCASIONS)[number] }> = [
  { pattern: /cưới|cuoi|cô dâu|bride/i, occasion: "Đám cưới" },
  { pattern: /sinh nhật|sinh nhat|birthday/i, occasion: "Sinh nhật" },
  { pattern: /kỷ niệm|ky niem|anniversary/i, occasion: "Kỷ niệm" },
  { pattern: /hàng ngày|hang ngay|đi làm|thường ngày/i, occasion: "Thường ngày" },
];

const readBudget = (text: string): number => {
  const matched = text.match(/(\d+(?:[.,]\d+)?)\s*(triệu|trieu|tr|k)\b/i);
  if (!matched) return AI_BUDGET_DEFAULT;
  const amount = Number(matched[1].replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return AI_BUDGET_DEFAULT;
  const unit = matched[2].toLowerCase();
  const value = unit === "k" ? amount * 1_000 : amount * 1_000_000;
  return Math.min(AI_BUDGET_MAX, Math.max(AI_BUDGET_MIN, Math.round(value)));
};

const readStyles = (text: string): string[] =>
  AI_STYLES.filter((style) => text.toLowerCase().includes(style.toLowerCase()));

const readOccasion = (text: string): string =>
  OCCASION_RULES.find((rule) => rule.pattern.test(text))?.occasion ?? "Khác";

const readIntent = (text: string): AssistantIntent =>
  /bộ|bo trang suc|phối|phoi|combo|\bset\b/i.test(text) ? "SET" : "RECOMMEND";

const leadFor = (intent: AssistantIntent, occasion: string, budget: number): string => {
  const money = new Intl.NumberFormat("vi-VN").format(budget);
  const action = intent === "SET" ? "Một bộ gợi ý" : "Vài món gợi ý";
  return `${action} cho dịp ${occasion}, ngân sách khoảng ${money}đ.`;
};

export const parseAssistantMessage = (raw: string): ParsedAssistantMessage => {
  const text = raw.trim().slice(0, 500);
  const intent = readIntent(text);
  const occasion = readOccasion(text);
  const budget = readBudget(text);
  const styles = readStyles(text);
  const budgetScope: AiBudgetScope = intent === "SET" ? AI_BUDGET_SCOPE_SET : AI_BUDGET_SCOPE_ITEM;
  const request: AiStylistRequest = {
    occasion,
    budget,
    budgetScope,
    recipient: text.slice(0, AI_RECIPIENT_MAX_LENGTH),
  };
  if (styles.length > 0) request.style = styles;
  return { intent, request, lead: leadFor(intent, occasion, budget) };
};
